#!/usr/bin/env node
/**
 * Non-destructive auth ROUTE-MAP check. Requires a running server (default
 * http://127.0.0.1:3000, override with AUTH_CHECK_BASE). Pairs with
 * verify-auth.js (which does the register/login round-trips); this proves
 * WHICH routes are live and which legacy doc routes are dead:
 *
 *   LIVE  /api/users/login                          -> users table          (401 on fake creds)
 *   LIVE  /api/admin-verification/authenticate-enhanced -> admin_users      (401 on fake creds)
 *   LIVE  /api/developer-verification/authenticate  -> developer_users      (401 on fake creds)
 *   LIVE  /api/admin/session                        -> admin_users + developer_users (401 bad token)
 *   DEAD  /api/admin/authenticate      -> 404 (only in stale docs + dead adminSession.js helper)
 *   DEAD  /api/developer/authenticate  -> 404 (only in stale docs + dead adminSession.js helper)
 *   DEAD  /api/login  /api/signup      -> 404 (stale docs; real paths are /api/users/...)
 *
 * Fake credentials only — no accounts created, no sessions opened.
 * Run:  node scripts/check-auth-route-map.js
 */
"use strict";

const BASE = process.env.AUTH_CHECK_BASE || "http://127.0.0.1:3000";

const FAKE = {
  email: "route-map-check@invalid.test",
  password: "WrongPassword123!",
};

// [label, method, path, body, headers, expectFn]
const CASES = [
  [
    "health: DB connected",
    "GET",
    "/api/health",
    null,
    null,
    (r) => r.status === 200 && r.json && r.json.database === "connected",
  ],
  [
    "user login route LIVE (users table)",
    "POST",
    "/api/users/login",
    FAKE,
    null,
    (r) => [400, 401, 403].includes(r.status),
  ],
  [
    "admin login route LIVE (admin_users)",
    "POST",
    "/api/admin-verification/authenticate-enhanced",
    FAKE,
    null,
    (r) => [400, 401, 403].includes(r.status),
  ],
  [
    "developer login route LIVE (developer_users)",
    "POST",
    "/api/developer-verification/authenticate",
    FAKE,
    null,
    (r) => [400, 401, 403].includes(r.status),
  ],
  [
    "admin/dev session route LIVE",
    "GET",
    "/api/admin/session",
    null,
    { Authorization: "Bearer invalid-token-route-map-check" },
    (r) => r.status === 401,
  ],
  [
    "legacy /api/admin/authenticate DEAD-but-fail-closed (401 via blanket admin gate)",
    "POST",
    "/api/admin/authenticate",
    FAKE,
    null,
    (r) => r.status === 401,
  ],
  [
    "legacy /api/developer/authenticate DEAD (404)",
    "POST",
    "/api/developer/authenticate",
    FAKE,
    null,
    (r) => r.status === 404,
  ],
  [
    "legacy /api/login DEAD (404)",
    "POST",
    "/api/login",
    FAKE,
    null,
    (r) => r.status === 404,
  ],
  [
    "legacy /api/signup DEAD (404)",
    "POST",
    "/api/signup",
    FAKE,
    null,
    (r) => r.status === 404,
  ],
];

async function hit(method, path, body, headers) {
  const opts = { method, headers: { "Content-Type": "application/json", ...(headers || {}) } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body (e.g. express 404 html) is fine */
  }
  return { status: res.status, json, snippet: text.replace(/\s+/g, " ").slice(0, 90) };
}

(async () => {
  console.log(`=== AUTH ROUTE-MAP CHECK @ ${BASE} ===\n`);
  let pass = 0;
  const failures = [];
  for (const [label, method, path, body, headers, expectFn] of CASES) {
    let result;
    try {
      result = await hit(method, path, body, headers);
    } catch (e) {
      console.log(`  FAIL ${label} -- request error: ${e.message}`);
      failures.push(label + " (request error)");
      continue;
    }
    const ok = expectFn(result);
    const detail =
      `status=${result.status}` +
      (result.json && (result.json.code || result.json.message)
        ? ` ${result.json.code || ""} ${result.json.message || ""}`.trim()
        : ` ${result.snippet}`);
    console.log(`  ${ok ? "PASS" : "FAIL"} ${label} [${detail}]`);
    if (ok) pass++;
    else failures.push(label);
  }
  console.log(`\nROUTE-MAP RESULT: ${pass}/${CASES.length} passed` + (failures.length ? ` -- FAILED: ${failures.join(" | ")}` : ""));
  process.exit(failures.length ? 1 : 0);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
