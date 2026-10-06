// Admin dashboard endpoint audit.
//
// Cross-references every API path the admin UI calls (apiCall / fetch in
// src/admin/**) against every handler the backend defines:
//   - router.get/post/put/delete/patch in backend/routes/*.js (path prefix
//     taken from each file's mount point in server.js)
//   - app.get/app.post/... inline handlers in server.js
//
// Reports three buckets:
//   OK       — handler found
//   MISSING  — UI calls it, backend has no handler (404 at runtime)
//   UNMOUNTED— route file defines it but the file is never mounted
//
// Run: node scripts/audit-admin-endpoints.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_ADMIN = path.join(ROOT, 'src', 'admin');
const ROUTES_DIR = path.join(ROOT, 'backend', 'routes');
const SERVER_JS = path.join(ROOT, 'server.js');

/* ── 1. collect endpoints the admin UI calls ─────────────────────────── */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const uiCalls = new Map(); // endpoint -> [files]

function record(map, key, file) {
  const rel = path.relative(ROOT, file);
  if (!map.has(key)) map.set(key, []);
  if (!map.get(key).includes(rel)) map.get(key).push(rel);
}

const apiCallRe = /apiCall\(\s*['"`]([^'"`]+)['"`]/g;
const fetchRe = /fetch\(\s*['"`](\/api\/[^'"`]+)['"`]/g;

for (const file of walk(SRC_ADMIN)) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = apiCallRe.exec(text))) record(uiCalls, normalize(m[1]), file);
  while ((m = fetchRe.exec(text))) record(uiCalls, normalize(m[1]), file);
}

function normalize(p) {
  // strip query string + trailing slash, keep leading /
  p = p.split('?')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (!p.startsWith('/')) p = '/' + p;
  // apiCall() routes every endpoint through getApiUrl(), which prefixes
  // API_BASE_URL ('/api') and strips any legacy '/api' the caller included.
  // Mirror that so UI paths are compared on the same footing as routes.
  if (p === '/api') p = '';
  else if (p.startsWith('/api/')) p = p.slice(4);
  // ${expr} template segments are dynamic ids at runtime — treat like :params.
  // `/${expr}` (segment) -> `/:dyn`; bare `${expr}` appended mid-string
  // (e.g. `ledger${location.search}`) is a query suffix — drop it.
  p = p.replace(/\/\$\{[^}]*\}/g, '/:dyn').replace(/\$\{[^}]*\}/g, '');
  return p;
}

/* ── 2. collect handlers the backend defines ─────────────────────────── */

// Mount discovery — three shapes exist in server.js:
//   const x = require("./backend/routes/x");  app.use("/api/x", x);
//   app.use("/api/x", require("./backend/routes/x"))
//   modularRoutes = [{ path: "/api/x", route: "./backend/routes/x" }]
const serverText = fs.readFileSync(SERVER_JS, "utf8");
const mounts = new Map(); // "/api/x" -> "/abs/path/to/x.js"

function resolveRouteFile(rel) {
  const base = path.join(ROOT, rel.replace("./", ""));
  if (fs.existsSync(base)) return base;
  if (fs.existsSync(base + ".js")) return base + ".js";
  return null;
}

// shape 1: require into a variable + app.use with that variable
const requireVarRe =
  /(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*["'`](\.\/backend\/routes\/[^"'`]+)["'`]\s*\)/g;
const requireVars = new Map();
let m;
while ((m = requireVarRe.exec(serverText))) requireVars.set(m[1], m[2]);

const useVarRe = /app\.use\(\s*["'`](\/api\/[^"'`]+)["'`]\s*,\s*(\w+)\s*\)/g;
while ((m = useVarRe.exec(serverText))) {
  const rel = requireVars.get(m[2]);
  if (rel) {
    const file = resolveRouteFile(rel);
    if (file) mounts.set(m[1].replace(/\/$/, ""), file);
  }
}

// shape 2: app.use inline require
const useRe =
  /app\.use\(\s*["'`](\/api\/[^"'`]+)["'`]\s*,\s*[^)]*?require\(\s*["'`](\.\/backend\/routes\/[^"'`]+)["'`]\s*\)/g;
while ((m = useRe.exec(serverText))) {
  const file = resolveRouteFile(m[2]);
  if (file) mounts.set(m[1].replace(/\/$/, ""), file);
}

// shape 3: modularRoutes array
const modularRe =
  /{\s*path:\s*["'`](\/api\/[^"'`]+)["'`]\s*,\s*route:\s*["'`](\.\/backend\/routes\/[^"'`]+)["'`]\s*}/g;
while ((m = modularRe.exec(serverText))) {
  const file = resolveRouteFile(m[2]);
  if (file) mounts.set(m[1].replace(/\/$/, ""), file);
}

const routeDefRe = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const appDefRe = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;

const backendHandlers = new Map(); // endpoint -> [origin]
const routeFilesOnDisk = fs.readdirSync(ROUTES_DIR).filter((f) => f.endsWith(".js"));
const mountedFiles = new Set();

for (const [mount, file] of mounts) {
  mountedFiles.add(path.basename(file));
  const text = fs.readFileSync(file, "utf8");
  let r;
  routeDefRe.lastIndex = 0;
  while ((r = routeDefRe.exec(text))) {
    const sub = r[2] === "/" ? "" : r[2];
    const full = normalize(mount + sub);
    if (!backendHandlers.has(full)) backendHandlers.set(full, []);
    backendHandlers.get(full).push(path.basename(file));
  }
}

// inline handlers in server.js (these are mounted at their literal path)
let a;
appDefRe.lastIndex = 0;
while ((a = appDefRe.exec(serverText))) {
  const full = normalize(a[2]);
  if (!backendHandlers.has(full)) backendHandlers.set(full, []);
  backendHandlers.get(full).push('server.js (inline)');
}

// catch-all style handlers: app.get("/api/x/:id", ...) — match dynamic
function findHandler(uiPath) {
  if (backendHandlers.has(uiPath)) return backendHandlers.get(uiPath);
  // exact dynamic segment match — wildcards on EITHER side:
  // backend ':id' params and UI ':dyn' (from ${expr} template literals)
  const dyn = uiPath.split('/');
  for (const [def, origin] of backendHandlers) {
    const defParts = def.split('/');
    if (defParts.length !== dyn.length) continue;
    let ok = true;
    for (let i = 0; i < defParts.length; i++) {
      const seg = defParts[i];
      if (seg.startsWith(':') || seg === '*' || dyn[i] === ':dyn') continue;
      if (seg !== dyn[i]) { ok = false; break; }
    }
    if (ok) return origin;
  }
  return null;
}

/* ── 3. diff ─────────────────────────────────────────────────────────── */

const missing = [];
const unmountedFiles = routeFilesOnDisk.filter((f) => !mountedFiles.has(f));

console.log('\n=== ADMIN UI -> BACKEND ENDPOINT AUDIT ===\n');
console.log(`UI endpoints referenced : ${uiCalls.size}`);
console.log(`Backend handler paths   : ${backendHandlers.size}`);
console.log(`Route files mounted     : ${mountedFiles.size}/${routeFilesOnDisk.length}`);

console.log('\n--- per-endpoint ---');
for (const [ep, files] of [...uiCalls].sort()) {
  const handler = findHandler(ep);
  if (handler) {
    console.log(`  OK       ${ep.padEnd(55)} <- ${handler.join(', ')}`);
  } else {
    missing.push([ep, files]);
    console.log(`  MISSING  ${ep.padEnd(55)} <- ${files.join(', ')}`);
  }
}

if (unmountedFiles.length) {
  console.log('\n--- route files on disk that server.js never mounts ---');
  for (const f of unmountedFiles) console.log(`  UNMOUNTED ${f}`);
}

console.log(`\nRESULT: ${missing.length} missing, ${unmountedFiles.length} unmounted file(s)\n`);
process.exit(missing.length ? 1 : 0);
