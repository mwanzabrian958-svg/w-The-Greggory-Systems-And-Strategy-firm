// Cloud bootstrap: imports database/the-*.sql once, if the cloud DB is empty.
// Runs before server start on Railway:  node scripts/import-if-empty.js && node server.js
//
// Railway starts services in parallel, so MySQL may still be booting when the
// API container starts — we therefore RETRY the connection for ~90 seconds.
// If it is still unreachable after that (e.g. wrong credentials) we log the
// exact cause and CONTINUE (exit 0) so the deployment goes live and the
// problem is visible in logs / /api/test-db instead of hiding as CRASHED.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MAX_ATTEMPTS = Number(process.env.DB_BOOTSTRAP_RETRIES || 18);
const RETRY_DELAY_MS = 5000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
    multipleStatements: true,
    connectTimeout: 15000,
  };
}

async function connectWithRetry() {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await mysql.createConnection(dbConfig());
    } catch (err) {
      lastErr = err;
      process.stdout.write(`[import] DB not ready (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.code || err.message}\n`);
      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastErr;
}

(async () => {
  let conn;
  try {
    conn = await connectWithRetry();
  } catch (err) {
    process.stderr.write(
      `[import] GAVE UP after ${MAX_ATTEMPTS} attempts: ${err.message}\n` +
      `[import] Verify the DB_* service variables point at your MySQL plugin.\n` +
      `[import] Booting the API anyway — DB routes will fail until this is fixed.\n`
    );
    process.exit(0);
  }

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
})().catch(e => {
  process.stderr.write(`[import] ERROR: ${e.message}\n[import] Booting the API anyway.\n`);
  process.exit(0);
});
