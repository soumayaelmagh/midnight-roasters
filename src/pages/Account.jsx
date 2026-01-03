import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function Account() {
  const { user, register, login, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/shop";

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    sessionId: user?.sessionId || "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("register"); // register | login
  const [memberChoice, setMemberChoice] = useState(user ? "login" : "");
  const [showPrompt, setShowPrompt] = useState(!user);
  const [orders, setOrders] = useState([]);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: user.name,
        email: user.email,
        sessionId: user.sessionId || "",
        password: "",
        confirmPassword: "",
      });
      setMessage("You're signed in. You can update your details below.");
      setMemberChoice("login");
      setMode("login");
      setShowPrompt(false);
      // eslint-disable-next-line react-hooks/immutability
      fetchUserData(user.id);
    }
  }, [user]);

  async function fetchUserData(userId) {
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("order_id, created_at, totals")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);
      const { data: balanceData } = await supabase
        .from("balances")
        .select("balance_cents")
        .eq("user_id", userId)
        .single();
      if (balanceData) setBalance(balanceData.balance_cents);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Unable to load account data", err);
    }
  }

  function formatSubtotal(totals) {
    if (!totals) return "—";
    const amount = Number(totals.subtotal ?? totals.total ?? totals.amount);
    if (Number.isNaN(amount)) return "—";
    const currency = totals.currency || "USD";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  function formatOrderDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  }

  function update(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
    setMessage("");
  }

  async function submit(e) {
    e.preventDefault();
    if (mode === "register") {
      if (form.password.length < 8) {
        setMessage("Password must be at least 8 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      try {
        await register(form.name, form.email, form.sessionId, form.password);
        setMessage("Registered! Redirecting you to finish checkout…");
        setTimeout(() => nav(redirectTo, { replace: true }), 400);
      } catch (err) {
        setMessage(err.message || "Unable to save account.");
      }
    } else {
      try {
        await login(form.email, form.password || form.sessionId);
        setMessage("Logged in! Redirecting you to finish checkout…");
        setTimeout(() => nav(redirectTo, { replace: true }), 300);
      } catch (err) {
        setMessage(err.message || "Login failed. Check your details and try again.");
      }
    }
  }

  function pick(choice) {
    setMemberChoice(choice);
    setMode(choice);
    setShowPrompt(false);
    setMessage("");
  }

  return (
    <div className="section">
      <h2>Account</h2>

      {user ? (
        <div className="split">
          <div className="panel">
            <h3>Profile</h3>
            <p className="muted">{user.email}</p>
            <div className="row">
              <button className="btn ghost" type="button" onClick={logout}>
                Log out
              </button>
            </div>
          </div>

          <div className="panel">
            <h3>Balance</h3>
            <p className="muted">
              {balance === null ? "—" : `$${(balance / 100).toFixed(2)}`}
            </p>
            <button className="btn" type="button" onClick={() => nav("/add-balance")}>
              Add balance
            </button>
            <h3 style={{ marginTop: "14px" }}>Order history</h3>
            {orders.length === 0 ? (
              <p className="muted tiny">No orders yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.order_id}>
                        <td className="mono">{o.order_id}</td>
                        <td>{formatOrderDate(o.created_at)}</td>
                        <td style={{ textAlign: "right" }}>{formatSubtotal(o.totals)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="muted">
            Create an account to purchase. We'll use this info to deliver your order.
          </p>

      {showPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div className="panel" style={{ maxWidth: 420, width: "90%" }}>
            <h3>Are you a member?</h3>
            <p className="muted tiny">Choose to log in or register to continue.</p>
            <div className="row">
              <button className="btn" type="button" onClick={() => pick("login")}>
                Yes, log me in
              </button>
              <button className="btn ghost" type="button" onClick={() => pick("register")}>
                No, register
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="split">
        <div className="panel" style={{ display: memberChoice === "login" ? "none" : "block" }}>
          <h3>New here?</h3>
          <p className="muted tiny">Register to place your first order.</p>
          <form
            className="form"
            onSubmit={(e) => {
              setMode("register");
              submit(e);
            }}
          >
            <label>
              Username
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Alex Doe"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                required
              />
            </label>
            <label>
              Session ID
              <input
                value={form.sessionId}
                onChange={(e) => update("sessionId", e.target.value)}
                placeholder="05b95aad7d71e5fc95143d02acf32329591b2224d92849e1420d844adb3c953f1b"
                pattern="^[a-fA-F0-9]{66}$"
                minLength={66}
                maxLength={66}
                title="Use the 66-character session hash."
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </label>

            {message && mode === "register" && <div className="note">{message}</div>}

            <div className="row">
              <button className="btn" type="submit" onClick={() => setMode("register")}>
                Register
              </button>
              {user && (
                <button className="btn ghost" type="button" onClick={logout}>
                  Sign out
                </button>
              )}
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  pick("login");
                }}
              >
                I already have an account
              </button>
            </div>
          </form>
        </div>

        <div className="panel" style={{ display: memberChoice === "register" ? "none" : "block" }}>
          <h3>Returning?</h3>
          <p className="muted tiny">Log in with your email and password.</p>
          <form
            className="form"
            onSubmit={(e) => {
              setMode("login");
              submit(e);
            }}
          >
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Your password"
                required
              />
            </label>

            {message && mode === "login" && <div className="note">{message}</div>}

            <div className="row">
              <button className="btn" type="submit" onClick={() => setMode("login")}>
                Log in
              </button>
              {user && (
                <button className="btn ghost" type="button" onClick={logout}>
                  Sign out
                </button>
              )}
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  pick("register");
                }}
              >
                Need to register
              </button>
            </div>
          </form>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
