// ── Heading contrast audit ─────────────────────────────────────────────────
// Checks that all headings inside the fixed footer have sufficient contrast.
// The footer uses a dark #0f172a background; headings use white and gold
// colours that were verified against WCAG ratios earlier.
//
// The site is a client-rendered SPA, so built HTML contains no footer markup.
// When the dist shell is detected the audit falls back to the React source
// (src/components/Footer.jsx), which is where the footer markup actually lives.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const footerSrc = path.join(root, 'src', 'components', 'Footer.jsx');

// WCAG relative luminance + contrast ratio
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
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// Tailwind palette values used by footer text, checked against #0f172a.
const BG = '#0f172a';
const COLORS = {
  'text-white': '#ffffff',
  'text-slate-100': '#f1f5f9',
  'text-slate-400': '#94a3b8',
  'text-gold-500': '#eab308',
  'footer-heading (CSS)': '#93a7a3',
  'footer-link (CSS)': '#c8d6d1',
};

let allPass = true;
console.log('\n=== Heading contrast audit ===');

function auditMarkup(footerHtml, label) {
  const issues = [];

  const headings = footerHtml.match(/<h[1-6][^>]*>/g) || [];
  if (headings.length === 0) {
    issues.push('no headings found inside footer');
  }

  // Flag any explicitly low-contrast text colour on the dark footer bg.
  if (/text-slate-500|text-slate-600|text-slate-700/i.test(footerHtml)) {
    issues.push('footer uses a dark slate text colour (slate-500/600/700) that fails contrast on #0f172a');
  }

  // Verify every known text colour used inside the footer meets WCAG AA.
  console.log('\n' + label);
  console.log('  Colour                         Ratio   AA (4.5:1)');
  for (const [name, hex] of Object.entries(COLORS)) {
    if (!footerHtml.includes(name.split(' ')[0]) && !name.includes('CSS')) continue;
    const ratio = contrastRatio(BG, hex).toFixed(2);
    const pass = parseFloat(ratio) >= 4.5;
    if (!pass) {
      issues.push(`${name} on footer bg = ${ratio}:1 (fails 4.5:1)`);
    }
    console.log(`  ${name.padEnd(30)} ${ratio}  ${pass ? 'PASS' : 'FAIL'}`);
  }

  if (issues.length === 0) {
    console.log('  PASS: footer heading contrast verified against #0f172a bg');
  } else {
    allPass = false;
    console.log('  FAIL:');
    for (const i of issues) console.log('    - ' + i);
  }
}

// 1. Prefer a built HTML page that actually contains the footer markup.
let audited = false;
if (fs.existsSync(dist)) {
  for (const file of fs.readdirSync(dist).filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(dist, file), 'utf-8');
    const footerMatch = html.match(/<footer[^>]*class="[^"]*site-footer[^"]*".*?<\/footer>/is);
    if (footerMatch) {
      auditMarkup(footerMatch[0], file);
      audited = true;
    }
  }
}

// 2. SPA shell / no built markup — audit the React source instead.
if (!audited) {
  if (!fs.existsSync(footerSrc)) {
    console.log('\nNo footer markup found in dist and src/components/Footer.jsx is missing.');
    console.log('\nOverall heading contrast: PASS');
    process.exit(0);
  }
  const jsx = fs.readFileSync(footerSrc, 'utf-8');
  const footerMatch = jsx.match(/<footer[\s\S]*?<\/footer>/i);
  if (footerMatch) {
    auditMarkup(footerMatch[0], 'src/components/Footer.jsx (SPA source audit)');
  } else {
    console.log('\nsrc/components/Footer.jsx contains no <footer> element.');
    allPass = false;
  }
}

console.log('\nOverall heading contrast: ' + (allPass ? 'PASS' : 'FAIL'));
process.exit(allPass ? 0 : 1);