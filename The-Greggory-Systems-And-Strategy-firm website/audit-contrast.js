const fs = require('fs');
const path = require('path');

function hexToRgb(hex) {
  if (!hex) return null;
  hex = hex.replace('#','').trim();
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const int = parseInt(hex,16);
  return { r: (int>>16)&255, g: (int>>8)&255, b: int&255 };
}
function srgbToLinear(v){ v = v/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
function luminance(rgb){ return 0.2126*srgbToLinear(rgb.r)+0.7152*srgbToLinear(rgb.g)+0.0722*srgbToLinear(rgb.b); }
function contrast(rgb1, rgb2){ const L1 = luminance(rgb1); const L2 = luminance(rgb2); const lighter = Math.max(L1,L2); const darker = Math.min(L1,L2); return (lighter+0.05)/(darker+0.05); }

const cssPath = path.join(process.cwd(),'src','index.css');
if (!fs.existsSync(cssPath)) { console.error('index.css not found at', cssPath); process.exit(1); }
const css = fs.readFileSync(cssPath,'utf8');

function parseVars(blockName){
  const re = new RegExp(blockName.replace(/[-\/\\^$*+?.()|[\\]{}]/g,'\\$&') + '\\s*\\{([\\s\\S]*?)\\}');
  const m = css.match(re);
  if (!m) return {};
  const body = m[1];
  const varRe = /--([a-zA-Z0-9-_]+)\\s*:\\s*([^;]+);/g;
  const vars = {};
  let mm;
  while ((mm = varRe.exec(body)) !== null){ vars[mm[1].trim()] = mm[2].trim(); }
  return vars;
}

const rootVars = parseVars(':root');
const darkVars = parseVars('.dark');

function norm(v){ if(!v) return null; v = v.split(')')[0].trim(); if (v.startsWith('rgba')){ const parts = v.replace(/rgba?\\(|\\)/g,'').split(',').map(s=>s.trim()); return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) }; } if (v.startsWith('rgb')){ const parts = v.replace(/rgba?\\(|\\)/g,'').split(',').map(s=>s.trim()); return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) }; } if (v.startsWith('#')) return hexToRgb(v); return null; }

const checks = [
  { name: 'light: text-primary vs bg-primary', fg: rootVars['text-primary'], bg: rootVars['bg-primary'] },
  { name: 'light: text-secondary vs bg-primary', fg: rootVars['text-secondary'], bg: rootVars['bg-primary'] },
  { name: 'light: border-primary vs bg-primary', fg: rootVars['border-primary'], bg: rootVars['bg-primary'] },
  { name: 'light: accent-primary vs bg-primary', fg: rootVars['accent-primary'], bg: rootVars['bg-primary'] },
  { name: 'dark: text-primary vs bg-primary', fg: darkVars['text-primary'] || rootVars['text-primary'], bg: darkVars['bg-primary'] || rootVars['bg-primary'] },
  { name: 'dark: text-secondary vs bg-primary', fg: darkVars['text-secondary'] || rootVars['text-secondary'], bg: darkVars['bg-primary'] || rootVars['bg-primary'] },
  { name: 'dark: border-primary vs bg-primary', fg: darkVars['border-primary'] || rootVars['border-primary'], bg: darkVars['bg-secondary'] || rootVars['bg-secondary'] },
  { name: 'dark: accent-primary vs bg-primary', fg: darkVars['accent-primary'] || rootVars['accent-primary'], bg: darkVars['bg-primary'] || rootVars['bg-primary'] },
];

console.log('Contrast audit for CSS variables in src/index.css\n');
let failed = 0;
checks.forEach(c => {
  const fgv = c.fg ? c.fg.replace(/\s+/g,'') : null;
  const bgv = c.bg ? c.bg.replace(/\s+/g,'') : null;
  const fg = norm(fgv);
  const bg = norm(bgv);
  if (!fg || !bg){ console.log(`- ${c.name}: MISSING color (fg=${String(c.fg)}, bg=${String(c.bg)})`); failed++; return; }
  const cr = contrast(fg,bg);
  const pass = cr >= 4.5;
  const passLarge = cr >= 3.0;
  console.log(`- ${c.name}: fg=${fgv} bg=${bgv} → contrast=${cr.toFixed(2)} : ${pass ? 'PASS (normal text)' : (passLarge ? 'FAIL normal, PASS large' : 'FAIL (insufficient)')}`);
  if (!pass) failed++;
});

if (failed === 0) console.log('\nAll checked variable pairs meet WCAG AA for normal text.');
else console.log(`\n${failed} checks failed WCAG AA for normal text. Consider adjusting text or background colors.`);
