// DEPLOYED-SITE VERIFIER — probes the RUNNING service, not the local files.
// Answers two questions that are easy to confuse:
//   A. Is the service up and reachable?
//   B. Is the CURRENT main branch actually what's running up there?
//
// Every request is unauthenticated or uses a deliberately bogus token, so nothing
// can mutate data: the admin/session routes short-circuit at the guard before any
// SQL runs. No credentials are sent.
//
// Run:
//   npm run test:live
//   BASE_URL=https://your-site.onrender.com npm run test:live
//
// Exit 0 = service up, guards answer 401, CORS echoes the origin.
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
if (existsSync(path.join(root, ".env"))) dotenv.config({ path: path.join(root, ".env") });

const BASE = (
  process.env.BASE_URL ||
  "https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com"
).replace(/\/+$/, "");
const ORIGIN = process.env.VERIFY_ORIGIN || BASE;

let problems = 0;
const ok = (m) => console.log(`OK  ${m}`);
const bad = (m) => { problems++; console.log(`!!  ${m}`); };
const info = (m) => console.log(`--  ${m}`);
const snippet = (s, n = 90) => (s || "").replace(/\s+/g, " ").trim().slice(0, n);

async function call(method, p, { headers = {} } = {}) {
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  return {
    status: res.status,
    body: await res.text(),
    headers: Object.fromEntries(res.headers.entries()),
  };
}

console.log(`=== DEPLOYED-SITE VERIFICATION (${BASE}) ===\n-- is it up? --`);

try {
  // ── 1. Liveness + DB reachability. NOTE: /api/health (server.js:6850) is the
  // public probe and is DELIBERATELY always HTTP 200 — Render must never see a
  // 500 from a DB blip — so the signal is the "database" field, not the status.
  // There is no bare /health route; that path falls through to the SPA shell.
  const h = await call("GET", "/api/health");
  let hb = {};
  try { hb = JSON.parse(h.body); } catch { /* HTML below means the API is not mounted */ }
  if (h.status === 200 && hb.status === "OK") {
    if (hb.database === "connected") {
      ok(`GET /api/health -> 200 database:"connected" dbSsl:${hb.dbSsl} env:${hb.env} — API up and the DB answers`);
    } else if (hb.database === "unreachable") {
      bad(`GET /api/health -> 200 but database:"unreachable" — process up, DB not. Check DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/DB_SSL in the Render dashboard`);
    } else {
      info(`GET /api/health -> 200 database:"${hb.database}" (first probe still in flight), dbSsl:${hb.dbSsl}`);
    }
  } else if (h.status === 200 && /<!doctype html/i.test(h.body)) {
    bad(`GET /api/health returned the SPA HTML — the API is not mounted at /api on this build`);
  } else {
    bad(`GET /api/health -> ${h.status} ${snippet(h.body)}`);
  }

  // ── 2. Frontend is being served ──────────────────────────────────────────
  const page = await call("GET", "/");
  if (page.status === 200 && /<div id=["']root["']>|<!doctype html/i.test(page.body)) {
    ok(`GET / -> 200, HTML shell served (${page.body.length} bytes)`);
  } else {
    bad(`GET / -> ${page.status}, no SPA shell in the first bytes: ${snippet(page.body, 60)}`);
  }

  // ── 3. WHICH build is live? The deleted x-admin-key guard is the tell. ────
  // Old code: 500 "Admin key not configured on server" (the key was never set).
  // New code: 401 "Admin authentication required" (session guard).
  console.log(`\n-- which build is live? (admin route on the modular router) --`);
  const admin = await call("DELETE", "/api/users/1");
  if (admin.status === 401 && admin.body.includes("Admin authentication required")) {
    ok(`DELETE /api/users/1 -> 401 session guard — the x-admin-key purge IS deployed`);
  } else if (/Admin key not configured/i.test(admin.body) || admin.status >= 500) {
    bad(`DELETE /api/users/1 -> ${admin.status} ${snippet(admin.body)} — the OLD build is still live; the purge has not deployed`);
  } else {
    bad(`DELETE /api/users/1 -> ${admin.status} ${snippet(admin.body)} — expected 401 "Admin authentication required"`);
  }

  const sessions = await call("DELETE", "/api/users/sessions");
  if (sessions.status === 401 && !/Admin key/i.test(sessions.body)) {
    ok(`DELETE /api/users/sessions -> 401 (route-order shadow fix live)`);
  } else {
    bad(`DELETE /api/users/sessions -> ${sessions.status} ${snippet(sessions.body)} — expected 401 "Authentication required"`);
  }

  // ── 4. The data-leak probe (the reason this script exists) ───────────────
  console.log(`\n-- leak probes --`);

  // THE important one: a bogus Bearer token must never yield a user list.
  const leak = await call("GET", "/api/users", { headers: { Authorization: "Bearer not-a-real-token" } });
  let leaked = false;
  try {
    const parsed = JSON.parse(leak.body || "null");
    leaked = leak.status === 200 && (Array.isArray(parsed) || (!!parsed && Array.isArray(parsed.users)));
  } catch { leaked = false; }
  if (leaked) {
    bad(`GET /api/users with a junk token returned 200 + a list — LIVE DATA EXPOSURE, check the route order in server.js now`);
  } else if (leak.status === 401 || leak.status === 403) {
    ok(`GET /api/users with a junk Bearer -> ${leak.status} (no user list without a valid session)`);
  } else {
    info(`GET /api/users with a junk Bearer -> ${leak.status} ${snippet(leak.body)} (not a list, so not a leak — but unexpected)`);
  }

  // ── 5. CORS: the browser-only failure mode for DELETE ────────────────────
  console.log(`\n-- CORS (what breaks the admin panel silently) --`);
  const pre = await call("OPTIONS", "/api/users", {
    headers: {
      Origin: ORIGIN,
      "Access-Control-Request-Method": "DELETE",
      "Access-Control-Request-Headers": "authorization,content-type",
    },
  });
  const allowOrigin = pre.headers["access-control-allow-origin"] || "";
  const allowMethods = pre.headers["access-control-allow-methods"] || "";
  if (!allowOrigin) {
    bad(`preflight sent no Access-Control-Allow-Origin — the browser will block DELETE. Set FRONTEND_URL in the Render dashboard to exactly ${ORIGIN}`);
  } else if (allowOrigin !== ORIGIN && allowOrigin !== "*") {
    bad(`preflight echoed Access-Control-Allow-Origin: ${allowOrigin}, not ${ORIGIN} — FRONTEND_URL in the dashboard is a different origin`);
  } else {
    ok(`preflight Access-Control-Allow-Origin: ${allowOrigin}`);
  }
  if (allowOrigin && !/delete/i.test(allowMethods)) {
    bad(`Access-Control-Allow-Methods: "${allowMethods}" lacks DELETE — admin delete buttons fail in the browser only`);
  } else if (allowOrigin) {
    ok(`Access-Control-Allow-Methods includes DELETE`);
  }
  if (allowOrigin && !/authorization/i.test(pre.headers["access-control-allow-headers"] || "")) {
    bad(`Access-Control-Allow-Headers lacks "authorization" — the Bearer token gets stripped pre-flight`);
  }

  // ── 6. Was the Google client id baked in? VITE_* is BUILD time, so a
  // dashboard change alone cannot fix it — this is the redeploy detector. ────
  console.log(`\n-- Google Sign-In: is VITE_GOOGLE_CLIENT_ID in this build? --`);
  const expectedId = (process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const scripts = [...page.body.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/gi)]
    .slice(0, 6)
    .map((m) => m[1]);
  // Vite emits route-level dynamic chunks that are NOT listed in index.html, and
  // the client id usually lands in one of those — so follow the asset references
  // found inside the entry bundle before concluding it is missing. Skipping this
  // step produced a false "not baked" reading on the first run of this script.
  const ID_RE = /[A-Za-z0-9-]{20,}\.apps\.googleusercontent\.com/;
  const queue = [...scripts];
  const seen = new Set();
  const texts = [];
  let hasGsiLoader = false;
  // 60, not 12: this build really has 30 assets and the Google code lives in a
  // lazy chunk near the end of the graph, so a small cap reports a false miss.
  while (queue.length && texts.length < 60) {
    const src = queue.shift();
    if (seen.has(src)) continue;
    seen.add(src);
    const url = src.startsWith("http") ? src : `${BASE}${src.startsWith("/") ? "" : "/"}${src}`;
    try {
      const js = await (await fetch(url, { signal: AbortSignal.timeout(20000) })).text();
      texts.push(js);
      if (/gsi\/client/.test(js)) hasGsiLoader = true;
      for (const m of js.matchAll(/assets\/[A-Za-z0-9_.\-]+\.js/g)) queue.push(m[0]);
    } catch { /* asset fetch is best-effort */ }
  }
  const exact = expectedId ? texts.some((t) => t.includes(expectedId)) : false;
  const hit = texts.map((t) => t.match(ID_RE)).find(Boolean);
  const bakedId = exact ? expectedId : hit ? hit[0] : null;
  if (!texts.length) info("no <script src=...js> could be fetched — skipped");
  else if (exact) ok(`deployed bundle contains the exact client id from .env — ${texts.length} asset(s) scanned`);
  else if (bakedId && expectedId) bad(`deployed bundle carries a DIFFERENT client id (${bakedId.slice(0, 12)}…) than .env (${expectedId.slice(0, 12)}…) — redeploy after setting VITE_GOOGLE_CLIENT_ID`);
  else if (bakedId) info(`deployed bundle carries a client id (${bakedId.slice(0, 12)}…) — nothing in .env to compare it against`);
  else if (hasGsiLoader) bad(`the Google library loader (gsi/client) IS in the bundle but NO client id is, across ${texts.length} asset(s) — VITE_GOOGLE_CLIENT_ID was empty at BUILD time, so the button hides itself. Set it in Render and REDEPLOY (a restart is not enough)`);
  else bad(`no Google client id and no gsi/client loader in ${texts.length} asset(s) — the sign-in code may not be in this build at all`);

  console.log(
    problems === 0
      ? `\nRESULT: the deployed service looks healthy — guards, CORS and the session-token admin routes all behave.`
      : `\nRESULT: ${problems} problem(s) above need attention.`
  );
  console.log(`-- reminder: this reads only what the service exposes publicly; it cannot see the Render dashboard.`);
  process.exit(problems ? 1 : 0);
} catch (err) {
  bad(`request failed: ${err && err.message ? err.message : err}`);
  info("is the service running, and is BASE_URL reachable from here?");
  process.exit(1);
}

