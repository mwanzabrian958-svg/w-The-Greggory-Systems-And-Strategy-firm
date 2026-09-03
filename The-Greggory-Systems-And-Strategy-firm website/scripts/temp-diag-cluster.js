// Temp diagnostic: replicate server.js's exact PoolCluster setup and test queries
require("dotenv").config();
const mysql = require("mysql2");
const { endpoints } = require("../server/config/dbEndpoints");

const cluster = mysql.createPoolCluster({
  canRetry: true,
  removeNodeErrorCount: 1,
  restoreNodeTimeout: 5000,
  defaultSelector: "ORDER",
});

endpoints().forEach((cfg, i) => {
  const { label, ...opts } = cfg;
  console.log(`Adding node db-${label || i}: ${opts.host}:${opts.port}`);
  cluster.add(`db-${label || i}`, {
    ...opts,
    database: process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
});

cluster.on("error", (err) => console.error("[CLUSTER] error:", err.message));
cluster.on("warn", (err) => console.warn("[CLUSTER] warn:", err.code || err.message));
cluster.on("offline", (id) => console.error(`[CLUSTER] ${id} offline`));
cluster.on("remove", (id) => console.error(`[CLUSTER] ${id} removed`));

const pool = cluster.of("*", "ORDER");

function q(sql, vals) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    pool.query(sql, vals, (err, rows) => {
      console.log(`  query "${sql.substring(0, 40)}" finished in ${Date.now() - t0}ms`, err ? `ERR: ${err.code}` : `rows: ${Array.isArray(rows) ? rows.length : 1}`);
      err ? reject(err) : resolve(rows);
    });
  });
}

(async () => {
  console.log("--- Test 1: SELECT 1 via namespace.query ---");
  await q("SELECT 1 as t", []);
  console.log("--- Test 2: invoices query via namespace.query ---");
  await q("SELECT id, title FROM invoices LIMIT 5", []);
  console.log("--- Test 3: prepared execute with LIMIT ? ---");
  await new Promise((resolve, reject) => {
    const t0 = Date.now();
    pool.execute("SELECT id, title FROM invoices LIMIT ? OFFSET ?", [5, 0], (err, rows) => {
      console.log(`  execute finished in ${Date.now() - t0}ms`, err ? `ERR: ${err.code} ${err.message.substring(0, 80)}` : `rows: ${rows.length}`);
      err ? reject(err) : resolve(rows);
    });
  }).catch(() => {});
  console.log("--- All tests done ---");
  cluster.end();
  process.exit(0);
})();

setTimeout(() => { console.log("GLOBAL TIMEOUT — something hung for 30s"); process.exit(1); }, 30000);
