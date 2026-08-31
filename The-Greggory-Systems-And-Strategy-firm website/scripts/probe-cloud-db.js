/**
 * Probe MySQL endpoints with the .env credentials — prints results WITHOUT
 * ever echoing the password. Used to diagnose the "Access denied for user
 * 'avnadmin'" situation when an Aiven service is migrated or its password is
 * rotated.
 *
 * Usage:
 *   node scripts/probe-cloud-db.js <host1> [host2] ...
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

const hosts = process.argv.slice(2);
const base = {
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT || 28067),
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
  connectTimeout: 15000,
};

(async () => {
  if (hosts.length === 0) {
    console.log("Usage: node scripts/probe-cloud-db.js <host1> [host2] ...");
    process.exit(2);
  }
  for (const host of hosts) {
    const label = `${host}:${base.port}`;
    try {
      const conn = await mysql.createConnection({ ...base, host });
      const [dbs] = await conn.query("SHOW DATABASES");
      const dbNames = dbs.map((d) => Object.values(d)[0]).filter(
        (n) => !["information_schema", "performance_schema", "mysql", "sys"].includes(n),
      );
      console.log(`[CONNECTED] ${label} — databases: ${dbNames.join(", ") || "(none)"}`);
      for (const dbName of dbNames) {
        try {
          await conn.query(`USE \`${dbName}\``);
          const [users] = await conn
            .query("SELECT COUNT(*) AS n FROM users")
            .catch(() => [[{ n: "n/a" }]]);
          const [tables] = await conn.query("SHOW TABLES");
          console.log(`  - ${dbName}: ${tables.length} tables, users rows: ${users[0].n}`);
        } catch (err) {
          console.log(`  - ${dbName}: inspect failed (${err.code || err.message})`);
        }
      }
      await conn.end();
    } catch (err) {
      console.log(`[FAILED] ${label} — ${err.code || ""} ${err.message}`);
    }
  }
})();
