#!/usr/bin/env node
/**
 * Schema sync — keeps the deployed database structurally identical to the
 * local XAMPP database (the one visible in phpMyAdmin).
 *
 * Two modes:
 *   node scripts/sync-db-schema.js --capture
 *       Reads the LOCAL database and writes a full schema manifest to
 *       database/schema-sync.json. Run on the dev machine whenever the
 *       phpMyAdmin schema changes, then commit the manifest.
 *
 *   node scripts/sync-db-schema.js [--env-file <path>]
 *       Applies the manifest to the database described by the environment
 *       (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL) — i.e. the
 *       production cloud DB on Render. Idempotent: creates only missing
 *       tables, adds only missing columns, NEVER touches data. Intended to
 *       run on every boot:  import-if-empty && sync-db-schema && server
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const { endpoints: dbEndpoints } = require("../server/config/dbEndpoints");

const envIdx = process.argv.indexOf("--env-file");
if (envIdx > -1 && process.argv[envIdx + 1]) {
  require("dotenv").config({ path: process.argv[envIdx + 1] });
} else {
  require("dotenv").config();
}

const DB = process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";
const MANIFEST = path.join(__dirname, "..", "database", "schema-sync.json");

// Columns the application code requires on mpesa_transactions, independent of
// any dump/schema drift (mirrors scripts/migrate-mpesa-columns.js).
const MPESA_REQUIRED = {
  merchant_request_id: "VARCHAR(100)",
  checkout_request_id: "VARCHAR(100)",
  invoice_id: "BIGINT NULL",
  project_id: "BIGINT NULL",
  currency: "VARCHAR(3) DEFAULT 'KES'",
  result_code: "INT",
  result_desc: "VARCHAR(255)",
  completion_time: "TIMESTAMP NULL",
  payment_method: "ENUM('paybill','till_number','buy_goods') DEFAULT 'paybill'",
  business_number: "VARCHAR(20) DEFAULT '174379'",
  account_reference: "VARCHAR(255)",
  client_id: "BIGINT",
  client_name: "VARCHAR(255)",
  client_email: "VARCHAR(255)",
  reconciled: "BOOLEAN DEFAULT FALSE",
  reconciled_at: "TIMESTAMP NULL",
  reconciled_by: "BIGINT NULL",
  reconciliation_notes: "TEXT",
  mpesa_receipt: "VARCHAR(50)",
  updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  updated_by: "BIGINT",
};

// Pick the first MySQL endpoint that answers (local 3306, then claude) and
// remember it for the rest of the run. Cached so we don't re-probe each call.
let _resolved;
async function resolveEndpoint() {
  if (_resolved) return _resolved;
  let lastErr;
  for (const cfg of dbEndpoints()) {
    const { label, ...opts } = cfg;
    try {
      const probe = await mysql.createConnection({ ...opts, connectTimeout: 4000 });
      await probe.end();
      _resolved = opts;
      console.log(`[sync] using endpoint ${label || opts.host}:${opts.port}`);
      return _resolved;
    } catch (e) {
      lastErr = e;
      console.log(`[sync] endpoint ${label || opts.host}:${opts.port} unreachable (${e.code || e.message})`);
    }
  }
  throw lastErr || new Error("No MySQL endpoint reachable");
}

async function baseConfig() {
  const cfg = await resolveEndpoint();
  return { ...cfg, connectTimeout: 15000 };
}

async function targetConfig() {
  const ssl =
    process.env.DB_SSL === "true"
      ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } }
      : {};
  const cfg = await baseConfig();
  return { ...cfg, database: DB, ...ssl };
}

async function ensureDatabase(cfg) {
  try {
    const c = await mysql.createConnection(cfg);
    await c.end();
  } catch (e) {
    if (e.code !== "ER_BAD_DB_ERROR") throw e;
    const ssl =
      process.env.DB_SSL === "true"
        ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } }
        : {};
    const c = await mysql.createConnection({ ...(await baseConfig()), connectTimeout: 15000, ...ssl });
    await c.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await c.end();
  }
}

// Build a column definition from information_schema metadata. Generated
// columns (VIRTUAL/STORED GENERATED) are skipped by the caller — they carry
// their own expressions inside SHOW CREATE TABLE.
function buildDef(c) {
  const type = String(c.COLUMN_TYPE || "").toLowerCase();
  const nullable = c.IS_NULLABLE === "NO" ? " NOT NULL" : "";
  let dflt = "";
  const d = c.COLUMN_DEFAULT;
  if (d !== null && d !== undefined) {
    const s = String(d);
    if (/^null$/i.test(s)) dflt = ""; // MariaDB reports "NULL" for no default
    else if (/^current_timestamp/i.test(s)) dflt = " DEFAULT CURRENT_TIMESTAMP";
    else if (/^-?\d+(\.\d+)?$/.test(s)) dflt = ` DEFAULT ${s}`;
    else if (/^'.*'$/.test(s)) dflt = ` DEFAULT ${s}`; // MariaDB pre-quotes literals
    else dflt = ` DEFAULT '${s.replace(/'/g, "''")}'`;
  }
  const extra = String(c.EXTRA || "");
  const onUpd = /on update/i.test(extra) ? " ON UPDATE CURRENT_TIMESTAMP" : "";
  const ai = /auto_increment/i.test(extra) ? " AUTO_INCREMENT" : "";
  return `${type}${nullable}${dflt}${onUpd}${ai}`;
}

async function capture() {
  const conn = await mysql.createConnection({ ...(await baseConfig()), database: DB });
  const [tabs] = await conn.query(
    "SELECT TABLE_NAME name FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
    [DB]
  );
  const tables = {};
  for (const t of tabs) {
    const name = t.name || t.NAME;
    const [create] = await conn.query(`SHOW CREATE TABLE \`${name}\``);
    const ddl = create[0]["Create Table"];
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM information_schema.columns WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
      [DB, name]
    );
    const columns = cols
      .filter((c) => !/(virtual|stored)\s+generated/i.test(String(c.EXTRA || "")))
      .map((c) => ({ name: c.COLUMN_NAME, def: buildDef(c) }));
    tables[name] = { create: ddl, columns };
  }
  await conn.end();
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: "local XAMPP (phpMyAdmin) database",
    database: DB,
    tables,
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(
    `[sync] captured ${Object.keys(tables).length} tables -> ${path.relative(process.cwd(), MANIFEST)}`
  );
}

async function apply() {
  if (!fs.existsSync(MANIFEST)) {
    console.log("[sync] no manifest found - skipping (run --capture on the dev machine)");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  await ensureDatabase(await targetConfig());
  const conn = await mysql.createConnection(await targetConfig());
  const [tabs] = await conn.query(
    "SELECT TABLE_NAME name FROM information_schema.tables WHERE TABLE_SCHEMA = ?",
    [DB]
  );
  const existing = new Set(tabs.map((t) => t.name || t.NAME));
  let created = 0;
  let addedCols = 0;
  const errors = [];
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const [name, def] of Object.entries(manifest.tables)) {
    try {
      if (!existing.has(name)) {
        await conn.query(def.create);
        created++;
        existing.add(name);
        console.log(`[sync] created table ${name}`);
      }
    } catch (e) {
      errors.push(`create ${name}: ${e.message}`);
    }
  }
  for (const [name, def] of Object.entries(manifest.tables)) {
    if (!existing.has(name)) continue;
    let have;
    try {
      const [c] = await conn.query(`SHOW COLUMNS FROM \`${name}\``);
      have = new Set(c.map((r) => r.Field));
    } catch (e) {
      errors.push(`show columns ${name}: ${e.message}`);
      continue;
    }
    for (const col of def.columns || []) {
      if (have.has(col.name)) continue;
      if (/^(case|when|then|else|end)$/i.test(col.name)) {
        console.log(`[sync] skipped suspicious column ${name}.${col.name}`);
        continue;
      }
      try {
        await conn.query(`ALTER TABLE \`${name}\` ADD COLUMN \`${col.name}\` ${col.def}`);
        addedCols++;
      } catch (e) {
        errors.push(`add ${name}.${col.name}: ${e.message}`);
      }
    }
  }
  // Code-required mpesa columns, independent of manifest freshness.
  try {
    const [c] = await conn.query("SHOW COLUMNS FROM `mpesa_transactions`");
    const have = new Set(c.map((r) => r.Field));
    for (const [n, d] of Object.entries(MPESA_REQUIRED)) {
      if (have.has(n)) continue;
      await conn.query(`ALTER TABLE \`mpesa_transactions\` ADD COLUMN \`${n}\` ${d}`);
      addedCols++;
    }
  } catch (e) {
    if (!/doesn't exist/i.test(e.message)) errors.push(`mpesa_transactions: ${e.message}`);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  await conn.end();
  console.log(
    `[sync] done - tables created: ${created}, columns added: ${addedCols}${errors.length ? `, ERRORS: ${errors.length}` : ""}`
  );
  errors.forEach((e) => console.error(`[sync]   !! ${e}`));
  // Never block the server boot on sync problems — same policy as import-if-empty.
}

(async () => {
  try {
    if (process.argv.includes("--capture")) {
      await capture();
    } else {
      await apply();
    }
    process.exit(0);
  } catch (e) {
    console.error("[sync] ERROR:", e.message);
    process.exit(0); // boot must proceed; problems stay visible in the logs
  }
})();

