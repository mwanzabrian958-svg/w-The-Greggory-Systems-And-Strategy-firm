// Endpoint connectivity audit — run anytime:  node scripts/endpoint-audit.js
// Cross-references every frontend API call (src/) against every backend route
// actually registered by server.js (inline routes, app.use mounts, and the
// modularRoutes registry). Masks nothing (paths only). Exit 1 if gaps found.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const norm = (p) =>
  p
    .split('?')[0]
    .replace(/\$\{[^}]*\}/g, '*')
    .replace(/\$\{[^}]*$/, '*') // template literal cut off at a nested backtick
    .replace(/:[^/]+/g, '*')
    .replace(/\/+$/, '') || '/';
const seg = (p) => p.split('/').filter(Boolean);
const match = (fe, be) => {
  const a = seg(fe), b = seg(be);
  return a.length === b.length && a.every((s, i) => s === b[i] || s === '*' || b[i] === '*');
};

// ---- Backend inventory ----
const backend = new Map(); // normPath -> [where]
const addB = (p, where) => { if (!backend.has(p)) backend.set(p, []); backend.get(p).push(where); };
const serverSrc = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
for (const m of serverSrc.matchAll(/\bapp\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]/g))
  if (m[2].startsWith('/api')) addB(norm(m[2]), `server.js ${m[1].toUpperCase()}`);
const reqs = {};
for (const m of serverSrc.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/g)) reqs[m[1]] = m[2];
const resolveFile = (rel) =>
  [path.resolve(root, rel.replace(/^\.\//, '')), path.resolve(root, rel.replace(/^\.\//, '') + '.js')]
    .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const mounts = [];
// a) app.use("path", ident) / app.use("path", require("mod"))
for (const m of serverSrc.matchAll(/app\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:(\w+)|require\(\s*['"]([^'"]+)['"]\s*\))/g)) {
  const file = m[3] || reqs[m[2]];
  if (file) mounts.push({ mount: m[1], file });
}
// b) modularRoutes registry: { path: "/api/x", route: "./backend/routes/x" }
for (const m of serverSrc.matchAll(/\{\s*path:\s*["']([^"']+)["']\s*,\s*route:\s*["']([^"']+)["']\s*\}/g))
  mounts.push({ mount: m[1], file: m[2] });
let routerFiles = 0;
for (const { mount, file } of mounts) {
  const fp = resolveFile(file);
  if (!fp) continue;
  routerFiles++;
  const src = fs.readFileSync(fp, 'utf8');
  const where = path.basename(fp);
  for (const r of src.matchAll(/\brouter\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]/g)) {
    let p = r[2]; if (p === '/' || p === '') p = ''; else if (!p.startsWith('/')) p = '/' + p;
    addB(norm(mount + p), `${where} ${r[1].toUpperCase()}`);
  }
  for (const r of src.matchAll(/\brouter\.route\(\s*['"`]([^'"`]+)['"`]/g)) {
    let p = r[1]; if (p === '/' || p === '') p = ''; else if (!p.startsWith('/')) p = '/' + p;
    addB(norm(mount + p), `${where} ROUTE`);
  }
}

// ---- Frontend calls ----
const calls = new Map(); // normPath -> Set(files)
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) walk(fp, out);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) out.push(fp);
  }
  return out;
};
for (const f of walk(path.join(root, 'src'))) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const add = (raw) => {
    if (!raw) return;
    // Drop a tail cut off by a nested template literal, e.g. `/download${user?.token ? `
    // (the regex stops at the inner backtick). Only strips UNTERMINATED ${... —
    // terminated ones like ${projectId} are left for the '*' normalization below.
    raw = raw.replace(/\$\{[^}]*$/, '');
    const q = raw.split('?')[0];
    const full = q === '/api' || q.startsWith('/api/') ? q : '/api' + q;
    const n = norm(full);
    if (!calls.has(n)) calls.set(n, new Set());
    calls.get(n).add(rel);
  };
  for (const m of src.matchAll(/\bapiCall\(\s*[`'"](\/[^`'"]+)[`'"]/g)) add(m[1]);
  for (const m of src.matchAll(/\bgetApiUrl\(\s*[`'"](\/[^`'"]+)[`'"]/g)) add(m[1]);
  for (const m of src.matchAll(/\bfetch\(\s*[`'"](\/api[^`'"]+)[`'"]/g)) add(m[1]);
}

// ---- Report ----
const bePaths = [...backend.keys()];
let ok = 0;
const broken = [];
for (const [fe, files] of [...calls.entries()].sort()) {
  const hit = bePaths.find((be) => match(fe, be));
  if (hit) ok++;
  else broken.push({ fe, files: [...files].sort() });
}
console.log(`BACKEND: ${bePaths.length} registered /api routes (server.js inline + ${routerFiles} mounted router files)`);
console.log(`FRONTEND: ${calls.size} distinct endpoints called from src/`);
console.log(`CONNECTED: ${ok}/${calls.size}`);
console.log(broken.length === 0
  ? '\n=== RESULT: every frontend endpoint has a matching backend route ==='
  : `\n=== GAPS (${broken.length}) — frontend calls with no backend route ===`);
for (const b of broken) {
  console.log(`  ${b.fe}`);
  for (const f of b.files) console.log(`      called in: ${f}`);
}
const uncalled = bePaths.filter((be) => !calls.has(be) && ![...calls.keys()].some((fe) => match(fe, be)));
console.log(`\n(info) backend routes never called from src/: ${uncalled.length}`);
process.exit(broken.length === 0 ? 0 : 1);
