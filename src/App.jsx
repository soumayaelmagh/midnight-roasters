import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Product from "./pages/Product.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import Account from "./pages/Account.jsx";
import RequireAccount from "./components/RequireAccount.jsx";
import AddBalance from "./pages/AddBalance.jsx";

function HomeGate({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return <Navigate to="/account" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <HomeGate>
                <Home />
              </HomeGate>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/add-balance"
            element={
              <RequireAccount>
                <AddBalance />
              </RequireAccount>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAccount>
                <Checkout />
              </RequireAccount>
            }
          />
          <Route
            path="/confirmation"
            element={
              <RequireAccount>
                <Confirmation />
              </RequireAccount>
            }
          />
          <Route path="*" element={<Navigate to="/account" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>
          @Midnight Roasters  </p>
      </footer>
    </>
  );
}
