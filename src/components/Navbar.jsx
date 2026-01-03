import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const { user } = useAuth();
  const name = user?.name?.split(" ")[0];

  return (
    <header className="nav">
      <div className="nav-inner container">
        <div className="brand">
          <span className="brand-mark">☕</span>
          <div>
            <div className="brand-name">Midnight Roasters</div>
            <div className="brand-tag">Coffee vibe. Digital goods inside.</div>
          </div>
        </div>

        <nav className="links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>Shop</NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
            Cart <span className="pill">{count}</span>
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => (isActive ? "active" : "")}>
            {name ? `Hi, ${name}` : "Account"}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
