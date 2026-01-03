import { Link } from "react-router-dom";
import { products } from "../data/products.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Freshly brewed digital goods.</h1>
          <p className="muted">
            Midnight Roasters looks like a coffee shop, but we sell templates, assets, and services to help you ship faster.
          </p>
          <div className="row">
            <Link to="/shop" className="btn">Browse Roasts</Link>
            <a href="#how" className="btn ghost">How it works</a>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-title">What you “order”</div>
          <ul className="list">
            <li>☕ Templates (landing pages, UI kits)</li>
            <li>🫘 Assets (icons, copy packs)</li>
            <li>🛠️ Services (audit, setup)</li>
          </ul>
          <div className="note">
            Delivery is digital: download link or email summary.
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <h2>Featured roasts</h2>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </div>
  );
}
