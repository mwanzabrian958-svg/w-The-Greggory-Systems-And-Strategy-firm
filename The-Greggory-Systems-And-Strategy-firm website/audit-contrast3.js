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
const content = fs.readFileSync(cssPath,'utf8');
const lines = content.split(/\r?\n/);

function extractBlock(name){
  const vars = {};
  const startIdx = lines.findIndex(l => l.trim().startsWith(name));
  if (startIdx === -1) return vars;
  // find opening brace on same line or following
  let i = startIdx;
  while (i < lines.length && !lines[i].includes('{')) i++;
  if (i === lines.length) return vars;
  let depth = 0;
  for (; i < lines.length; i++){
    const line = lines[i];
    for (const ch of line) { if (ch === '{') depth++; if (ch === '}') depth--; }
    if (depth <= 0) break;
    const m = line.match(/--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

const root = extractBlock(':root');
const dark = extractBlock('.dark');

console.log('Parsed CSS variables (first 20 shown each scope):');
console.log('root:', Object.entries(root).slice(0,20));
console.log('dark:', Object.entries(dark).slice(0,20));

function norm(v){ if(!v) return null; v = v.split(')')[0].trim(); if (/rgba?\(/.test(v)){
  const parts = v.replace(/rgba?\(|\)/g,'').split(',').map(s=>s.trim()); return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) };
}
 if (v.startsWith('#')) return hexToRgb(v); if (/^[0-9]+$/.test(v)) return { r: +v, g: +v, b: +v }; return null; }

const checks = [
  { name: 'light: text-primary vs bg-primary', fg: root['text-primary'], bg: root['bg-primary'] },
  { name: 'light: text-secondary vs bg-primary', fg: root['text-secondary'], bg: root['bg-primary'] },
  { name: 'light: border-primary vs bg-primary', fg: root['border-primary'], bg: root['bg-primary'] },
  { name: 'light: accent-primary vs bg-primary', fg: root['accent-primary'], bg: root['bg-primary'] },
  { name: 'dark: text-primary vs bg-primary', fg: (dark['text-primary'] || root['text-primary']), bg: (dark['bg-primary'] || root['bg-primary']) },
  { name: 'dark: text-secondary vs bg-primary', fg: (dark['text-secondary'] || root['text-secondary']), bg: (dark['bg-primary'] || root['bg-primary']) },
  { name: 'dark: border-primary vs bg-secondary', fg: (dark['border-primary'] || root['border-primary']), bg: (dark['bg-secondary'] || root['bg-secondary']) },
  { name: 'dark: accent-primary vs bg-primary', fg: (dark['accent-primary'] || root['accent-primary']), bg: (dark['bg-primary'] || root['bg-primary']) },
];

let failed = 0;
console.log('\nContrast audit results:');
checks.forEach(c=>{
  const fgv = c.fg; const bgv = c.bg;
  const fg = norm(String(fgv || '').trim());
  const bg = norm(String(bgv || '').trim());
  if (!fg || !bg){ console.log(`- ${c.name}: MISSING color (fg=${String(fgv)}, bg=${String(bgv)})`); failed++; return; }
  const cr = contrast(fg,bg);
  const pass = cr >= 4.5; const passLarge = cr >= 3.0;
  console.log(`- ${c.name}: fg=${fgv} bg=${bgv} → contrast=${cr.toFixed(2)} : ${pass ? 'PASS (normal text)' : (passLarge ? 'FAIL normal, PASS large' : 'FAIL (insufficient)')}`);
  if (!pass) failed++;
});

console.log('');
if (failed===0) console.log('All checked variable pairs meet WCAG AA for normal text.');
else console.log(`${failed} checks failed WCAG AA for normal text. Recommendations: adjust colors listed above (make text darker or background lighter/darker to reach contrast ≥ 4.5).`);

// Suggest conservative tweaks for failures by nudging text darker or bg lighter
console.log('\nSuggested conservative fixes (automatic proposals):');
checks.forEach(c=>{
  const fgv = c.fg; const bgv = c.bg;
  const fg = norm(String(fgv || '').trim());
  const bg = norm(String(bgv || '').trim());
  if (!fg || !bg) return;
  const cr = contrast(fg,bg);
  if (cr >= 4.5) return;
  // If text is lighter than bg, darken text; else lighten text
  const Lf = luminance(fg); const Lb = luminance(bg);
  const target = 4.5;
  // naive approach: move text color towards black or white by factor until contrast sufficient
  const towards = Lf > Lb ? 'black' : 'white';
  function mix(c1,c2,f){ return { r: Math.round(c1.r*(1-f)+c2.r*f), g: Math.round(c1.g*(1-f)+c2.g*f), b: Math.round(c1.b*(1-f)+c2.b*f) }; }
  const black = {r:0,g:0,b:0}; const white={r:255,g:255,b:255};
  let fstep = 0.05; let best=null;
  for (let t=0;t<=1;t+=fstep){ const candidate = mix(fg, towards==='black'?black:white, t); const cr2 = contrast(candidate,bg); if (cr2>=target){ best = {candidate,ratio:cr2,t}; break; } }
  if (best){ const hex = '#'+((1<<24) + (best.candidate.r<<16) + (best.candidate.g<<8) + best.candidate.b).toString(16).slice(1);
    console.log(`- ${c.name}: propose changing fg ${fgv} -> ${hex} to reach contrast ${best.ratio.toFixed(2)}`);
  } else {
    console.log(`- ${c.name}: could not find simple fg adjustment; consider changing background ${bgv} instead`);
  }
});
