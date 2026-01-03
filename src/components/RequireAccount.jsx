import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAccount({ children }) {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null;

  if (!user) {
    return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  }

  return children;
}
