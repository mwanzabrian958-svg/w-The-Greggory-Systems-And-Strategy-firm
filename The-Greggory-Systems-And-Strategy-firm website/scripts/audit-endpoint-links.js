#!/usr/bin/env node
/**
 * audit-endpoint-links.js — cross-references every HTTP endpoint the BACKEND
 * exposes (monolith server.js + every mounted router file) against the API
 * paths the WEBSITE (src/**) actually calls, in either direction:
 *   1. BACKEND endpoints with no website caller → "unlinked".
 *   2. WEBSITE calls with no backend definition → guaranteed 404s.
 *   3. Method gaps: path linked but specific verbs never called.
 * Run:  node scripts/audit-endpoint-links.js
 * Out:  console summary + scripts/endpoint-links-report.md
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VERBS = ["get", "post", "put", "delete", "patch"];
const read = (f) => fs.readFileSync(f, "utf8");
const lineOf = (t, i) => t.slice(0, i).split("\n").length;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

/** Normalize an endpoint path: params/templates → '*', api-prefix applied. */
function norm(raw, { apiPrefix = false } = {}) {
  let p = String(raw).split("?")[0].split("#")[0].trim();
  p = p.split("${API_BASE_URL}").join("/api").split("${API_BASE}").join("/api");
  let prev;
  do { prev = p; p = p.replace(/\$\{[^{}]*\}/g, "*"); } while (p !== prev);
  const cut = p.indexOf("${"); // unterminated nested template tail → truncate
  if (cut !== -1) p = p.slice(0, cut).replace(/\/$/, "");
  p = p.replace(/\\?\((?:\\[dw s.]*|[^)]{1,12})\)/g, ""); // express regex constraints :id(\d+)
  p = p.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, "*");
  if (!p.startsWith("/")) p = "/" + p;
  if (apiPrefix && !p.startsWith("/api/")) p = "/api" + (p === "/" ? "" : p);
  p = p.replace(/\/{2,}/g, "/");
  if (raw.trim().endsWith("/") && p.length > 1 && !p.endsWith("*")) p += "/*";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/* ---------------- backend inventory ---------------- */
const backend = []; // {method, path, src, line}
const warnings = [];

function scanRouterFile(file, prefix, seen = new Set()) {
  if (seen.has(file)) return;
  seen.add(file);
  if (!fs.existsSync(file)) { warnings.push(`missing router file: ${file}`); return; }
  const t = read(file);
  const Q = "`\"'";
  for (const v of VERBS) {
    const re = new RegExp("\\b(?:router|\\w*Router)\\." + v + "\\(\\s*[" + Q + "]([^" + Q + "]+)", "g");
    let m;
    while ((m = re.exec(t))) {
      const sub = m[1];
      const full = sub === "/" ? prefix : prefix.replace(/\/$/, "") + (sub.startsWith("/") ? sub : "/" + sub);
      backend.push({ method: v.toUpperCase(), path: norm(full), src: path.relative(ROOT, file), line: lineOf(t, m.index) });
    }
  }
  const sub = /router\.use\(\s*["'`]([^"'`]+)["'`]\s*,\s*require\(\s*["']([^"']+)["']\s*\)/g;
  let m2;
  while ((m2 = sub.exec(t))) {
    const p2 = m2[2];
    scanRouterFile(path.resolve(path.dirname(file), p2 + (/\.js$/.test(p2) ? "" : ".js")), norm(prefix.replace(/\/$/, "") + m2[1]), seen);
  }
}

const sv = read(path.join(ROOT, "server.js"));

// monolith routes
for (const v of VERBS) {
  const re = new RegExp("\\bapp\\." + v + "\\(\\s*[\"'`]([^\"'`]+)", "g");
  let m;
  while ((m = re.exec(sv))) {
    if (!m[1].startsWith("/api/")) continue; // SPA/error routes are not APIs
    backend.push({ method: v.toUpperCase(), path: norm(m[1]), src: "server.js", line: lineOf(sv, m.index) });
  }
}

// resolve `const X = require("./…")` variables
const varMap = {};
let m;
const vRe = /(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*["'](\.\/[^"']+?)["']\s*\)/g;
while ((m = vRe.exec(sv))) varMap[m[1]] = m[2];

// direct app.use mounts + the modularRoutes table
const useRe = /app\.use\(\s*["'](\/[^"']+)["']\s*,\s*(?:require\(\s*["'](\.\/[^"']+?)["']\s*\)|(\w+))/g;
const mounted = [];
while ((m = useRe.exec(sv))) {
  let mod = m[2];
  if (!mod) mod = varMap[m[3]];
  if (!mod) { warnings.push(`unresolved router var: ${m[3]}`); continue; }
  mounted.push([m[1], mod]);
}
const tblRe = /\{\s*path:\s*["']([^"']+)["']\s*,\s*route:\s*["'](\.\/[^"']+)["']\s*\}/g;
while ((m = tblRe.exec(sv))) mounted.push([m[1].startsWith("/api") ? m[1] : "/api" + m[1], m[2]]);

const seenFiles = new Set();
for (const [prefix, mod] of mounted) {
  scanRouterFile(path.resolve(ROOT, mod + (/\.js$/.test(mod) ? "" : ".js")), prefix, seenFiles);
}

/* ---------------- frontend inventory ---------------- */
const front = new Map(); // path -> {methods:Set, files:Set}
function addFront(p, method, file) {
  if (p === "/api*" || p === "/api") return; // bare base-url artifacts
  if (!front.has(p)) front.set(p, { methods: new Set(), files: new Set() });
  const e = front.get(p);
  e.methods.add(method);
  e.files.add(path.relative(ROOT, file).replace(/\\/g, "/"));
}

for (const file of walk(path.join(ROOT, "src")).filter((f) => /\.(js|jsx)$/.test(f))) {
  const t = read(file);
  let f;
  // apiCall('/x', {method:'POST'|methodType:`POST`|…}) — apiCall paths are /api-relative.
  // Match ONLY the quoted path, then sniff the following options object in a
  // separate slice (cut at the next apiCall so back-to-back defs don't steal
  // each other's methods).
  const ac = /apiCall\(\s*[`'"]([^`'"]+)[`'"]/g;
  while ((f = ac.exec(t))) {
    let tail = t.slice(f.index + f[0].length, f.index + f[0].length + 240).split("apiCall")[0];
    let method = "ANY";
    const mm = /(?:method|methodType)\s*[:=]\s*[`'"]?(GET|POST|PUT|DELETE|PATCH)/i.exec(tail);
    if (mm) method = mm[1].toUpperCase();
    addFront(norm(f[1], { apiPrefix: true }), method, file);
  }
  // any literal that references /api/ or `${API_BASE…}` (fetch, img src, window.open…)
  const lit = /[`'"]([^`'"\n]{0,220})[`'"]/g;
  while ((f = lit.exec(t))) {
    const s = f[1];
    if (s === "/api" || s === "/api/" || s.length < 6) continue; // bare base-url constants
    if (!/(^|[^a-z])\/api\/|\$\{API_BASE/.test(s)) continue;
    addFront(norm(s), "ANY", file);
  }
}

/* ---------------- match ---------------- */
const segMatch = (a, b) => {
  const as = a.split("/"), bs = b.split("/");
  if (as.length !== bs.length) return false;
  return as.every((s, i) => s === bs[i] || s === "*" || bs[i] === "*");
};
const anyMatch = (p, list) =>
  list.some((q) => segMatch(p, q) || segMatch(p.replace(/\/\*$/, ""), q) || segMatch(p, q.replace(/\/\*$/, "")));

const bPaths = [...new Set(backend.map((b) => b.path))];
const fPaths = [...front.keys()];

const unlinked = backend.filter((b) => !anyMatch(b.path, fPaths));
const broken = fPaths.filter((p) => !anyMatch(p, bPaths));

const byPathMethods = {};
for (const b of backend) (byPathMethods[b.path] = byPathMethods[b.path] || new Set()).add(b.method);
const methodGaps = [];
for (const [p, e] of front) {
  if (e.methods.has("ANY")) continue;
  const declared = byPathMethods[p]; // exact normalized path only — no wildcard attribution
  if (!declared) continue;
  const missing = [...declared].filter((v) => !e.methods.has(v));
  if (missing.length) methodGaps.push({ path: p, used: [...e.methods].join(","), unused: missing.join(",") });
}

/* ---------------- report ---------------- */
const uniqUnlinked = [];
const seenK = new Set();
for (const b of unlinked) { const k = b.path + b.method; if (!seenK.has(k)) { seenK.add(k); uniqUnlinked.push(b); } }

const lines = [];
lines.push("# Endpoint link report", `Backend endpoints: ${backend.length} (${bPaths.length} paths) | Website call paths: ${fPaths.length}`, "");
lines.push(`## 1. Backend endpoints NOT called by the website (${uniqUnlinked.length})`);
uniqUnlinked.sort((a, b) => a.src.localeCompare(b.src) || a.path.localeCompare(b.path));
for (const b of uniqUnlinked) lines.push(`- \`${b.method} ${b.path}\` — ${b.src}:${b.line}`);
lines.push("", `## 2. Website calls with NO backend route (404 risk) (${broken.length})`);
for (const p of broken) lines.push(`- \`${p}\` — called from ${[...front.get(p).files].slice(0, 3).join(", ")}`);
lines.push("", `## 3. Method gaps (path linked, some verbs never called) (${methodGaps.length})`);
for (const g of methodGaps) lines.push(`- \`${g.path}\` — website uses ${g.used}; unused verbs: ${g.unused}`);
if (warnings.length) lines.push("", "## Warnings", ...warnings.map((w) => `- ${w}`));

fs.writeFileSync(path.join(__dirname, "endpoint-links-report.md"), lines.join("\n") + "\n");
console.log(`Backend endpoints: ${backend.length} (${bPaths.length} paths) | Website call paths: ${fPaths.length}`);
console.log(`Unlinked backend endpoints: ${uniqUnlinked.length} | Broken frontend calls: ${broken.length} | Method gaps: ${methodGaps.length}`);
console.log("Full report -> scripts/endpoint-links-report.md");

