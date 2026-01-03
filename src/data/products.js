export const products = [
  {
    slug: "dark-roast-ui-kit",
    name: "Backdoor Audit",
    priceUsd: 199,
    type: "Digital Download",
    category: "Audits (Services)",
  
  },
  {
    slug: "espresso-landing-template",
    name: "Surface Scan",
    priceUsd: 299,
    type: "Digital Download",
    category: "scaning Tools (Services)",
  },
  {
    slug: "cold-brew-icon-pack",
    name: "Logs Analyzer",
    priceUsd: 150,
    type: "Digital Download",
    category: "Beans Logs (Assets)",
  },
  {
    slug: "latte-copy-pack",
    name: "Silent Patch",
    priceUsd: 100,
    type: "Digital Download",
    category: "Bug-fix & cleanup service",
  },
  {
    slug: "beans-and-bugs-audit",
    name: "Beans & SMTP setup",
    priceUsd: 400,
    type: "Digital Download",
    category: "Brew SMPT Tools (Services)",
  },
  {
    slug: "mocha-resume-template",
    name: "Mocha Encrypted beans",
    priceUsd: 250,
    type: "Digital Download",
    category: "Roasts (Keys & Assets)",
  },
];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}
