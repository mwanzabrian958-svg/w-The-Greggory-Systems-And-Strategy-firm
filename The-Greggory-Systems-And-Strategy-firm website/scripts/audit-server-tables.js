/**
 * Phantom-table audit: extracts every table name referenced by SQL in
 * server.js (FROM / JOIN / INSERT INTO / UPDATE / DELETE FROM) and checks it
 * against the live database schema. Any table that does not exist is a
 * guaranteed 500 the first time its endpoint runs with data — exactly the
 * class of bug that broke the client portal (phantom `duties` column).
 *
 * Usage: node scripts/audit-server-tables.js
 */
require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2/promise");
const { endpoints, DB_NAME } = require("../server/config/dbEndpoints");

const src = fs.readFileSync("server.js", "utf8");

// Strip string literals EXCEPT inside SQL — simpler: only look at backtick
// template literals that look like SQL (contain FROM/JOIN/INSERT/UPDATE).
const sqlChunks = src.match(/`[^`]*`/gs) || [];
const sqlText = sqlChunks.filter((c) =>
  /\b(FROM|JOIN|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b/i.test(c),
).join("\n");

const tables = new Set();
const add = (t) => {
  t = t.replace(/[`;\s].*$/, "").trim();
  if (/^[a-z_][a-z0-9_]*$/i.test(t)) tables.add(t.toLowerCase());
};

// Benign "tables" that are never real tables: `information_schema.*` is a
// built-in virtual schema; the rest are prose matches (e.g. "photo from
// base64", "from IP: x", "converted from quote") inside template literals.
const ALWAYS_OK = new Set([
  "information_schema",
  "performance_schema",
  "base64",
  "ip",
  "quote",
  "local",
  "cloud",
]);

for (const m of sqlText.matchAll(/\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi)) add(m[1]);
for (const m of sqlText.matchAll(/INSERT\s+INTO\s+([a-z_][a-z0-9_]*)/gi)) add(m[1]);
for (const m of sqlText.matchAll(/DELETE\s+FROM\s+([a-z_][a-z0-9_]*)/gi)) add(m[1]);
for (const m of sqlText.matchAll(/\bUPDATE\s+([a-z_][a-z0-9_]*)\s+SET/gi)) add(m[1]);
ALWAYS_OK.forEach((t) => tables.delete(t));

async function main() {
  const { label } = { label: process.argv[2] || "local" };
  const list = endpoints();
  const cfg = label === "cloud" ? list[list.length - 1] : list[0];
  const { label: lbl, ...opts } = cfg;
  const conn = await mysql.createConnection({ ...opts, database: DB_NAME });
  const [rows] = await conn.query("SHOW TABLES");
  const live = new Set(rows.map((r) => String(Object.values(r)[0]).toLowerCase()));
  console.log(`Endpoint "${lbl}" -> ${DB_NAME}: ${live.size} live tables`);
  console.log(`server.js references ${tables.size} distinct tables\n`);

  const missing = [...tables].filter((t) => !live.has(t)).sort();
  if (missing.length === 0) {
    console.log("ALL REFERENCED TABLES EXIST — no phantom tables in server.js.");
  } else {
    console.log("MISSING TABLES (would 500 when their endpoints run):");
    missing.forEach((t) => console.log("  -", t));
  }
  await conn.end();
  process.exit(missing.length ? 1 : 0);
}

main().catch((e) => {
  console.error("[FATAL]", e.message);
  process.exit(1);
});
