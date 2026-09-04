#!/usr/bin/env node
/**
 * Auth flow verification — proves the three platforms register & log in cleanly
 * with NO email-token / email-verification gating (that is not a feature of
 * this system). Run:  node scripts/verify-auth.js
 *
 * Platforms:
 *   admin      -> /api/admin-verification/register | /admin-verification/authenticate-enhanced
 *   developer  -> /api/admin-verification/register | /developer-verification/authenticate   (role: developer)
 *   user       -> /api/users/register             | /users/login
 *
 * Real Nodemailer is NOT required: the checks are HTTP status + token presence.
 */
require("dotenv").config();
const http = require("http");

function api(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    const req = http.request({ hostname: "127.0.0.1", port: 3000, path, method, headers }, (res) => {
      let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject); if (data) req.write(data); req.end();
  });
}
const J = (b) => { try { return JSON.parse(b); } catch { return null; } };
let pass = 0, fail = 0; const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; failures.push(name + (extra ? " -- " + extra : "")); console.log("  FAIL", name, extra || ""); }
}

(async () => {
  const stamp = Date.now();
  console.log("=== AUTH FLOW VERIFICATION (no email-token gating) ===\n");

  // --- ADMIN ---
  const adm = "authadm" + stamp + "@test.com";
  const ar = await api("/api/admin-verification/register", "POST", { email: adm, password: "Test1234", first_name: "Adm", last_name: "In", role: "admin" });
  check("admin register 201", ar.status === 201, ar.body.substring(0, 80));
  const al = await api("/api/admin-verification/authenticate-enhanced", "POST", { email: adm, password: "Test1234" });
  const ad = J(al.body);
  check("admin login 200 + token", al.status === 200 && !!ad?.token, al.body.substring(0, 80));

  // --- DEVELOPER ---
  const dev = "authdev" + stamp + "@test.com";
  const dr = await api("/api/admin-verification/register", "POST", { email: dev, password: "Test1234", first_name: "Dev", last_name: "Eloper", role: "developer" });
  check("developer register 201", dr.status === 201, dr.body.substring(0, 80));
  const dl = await api("/api/developer-verification/authenticate", "POST", { email: dev, password: "Test1234" });
  const dd = J(dl.body);
  check("developer login 200 + token", dl.status === 200 && !!dd?.token, dl.body.substring(0, 80));

  // --- USER (client) ---
  const usr = "authusr" + stamp + "@test.com";
  const ur = await api("/api/users/register", "POST", { email: usr, password: "Test1234", first_name: "Cli", last_name: "Ent", phone: "+254700000099" });
  check("user register 201", ur.status === 201, ur.body.substring(0, 80));
  const ul = await api("/api/users/login", "POST", { email: usr, password: "Test1234" });
  const ud = J(ul.body);
  check("user login 200 + token (no email-token gating)", ul.status === 200 && !!ud?.token, ul.body.substring(0, 80));

  console.log("\n==================================================");
  console.log("AUTH VERIFICATION: " + pass + " passed, " + fail + " failed, " + (pass + fail) + " total");
  if (failures.length) console.log("FAILURES: " + failures.join(" | "));
  console.log("==================================================");
  if (fail > 0) console.log("\nNOTE: registration/login must NOT request an email token. If any check above is the email-verification step, that path should not exist.");
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });