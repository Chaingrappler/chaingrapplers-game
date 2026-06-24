const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith(".html"));

function localReference(value) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("data:") ||
    value.startsWith("javascript:")
  ) {
    return null;
  }

  return value.split(/[?#]/, 1)[0];
}

test("all local HTML links, scripts, styles and images exist", () => {
  const missing = [];
  const referencePattern = /\b(?:href|src)=["']([^"']+)["']/g;

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    for (const match of html.matchAll(referencePattern)) {
      const reference = localReference(match[1]);
      if (!reference) continue;

      const target = path.resolve(root, reference);
      if (!target.startsWith(root) || !fs.existsSync(target)) {
        missing.push(`${htmlFile}: ${match[1]}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("every public page links to the Shopify product", () => {
  const productUrl =
    "https://shop.chaingrapplers.com/products/chaingrapplers-card-game";

  for (const htmlFile of ["index.html", "game.html", "about.html", "rules.html"]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, new RegExp(productUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("all HTML pages declare Swedish as the source language", () => {
  for (const htmlFile of ["index.html", "game.html", "about.html", "rules.html"]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /<html\s+lang="sv">/i, htmlFile);
  }
});

test("the rules page documents all tested win conditions and special cards", () => {
  const rules = fs.readFileSync(path.join(root, "rules.html"), "utf8");
  const requiredTerms = [
    "Submission",
    "Card advantage",
    "Draw",
    "Mat Enforcer",
    "Teenage Rage",
    "The Black Belt",
    "Fatigue",
    "Ultra Heavy"
  ];

  for (const term of requiredTerms) {
    assert.ok(rules.includes(term), `rules.html is missing ${term}`);
  }
});

test("the deployed card images match the card data exactly", () => {
  const cardDataSource = fs.readFileSync(path.join(root, "cardsData.js"), "utf8");
  const referenced = new Set(
    [...cardDataSource.matchAll(/"filename":\s*"([^"]+)"/g)].map(match => match[1])
  );
  const deployed = new Set(
    fs.readdirSync(path.join(root, "cards")).filter(name => /\.(?:jpg|png|webp)$/i.test(name))
  );
  referenced.add("0-back.jpg");

  assert.deepEqual([...deployed].sort(), [...referenced].sort());
});
