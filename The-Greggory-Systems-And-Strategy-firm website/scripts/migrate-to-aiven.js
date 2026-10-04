/**
 * One-shot: import the seed dump into the managed Aiven `defaultdb`.
 *
 * The dump starts with:
 *   DROP DATABASE IF EXISTS the_greggory_systems_and_strategy_firm_db_main;
 *   CREATE DATABASE the_greggory_... ;
 *   USE the_greggory_...;
 *
 * Aiven's avnadmin only owns `defaultdb` (verified: SHOW DATABASES lists just
 * that one), so those three statements fail with ER_DBACCESS_DENIED_ERROR.
 * They are rewritten below to be no-ops / point at defaultdb instead.
 *
 * Idempotent: safe to re-run. CREATE TABLE IF NOT EXISTS + INSERT IGNORE.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SQL_FILE = path.join(
  __dirname,
  '..',
  'The-Greggory-Systems-And-Strategy-firm-db-main',
  'the-greggory-systems-and-strategy-firm-db-main.sql'
);
const DB_NAME = process.env.DB_NAME || 'defaultdb';
const OLD_DB = 'the_greggory_systems_and_strategy_firm_db_main';

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB_NAME,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  connectTimeout: 20000,
};

function neutralize(sql) {
  const notes = [];
  let out = sql;
  // Dropping the only database we own would destroy the target mid-import.
  out = out.replace(new RegExp(`DROP DATABASE[^;]*${OLD_DB}[^;]*;`, 'gi'), () => {
    notes.push('DROP DATABASE -> removed (would delete the target)');
    return '-- DROP DATABASE neutralized by migrate-to-aiven.js;';
  });
  // We cannot create a new schema on Aiven; defaultdb already exists.
  out = out.replace(/CREATE DATABASE[^;]*;/gi, () => {
    notes.push('CREATE DATABASE -> removed (avnadmin owns defaultdb only)');
    return '-- CREATE DATABASE neutralized by migrate-to-aiven.js;';
  });
  out = out.replace(/^USE\s+[`\w]+;/gim, () => {
    notes.push(`USE ${OLD_DB} -> USE \`${DB_NAME}\``);
    return `USE \`${DB_NAME}\`;`;
  });
  return { sql: out, notes: [...new Set(notes)] };
}

(async () => {
  const raw = fs.readFileSync(SQL_FILE, 'utf8');
  const { sql, notes } = neutralize(raw);
  console.log('=== MIGRATE TO AIVEN ===');
  console.log('target:', cfg.host + ':' + cfg.port + '/' + DB_NAME);
  notes.forEach((n) => console.log('  *', n));

  const conn = await mysql.createConnection({ ...cfg, multipleStatements: true });
  try {
    const [[{ db }]] = await conn.query('SELECT DATABASE() AS db');
    console.log('connected, default schema =', db);

    const before = await conn.query('SHOW TABLES');
    console.log('tables before:', before[0].length);

    console.log('importing dump (~' + Math.round(sql.length / 1024) + ' KB)...');
    await conn.query(sql);
    console.log('import OK');

    const after = await conn.query('SHOW TABLES');
    console.log('tables after:', after[0].length);

    for (const t of ['users', 'admin_users', 'companies', 'blog_articles', 'case_studies']) {
      try {
        const [[{ n }]] = await conn.query(
          'SELECT COUNT(*) AS n FROM `' + t + '`'
        );
        console.log('  ' + t + ': ' + n + ' rows');
      } catch (e) {
        console.log('  ' + t + ': MISSING (' + e.code + ')');
      }
    }
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error('MIGRATION FAILED:', e.code || '', e.message);
  process.exit(1);
});