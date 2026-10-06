/**
 * ADMIN-CODE SECOND-FACTOR REGRESSION TEST (no DB required)
 *
 * POST /api/admin/create-admin creates a row in `admin_users`, so ADMIN_CODE is a
 * second factor on top of the admin session. The check used to be:
 *
 *     if (admin_code) { if (!expected || admin_code !== expected) return 403; }
 *
 * which meant a request that simply OMITTED `admin_code` skipped validation
 * entirely and went on to the INSERT. Holding any valid admin session was
 * therefore enough to mint another privileged account.
 *
 * The route must now fail CLOSED:
 *   1. no session            -> 401 (router-wide gate)
 *   2. session, no ADMIN_CODE on the server -> 503 (feature disabled, not open)
 *   3. session, code omitted  -> 403 (THE REGRESSION)
 *   4. session, wrong code    -> 403
 *
 * Every case must be rejected BEFORE any SQL runs, so this test can never write
 * to a database. DB_HOST/DB_PORT are additionally pointed at a closed local port
 * so that if a future edit ever let a request through, it would fail to connect
 * loudly instead of writing to a real database.
 *
 * Run: node scripts/test-admin-code-guard.js
 */
"use strict";
// Load .env before anything in the require chain reaches server/config/
// dbEndpoints.js, which throws at require() time when DB_NAME is unset.
// No SQL runs in this test — the env just has to exist for the modules to
// load (commit 0e207e4 made DB_NAME mandatory).
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const http = require("http");

// Belt and braces: no request below should reach the DB layer. If one does, it
// gets ECONNREFUSED on 127.0.0.1:1 rather than a live connection.
process.env.DB_HOST = "127.0.0.1";
process.env.DB_PORT = "1";

const { signSessionToken } = require("../backend/utils/sessionToken");
const adminRouter = require("../backend/routes/admin");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRouter);

function req(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const payload = body === undefined ? null : JSON.stringify(body);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      if (payload !== null) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(payload);
      }
      const r = http.request({ host: "127.0.0.1", port, method, path, headers }, (res) => {
        let out = "";
        res.on("data", (c) => (out += c));
        res.on("end", () => { server.close(); resolve({ status: res.statusCode, body: out }); });
      });
      r.on("error", (e) => { server.close(); reject(e); });
      if (payload !== null) r.write(payload);
      r.end();
    });
  });
}

(async () => {
  const results = [];
  const check = (name, cond, detail) => results.push({ name, ok: !!cond, detail });

  // Mints a token the router will accept: same module, same process, same secret.
  const token = signSessionToken(1, "admin");
  const valid = {
    first_name: "Test",
    last_name: "User",
    email: "guard-probe@example.invalid",
    password: "not-a-real-password",
  };

  // 1. router-wide gate still applies
  const a = await req("POST", "/api/admin/create-admin", { body: valid });
  check("no session -> 401", a.status === 401, `got ${a.status} ${a.body.slice(0, 70)}`);

  // 2. server has no ADMIN_CODE -> fail closed with 503, never open
  const savedCode = process.env.ADMIN_CODE;
  delete process.env.ADMIN_CODE;
  const b = await req("POST", "/api/admin/create-admin", { token, body: valid });
  check(
    "ADMIN_CODE unset + valid session -> 503 (fail closed)",
    b.status === 503,
    `got ${b.status} ${b.body.slice(0, 70)}`
  );

  // 3. THE REGRESSION: code omitted entirely used to skip validation and INSERT
  process.env.ADMIN_CODE = "correct-horse-battery";
  const c = await req("POST", "/api/admin/create-admin", { token, body: valid });
  check(
    "valid session, admin_code omitted -> 403 (was: skipped the check)",
    c.status === 403,
    `got ${c.status} ${c.body.slice(0, 70)}`
  );

  // 4. wrong code
  const d = await req("POST", "/api/admin/create-admin", {
    token,
    body: { ...valid, admin_code: "wrong-code" },
  });
  check("valid session, wrong admin_code -> 403", d.status === 403, `got ${d.status} ${d.body.slice(0, 70)}`);

  // 5. empty-string code is not a bypass either
  const e = await req("POST", "/api/admin/create-admin", {
    token,
    body: { ...valid, admin_code: "" },
  });
  check("valid session, empty admin_code -> 403", e.status === 403, `got ${e.status} ${e.body.slice(0, 70)}`);

  if (savedCode === undefined) delete process.env.ADMIN_CODE;
  else process.env.ADMIN_CODE = savedCode;

  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  [${r.detail}]`);
    if (!r.ok) failed++;
  }
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
