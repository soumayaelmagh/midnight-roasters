import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { slug, name, priceUsd, qty }

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { slug: product.slug, name: product.name, priceUsd: product.priceUsd, qty }];
    });
  }

  function removeFromCart(slug) {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }

  function setQty(slug, qty) {
    const safeQty = Math.max(1, Number(qty) || 1);
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty: safeQty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.priceUsd * i.qty, 0);
    return { subtotal };
  }, [items]);

  const value = { items, addToCart, removeFromCart, setQty, clearCart, totals };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
