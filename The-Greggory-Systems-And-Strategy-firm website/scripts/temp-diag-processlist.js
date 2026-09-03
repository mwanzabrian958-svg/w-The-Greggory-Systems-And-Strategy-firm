// Temp diagnostic: show MariaDB processlist + try a query WHILE server is hung
require("dotenv").config();
const { endpoints, clean, DB_NAME } = require("../server/config/dbEndpoints");
const mysql = require("mysql2/promise");

(async () => {
  const cfg = endpoints().find((c) => c.label === "local");
  const conn = await mysql.createConnection({ ...clean(cfg), database: DB_NAME, connectTimeout: 5000 });
  const [rows] = await conn.query("SHOW PROCESSLIST");
  console.log("=== MariaDB PROCESSLIST ===");
  rows.forEach((r) => {
    console.log(
      `id=${r.Id} user=${r.User} host=${r.Host} db=${r.DB} cmd=${r.Command} time=${r.Time}s state=${r.State} info=${(r.Info || "").substring(0, 60)}`
    );
  });
  await conn.end();
  process.exit(0);
})();
