import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";

function makeOrderId() {
  return "MR-" + Math.random().toString(16).slice(2, 10).toUpperCase();
}

const VALID_SESSION_ID = "05b95aad7d71e5fc95143d02acf32329591b2224d92849e1420d844adb3c953f1b";

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    sessionId: user?.sessionId || "",
    network: "USDT (TRC20)",
    txHash: "",
  });
  const [error, setError] = useState("");
  const [balanceCents, setBalanceCents] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const orderId = useMemo(() => makeOrderId(), []);
  const requiredCents = Math.round(totals.subtotal * 100);
  const effectiveBalanceCents = balanceCents ?? 0;
  const hasEnoughBalance = effectiveBalanceCents >= requiredCents;

  useEffect(() => {
    if (user?.sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((p) =>
        p.sessionId === user.sessionId ? p : { ...p, sessionId: user.sessionId }
      );
    }
  }, [user?.sessionId]);

  useEffect(() => {
    let cancelled = false;
    async function loadBalance() {
      if (!user?.id) {
        setBalanceCents(null);
        return;
      }
      setBalanceLoading(true);
      const { data, error: err } = await supabase
        .from("balances")
        .select("balance_cents")
        .eq("user_id", user.id)
        .single();
      if (cancelled) return;
      if (!err && data) {
        setBalanceCents(data.balance_cents);
      } else {
        setBalanceCents(0);
      }
      setBalanceLoading(false);
    }
    loadBalance();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // This is intentionally a fake/demo address:
  const demoWalletAddress = "TDYDXEWeAyoftNUYN2gNVex1rDKTA9F1Zw";

  if (items.length === 0) {
    return (
      <div className="section">
        <h2>Checkout</h2>
        <p className="muted">Your cart is empty.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section">
        <h2>Checkout</h2>
        <p className="muted">Please create an account to continue.</p>
        <button
          className="btn"
          type="button"
          onClick={() => nav("/account", { state: { from: "/checkout" } })}
        >
          Go to account
        </button>
      </div>
    );
  }

  function update(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
    setError("");
  }

  function submit(e) {
    e.preventDefault();

    if (balanceLoading) {
      setError("Checking balance… please wait.");
      return;
    }
    if (!hasEnoughBalance) {
      setError("Insufficient balance. Redirecting to add balance.");
      nav("/add-balance", { state: { from: "/checkout" } });
      return;
    }

    const normalizedSessionId = form.sessionId.trim().toLowerCase();
    if (!/^[a-f0-9]{66}$/.test(normalizedSessionId)) {
      setError("Session ID must be 66 hexadecimal characters.");
      return;
    }
    if (normalizedSessionId !== VALID_SESSION_ID.toLowerCase()) {
      setError("Session ID is invalid. Please use the one provided.");
      return;
    }

    // Save mock order (localStorage for the assignment demo)
    const payload = {
      orderId,
      createdAt: new Date().toISOString(),
      sessionId: normalizedSessionId,
      customer: user,
      payment: {
        method: "Crypto",
        network: form.network,
        txHash: form.txHash || "(not provided)",
        demoWalletAddress,
      },
      items,
      totals,
    };

    localStorage.setItem("midnight_roasters_last_order", JSON.stringify(payload));

    clearCart();
    nav("/confirmation");
  }

  return (
    <div className="section">
      <h2>Checkout</h2>
    

      <div className="split">
        <div className="panel">
          <h3>Payment </h3>
          <div className="notice">
            <div><strong>Order:</strong> {orderId}</div>
            <div><strong>Amount (USD):</strong> ${totals.subtotal.toFixed(2)}</div>
           
          </div>

          <div className="notice">
            <div className="tiny muted">Balance</div>
            <div className="row space">
              <div className="mono">
                {balanceLoading
                  ? "Checking…"
                  : balanceCents === null
                  ? "—"
                  : `$${(balanceCents / 100).toFixed(2)}`}
              </div>
              {!hasEnoughBalance && !balanceLoading && (
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => nav("/add-balance", { state: { from: "/checkout" } })}
                >
                  Add balance
                </button>
              )}
            </div>
            {!hasEnoughBalance && !balanceLoading && (
              <div className="note" style={{ color: "var(--accent)" }}>
                Not enough balance. Please top up before confirming.
              </div>
            )}
          </div>

          <div className="notice">
            <div className="tiny muted">Send to address :</div>
            <div className="mono">{demoWalletAddress}</div>
            <div className="tiny muted">Network: TRC20</div>
          </div>

          <div className="notice">
            <div className="tiny muted">Account</div>
            <div>{user?.name}</div>
            <div className="tiny muted">{user?.email}</div>
          </div>

          <form onSubmit={submit} className="form">
            <label>
              Session ID
              <input
                value={form.sessionId}
                onChange={(e) => update("sessionId", e.target.value)}
                placeholder="05b95aad7d71e5fc95143d02acf32329591b2224d92849e1420d844adb3c953f1b"
                type="text"
                pattern="^[a-fA-F0-9]{66}$"
                minLength={66}
                maxLength={66}
                title="Enter the 66-character hash."
                required
              />
            </label>
            {error && (
              <div className="note" style={{ color: "var(--accent)" }}>
                {error}
              </div>
            )}
            <button className="btn" type="submit" disabled={balanceLoading}>
              {hasEnoughBalance ? "Confirm order" : "Add balance first"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h3>Order summary</h3>
          <ul className="list">
            {items.map((i) => (
              <li key={i.slug}>
                {i.name} × {i.qty} — ${(i.priceUsd * i.qty).toFixed(2)}
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <div className="muted">Total</div>
            <div className="price">${totals.subtotal.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
