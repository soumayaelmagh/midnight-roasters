import { Link } from "react-router-dom";

export default function Confirmation() {
  const raw = localStorage.getItem("midnight_roasters_last_order");
  const order = raw ? JSON.parse(raw) : null;

  if (!order) {
    return (
      <div className="section">
        <h2>No recent order</h2>
        <Link className="btn" to="/shop">Back to shop</Link>
      </div>
    );
  }

  const sessionId = order.sessionId || order.customer?.email || "(not recorded)";

  return (
    <div className="section">
      <h2>Order Confirmed </h2>
      <p className="muted">
        Session verified. Keep this ID handy for your records. You will receive the download link on your session 
      </p>

      <div className="panel">
        <div className="row space">
          <div>
            <div className="tiny muted">Order ID</div>
            <div className="mono">{order.orderId}</div>
          </div>
          <div>
            <div className="tiny muted">Payment</div>
            <div>{order.payment.method}</div>
          </div>
        </div>

        <div className="notice">
          <div className="tiny muted">Account</div>
          <div>{order.customer?.name || "Not recorded"}</div>
          <div className="tiny muted">{order.customer?.email || "—"}</div>
        </div>

        <div className="notice">
          <div className="tiny muted">Session ID</div>
          <div className="mono">{sessionId}</div>
        </div>

        <div className="notice">
          <div className="tiny muted">Wallet address :</div>
          <div className="mono">{order.payment.demoWalletAddress}</div>
          <div className="tiny muted">Network: {order.payment.network}</div>
          <div className="tiny muted">Tx hash: {order.payment.txHash}</div>
        </div>

        <h3>Items</h3>
        <ul className="list">
          {order.items.map((i) => (
            <li key={i.slug}>
              {i.name} × {i.qty} — ${(i.priceUsd * i.qty).toFixed(2)}
            </li>
          ))}
        </ul>

        <div className="cart-total">
          <div className="muted">Total</div>
          <div className="price">${order.totals.subtotal.toFixed(2)}</div>
        </div>

        <div className="row">
          <Link className="btn" to="/shop">Continue shopping</Link>
          <Link className="btn ghost" to="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
