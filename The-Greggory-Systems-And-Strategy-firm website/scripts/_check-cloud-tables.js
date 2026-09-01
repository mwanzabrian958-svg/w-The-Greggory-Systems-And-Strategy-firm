// TEMP: verify the Aiven cloud DB is reachable and compare its tables against
// the expected schema (database/*.sql + schema-sync.json). Never prints secrets.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function tablesFromSql(file) {
  const out = new Set();
  const sql = fs.readFileSync(file, "utf8");
  for (const m of sql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?[`"]?([a-zA-Z0-9_]+)[`"]?\s*\(/g)) {
    out.add(m[1]);
  }
  return out;
}

(async () => {
  const useLocal = process.env.USE_LOCAL === "1";
  const host = useLocal
    ? process.env.DB_HOST_2 || "127.0.0.1"
    : process.env.DB_HOST || process.env.DB_CLOUD_HOST;
  const port = Number(
    useLocal
      ? process.env.DB_PORT_2 || 3306
      : process.env.DB_PORT || process.env.DB_CLOUD_PORT || 3306
  );
  const user = useLocal
    ? process.env.DB_USER_2 || "root"
    : process.env.DB_USER || process.env.DB_CLOUD_USER;
  const password = useLocal
    ? process.env.DB_PASSWORD_2 || ""
    : process.env.DB_PASSWORD || process.env.DB_CLOUD_PASSWORD;
  const dbName =
    process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";

  if (!host || !user) {
    console.log("NO CREDS: DB_HOST/DB_USER missing from .env");
    process.exit(1);
  }
  console.log(`Target: ${host}:${port} user=${user} db=${dbName} ssl=TLS1.2+`);

  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(host);
  const useSsl = !isLocal && String(process.env.DB_SSL || "true") !== "false";
  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 15000,
      ...(useSsl ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } } : {}),
    });
    console.log(`CONNECTED ✅ — ${isLocal ? "LOCAL XAMPP DB" : "Aiven cloud DB is ACTIVE"}.`);
  } catch (err) {
    console.log(`CONNECT FAILED ❌ — ${err.code || ""} ${err.message}`);
    process.exit(1);
  }

  const [rows] = await conn.query("SHOW TABLES FROM ??", dbName);
  const actual = new Set(rows.map((r) => Object.values(r)[0]));

  const dir = path.join(__dirname, "..", "database");
  const expected = new Set([
    ...tablesFromSql(path.join(dir, "the-greggory-systems-and-strategy-firm-db-main.sql")),
    ...tablesFromSql(path.join(dir, "portal-sync-schema.sql")),
  ]);
  // schema-sync.json is a third source of truth
  try {
    const sync = JSON.parse(
      fs.readFileSync(path.join(dir, "schema-sync.json"), "utf8")
    );
    for (const t of Object.keys(sync.tables || {})) expected.add(t);
  } catch (_) {}

  const missing = [...expected].filter((t) => !actual.has(t)).sort();
  const extra = [...actual].filter((t) => !expected.has(t)).sort();

  console.log(`\nExpected tables: ${expected.size}`);
  console.log(`Actual tables in cloud DB: ${actual.size}`);

  if (actual.size) {
    // row counts for a quick liveness snapshot
    const counts = {};
    for (const t of [...actual].sort()) {
      try {
        const [c] = await conn.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
        counts[t] = c[0].n;
      } catch (e) {
        counts[t] = "err";
      }
    }
    console.log("\nRow counts (actual):");
    for (const [t, n] of Object.entries(counts)) console.log(`  ${t}: ${n}`);
  }

  console.log(`\nMISSING in cloud (${missing.length}):`);
  console.log(missing.length ? "  " + missing.join(", ") : "  (none) ✅");
  console.log(`\nEXTRA in cloud, not in dumps (${extra.length}):`);
  console.log(extra.length ? "  " + extra.join(", ") : "  (none)");

  await conn.end();
})();
