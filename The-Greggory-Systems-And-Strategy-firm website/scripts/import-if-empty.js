// Cloud bootstrap: imports database/the-*.sql once, if the cloud DB is empty.
// Runs before server start on Railway:  node scripts/import-if-empty.js && node server.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
    multipleStatements: true,
    connectTimeout: 30000,
  };
  const conn = await mysql.createConnection(cfg);
  try {
    const [tables] = await conn.query('SHOW TABLES');
    if (tables.length > 0) {
      process.stdout.write(`[import] ${tables.length} tables exist - skipping import\n`);
      return;
    }
    const dumpPath = path.join(__dirname, '..', 'database', 'the-greggory-systems-and-strategy-firm-db-main.sql');
    if (!fs.existsSync(dumpPath)) {
      process.stdout.write(`[import] dump not found at ${dumpPath} - skipping\n`);
      return;
    }
    process.stdout.write(`[import] empty DB detected - importing ${path.basename(dumpPath)}...\n`);
    await conn.query(fs.readFileSync(dumpPath, 'utf8'));
    const [after] = await conn.query('SHOW TABLES');
    process.stdout.write(`[import] done - ${after.length} tables created\n`);
  } finally {
    await conn.end();
  }
})().catch(e => { process.stderr.write(`[import] ERROR: ${e.message}\n`); process.exit(1); });
