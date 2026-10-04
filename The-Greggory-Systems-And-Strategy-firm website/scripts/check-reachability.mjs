/**
 * Reachability check for the deployed service — three layers, read-only:
 *
 *   1. TCP   — is the Aiven DB host/port open from here?
 *   2. HTTPS — is the Render service answering on 443?
 *   3. API   — does /api/health report the DB as "connected"?
 *              (plus the DB-backed public endpoints, which 500 when the DB is down)
 *
 * The API layer is the one that actually matters: TCP can pass while Render is
 * still pointed at a dead host, because the DB lives on Aiven's network and only
 * Render can reach it. /api/health reports "connected"/"unreachable" from inside
 * the container, which is the only view that sees what production really uses.
 *
 * Usage:  node scripts/check-reachability.mjs
 * Exit 0 only when the DB layer is actually connected.
 */
import dns from 'dns/promises';
import net from 'net';

const SITE =
  process.env.SITE_URL ||
  'https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com';
const DB_HOST =
  process.env.DB_HOST || 'mysql-2277f171-brianmwanza651-0b75.g.aivencloud.com';
const DB_PORT = Number(process.env.DB_PORT || 27059);

let failures = 0;
const ok = (m) => console.log(`OK  ${m}`);
const bad = (m) => { failures++; console.log(`!!  ${m}`); };

function tcp(host, port, timeout = 15000) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port });
    const done = (v) => { s.destroy(); resolve(v); };
    s.setTimeout(timeout);
    s.on('connect', () => done(true));
    s.on('timeout', () => done(false));
    s.on('error', () => done(false));
  });
}

// Render's free tier idles out; a cold start routinely exceeds a 20s budget,
// so the timeout here is generous on purpose.
async function get(path, timeout = 120000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(`${SITE}${path}`, { signal: ctl.signal });
    const body = await r.text();
    return { status: r.status, body };
  } finally {
    clearTimeout(t);
  }
}

console.log('=== REACHABILITY ===');
console.log(`site: ${SITE}`);
console.log(`db  : ${DB_HOST}:${DB_PORT}\n`);

try {
  const a = await dns.lookup(DB_HOST);
  ok(`DNS  ${DB_HOST} -> ${a.address}`);
} catch (e) {
  bad(`DNS  ${DB_HOST} — ${e.code || e.message}`);
}

if (await tcp(DB_HOST, DB_PORT)) ok(`TCP  db:${DB_PORT} open`);
else bad(`TCP  db:${DB_PORT} unreachable`);

if (await tcp(new URL(SITE).hostname, 443)) ok('TCP  site:443 open');
else bad('TCP  site:443 unreachable');

let health;
try {
  health = await get('/api/health');
  ok(`HTTP /api/health -> ${health.status}`);
} catch (e) {
  bad(`HTTP /api/health — ${e.name || e.message}`);
}

if (health) {
  let j = {};
  try { j = JSON.parse(health.body); } catch { /* non-JSON body */ }
  console.log(`     database=${j.database} env=${j.env} dbSsl=${j.dbSsl}`);
  if (j.database === 'connected') ok('DB   connected from inside the container');
  else bad(`DB   ${j.database} — Render is not using a reachable database`);
}

// DB-backed public endpoints: these 500 when the DB is down, so they are the
// honest end-user symptom to watch.
for (const p of ['/api/posts/testimonials', '/api/posts/portfolio']) {
  try {
    const r = await get(p);
    if (r.status === 200) ok(`HTTP ${p} -> 200`);
    else bad(`HTTP ${p} -> ${r.status} ${r.body.slice(0, 80)}`);
  } catch (e) {
    bad(`HTTP ${p} — ${e.name || e.message}`);
  }
}

console.log('');
if (!failures) console.log('REACHABLE: site up and database connected.');
else {
  console.log(`${failures} problem(s) found.`);
  process.exitCode = 1;
}