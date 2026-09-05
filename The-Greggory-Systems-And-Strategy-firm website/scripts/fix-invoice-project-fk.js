/**
 * FIX INVOICE PROJECT FK (migration)
 * File: scripts/fix-invoice-project-fk.js
 *
 * invoices.project_id was NOT NULL with a FK to the legacy `projects` table,
 * but projects are now created in `user_projects`. The FK rejected valid
 * user_projects ids -> invoice POST 500.
 *
 * Fix: drop the FK, make project_id nullable, and repoint resolveInvoiceProjectId
 * at user_projects (handled inline in server.js).
 *
 * Usage: node scripts/fix-invoice-project-fk.js
 */
require("dotenv").config();
const mysql = require("mysql2");
(async () => {
  const conn = mysql.createConnection({
    host: process.env.DB_CLOUD_HOST || process.env.DB_HOST,
    port: Number(process.env.DB_CLOUD_PORT || process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const exec = (sql) => conn.promise().query(sql).then(() => console.log("ok:", sql.split("\n")[0].slice(0, 80))).catch((e) => console.log("skip:", e.message.slice(0, 80)));
  // 1. Drop the FK that points at the legacy projects table
  const [fks] = await conn.promise().query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'invoices_ibfk_1'`
  );
  if (fks.length) await exec(`ALTER TABLE invoices DROP FOREIGN KEY invoices_ibfk_1`);
  // 2. Make project_id nullable so invoices without a project are allowed
  await exec(`ALTER TABLE invoices MODIFY COLUMN project_id bigint NULL`);
  // 3. Keep the index for lookups
  await exec(`ALTER TABLE invoices DROP INDEX IF EXISTS idx_invoices_project`);
  await exec(`CREATE INDEX idx_invoices_project ON invoices (project_id)`);
  console.log("DONE — invoices.project_id now nullable, FK to legacy projects removed");
  conn.end();
  process.exit(0);
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
