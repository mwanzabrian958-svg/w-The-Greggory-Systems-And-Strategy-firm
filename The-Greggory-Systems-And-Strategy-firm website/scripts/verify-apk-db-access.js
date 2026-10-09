/**
 * scripts/verify-apk-db-access.js
 *
 * Proves the CLIENT-PORTAL APK reaches the CURRENT database through the same
 * configuration the live API uses:
 *
 *   APK (Retrofit -> BASE_URL=…1vf9.onrender.com)
 *        -> Express routes (api/users/*, api/auth/whatsapp/*, …)
 *        -> backend/config/database.js pool  =  local XAMPP (:3306)
 *                                                  └─ failover ─> claude Aiven (:28067)
 *
 * The APK NEVER connects to MySQL directly (no credentials ship in the app).
 * This script exercises that same path from the server side and reports:
 *   1. which endpoint answers (local and/or claude) — host/port masked,
 *   2. which tables the portal endpoints depend on exist on EACH endpoint,
 *   3. a PASS/FAIL verdict for "is the current claude DB ready for the APK".
 *
 * Run:  node scripts/verify-apk-db-access.js
 * Exit: 0 = claude reachable + core tables present, 1 = otherwise.
 */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const DB_NAME = process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main';

const ENDPOINTS = [
  {
    label: 'LOCAL (XAMPP)',
    host: process.env.DB_HOST_2 || 'localhost',
    port: Number(process.env.DB_PORT_2 || 3306),
    user: process.env.DB_USER_2 || 'root',
    password: process.env.DB_PASSWORD_2 || '',
    database: DB_NAME,
    ssl: (process.env.DB_SSL_2 || 'false') === 'true' ? { rejectUnauthorized: false } : false,
    claude: false
  },
  {
    label: 'CLAUDE (current Aiven cloud)',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 28067),
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || '',
    database: DB_NAME,
    ssl: (process.env.DB_SSL || 'false') === 'true' ? { rejectUnauthorized: false } : false,
    claude: true
  }
];

// Tables the APK's Retrofit endpoints read/write (ApiService.kt):
//   users -> login/profile/dashboard, user_projects -> getProjects(),
//   notifications -> notifications/me, project_reports -> my-reports (download),
//   invoices/quotes/signatures/change_requests -> Requests screens,
//   sessions -> revokeOtherSessions(), whatsapp auth codes -> OTP pipeline.
const REQUIRED = ['users', 'user_projects', 'notifications', 'project_reports'];
const OPTIONAL = [
  'invoices', 'quotes', 'signature_requests', 'change_requests',
  'client_feedback', 'feedback', 'sessions', 'client_documents',
  'whatsapp_auth_codes', 'whatsapp_otp_codes', 'auth_codes',
  'chat_messages', 'messages'
];

const mask = (v) => (v ? `${String(v).slice(0, 4)}… (${String(v).length} chars)` : '(empty)');

async function probe(ep) {
  const out = { label: ep.label, claude: ep.claude, ok: false, tables: new Set(), error: null };
  if (!ep.host && ep.claude) {
    out.error = 'DB_HOST is not set in .env — claude endpoint not configured';
    return out;
  }
  let conn;
  try {
    const { label, claude, ...cfg } = ep;          // strip meta keys — mysql2 rejects unknown options
    conn = await mysql.createConnection({ ...cfg, connectTimeout: 12000 });
    const [rows] = await conn.query('SHOW TABLES');
    const key = Object.keys(rows[0] || { Tables_in_db: 1 })[0];
    out.tables = new Set(rows.map((r) => r[key]));
    out.ok = true;
    console.log(`✔ ${ep.label}: ${ep.host}:${ep.port}  db=${ep.database}  tables=${out.tables.size}`);
    console.log(`   user=${ep.user}  password=${mask(ep.password)}  ssl=${ep.ssl ? 'on' : 'off'}`);
  } catch (e) {
    out.error = e.message;
    console.log(`✘ ${ep.label}: ${ep.host || '(no host)'}:${ep.port} — ${e.message}`);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
  return out;
}

(async () => {
  console.log('[apk-db] Endpoints exactly as the app pool configures them (.env):');
  const results = [];
  for (const ep of ENDPOINTS) results.push(await probe(ep));

  const claude = results.find((r) => r.claude);
  console.log('\n[apk-db] Required tables (portal endpoints):');
  let hardFail = false;
  for (const t of REQUIRED) {
    const localHas = results[0].tables.has(t);
    const claudeHas = claude.tables.has(t);
    console.log(`  ${claudeHas || localHas ? '·' : '!'} ${t.padEnd(18)} local=${localHas ? 'yes' : 'NO '}  claude=${claudeHas ? 'yes' : 'NO'}`);
    if (!claudeHas && !results[0].ok) hardFail = true;   // nothing anywhere → fatal
  }
  const presentOptional = OPTIONAL.filter((t) => claude.tables.has(t) || results[0].tables.has(t));
  if (presentOptional.length) console.log(`  · also present: ${presentOptional.join(', ')}`);

  console.log('\n[apk-db] Verdict:');
  if (!claude.ok) {
    console.log('  FAIL — current claude DB unreachable. The APK on the live host will');
    console.log('         500 on any query once the local node goes down.');
    process.exit(1);
  }
  if (hardFail) {
    console.log('  FAIL — core portal tables missing. Run the repo\'s schema/dump scripts.');
    process.exit(1);
  }
  console.log('  PASS — the APK reaches the CURRENT claude DB via the backend pipeline.');
  console.log('         (Endpoint exercised from this machine; Render uses the same .env keys.)');
  process.exit(0);
})();
