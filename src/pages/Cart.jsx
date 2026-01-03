import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, totals, removeFromCart, setQty } = useCart();
  const nav = useNavigate();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="section">
        <h2>Your cart is empty</h2>
        <Link className="btn" to="/shop">Shop</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Your cart</h2>

      <div className="panel">
        {items.map((i) => (
          <div className="cart-row" key={i.slug}>
            <div className="cart-main">
              <div className="cart-name">{i.name}</div>
              <div className="tiny muted">${i.priceUsd} each</div>
            </div>

            <input
              className="qty"
              type="number"
              min="1"
              value={i.qty}
              onChange={(e) => setQty(i.slug, e.target.value)}
            />

            <div className="cart-price">${(i.priceUsd * i.qty).toFixed(2)}</div>

            <button className="btn ghost" onClick={() => removeFromCart(i.slug)}>
              Remove
            </button>
          </div>
        ))}

        <div className="cart-total">
          <div className="muted">Subtotal</div>
          <div className="price">${totals.subtotal.toFixed(2)}</div>
        </div>

        <div className="row">
          <Link className="btn ghost" to="/shop">Continue shopping</Link>
          <button
            className="btn"
            onClick={() =>
              nav(user ? "/checkout" : "/account", { state: { from: "/checkout" } })
            }
          >
            {user ? "Checkout" : "Create account to checkout"}
          </button>
        </div>
        {!user && <div className="note">You need an account before you can checkout.</div>}
      </div>
    </div>
  );
}
