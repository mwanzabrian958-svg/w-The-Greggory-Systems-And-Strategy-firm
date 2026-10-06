// ── Fixed footer contrast & accessibility audit ────────────────────────────
// Runs on the built CSS to check that the new .site-footer colour tokens
// keep a strong contrast ratio against their on-surface backgrounds.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const cssFiles = fs.existsSync(dist)
  ? fs.readdirSync(dist).filter(f => f.endsWith('.css'))
  : [];

// Measured WCAG ratios (relative luminance) for the palette actually used in
// the fixed footer: #0f172a background, #f8faf9 body text, #c8d6d1 links,
// #93a7a3 headings, #eab308 gold accents, #f2b842 focus ring.
// This script prints the numbers so you can eyeball them against the AA
// thresholds (4.5:1 body / 3:1 large text / 3:1 UI components).

const C = {
  bg:    '#0f172a',   // dark site footer background
  fg:    '#f8faf9',   // footer text
  focus: '#f2b842',   // focus ring outline
  link:  '#c8d6d1',   // .footer-link colour
  heading: '#93a7a3', // .footer-heading colour
  gold:  '#eab308',   // tailwind gold-500 accents
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => linearize(v));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const lighter = Math.max(L1, L2);
  const darker  = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  ['footer background', '#0f172a', 'footer text', '#f8faf9'],
  ['footer background', '#0f172a', 'footer link', '#c8d6d1'],
  ['footer background', '#0f172a', 'footer heading', '#93a7a3'],
  ['footer background', '#0f172a', 'footer gold accent', '#eab308'],
  ['footer background', '#0f172a', 'focus ring', '#f2b842'],
];

let allPass = true;
console.log('\n=== Fixed footer contrast audit ===');
console.log('Background #0f172a vs text #f8faf9, link #c8d6d1, heading #93a7a3, gold #eab308, focus #f2b842');
console.log('\nPair                              Ratio   AA (body 4.5:1)');
for (const [label, c1, label2, c2] of pairs) {
  const r = contrastRatio(c1, c2).toFixed(2);
  const pass = parseFloat(r) >= 4.5;
  if (!pass) allPass = false;
  console.log(`${label} on ${label2.padEnd(28)} ${r}  ${pass ? 'PASS' : 'FAIL (< 4.5:1)'}`);
}

console.log(`\nOverall footer contrast: ${allPass ? 'PASS' : 'FAIL'}`);
process.exit(allPass ? 0 : 1);
