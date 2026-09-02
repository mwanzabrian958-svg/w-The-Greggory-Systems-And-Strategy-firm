// Temp diagnostic: DB reachability + admin auth tables + entity counts
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const { endpoints, DB_NAME } = require('../server/config/dbEndpoints');

async function tryConnect(ep) {
  const start = Date.now();
  try {
    const c = await mysql.createConnection({ ...ep, database: DB_NAME, connectTimeout: 4000 });
    return { ok: true, ms: Date.now() - start, conn: c };
  } catch (e) {
    return { ok: false, ms: Date.now() - start, err: e.code || e.message, conn: null };
  }
}

(async () => {
  let live = null;
  for (const ep of endpoints()) {
    const r = await tryConnect(ep);
    console.log(`[DB] ${ep.label} ${ep.host}:${ep.port} -> ${r.ok ? 'OK (' + r.ms + 'ms)' : 'FAIL ' + r.err}`);
    if (r.ok) { live = r.conn; break; }
  }
  if (!live) { console.log('NO DB REACHABLE'); process.exit(3); }

  const tables = ['auth_platform_mapping', 'auth_validation_rules', 'auth_request_log', 'admin_users', 'users'];
  for (const t of tables) {
    try {
      const [rows] = await live.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
      console.log(`[TABLE] ${t}: ${rows[0].c} rows`);
    } catch (e) {
      console.log(`[TABLE] ${t}: MISSING (${e.code || e.message})`);
    }
  }

  try {
    const [admins] = await live.query('SELECT id, email, admin_level, is_active, deleted_at FROM admin_users LIMIT 10');
    console.log('[ADMINS]', JSON.stringify(admins));
  } catch (e) { console.log('[ADMINS] query failed:', e.code || e.message); }

  try {
    const [mapping] = await live.query('SELECT platform_name, table_name, is_locked, is_active FROM auth_platform_mapping');
    console.log('[MAPPING]', JSON.stringify(mapping));
  } catch (e) { console.log('[MAPPING] query failed:', e.code || e.message); }

  await live.end();
})().catch((e) => { console.error('DIAG ERROR', e); process.exit(4); });