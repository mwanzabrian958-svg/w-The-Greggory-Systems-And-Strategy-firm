// Post-migration verification: table count + row counts across the new defaultdb.
require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  });
  const [tabs] = await conn.query(
    "SELECT table_name AS tName, table_type AS tType FROM information_schema.tables WHERE table_schema='defaultdb' ORDER BY table_name"
  );
  console.log('objects in defaultdb:', tabs.length);
  let total = 0;
  const populated = [];
  for (const row of tabs) {
    const t = row.tName || row.TNAME || row.table_name || row.TABLE_NAME;
    const ty = row.tType || row.TTYPE || row.table_type || row.TABLE_TYPE;
    if (ty !== 'BASE TABLE') { console.log('   (skip ' + ty + ' ' + t + ')'); continue; }
    const [[{ n }]] = await conn.query('SELECT COUNT(*) n FROM `' + t + '`');
    const c = Number(n);
    total += c;
    if (c > 0) populated.push(`${t}=${c}`);
  }
  console.log('base tables with rows:', populated.length);
  populated.forEach((p) => console.log('   ', p));
  console.log('TOTAL ROWS:', total);
  await conn.end();
})().catch((e) => {
  console.error('VERIFY FAILED:', e.code || e.message);
  process.exit(1);
});