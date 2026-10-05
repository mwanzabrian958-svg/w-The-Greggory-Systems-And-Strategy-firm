// Full env audit: read ALL of a service's env vars, then compare against the
// keys render.yaml declares and the ones the app actually requires.
//
// The list endpoint caps at 20 per page and returns a bare top-level ARRAY
// (no cursor to follow), so a default read silently hides everything past the
// 20th key — which made DB_USER and JWT_SECRET look ABSENT when they were set.
// Always pass ?limit=100 (200 is rejected with HTTP 400).
//
// Prints presence/length only — never a secret value.
//
// Usage: node scripts/env-full-audit.js <file-containing-render-api-key> <service-id>
const fs = require('fs');
require('dotenv').config();
const KEY = fs.readFileSync(process.argv[2], 'utf8').trim();
const SVC = process.argv[3];
const H = { Accept: 'application/json', Authorization: `Bearer ${KEY}` };
const SECRET = /PASS|SECRET|KEY|TOKEN|CODE/i;

async function allEnvVars() {
  const out = {};
  // The list endpoint returns at most 20 per page and a bare top-level ARRAY
  // (no cursor field to follow), so paging by cursor silently truncated the
  // read and made DB_USER/JWT_SECRET look ABSENT when they were set. Ask for a
  // large page instead.
  const r = await fetch(
    `https://api.render.com/v1/services/${SVC}/env-vars?limit=100`,
    { headers: H }
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const body = await r.json();
  const arr = Array.isArray(body) ? body : body.envVars || [];
  for (const e of arr) {
    if (e.envVar && e.envVar.key) out[e.envVar.key] = e.envVar.value;
  }
  return { out, pages: 1 };
}

// Keys render.yaml declares (sync:false or value:), read from the file.
function yamlKeys() {
  const p = '..\\render.yaml';
  try {
    const txt = fs.readFileSync(p, 'utf8');
    const keys = [];
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*-\s*key:\s*(\S+)\s*$/);
      if (m) keys.push(m[1]);
    }
    return [...new Set(keys)];
  } catch { return []; }
}

(async () => {
  const { out, pages } = await allEnvVars();
  console.log(`=== ALL RENDER ENV VARS (${Object.keys(out).length} total, ${pages} page(s)) ===`);
  for (const [k, v] of Object.entries(out).sort()) {
    const shown = SECRET.test(k)
      ? (v ? `<set, ${String(v).length} chars>` : '<EMPTY>')
      : (v === '' ? '<EMPTY>' : String(v).slice(0, 58));
    const bad = /<[^>]+>/.test(String(v)) && !/SMTP_FROM/.test(k);
    console.log(`  ${k.padEnd(26)} ${shown}${bad ? '  <-- PLACEHOLDER' : ''}`);
  }

  const y = yamlKeys();
  console.log(`\n=== vs render.yaml (declares ${y.length} keys) ===`);
  const missing = y.filter((k) => !(k in out));
  console.log(missing.length ? `  MISSING: ${missing.join(', ')}` : '  none missing');

  console.log('\n=== CRITICAL SECRETS CHECK ===');
  const critical = ['JWT_SECRET', 'SESSION_SECRET', 'ADMIN_SESSION_SECRET', 'ADMIN_CODE',
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SSL', 'SMTP_PASS'];
  for (const k of critical) {
    const v = out[k];
    const state = v === undefined ? 'ABSENT' : (v === '' ? 'EMPTY' : `set (${v.length})`);
    const flag = v === undefined || v === '' ? '  <-- PROBLEM' : '';
    console.log(`  ${k.padEnd(24)} ${state}${flag}`);
  }
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });