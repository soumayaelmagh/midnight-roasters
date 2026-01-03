import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="card">
      <div className="card-top">
        <div className="badge">{product.type}</div>
        <div className="price">${product.priceUsd}</div>
      </div>

      <h3 className="card-title">{product.name}</h3>
      <p className="muted">{product.short}</p>
      <p className="tiny muted">{product.category}</p>

      <div className="card-actions">
    
        <button className="btn" onClick={() => addToCart(product, 1)}>Add</button>
      </div>
    </article>
  );
}
