// Run: npm run check:frontend
// Checks that the merged frontend/ folder is complete and wired to the API.
// It does not start anything and needs no database.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..', 'frontend');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => (exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '');

const problems = [];
const warnings = [];
const passed = [];
const check = (cond, okMsg, badMsg) => (cond ? passed : problems).push(cond ? okMsg : badMsg);

// 1. original files restored?
for (const f of ['index.html', 'product.html', 'css/style.css', 'js/cart.js', 'js/products.js',
  'js/product-details.js', 'js/config.js', 'data/products.json']) {
  check(exists(f), `found ${f}`, `MISSING ${f}  (copy it from your old project)`);
}

// 2. every seed product has its image
const missing = require('../src/seeds/products.json').map((p) => p.image).filter((img) => !exists(img));
check(missing.length === 0, 'all 15 product images found', `missing images: ${missing.join(', ')}`);

// 3. API config loaded before the other scripts
for (const page of ['index.html', 'product.html']) {
  const html = read(page);
  const cfg = html.indexOf('js/config.js');
  const cart = html.indexOf('js/cart.js');
  check(cfg !== -1 && (cart === -1 || cfg < cart), `${page} loads config.js first`,
    `${page}: add <script src="js/config.js"></script> above the cart.js script`);
}

// 4. scripts connected to the API
check(/API_BASE/.test(read('js/products.js')), 'products.js uses the API', 'js/products.js does not use API_BASE');
check(/API_BASE/.test(read('js/product-details.js')), 'product-details.js uses the API', 'js/product-details.js does not use API_BASE');
check(/addToCart/.test(read('js/cart.js')), 'cart.js defines addToCart', 'js/cart.js must define addToCart');

// 5. leftover note
check(!exists('COPY-YOUR-FILES.txt'), 'COPY-YOUR-FILES.txt removed', 'delete frontend/COPY-YOUR-FILES.txt');

// 6. element ids used by the scripts exist in the pages (warning only: some may be created by the script)
const wiring = { 'js/products.js': ['index.html'], 'js/product-details.js': ['product.html'], 'js/cart.js': ['index.html', 'product.html'] };
for (const [js, pages] of Object.entries(wiring)) {
  const ids = [...read(js).matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]);
  for (const page of pages) {
    const html = read(page);
    for (const id of new Set(ids)) {
      if (html && !html.includes(`id="${id}"`)) warnings.push(`${js} looks for #${id}, not found in ${page}`);
    }
  }
}

passed.forEach((m) => console.log('  OK      ' + m));
warnings.forEach((m) => console.log('  WARN    ' + m));
problems.forEach((m) => console.log('  PROBLEM ' + m));
console.log(problems.length ? `\n${problems.length} problem(s) to fix.` : '\nFrontend looks complete.');
process.exit(problems.length ? 1 : 0);
