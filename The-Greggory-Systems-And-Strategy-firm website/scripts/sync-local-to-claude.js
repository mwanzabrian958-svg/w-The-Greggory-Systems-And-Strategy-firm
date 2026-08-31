/**
 * scripts/sync-local-to-claude.js
 * Copies every table (schema + data) from localhost:3306 to the claude
 * Aiven DB (mysql-2753711c-…28067). Safe to re-run: uses INSERT IGNORE
 * so existing rows are skipped.
 *
 * Run:  node scripts/sync-local-to-claude.js
 */
 const mysql = require('mysql2/promise');
 const dotenv = require('dotenv');
 const path  = require('path');
 dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
 
 const LOCAL = {
  host     : process.env.DB_HOST_2     || 'localhost',
  port     : Number(process.env.DB_PORT_2 || 3306),
  user     : process.env.DB_USER_2     || 'root',
  password : process.env.DB_PASSWORD_2 || '',
  database : process.env.DB_NAME       || 'the_greggory_systems_and_strategy_firm_db_main',
  ssl      : (process.env.DB_SSL_2 || 'false') === 'true' ? { rejectUnauthorized: false } : false
};
 
 const CLOUD = {
  host     : process.env.DB_HOST,
  port     : Number(process.env.DB_PORT || 28067),
  user     : process.env.DB_USER       || 'avnadmin',
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME       || 'the_greggory_systems_and_strategy_firm_db_main',
  ssl      : (process.env.DB_SSL || 'false') === 'true' ? { rejectUnauthorized: false } : false
};
 
 async function sync() {
  const local = await mysql.createConnection(LOCAL);
  const cloud = await mysql.createConnection(CLOUD);
  console.log('[sync] LOCAL  :', LOCAL.host, LOCAL.port);
  console.log('[sync] CLAUDE :', CLOUD.host, CLOUD.port);
 
  const [tables] = await local.query('SHOW TABLES');
  
  const key = Object.keys(tables[0])[0];           // table-name column differs by locale
  const names = tables.map(t => t[key]);
 
  for (const table of names) {
    const [rows] = await local.query(`SELECT * FROM ??`, [table]);
 
    // copy schema if table doesn't exist (CREATE LIKE keeps cloud-side engine/charset clean)
    const [exists] = await cloud.query(`SELECT 1 FROM ?? LIMIT 0`, [table]);
 
    if (rows.length === 0 || exists.length === 0) {
      if (exists.length === 0) {
        await cloud.query(`CREATE TABLE ?? LIKE ??`, [table, table]);          // create empty table
        console.log('[sync] schema copied :', table);
      }
      continue;                                                         // empty table → next
    }
 
    const columns = Object.keys(rows[0]);                               // all column names
    const placeholders = columns.map(() => '??').join(', ');
    const updates = columns.map(c => `${c} = VALUES(${c})`).join(', ');
 
    await cloud.query(
      `INSERT INTO ?? (${placeholders}) VALUES ? ON DUPLICATE KEY UPDATE ${updates}`,
      [table, ...columns, rows]
    );
    console.log(`[sync] ${rows.length} rows -> ${table} `);
  }
 
  await local.end();
  await cloud.end();
  console.log('[sync] done ✅');
 }
 
 sync().catch(e => {
  console.error('[sync] error:', e.message || e);
  process.exit(1);
 });