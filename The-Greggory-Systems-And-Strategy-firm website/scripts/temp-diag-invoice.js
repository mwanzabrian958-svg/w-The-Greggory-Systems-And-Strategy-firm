// Temp diagnostic: run the exact GET /api/invoices SQL against each endpoint
require("dotenv").config();
const { endpoints, clean, DB_NAME } = require("../server/config/dbEndpoints");
const mysql = require("mysql2/promise");

const SQL =
  "SELECT i.*, p.name as project_name, u.first_name, u.last_name, " +
  "CONCAT(u.first_name, ' ', u.last_name) as created_by_name " +
  "FROM invoices i LEFT JOIN projects p ON i.project_id = p.id " +
  "LEFT JOIN users u ON i.created_by = u.id WHERE i.deleted_at IS NULL " +
  "ORDER BY i.issue_date DESC, i.created_at DESC LIMIT ? OFFSET ?";

(async () => {
  for (const cfg of endpoints()) {
    const t0 = Date.now();
    let conn;
    try {
      conn = await mysql.createConnection({
        ...clean(cfg),
        database: DB_NAME,
        connectTimeout: 5000,
      });
      console.log(`[${cfg.label}] connected in ${Date.now() - t0}ms`);
      try {
        const [rows] = await conn.execute(SQL, [50, 0]);
        console.log(`[${cfg.label}] execute OK in ${Date.now() - t0}ms, rows: ${rows.length}`);
      } catch (e) {
        console.log(`[${cfg.label}] execute FAILED in ${Date.now() - t0}ms: ${e.code} ${e.message.substring(0, 120)}`);
      }
      try {
        const [rows2] = await conn.query(SQL.replace("LIMIT ? OFFSET ?", "LIMIT 50 OFFSET 0"));
        console.log(`[${cfg.label}] query OK in ${Date.now() - t0}ms, rows: ${rows2.length}`);
      } catch (e) {
        console.log(`[${cfg.label}] query FAILED in ${Date.now() - t0}ms: ${e.code} ${e.message.substring(0, 120)}`);
      }
      await conn.end();
    } catch (e) {
      console.log(`[${cfg.label}] connect FAILED in ${Date.now() - t0}ms: ${e.code || e.message.substring(0, 80)}`);
    }
  }
  process.exit(0);
})();
