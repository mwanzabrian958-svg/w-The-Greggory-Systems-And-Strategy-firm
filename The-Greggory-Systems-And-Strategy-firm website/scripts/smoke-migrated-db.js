// End-to-end smoke test against the CURRENT .env DB (the migrated Aiven one).
// Verifies the app's own query layer can read restored data, not just raw SQL.
require('dotenv').config();
const mysql = require('mysql2/promise');
const { endpoints, clean } = require('../server/config/dbEndpoints');

(async () => {
  const eps = endpoints();
  const cloud = eps.find((e) => e.label !== 'local') || eps[0];
  console.log('using endpoint:', cloud.label, cloud.host + ':' + cloud.port + '/' + cloud.database);

  const conn = await mysql.createConnection({ ...clean(cloud) });
  try {
    const [[u]] = await conn.query(
      "SELECT id, email, is_active FROM users WHERE email='mwanzabrian958@gmail.com'");
    console.log('user row      :', JSON.stringify(u));

    const [[a]] = await conn.query(
      "SELECT id, email, admin_level FROM admin_users WHERE email='mwanzabrian958@gmail.com'");
    console.log('admin row     :', JSON.stringify(a));

    // The login middleware requires a locked+active mapping for the platform.
    const [ms] = await conn.query(
      "SELECT platform_name FROM auth_platform_mapping WHERE is_locked=TRUE AND is_active=TRUE");
    console.log('auth mappings :', ms.map((x) => x.platform_name).join(', '));

    const [[h]] = await conn.query("SELECT COUNT(*) n FROM team_members");
    console.log('team members  :', h.n);
  } finally {
    await conn.end();
  }
  console.log('SMOKE OK');
})().catch((e) => {
  console.error('SMOKE FAILED:', e.code || e.message);
  process.exit(1);
});