import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const mapUser = (authUser) => ({
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name || "",
    sessionId: authUser.user_metadata?.session_id || "",
  });

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setAuthError(error.message);
      if (data?.session?.user) {
        setUser(mapUser(data.session.user));
      }
      setAuthReady(true);
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription?.subscription?.unsubscribe();
  }, []);

  async function upsertProfile(profile) {
    const { error } = await supabase.from("users").upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      session_id: profile.sessionId,
    });
    if (error) {
      throw new Error(error.message || "Unable to save profile to database.");
    }
  }

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("name,email,session_id")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  }

  async function register(name, email, sessionId, password) {
    const fullName = name.trim();
    const safeEmail = email.trim();
    const safeSession = (sessionId || "").trim();
    const safePassword = (password || "").trim();
    if (!fullName || !safeEmail || !safeSession || !safePassword) {
      throw new Error("Name, email, session ID, and password are required.");
    }
    if (!/^[a-fA-F0-9]{66}$/.test(safeSession)) {
      throw new Error("Session ID must be 66 hexadecimal characters.");
    }
    if (safePassword.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: safeEmail,
      password: safePassword,
      options: { data: { name: fullName, session_id: safeSession } },
    });
    if (error) {
      if (error.message?.toLowerCase().includes("already registered")) {
        throw new Error("Account already exists. Please log in with your password.");
      }
      throw error;
    }

    // Ensure we have an active session (signUp may require email confirm)
    let authUser = data?.user || null;
    if (!data?.session) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: safeEmail,
        password: safePassword,
      });
      if (loginError) throw loginError;
      authUser = loginData?.user || authUser;
    }

    if (authUser) {
      const profile = {
        id: authUser.id,
        email: safeEmail,
        name: fullName,
        sessionId: safeSession,
      };
      await upsertProfile(profile);
      setUser(profile);
    }
    return authUser || null;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: (password || "").trim(),
    });
    if (error) throw error;
    if (data?.user) {
      const meta = data.user.user_metadata || {};
      const profileRow =
        meta.session_id && meta.name
          ? null
          : await fetchProfile(data.user.id);

      const profile = {
        id: data.user.id,
        email: data.user.email || email.trim(),
        name: meta.name || profileRow?.name || "",
        sessionId: meta.session_id || profileRow?.session_id || "",
      };

      if (profile.sessionId) {
        await upsertProfile(profile);
      }
      setUser(profile);
      return profile;
    }
    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      authReady,
      authError,
      register,
      login,
      logout,
    }),
    [user, authReady, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
