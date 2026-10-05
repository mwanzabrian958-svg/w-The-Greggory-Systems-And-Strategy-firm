// Cloud bootstrap: imports the seed dump in The-Greggory-Systems-And-Strategy-firm-db-main/
// once, if the cloud DB is empty.
// Runs before server start in production (Render):
//   node scripts/import-if-empty.js && node server.js
//
// The cloud MySQL (Aiven) may still be unreachable (network blip, service
// restart, credentials) right when the API container starts — we therefore
// RETRY the connection for ~90 seconds.
// If it is still unreachable after that (e.g. wrong credentials) we log the
// exact cause and CONTINUE (exit 0) so the deployment goes live and the
// problem is visible in logs / /api/test-db instead of hiding as CRASHED.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MAX_ATTEMPTS = Number(process.env.DB_BOOTSTRAP_RETRIES || 18);
const RETRY_DELAY_MS = 5000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The Aiven service only ever owns `defaultdb`, and DB_NAME is set on Render.
// The old fallback ("the_greggory_systems_and_strategy_firm_db_main") was a
// LOCAL XAMPP database name: if DB_NAME were ever missing here, this would try
// to CREATE a database that Aiven refuses (ER_DBACCESS_DENIED_ERROR) and the
// container would never finish booting. Fail loudly instead of guessing a name.
const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) {
  console.error(
    '[import] DB_NAME is not set — refusing to guess a database name. ' +
      'Set it in the environment (Aiven service: `defaultdb`).'
  );
  process.exit(1);
}
const ENDPOINTS = require('../server/config/dbEndpoints').endpoints();

// On a managed MySQL (Aiven) the service ships with its schema already present
// (`defaultdb`) and avnadmin owns ONLY that one, so CREATE DATABASE is a
// guaranteed permission error. Only attempt it for a local/self-hosted server
// where the target may genuinely not exist yet.
async function ensureDatabaseExists(cfg) {
  if (!/^(localhost|127\.0\.0\.1|::1)$/i.test(cfg.host || '')) return;
  const serverCfg = { ...cfg };
  delete serverCfg.database;
  const conn = await mysql.createConnection(serverCfg);
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    process.stdout.write(`[import] database \`${DB_NAME}\` ready\n`);
  } finally {
    await conn.end();
  }
}

// Try every configured MySQL endpoint (local 3306, then claude) and keep the
// first one that answers — same "looks at both ports" behaviour as server.js.
async function tryAnyEndpoint(attempt) {
  let lastErr;
  for (const cfg of ENDPOINTS) {
    const { label, ...opts } = cfg;
    try {
      await ensureDatabaseExists(opts);
      return await mysql.createConnection({
        ...opts,
        database: DB_NAME,
        multipleStatements: true, // the SQL dump is imported as one multi-statement string
      });
    } catch (err) {
      lastErr = err;
      process.stdout.write(
        `[import] DB not ready (${label || opts.host}:${opts.port}, attempt ${attempt}/${MAX_ATTEMPTS}): ${err.code || err.message}\n`
      );
    }
  }
  throw lastErr;
}

async function connectWithRetry() {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await tryAnyEndpoint(attempt);
    } catch (err) {
      lastErr = err;
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
    const tableNames = tables.map((r) => Object.values(r)[0]);
    // A partial import (e.g. a previous run aborted on a foreign-key error)
    // leaves some tables behind; detect it via the core auth tables so we can
    // wipe and re-import instead of silently skipping a broken schema.
    const coreTables = ['users', 'admin_users', 'developer_users'];
    if (coreTables.every((t) => tableNames.includes(t))) {
      process.stdout.write(`[import] ${tableNames.length} tables exist - skipping import\n`);
      return;
    }
    const dumpPath = path.join(__dirname, '..', 'The-Greggory-Systems-And-Strategy-firm-db-main', 'the-greggory-systems-and-strategy-firm-db-main.sql');
    if (!fs.existsSync(dumpPath)) {
      process.stdout.write(`[import] dump not found at ${dumpPath} - skipping\n`);
      return;
    }
    if (tableNames.length > 0) {
      process.stdout.write(`[import] partial schema detected (${tableNames.length} tables, core missing) - dropping and re-importing\n`);
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const t of tableNames) {
        await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    process.stdout.write(`[import] empty DB detected - importing ${path.basename(dumpPath)}...\n`);
    // The dump was written for local XAMPP: it starts with DROP DATABASE /
    // CREATE DATABASE / USE <hardcoded name>. On managed MySQL (Aiven) the
    // app connects to DB_NAME instead, so strip those three statements and
    // let the tables land in the database we are connected to.
    const dump = fs.readFileSync(dumpPath, 'utf8')
      .replace(/^\s*DROP DATABASE[^;]*;\s*$/gim, '')
      .replace(/^\s*CREATE DATABASE[^;]*;\s*$/gim, '')
      .replace(/^\s*USE\s+[^;]*;\s*$/gim, '');
    // The dump creates tables in an order MySQL rejects with foreign-key
    // checks on (a table referencing `users` is created before `users`), so
    // import with checks disabled and re-enable afterwards.
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query(dump);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    const [after] = await conn.query('SHOW TABLES');
    process.stdout.write(`[import] done - ${after.length} tables created\n`);
  } finally {
    await conn.end();
  }
})().catch(e => {
  process.stderr.write(`[import] ERROR: ${e.message}\n[import] Booting the API anyway.\n`);
  process.exit(0);
});
