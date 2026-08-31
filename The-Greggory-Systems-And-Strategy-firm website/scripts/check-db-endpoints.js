/**
 * Tests every known MySQL endpoint config (current .env + .env.cloud.apply +
 * localhost fallbacks) and reports which one actually works and whether the
 * client-portal tables exist there.
 *
 * Usage: node scripts/check-db-endpoints.js
 */
require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2/promise");
const { endpoints, DB_NAME } = require("../server/config/dbEndpoints");

// Parse .env.cloud.apply manually so both candidate credential sets are tested.
function parseEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const cloudApply = parseEnvFile(".env.cloud.apply");

const eps = endpoints();
const candidates = [
  { tag: `endpoint[0] (${eps[0]?.label || "?"})`, ...pick(0) },
  { tag: `endpoint[1] (${eps[1]?.label || "?"})`, ...pick(1) },
  {
    tag: ".env.cloud.apply",
    host: cloudApply.DB_HOST,
    port: cloudApply.DB_PORT,
    user: cloudApply.DB_USER,
    password: cloudApply.DB_PASSWORD,
    ssl: cloudApply.DB_SSL === "true",
  },
];

function pick(i) {
  const eps = endpoints();
  const { label, ...opts } = eps[i] || {};
  return { host: opts.host, port: opts.port, user: opts.user, password: opts.password, ssl: !!opts.ssl };
}

const REQUIRED_TABLES = [
  "users", "user_projects", "project_tasks", "project_team_members",
  "project_activities", "project_invoices", "project_docs",
  "user_feedback", "client_project_summary",
];

(async () => {
  for (const c of candidates) {
    if (!c.host) { console.log(`[${c.tag}] skipped (no host)`); continue; }
    const short = `${c.user}@${c.host}:${c.port}`;
    try {
      const conn = await mysql.createConnection({
        host: c.host, port: Number(c.port), user: c.user, password: c.password,
        ssl: c.ssl ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : undefined,
        connectTimeout: 12000,
      });
      console.log(`[CONNECTED] ${c.tag} -> ${short}`);
      const [dbs] = await conn.query(
        "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?", [DB_NAME]);
      if (dbs.length === 0) {
        console.log(`   database "${DB_NAME}" does NOT exist there`);
        await conn.end();
        continue;
      }
      const [tables] = await conn.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`, [DB_NAME]);
      const have = new Set(tables.map((t) => t.TABLE_NAME || t.TABLE_NAME));
      const found = REQUIRED_TABLES.filter((t) => have.has(t));
      console.log(`   database OK — ${tables.length} tables total; portal tables: ${found.length}/${REQUIRED_TABLES.length}`);
      const [cnt] = await conn.query("SELECT COUNT(*) AS n FROM `" + DB_NAME + "`.users");
      console.log(`   [users count] ${cnt[0].n}`);
      await conn.end();
    } catch (err) {
      console.log(`[FAILED] ${c.tag} -> ${short} : ${err.code || err.message}`);
    }
  }
})();
