import { useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function AddBalance() {
  const { user } = useAuth();
  const { totals } = useCart();

  const amountHint = useMemo(() => totals.subtotal.toFixed(2), [totals.subtotal]);
  const walletAddress = "TDYDXEWeAyoftNUYN2gNVex1rDKTA9F1Zw";

  return (
    <div className="section">
      <h2>Add balance</h2>
      <div className="panel">
        <div className="notice">
          <div className="tiny muted">USDT Wallet (TRC20)</div>
          <div className="mono">{walletAddress}</div>
          <div className="tiny muted">Network: TRC20</div>
        </div>
        <p className="muted">
          Send your top-up (minimum 100) to the address above. After the transfer settles, your
          balance will be updated on this account ({user?.email}).
        </p>
        <p className="note">
          Suggested amount: ${amountHint}. Include your session ID in any payment memo if provided.
        </p>
      </div>
    </div>
  );
}
