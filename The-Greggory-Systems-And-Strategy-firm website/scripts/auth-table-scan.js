#!/usr/bin/env node
/**
 * Non-destructive auth TABLE-SCAN. Static (no server, no DB): prints every
 * auth-related route definition alongside the auth tables each SQL line
 * touches, so a route->table mapping mistake (a client login reading
 * admin_users, etc.) shows up in the text before it ships.
 *
 * Complements scripts/check-auth-route-map.js (which proves the same mapping
 * against a LIVE server) and scripts/audit-endpoint-links.js (which proves
 * endpoint linkage). Run:  node scripts/auth-table-scan.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const R = (f) => path.join(__dirname, "..", f);

const ROUTE_RE = /(?:router|app)\.(get|post|put|delete|patch)\(\s*["'`]([^"'`]+)["'`]/;
const TABLE_RE = /\b(?:FROM|INTO|UPDATE|JOIN)\s+`?(users|admin_users|admin_user_sessions|user_sessions|developers|developer_sessions|clients|team_members)\b/gi;

const FILES = [
  "backend/routes/users.js",
  "backend/routes/admin.js",
  "backend/routes/admin-verification.js",
  "backend/routes/developer-verification.js",
  "server/utils/clientAuth.js",
  "server/utils/adminAuth.js",
];

function scan(rel) {
  const file = R(rel);
  if (!fs.existsSync(file)) { console.log(`(missing ${rel})`); return; }
  console.log(`\n===== ${rel} =====`);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  let currentRoute = "(top)";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rm = line.match(ROUTE_RE);
    if (rm) currentRoute = `${rm[1].toUpperCase()} ${rm[2]}`;
    TABLE_RE.lastIndex = 0;
    const hits = [...line.matchAll(TABLE_RE)].map(m => m[1].toLowerCase());
    if (hits.length) {
      console.log(`  [${currentRoute}] L${i + 1}: ${[...new Set(hits)].join(", ")}`);
    }
  }
}
FILES.forEach(scan);

// server.js: only the auth-related monolith sections
console.log("\n===== server.js (auth sections only) =====");
const sLines = fs.readFileSync(R("server.js"), "utf8").split(/\r?\n/);
let cur = null;
for (let i = 0; i < sLines.length; i++) {
  const m = sLines[i].match(ROUTE_RE);
  if (m) {
    const p = m[2];
    cur = /login|register|auth|session|password|token|verify|developer/i.test(p) ? `${m[1].toUpperCase()} ${p}` : null;
  }
  if (!cur) continue;
  TABLE_RE.lastIndex = 0;
  const hits = [...sLines[i].matchAll(TABLE_RE)].map(h => h[1].toLowerCase());
  if (hits.length) console.log(`  [${cur}] L${i + 1}: ${[...new Set(hits)].join(", ")}`);
}
