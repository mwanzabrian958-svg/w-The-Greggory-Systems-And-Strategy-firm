// TEMP: import a mysqldump data-only file (scripts/_reseed-data.sql) into the
// Aiven cloud DB over TLS. Tables that own GENERATED columns (which cannot
// accept explicit values) are routed through a TEMPORARY staging table whose
// generated columns are materialized as plain ones, then copied back minus
// the generated columns. Never prints secrets.
require("dotenv").config({ override: true });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const file = path.join(__dirname, "_reseed-data.sql");
  const lines = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => /^(INSERT|REPLACE) INTO/i.test(l.trim()));
  console.log(`Dump file: ${lines.length} data statements`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main",
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
    connectTimeout: 20000,
  });
  console.log("Connected to Aiven ✅");

  // generated columns per table
  const [gen] = await conn.query(
    "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND EXTRA LIKE '%GENERATED%'",
    [process.env.DB_NAME]
  );
  const genByTable = {};
  for (const r of gen) (genByTable[r.TABLE_NAME] ||= []).push(r.COLUMN_NAME);

  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  await conn.query("SET UNIQUE_CHECKS=0");
  await conn.query("SET sql_mode='NO_AUTO_VALUE_ON_ZERO'");
  try {
    await conn.query("SET SESSION sql_require_primary_key=0"); // Aiven: allow PK-less staging tables
  } catch (_) {}

  for (const stmt of lines) {
    const table = (stmt.match(/^(?:INSERT|REPLACE) INTO `([^`]+)`/i) || [])[1];
    if (!table) continue;
    const genCols = genByTable[table] || [];
    try {
      if (!genCols.length) {
        await conn.query(stmt);
        console.log(`  ${table}: imported ✅`);
        continue;
      }
      // staging path for generated columns
      const stage = `_stage_${table}`;
      await conn.query(`DROP TEMPORARY TABLE IF EXISTS \`${stage}\``);
      await conn.query(`CREATE TEMPORARY TABLE \`${stage}\` AS SELECT * FROM \`${table}\` LIMIT 0`);
      await conn.query(stmt.replace(/^((?:INSERT|REPLACE) INTO )`[^`]+`/i, `$1\`${stage}\``));
      const [cols] = await conn.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION",
        [process.env.DB_NAME, table]
      );
      const keep = cols.map((c) => c.COLUMN_NAME).filter((c) => !genCols.includes(c));
      const collist = keep.map((c) => `\`${c}\``).join(",");
      await conn.query(`REPLACE INTO \`${table}\` (${collist}) SELECT ${collist} FROM \`${stage}\``);
      await conn.query(`DROP TEMPORARY TABLE \`${stage}\``);
      console.log(`  ${table}: imported via staging (skipped generated: ${genCols.join(", ")}) ✅`);
    } catch (e) {
      console.error(`  ${table}: FAILED ❌ ${e.code || ""} ${e.message}`);
      throw e;
    }
  }

  await conn.query("SET FOREIGN_KEY_CHECKS=1");
  await conn.query("SET UNIQUE_CHECKS=1");
  console.log("IMPORT DONE ✅");
  await conn.end();
})().catch((e) => {
  console.error("IMPORT FAILED ❌", e.code || "", e.message);
  process.exit(1);
});

