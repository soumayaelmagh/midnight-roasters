import { products } from "../data/products.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Shop() {
  return (
    <div className="section">
      <h2>Shop</h2>
      <p className="muted">Coffee-themed names, real digital products/services.</p>

      <div className="grid">
        {products.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}
