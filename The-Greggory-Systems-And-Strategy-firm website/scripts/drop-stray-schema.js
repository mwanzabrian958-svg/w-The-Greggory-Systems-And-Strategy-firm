// Drop the stray empty schema left behind by the old CREATE DATABASE fallback.
//
// WHY IT EXISTS
// -------------
// Before 0e207e4, scripts/import-if-empty.js defaulted DB_NAME to the local
// XAMPP name and ran `CREATE DATABASE IF NOT EXISTS` against whatever host it
// resolved. On the Aiven service that created a schema named
// THEGREGGORYSYSTEMSANDSTRATEGYFIRM (MySQL upper-cases schema names).
//
// SAFETY
// ------
// Refuses to run unless the target is BOTH empty (0 tables) AND not the
// database the app is configured to use. This cannot delete real data.
require('dotenv').config();
const mysql = require('mysql2/promise');

const TARGET = 'THEGREGGORYSYSTEMSANDSTRATEGYFIRM';

(async () => {
  const server = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  });
  try {
    if (TARGET.toLowerCase() === String(process.env.DB_NAME).toLowerCase()) {
      console.error('ABORT: that is the configured DB_NAME — refusing.');
      process.exit(1);
    }
    const [rows] = await server.query(
      'SELECT COUNT(*) n FROM information_schema.tables WHERE table_schema=?', [TARGET]);
    const n = rows[0].n;
    console.log(`${TARGET}: ${n} tables`);
    if (n !== 0) {
      console.error('ABORT: not empty — refusing to drop a schema with data.');
      process.exit(1);
    }
    if (process.argv.includes('--apply')) {
      await server.query(`DROP DATABASE \`${TARGET}\``);
      console.log(`DROPPED ${TARGET}`);
      const [after] = await server.query('SHOW DATABASES');
      console.log('remaining:', after.map((d) => d.Database).join(', '));
    } else {
      console.log('Dry run. Re-run with --apply to drop.');
    }
  } finally {
    await server.end();
  }
})().catch((e) => { console.error('FAILED:', e.code || e.message); process.exit(1); });