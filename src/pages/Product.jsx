import { useParams, Link } from "react-router-dom";
import { getProductBySlug } from "../data/products.js";
import { useCart } from "../context/CartContext.jsx";

export default function Product() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="section">
        <h2>Not found</h2>
        <Link className="btn" to="/shop">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="product-header">
        <div>
          <div className="badge">{product.type}</div>
          <h2>{product.name}</h2>
          <p className="muted">{product.short}</p>
          <p className="tiny muted">{product.category}</p>
        </div>
        <div className="product-buy">
          <div className="price big">${product.priceUsd}</div>
          <button className="btn" onClick={() => addToCart(product, 1)}>Add to cart</button>
          <Link className="btn ghost" to="/cart">Go to cart</Link>
        </div>
      </div>

      <div className="split">
        <div className="panel">
          <h3>What’s included</h3>
          <ul className="list">
            {product.includes.map((x) => <li key={x}>• {x}</li>)}
          </ul>
        </div>

        <div className="panel">
          <h3>Delivery</h3>
          <p className="muted">
            Digital items: instant download link on confirmation<br />
            Services: summary delivered by email within 24–48h .
          </p>
        </div>
      </div>
    </div>
  );
}

