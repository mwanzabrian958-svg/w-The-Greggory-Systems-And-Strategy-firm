/**
 * ROUTE-ORDER REGRESSION TEST (no DB required — all paths short-circuit at auth)
 * Proves:
 *   1. GET  /sessions        -> 401 (reachable; not shadowed)
 *   2. DELETE /sessions      -> 401 (THE FIX: used to be 403/500 via DELETE /:id + requireAdmin)
 *   3. DELETE /sessions/999  -> 401 (reachable)
 *   4. DELETE /1             -> still the admin route (403/500, NOT 401)
 * Run: node scripts/test-session-routes.js
 */
"use strict";
const express = require("express");
const http = require("http");

// env guards so middleware behaves like production-ish paths
process.env.ADMIN_KEY = process.env.ADMIN_KEY || "test-admin-key";

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
  check("DELETE /:id still admin-gated (not 401)", d.status !== 401, `got ${d.status}`);

  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  [${r.detail}]`);
    if (!r.ok) failed++;
  }
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
