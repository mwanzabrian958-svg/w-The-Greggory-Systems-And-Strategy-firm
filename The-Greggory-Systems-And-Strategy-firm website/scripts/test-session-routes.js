/**
 * ROUTE-ORDER REGRESSION TEST (no DB required — all paths short-circuit at auth)
 * Proves:
 *   1. GET  /sessions        -> 401 (reachable; not shadowed)
 *   2. DELETE /sessions      -> 401 (THE FIX: used to be 403/500 via DELETE /:id + the admin key guard)
 *   3. DELETE /sessions/999  -> 401 (reachable)
 *   4. DELETE /1             -> still the admin route (admin guard's 401 message, NOT the user guard's)
 * Run: node scripts/test-session-routes.js
 */
"use strict";
// Load .env before anything in the require chain reaches server/config/
// dbEndpoints.js, which throws at require() time when DB_NAME is unset.
// This test never touches the DB — the env just has to exist for the
// modules to load (commit 0e207e4 made DB_NAME mandatory).
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const http = require("http");

// env guards so middleware behaves like production-ish paths
// (no ADMIN_KEY: the x-admin-key guard was deleted; admin routes now verify the
// Bearer session token — see backend/middleware/adminSession.js)

const usersRouter = require("../backend/routes/users");
const app = express();
app.use(express.json());
app.use("/api/users", usersRouter);

function req(method, path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const r = http.request(
        { host: "127.0.0.1", port, method, path },
        (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            server.close();
            resolve({ status: res.statusCode, body });
          });
        }
      );
      r.on("error", (e) => { server.close(); reject(e); });
      r.end();
    });
  });
}

(async () => {
  const results = [];
  const check = (name, cond, detail) => results.push({ name, ok: !!cond, detail });

  const a = await req("GET", "/api/users/sessions");
  check("GET /sessions unauth -> 401", a.status === 401, `got ${a.status}`);

  const b = await req("DELETE", "/api/users/sessions");
  check("DELETE /sessions unauth -> 401 (shadow fix)", b.status === 401, `got ${b.status} ${b.body.slice(0, 80)}`);

  const c = await req("DELETE", "/api/users/sessions/999");
  check("DELETE /sessions/:id unauth -> 401", c.status === 401, `got ${c.status}`);

  const d = await req("DELETE", "/api/users/1");
  // Since the x-admin-key purge this route also answers 401 — but with the ADMIN
  // guard's own message, which proves it is still the admin-gated route and not
  // the user-session path (/sessions returns "Authentication required").
  check(
    "DELETE /:id stays admin-gated (admin guard 401, not the user guard's)",
    d.status === 401 && d.body.includes('"Admin authentication required"'),
    `got ${d.status} ${d.body.slice(0, 90)}`
  );

  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  [${r.detail}]`);
    if (!r.ok) failed++;
  }
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
