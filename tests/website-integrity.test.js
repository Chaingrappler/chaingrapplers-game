const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
function findFiles(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== ".git" && entry.name !== "node_modules") {
      return findFiles(fullPath, extension);
    }
    return entry.isFile() && entry.name.endsWith(extension) ? [fullPath] : [];
  });
}

const htmlFiles = findFiles(root, ".html");

function localReference(value) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/_vercel/") ||
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
    const html = fs.readFileSync(htmlFile, "utf8");
    for (const match of html.matchAll(referencePattern)) {
      const reference = localReference(match[1]);
      if (!reference) continue;

      const target = path.resolve(path.dirname(htmlFile), reference);
      if (!target.startsWith(root) || !fs.existsSync(target)) {
        missing.push(`${path.relative(root, htmlFile)}: ${match[1]}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("every public page links to the Shopify checkout", () => {
  const checkoutUrl =
    "https://shop.chaingrapplers.com/cart/62506751459658:1?checkout";

  for (const htmlFile of [
    "index.html",
    "game.html",
    "about.html",
    "rules.html",
    path.join("en", "index.html"),
    path.join("en", "game.html"),
    path.join("en", "about.html"),
    path.join("en", "rules.html")
  ]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, new RegExp(checkoutUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("every public page includes cookie-free Vercel Web Analytics", () => {
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    assert.match(html, /<script defer src="\/_vercel\/insights\/script\.js"><\/script>/, path.relative(root, htmlFile));
  }
});

test("images reserve layout space and rule cards load lazily", () => {
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
      assert.match(tag, /\bwidth="\d+"/i, `${path.relative(root, htmlFile)}: ${tag}`);
      assert.match(tag, /\bheight="\d+"/i, `${path.relative(root, htmlFile)}: ${tag}`);
    }
  }

  for (const htmlFile of ["rules.html", path.join("en", "rules.html")]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    const ruleCards = [...html.matchAll(/<img\b[^>]*class="[^"]*rule-chain-card[^"]*"[^>]*>/gi)];
    assert.equal(ruleCards.length, 5, htmlFile);
    for (const [tag] of ruleCards) assert.match(tag, /\bloading="lazy"/i, `${htmlFile}: ${tag}`);
  }
});

test("rule guide cards preserve their printed proportions on mobile", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const ruleCardBlock = styles.match(/\.rule-chain-card\s*\{([^}]+)\}/);

  assert.ok(ruleCardBlock, "styles.css is missing .rule-chain-card");
  assert.match(ruleCardBlock[1], /height:\s*auto\s*;/);
  assert.match(ruleCardBlock[1], /aspect-ratio:\s*59\s*\/\s*84\s*;/);
  assert.match(ruleCardBlock[1], /object-fit:\s*contain\s*;/);
  assert.match(ruleCardBlock[1], /align-self:\s*start\s*;/);
});

test("enlarged card previews preserve their intrinsic proportions at every viewport", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const previewImageBlock = styles.match(/\.card-preview-image\s*\{([^}]+)\}/);

  assert.ok(previewImageBlock, "styles.css is missing .card-preview-image");
  assert.match(previewImageBlock[1], /width:\s*auto\s*;/);
  assert.match(previewImageBlock[1], /height:\s*auto\s*;/);
  assert.match(previewImageBlock[1], /max-width:\s*min\(360px,\s*calc\(100vw\s*-\s*2\.5rem\)\)\s*;/);
  assert.match(previewImageBlock[1], /max-height:\s*calc\(100dvh\s*-\s*8rem\)\s*;/);
  assert.match(previewImageBlock[1], /object-fit:\s*contain\s*;/);
  assert.doesNotMatch(previewImageBlock[1], /(?:^|\n)\s*width:\s*min\(/);
});

test("all HTML pages declare Swedish as the source language", () => {
  for (const htmlFile of ["index.html", "game.html", "about.html", "rules.html"]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /<html\s+lang="sv">/i, htmlFile);
  }
});

test("the Swedish rules translation covers split inline fragments", () => {
  const translations = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
  const requiredMappings = [
    ['Start color (top)', 'Startfärg (överst)'],
    ['Result color (bottom)', 'Resultatfärg (nederst)'],
    ["(top) matches the current card's", "(överst) matchar det aktuella kortets"]
  ];

  for (const [source, target] of requiredMappings) {
    assert.ok(translations.includes(`"${source}": "${target}"`), `missing Swedish mapping for ${source}`);
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

test("every public page uses the shared full-height menu", () => {
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    const scriptPath = htmlFile.includes(`${path.sep}en${path.sep}`) ? "../site.js" : "site.js";
    assert.match(html, new RegExp(`<script src=["']${scriptPath.replace(".", "\\.")}\\?v=20260824c["']`), path.relative(root, htmlFile));
  }

  const menuScript = fs.readFileSync(path.join(root, "site.js"), "utf8");
  assert.match(menuScript, /className = "site-menu-toggle"/);
  assert.match(menuScript, /aria-controls/);
  assert.match(menuScript, /event\.key === "Escape"/);
  assert.match(menuScript, /header\.appendChild\(backdrop\)/);
  assert.doesNotMatch(menuScript, /document\.body\.appendChild\(backdrop\)/);
  assert.doesNotMatch(menuScript, /nav\.addEventListener\("click"/);
});

test("every page uses the current shared CSS cache key", () => {
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    assert.match(html, /styles\.css\?v=20260824b/, path.relative(root, htmlFile));
    assert.match(html, /site\.js\?v=20260824c/, path.relative(root, htmlFile));
  }
});

test("product landing pages use the live Shopify product and checkout cart permalink", () => {
  const cartUrl = "https://shop.chaingrapplers.com/cart/62506751459658:1?checkout";
  const productImage = "chaingrapplers-product-hero-v2.png";

  for (const htmlFile of ["index.html", path.join("en", "index.html")]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /class="product-hero(?:\s[^"]*)?"/);
    assert.match(html, /data-shopify-checkout/);
    assert.ok(html.includes(cartUrl), `${htmlFile} is missing the live cart permalink`);
    assert.ok(html.includes(productImage), `${htmlFile} is missing the live product image`);
    assert.match(html, /299 (?:kr|SEK)/);
    assert.match(html, /class="product-action-title"/);
    assert.match(html, /product-action-title__green/);
    assert.match(html, /product-action-title__yellow/);
    assert.match(html, /product-action-title__orange/);
    assert.match(html, /class="product-proof product-proof--landing"/);
    assert.match(html, /class="mobile-buy-bar"/);
    assert.doesNotMatch(html, /class="product-how"/);
  }
});

test("the landing header and sticky purchase bar match the requested positions", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(styles, /\.product-home \.landing-brand\s*\{[^}]*order:\s*2/s);
  assert.match(styles, /\.product-home \.site-menu-toggle\s*\{[^}]*order:\s*1/s);
  assert.match(styles, /\.product-home \.landing-nav\.site-menu-panel\s*\{[^}]*inset:\s*0 auto 0 0/s);
  assert.match(styles, /\.product-home \.mobile-buy-bar\s*\{[^}]*position:\s*fixed/s);
  assert.match(styles, /\.product-home \.mobile-buy-bar strong\s*\{[^}]*font-size:\s*1rem/s);
  assert.match(styles, /\.product-home \.mobile-buy-bar > a\s*\{[^}]*min-height:\s*56px/s);

  const swedish = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const english = fs.readFileSync(path.join(root, "en", "index.html"), "utf8");
  assert.match(swedish, /Kontra\./);
  assert.match(swedish, /Sätt press\./);
  assert.match(swedish, /Hitta avslutet\./);
  assert.match(swedish, /Lätt att lära sig/);
  assert.doesNotMatch(swedish, /Lätt att börja/);
  assert.match(swedish, /Inte bara tur/);
  assert.match(english, /Counter\./);
  assert.match(english, /Apply pressure\./);
  assert.match(english, /Find the finish\./);
  assert.match(english, /Easy to learn/);
  assert.match(english, /Not just luck/);
  assert.match(styles, /\.product-action-title__yellow\s*\{[^}]*color:\s*var\(--cg-yellow\)/s);
  assert.doesNotMatch(styles, /border-radius:\s*\d+(?:\.\d+)?px\s+\d+(?:\.\d+)?px\s+\d+(?:\.\d+)?px\s+\d+(?:\.\d+)?px/);
});

test("the menu stays concise and consistent across every route", () => {
  const script = fs.readFileSync(path.join(root, "site.js"), "utf8");
  assert.match(script, /const routes = \[/);
  assert.match(script, /\{ key: "start", href: "\.\/", label: swedish \? "Start" : "Home" \}/);
  assert.match(script, /\{ key: "game", href: "game\.html", label: "Demo" \}/);
  assert.match(script, /\{ key: "about", href: "about\.html", label: swedish \? "Om spelet" : "About" \}/);
  assert.match(script, /\{ key: "rules", href: "rules\.html", label: swedish \? "Regler" : "Rules" \}/);
  assert.match(script, /languageToggle\.className = `language-toggle/);
  assert.match(script, /languageToggle\.setAttribute\("role", "switch"\)/);
  assert.match(script, /languageToggle\.setAttribute\("aria-checked"/);
  assert.match(script, /nav\.replaceChildren\(\)/);
  assert.doesNotMatch(script, /landing-nav-link--buy/);
  assert.doesNotMatch(script, /createQuickBuyStrip/);
  assert.doesNotMatch(script, /För vem\?|Who is it for/);
});

test("only the about page receives the supporting sticky purchase bar", () => {
  const script = fs.readFileSync(path.join(root, "site.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(script, /if \(currentFile\(\) !== "about\.html" \|\| document\.querySelector\("\.mobile-buy-bar"\)\) return/);
  assert.match(script, /className = "mobile-buy-bar mobile-buy-bar--support"/);
  assert.match(script, /document\.body\.classList\.add\("support-buy-page"\)/);
  assert.match(styles, /\.support-buy-page \.mobile-buy-bar\s*\{[^}]*position:\s*fixed/s);
  assert.match(styles, /\.support-buy-page \.mobile-buy-bar > a\s*\{[^}]*min-height:\s*56px/s);
});

test("supporting pages share the landing page paper-and-mat design", () => {
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(styles, /body\.info-page\s*\{[^}]*background:\s*var\(--cg-paper\)/s);
  assert.match(styles, /\.info-page \.landing-brand\s*\{[^}]*order:\s*2/s);
  assert.match(styles, /\.info-page \.site-menu-toggle\s*\{[^}]*order:\s*1/s);
  assert.match(styles, /\.info-page \.landing-nav\.site-menu-panel\s*\{[^}]*inset:\s*0 auto 0 0/s);
  assert.match(styles, /\.info-page \.landing-hero\s*\{[^}]*background:\s*var\(--cg-paper-deep\)/s);
  assert.match(styles, /\.info-page :is\([\s\S]*\.arena-panel,[\s\S]*\.rule-chain-note[\s\S]*\)\s*\{[^}]*color:\s*var\(--cg-paper\)/s);
});

test("English discovery page keeps visitors on English routes", () => {
  const html = fs.readFileSync(path.join(root, "en", "bjj-card-game.html"), "utf8");
  const nav = html.match(/<nav class="landing-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert.match(nav, /href="game\.html"/);
  assert.match(nav, /href="about\.html"/);
  assert.match(nav, /href="rules\.html"/);
  assert.doesNotMatch(nav, /href="\.\.\/(?:game|about|rules)\.html"/);
});

test("Shopify checkout uses a secure popup overlay with a navigation fallback", () => {
  const script = fs.readFileSync(path.join(root, "site.js"), "utf8");
  assert.match(script, /CAMPAIGN_PARAMETERS/);
  assert.match(script, /checkoutUrlWithCampaignParameters/);
  assert.match(script, /searchParams\.delete\("checkout"\)/);
  assert.match(script, /checkoutUrl\.search = `\?checkout/);
  assert.match(script, /utm_source/);
  assert.match(script, /utm_content/);
  assert.match(script, /window\.open\(url, "chaingrapplers-shopify-checkout"/);
  assert.match(script, /window\.location\.assign\(url\)/);
  assert.match(script, /setBackgroundInert\(true\)/);
  assert.match(script, /returnFocus instanceof HTMLElement/);
  assert.doesNotMatch(script, /createElement\(["']iframe["']\)/i);
});

test("the browser demo exposes card controls and dialogs to keyboard users", () => {
  const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
  assert.match(script, /img\.setAttribute\("role", "button"\)/);
  assert.match(script, /img\.tabIndex = 0/);
  assert.match(script, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(script, /event\.key === "Escape"/);

  for (const htmlFile of ["game.html", path.join("en", "game.html")]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /id="info-text"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(html, /id="card-preview-overlay"[^>]*role="dialog"[^>]*aria-modal="true"/);
    assert.match(html, /id="card-preview-close-btn"/);
  }

  const englishGame = fs.readFileSync(path.join(root, "en", "game.html"), "utf8");
  assert.equal((englishGame.match(/<main\b/g) || []).length, 1);
});

test("the browser demo starts automatically while retaining the new-match control", () => {
  const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
  assert.match(script, /document\.addEventListener\("DOMContentLoaded", startGame, \{ once: true \}\)/);
  assert.match(script, /document\.getElementById\("start-game-btn"\)\.addEventListener\("click", startGame\)/);

  for (const htmlFile of ["game.html", path.join("en", "game.html")]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /script\.js\?v=20260824b/, htmlFile);
  }
});

test("only the start pages retain the contact footer", () => {
  const startPages = ["index.html", path.join("en", "index.html")];
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    const relative = path.relative(root, htmlFile);
    if (startPages.includes(relative)) {
      assert.match(html, /mailto:admin@chaingrapplers\.com/, relative);
    } else {
      assert.doesNotMatch(html, /mailto:admin@chaingrapplers\.com/, relative);
      assert.doesNotMatch(html, /<footer class="site-footer">/, relative);
    }
  }
});

test("language selection follows the requested route instead of stale browser preference", () => {
  const translations = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
  assert.match(translations, /const ROUTE_LANG = document\.documentElement\.lang/);
  assert.match(translations, /return ROUTE_LANG/);
  assert.match(translations, /return `\/en\/\$\{file\}`/);
  assert.doesNotMatch(translations, /const stored = localStorage\.getItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(translations, /language-switcher|language-option|injectSelector/);

  for (const htmlFile of ["game.html", "about.html", "rules.html", "buy.html", path.join("en", "game.html")]) {
    const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
    assert.match(html, /i18n\.js\?v=20260824b/, htmlFile);
  }
});
