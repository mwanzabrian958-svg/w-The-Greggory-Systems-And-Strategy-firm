#!/usr/bin/env node
/**
 * Secondary backup — pulls the PRODUCTION cloud database (Aiven MySQL) into
 * the LOCAL XAMPP database (the one visible in phpMyAdmin).
 *
 * Run manually:      node scripts/backup-cloud-to-local.js
 * Or via npm:        npm run backup:cloud-to-local
 * Scheduled daily by Windows Task Scheduler.
 *
 * What it does:
 *   1. JSON snapshot of every cloud table -> backups/cloud-snapshot-<ts>.json
 *      (keeps the last 10 snapshots, older ones are pruned)
 *   2. Mirrors every cloud table into the local DB:
 *      - creates any tables missing locally (from the cloud DDL)
 *      - truncates + re-inserts rows with IDs preserved
 *      - skips computed (STORED/VIRTUAL GENERATED) columns
 *      - re-syncs AUTO_INCREMENT counters
 *   3. Verifies row counts on both sides and prints a report
 *
 * Safety:
 *   - Cloud credentials come from .env (DB_CLOUD_*), never hardcoded
 *   - Aborts BEFORE touching local if the cloud is unreachable
 *   - Aborts BEFORE touching local if the cloud looks empty (0 rows)
 *     unless --force is passed — protects against wiping local with nothing
 *   - One failing table never aborts the whole backup
 */
const fs = require("fs");
const path = require("path");
// resolve .env relative to this script so Task Scheduler can start it from any cwd
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

const DB = process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";
const SNAPSHOT_KEEP = 10;

// ---- status file (read by the admin API and monitoring) ----
const STATUS_PATH = path.join(__dirname, "..", "backups", "last-backup-status.json");
const STATUS = {
  ok: false,
  trigger: process.env.BACKUP_TRIGGER || "manual",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  durationMs: null,
  error: null,
  cloud: null,
  local: null,
};
function saveStatus() {
  try {
    fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
    fs.writeFileSync(STATUS_PATH, JSON.stringify(STATUS, null, 2));
  } catch (e) {
    console.error(`[backup] could not write status file: ${e.message}`);
  }
}

const isLocalHost = (h) =>
  ["localhost", "127.0.0.1", "::1"].includes((h || "").toLowerCase());

// Cloud (primary) source — explicit DB_CLOUD_* keys win; otherwise fall back
// to DB_* when DB_HOST is itself a non-local (managed) host, so a .env that
// only defines DB_* still works.
const CLOUD = {
  host:
    process.env.DB_CLOUD_HOST ||
    (!isLocalHost(process.env.DB_HOST) ? process.env.DB_HOST : undefined),
  port: Number(process.env.DB_CLOUD_PORT || process.env.DB_PORT || 28067),
  user: process.env.DB_CLOUD_USER || process.env.DB_USER,
  password:
    process.env.DB_CLOUD_PASSWORD !== undefined
      ? process.env.DB_CLOUD_PASSWORD
      : process.env.DB_PASSWORD,
  database: DB,
  connectTimeout: 20000,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
};

// LOCAL target = the XAMPP/phpMyAdmin secondary. Uses the DB_*_2 variables —
// the SAME convention as server/config/dbEndpoints.js (DB_* = cloud primary,
// DB_*_2 = local secondary) so one .env drives both the app and the backup.
// (Previously this read DB_HOST/DB_USER/DB_PASSWORD, which now point at the
// cloud — mirroring the cloud into itself. The _2 keys fix that.)
const LOCAL = {
  host: process.env.DB_HOST_2 || "127.0.0.1",
  port: Number(process.env.DB_PORT_2 || 3306),
  user: process.env.DB_USER_2 || "root",
  password: process.env.DB_PASSWORD_2 !== undefined ? process.env.DB_PASSWORD_2 : "",
  database: DB,
  connectTimeout: 8000,
};

function requireCloudEnv() {
  const missing = [];
  if (!CLOUD.host) missing.push("DB_CLOUD_HOST (or a non-local DB_HOST)");
  if (!CLOUD.user) missing.push("DB_CLOUD_USER (or DB_USER)");
  if (CLOUD.password === undefined)
    missing.push("DB_CLOUD_PASSWORD (or DB_PASSWORD)");
  if (missing.length) {
    console.error(`[backup] missing .env keys: ${missing.join(", ")} — aborting`);
    process.exit(1);
  }
}

// MySQL 8 DDL uses utf8mb4_0900_ai_ci which MariaDB does not understand.
function ddlForLocal(ddl) {
  return ddl
    .replace(/utf8mb4_0900_ai_ci/gi, "utf8mb4_unicode_ci")
    .replace(/utf8mb4_0900_bin/gi, "utf8mb4_bin");
}

async function cloudSnapshot(conn) {
  const [tabs] = await conn.query(
    "SELECT TABLE_NAME name FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
    [DB],
  );
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: `cloud backup target ${CLOUD.host}`,
    database: DB,
    tables: {},
  };
  let total = 0;
  for (const t of tabs) {
    const [rows] = await conn.query(`SELECT * FROM \`${t.name}\``);
    snapshot.tables[t.name] = rows;
    total += rows.length;
  }
  return { snapshot, total, count: tabs.length };
}

function saveSnapshot(snapshot) {
  const dir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `cloud-snapshot-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot));
  console.log(`[backup] snapshot saved: ${path.basename(file)} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
  const old = fs
    .readdirSync(dir)
    .filter((f) => /^cloud-snapshot-\d+\.json$/.test(f))
    .sort()
    .reverse()
    .slice(SNAPSHOT_KEEP);
  old.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  if (old.length) console.log(`[backup] pruned ${old.length} old snapshot(s)`);
}

(async () => {
  const force = process.argv.includes("--force");
  requireCloudEnv();

  console.log(`[backup] ${new Date().toISOString()} — cloud -> local (${DB})`);
  const C = await mysql.createConnection(CLOUD).catch((e) => {
    console.error(`[backup] CLOUD UNREACHABLE (${e.code || e.message}) — local DB left untouched. Aborting.`);
    STATUS.error = `cloud unreachable: ${e.code || e.message}`;
    STATUS.finishedAt = new Date().toISOString();
    STATUS.durationMs = Date.now() - Date.parse(STATUS.startedAt);
    saveStatus();
    process.exit(1);
  });

  // ---- 1) snapshot the cloud ----
  const { snapshot, total, count } = await cloudSnapshot(C);
  console.log(`[backup] cloud reachable: ${count} tables, ${total} rows`);
  if (total === 0 && !force) {
    console.error("[backup] cloud appears EMPTY (0 rows) — refusing to overwrite local. Use --force to override.");
    STATUS.error = "cloud database empty (0 rows) — local protected; use --force to override";
    STATUS.finishedAt = new Date().toISOString();
    STATUS.durationMs = Date.now() - Date.parse(STATUS.startedAt);
    saveStatus();
    await C.end();
    process.exit(1);
  }
  saveSnapshot(snapshot);

  // ---- 2) mirror into local ----
  const L = await mysql.createConnection(LOCAL).catch((e) => {
    console.error(`[backup] LOCAL DB unreachable (${e.code || e.message}) — is XAMPP MySQL running? Aborting.`);
    STATUS.error = `local DB unreachable: ${e.code || e.message} (is XAMPP MySQL running?)`;
    STATUS.finishedAt = new Date().toISOString();
    STATUS.durationMs = Date.now() - Date.parse(STATUS.startedAt);
    saveStatus();
    process.exit(1);
  });
  await L.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await L.query("SET FOREIGN_KEY_CHECKS = 0");
  // Cloud (MySQL 8) DDL quotes identifiers with double quotes — enable
  // ANSI_QUOTES locally so "table"/"column" parse as identifiers.
  await L.query("SET SESSION sql_mode = CONCAT(@@sql_mode, ',ANSI_QUOTES')");
  // Some cloud rows predate local CHECK constraints (e.g. json_valid on
  // mpesa_transactions.response_data) — relax CHECKs for the mirror.
  try { await L.query("SET SESSION check_constraint_checks = 0"); } catch (e) { /* not supported — fine */ }

  const [ltabs] = await L.query(
    "SELECT TABLE_NAME name FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",
    [DB],
  );
  const localTables = new Set(ltabs.map((r) => r.name || r.TABLE_NAME));

  let synced = 0, created = 0, failed = 0, copiedRows = 0;
  for (const t of Object.keys(snapshot.tables)) {
    try {
      if (!localTables.has(t)) {
        const [ddlRows] = await C.query(`SHOW CREATE TABLE \`${t}\``);
        const ddl = ddlForLocal(ddlRows[0]["Create Table"]);
        await L.query(ddl);
        created++;
        console.log(`[backup] created local table ${t}`);
      }
      const [lcols] = await L.query(
        "SELECT COLUMN_NAME name, EXTRA extra FROM information_schema.columns WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
        [DB, t],
      );
      // never insert into computed columns — values regenerate themselves
      const targets = lcols
        .filter((r) => !/(STORED|VIRTUAL)\s*GENERATED/i.test(r.extra || ""))
        .map((r) => r.name);
      const rows = snapshot.tables[t];
      await L.query(`TRUNCATE TABLE \`${t}\``);
      const chunk = 100;
      for (let i = 0; i < rows.length; i += chunk) {
        const slice = rows.slice(i, i + chunk);
        const ph = slice.map(() => `(${targets.map(() => "?").join(",")})`).join(",");
        const vals = slice.flatMap((r) =>
          targets.map((cn) => {
            const v = r[cn];
            if (v === undefined) return null;
            // JSON columns arrive as arrays/objects — mysql2 text protocol
            // would flatten arrays into extra values, so stringify first.
            if (v !== null && typeof v === "object" && !(v instanceof Date) && !Buffer.isBuffer(v)) {
              return JSON.stringify(v);
            }
            return v;
          }),
        );
        await L.query(
          `INSERT INTO \`${t}\` (${targets.map((n) => `\`${n}\``).join(",")}) VALUES ${ph}`,
          vals,
        );
      }
      // auto-increment: continue from the cloud's high-water mark
      const [aiCol] = await C.query(
        "SELECT COLUMN_NAME name FROM information_schema.columns WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA LIKE '%auto_increment%'",
        [DB, t],
      );
      if (aiCol.length) {
        const [mx] = await C.query(`SELECT MAX(\`${aiCol[0].name}\`) m FROM \`${t}\``);
        await L.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = ${(mx[0].m || 0) + 1}`);
      }
      synced++;
      copiedRows += rows.length;
    } catch (e) {
      failed++;
      console.error(`[backup]   !! ${t}: ${e.message}`.slice(0, 200));
    }
  }
  await L.query("SET FOREIGN_KEY_CHECKS = 1");

  // ---- 3) verify ----
  // Compare local against the SNAPSHOT (the exact rows we copied). Re-querying
  // the live cloud here races with production traffic — tables like
  // data_access_logs gain a row per API request, which reports a false
  // MISMATCH on every run. Cloud growth beyond the snapshot is reported as
  // informational "churn" and is picked up by the next run.
  let mismatches = 0, churnTables = 0, churnRows = 0;
  for (const t of Object.keys(snapshot.tables)) {
    const snapCount = snapshot.tables[t].length;
    const [lr] = await L.query(`SELECT COUNT(*) n FROM \`${t}\``);
    if (lr[0].n !== snapCount) {
      mismatches++;
      console.error(`[backup]   MISMATCH ${t}: snapshot ${snapCount} vs local ${lr[0].n}`);
    } else {
      const [cr] = await C.query(`SELECT COUNT(*) n FROM \`${t}\``);
      if (cr[0].n > snapCount) {
        churnTables++;
        churnRows += cr[0].n - snapCount;
      }
    }
  }
  console.log(
    mismatches === 0
      ? `[backup] VERIFIED — local matches the snapshot for all ${count} tables` +
          ` (${copiedRows} rows copied, ${created} tables created, ${failed} failures)` +
          (churnTables
            ? ` · cloud grew +${churnRows} row(s) on ${churnTables} table(s) during the run — picked up next run`
            : "")
      : `[backup] finished with ${mismatches} MISMATCH(ES) — see above`,
  );
  STATUS.churn = { tables: churnTables, rows: churnRows };
  STATUS.ok = mismatches === 0 && failed === 0;
  STATUS.finishedAt = new Date().toISOString();
  STATUS.durationMs = Date.now() - Date.parse(STATUS.startedAt);
  STATUS.cloud = { host: CLOUD.host, tables: count, rows: total };
  STATUS.local = {
    host: LOCAL.host,
    tablesCreated: created,
    rowsCopied: copiedRows,
    failures: failed,
    mismatches,
  };
  saveStatus();
  await C.end();
  await L.end();
})().catch((e) => {
  console.error("[backup] FATAL:", e.message);
  STATUS.error = e.message;
  STATUS.finishedAt = new Date().toISOString();
  STATUS.durationMs = Date.now() - Date.parse(STATUS.startedAt);
  saveStatus();
  process.exit(1);
});