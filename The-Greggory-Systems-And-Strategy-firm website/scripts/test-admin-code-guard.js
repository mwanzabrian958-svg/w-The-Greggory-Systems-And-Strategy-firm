/**
 * ADMIN-CODE PURGE REGRESSION TEST (no DB required)
 *
 * The old ADMIN_CODE second factor ("admin registration code") was purged
 * together with its input boxes on the admin auth platform:
 *   - the "Admin registration code" field in src/components/AuthPlatformModal.jsx
 *     and src/admin/pages/Login.jsx no longer exists,
 *   - POST /api/admin-verification/register and POST /api/admin/create-admin
 *     no longer read admin_code / ADMIN_CODE (both used to fail CLOSED with
 *     403/503), and
 *   - no env var, render.yaml entry or test caller sends the code any more.
 *
 * This test guards the PURGE itself: nothing that ships to production
 * (src/ = frontend, backend/ = API) may reference ADMIN_CODE / ADMIN_ACCESS_CODE
 * / admin_code / adminCode again. If it fails, someone reintroduced the old
 * admin-code requirement somewhere in the live app.
 *
 * Run: node scripts/test-admin-code-guard.js   (also part of `npm run test:routes`)
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src", "backend"];
const FORBIDDEN = /ADMIN_CODE|ADMIN_ACCESS_CODE|admin_code|adminCode/;
// Allowed exception: src/utils/adminSession.js's LEGACY_KEYS list keeps the old
// localStorage key names (e.g. 'admin_code_validated') only to DELETE stale
// browser state — it reads no code and gates nothing.
const ALLOWED = /LEGACY_KEYS/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const hits = [];
for (const d of SCAN_DIRS) {
  const base = path.join(ROOT, d);
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (FORBIDDEN.test(line) && !ALLOWED.test(line)) {
        hits.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 90)}`);
      }
    });
  }
}

if (hits.length) {
  console.log("FAIL  admin-code references still exist in production code:");
  for (const h of hits) console.log(`      ${h}`);
  console.log(`\n0 passed, 1 failed (${hits.length} offending line(s))`);
  process.exit(1);
}
console.log("PASS  no ADMIN_CODE/admin_code references in src/ or backend/ (purge holds)");
console.log("\n1 passed, 0 failed");
