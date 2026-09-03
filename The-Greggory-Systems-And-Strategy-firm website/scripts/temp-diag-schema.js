// PURGE: drop Baraka Housing Agency (properties/rental) tables — idempotent.
// Order matters: children first (FK constraints).
require("dotenv").config();
const { endpoints, clean, DB_NAME } = require("../server/config/dbEndpoints");
const mysql = require("mysql2/promise");

const TABLES = [
  "applicants",
  "applications",
  "property_features",
  "properties",
  "prop_type_enum",
  "app_status_enum",
  "companies",
];

(async () => {
  for (const target of endpoints()) {
    // Drop on BOTH endpoints so local + cloud stay in sync
    let conn;
    try {
      conn = await mysql.createConnection({ ...clean(target), database: DB_NAME, connectTimeout: 8000 });
    } catch (e) {
      console.log(`[${target.label}] connect failed (${e.code || e.message}) — skipping`);
      continue;
    }
    console.log(`[${target.label}] dropping housing tables...`);
    for (const t of TABLES) {
      try {
        await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
        console.log(`  dropped ${t}`);
      } catch (e) {
        console.log(`  FAILED ${t}: ${e.code || e.message}`);
      }
    }
    await conn.end();
  }
  process.exit(0);
})();
