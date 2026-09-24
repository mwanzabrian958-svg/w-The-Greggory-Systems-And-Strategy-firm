#!/usr/bin/env node
/**
 * MULTI-DEVICE SESSION KICK-OUT VERIFICATION
 * File: scripts/verify-session-kickout.js
 *
 * Proves the "first logged-in page shows every other login, owner can kick
 * them out" contract end-to-end, exactly as ClientPortal.jsx drives it:
 *
 *   1. register + login a throw-away client (@test.com — purge-script scoped)
 *   2. login AGAIN (second device)            -> 2 independent gf_lock_ tokens
 *   3. GET  /api/users/sessions               -> 2 rows, exactly one is_current,
 *                                                no raw tokens leaked
 *   4. DELETE /api/users/sessions/:otherId    -> kick device #2
 *   5. device #2's token now 401s on /client-dashboard
 *   6. login device #2 again, DELETE /api/users/sessions (kick ALL others)
 *      -> device #1 401s, device #2 still signed in
 *   7. cleanup: delete the throw-away account (session rows go too)
 *
 * Usage:
 *   node scripts/verify-session-kickout.js                                  # localhost
 *   TARGET_ORIGIN=https://your-live-origin.example.com node scripts/verify-session-kickout.js
 */
"use strict";
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 3000;
const BASE = process.env.TARGET_ORIGIN
  ? process.env.TARGET_ORIGIN.replace(/\/$/, "")
  : `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0; const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; failures.push(name + (extra ? " -- " + extra : "")); console.log("  FAIL", name, extra || ""); }
}

async function api(path, method = "GET", body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(BASE + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, data };
}

// Unique throw-away identity — must stay within the purge script's
// @test.com / @example.com patterns so cleanup always finds it.
const stamp = Date.now();
const EMAIL = `kickout-${stamp}@test.com`;
const PASSWORD = `KickOut!${stamp % 100000}x`;

(async () => {
  console.log(`=== SESSION KICK-OUT VERIFICATION ===\nBase: ${BASE}\nAccount: ${EMAIL}\n`);
  let token1 = null, token2 = null;

  try {
    // 1. Register throw-away client.
    const reg = await api("/api/users/register", "POST", {
      email: EMAIL, password: PASSWORD,
      first_name: "Kick", last_name: "Out",
      display_name: "Kick Out", phone: "0700000000",
    });
    check("register 201/200", [200, 201].includes(reg.status), `got ${reg.status} ${JSON.stringify(reg.data).slice(0, 120)}`);
    if (![200, 201].includes(reg.status)) throw new Error("abort: cannot register");

    // 2. Two independent logins = two devices.
    const l1 = await api("/api/users/login", "POST", { email: EMAIL, password: PASSWORD });
    token1 = l1.data?.token;
    check("login #1 issues token", l1.status === 200 && !!token1, `got ${l1.status}`);
    const l2 = await api("/api/users/login", "POST", { email: EMAIL, password: PASSWORD });
    token2 = l2.data?.token;
    check("login #2 issues DISTINCT token (multi-device)", l2.status === 200 && !!token2 && token2 !== token1);
    if (!token1 || !token2) throw new Error("abort: logins failed");

    // 3. The record the first logged-in page renders.
    const list = await api("/api/users/sessions", "GET", null, token1);
    const rows = list.data?.sessions || [];
    check("GET /sessions 200", list.status === 200, `got ${list.status}`);
    check("both devices listed", rows.length >= 2, `got ${rows.length}`);
    check("exactly one is_current", rows.filter(s => s.is_current).length === 1,
      `got ${rows.filter(s => s.is_current).length}`);
    check("no raw gf_lock_ tokens leak in payload",
      rows.every(s => !String(s.token || "").startsWith("gf_lock_")),
      JSON.stringify(rows[0] || {}).slice(0, 160));
    check("rows carry audit metadata (id + user_agent + created_at)",
      rows.every(s => s.id != null && "user_agent" in s && "created_at" in s));

    // 4. Kick device #2 out by id.
    const other = rows.find(s => !s.is_current);
    check("found device #2 row to kick", !!other);
    if (other) {
      const kick = await api(`/api/users/sessions/${other.id}`, "DELETE", null, token1);
      check("DELETE /sessions/:id 200", kick.status === 200 && kick.data?.success,
        `got ${kick.status} ${JSON.stringify(kick.data)}`);

      // 5. Kicked device is dead on its next request.
      const dead = await api("/api/users/client-dashboard", "GET", null, token2);
      check("kicked device now 401s", dead.status === 401, `got ${dead.status}`);

      // Kicking again -> 404 (already gone), never a 500.
      const again = await api(`/api/users/sessions/${other.id}`, "DELETE", null, token1);
      check("re-kick is 404, not 500", again.status === 404, `got ${again.status}`);
    }

    // Id isolation: a foreign id must not be revocable.
    const foreign = await api("/api/users/sessions/99999999", "DELETE", null, token1);
    check("foreign session id -> 404 (scoped to owner)", foreign.status === 404, `got ${foreign.status}`);


    // 6. "Log out everywhere else" — the endpoint the shadow-bug used to block.
    const l3 = await api("/api/users/login", "POST", { email: EMAIL, password: PASSWORD });
    token2 = l3.data?.token;
    check("device #2 re-login", l3.status === 200 && !!token2);
    if (token2) {
      const all = await api("/api/users/sessions", "DELETE", null, token2);
      check("DELETE /sessions (kick all others) 200", all.status === 200 && all.data?.success,
        `got ${all.status} ${JSON.stringify(all.data)}`);
      const survivor = await api("/api/users/client-dashboard", "GET", null, token2);
      check("caller device stays signed in", survivor.status === 200, `got ${survivor.status}`);
      const dead1 = await api("/api/users/client-dashboard", "GET", null, token1);
      check("device #1 kicked by 'everywhere else'", dead1.status === 401, `got ${dead1.status}`);
    }

    // Unauthenticated gates (also proves route shadowing stays fixed).
    check("GET /sessions unauth -> 401", (await api("/api/users/sessions")).status === 401);
    check("DELETE /sessions unauth -> 401", (await api("/api/users/sessions", "DELETE")).status === 401);
  } catch (err) {
    fail++; failures.push("aborted: " + err.message);
    console.error("\nABORTED:", err.message);
  } finally {
    // 7. Cleanup — delete the throw-away account and its session rows from
    //    every configured endpoint (mirrors scripts/purge-test-data.js). If
    //    DB access is unavailable the row stays scoped to @test.com and
    //    `npm run test:purge` will collect it later.
    try {
      const mysql = require("mysql2/promise");
      const { endpoints } = require("../server/config/dbEndpoints");
      for (const cfg of endpoints()) {
        if (!cfg.host || (!cfg.password && !("password" in cfg))) continue;
        try {
          const conn = await mysql.createConnection({ ...cfg, connectTimeout: 8000 });
          await conn.execute(
            "DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM (SELECT id FROM users WHERE email = ?) x)",
            [EMAIL]
          );
          await conn.execute(
            "DELETE FROM notifications WHERE user_id IN (SELECT id FROM (SELECT id FROM users WHERE email = ?) x)",
            [EMAIL]
          );
          const [r] = await conn.execute("DELETE FROM users WHERE email = ?", [EMAIL]);
          await conn.end();
          if (r.affectedRows) console.log(`  CLEANUP removed throw-away account on ${cfg.host}`);
        } catch (e) {
          console.warn(`  CLEANUP skip ${cfg.host}: ${e.message}`);
        }
      }
    } catch (e) {
      console.warn("  CLEANUP deferred (run `npm run test:purge`):", e.message);
    }
    console.log(`\n${pass} passed, ${fail} failed${fail ? "\nFailures:\n  - " + failures.join("\n  - ") : ""}`);
    process.exit(fail ? 1 : 0);
  }
})();
