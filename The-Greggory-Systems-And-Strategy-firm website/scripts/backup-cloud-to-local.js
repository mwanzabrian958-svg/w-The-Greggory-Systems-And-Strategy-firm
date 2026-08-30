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

const CLOUD = {
  host: process.env.DB_CLOUD_HOST,
  port: Number(process.env.DB_CLOUD_PORT || 3306),
  user: process.env.DB_CLOUD_USER,
  password: process.env.DB_CLOUD_PASSWORD,
  database: DB,
  connectTimeout: 20000,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
};
const LOCAL = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: DB,
  connectTimeout: 8000,
};

function requireCloudEnv() {
  const missing = ["DB_CLOUD_HOST", "DB_CLOUD_USER", "DB_CLOUD_PASSWORD"].filter(
    (k) => !process.env[k],
  );
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
  let mismatches = 0;
  for (const t of Object.keys(snapshot.tables)) {
    const [cr] = await C.query(`SELECT COUNT(*) n FROM \`${t}\``);
    const [lr] = await L.query(`SELECT COUNT(*) n FROM \`${t}\``);
    if (cr[0].n !== lr[0].n) {
      mismatches++;
      console.error(`[backup]   MISMATCH ${t}: cloud ${cr[0].n} vs local ${lr[0].n}`);
    }
  }
  console.log(
    mismatches === 0
      ? `[backup] VERIFIED — all ${count} tables match. Backup complete (${copiedRows} rows copied, ${created} tables created, ${failed} failures).`
      : `[backup] finished with ${mismatches} MISMATCH(ES) — see above`,
  );
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