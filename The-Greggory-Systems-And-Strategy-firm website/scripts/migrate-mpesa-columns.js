// Migration: sync mpesa_transactions with what the application code expects.
// Idempotent — inspects current columns, adds only the missing ones.
require("dotenv").config();
const mysql = require("mysql2/promise");

// Columns referenced by backend/routes/mpesa.js, server.js (PDF + reconciliation)
// and src/admin/pages/Financial.jsx. mpesa_receipt is used widely but was missing
// even from the canonical SQL dump.
const REQUIRED_COLUMNS = {
  merchant_request_id: "VARCHAR(100)",
  checkout_request_id: "VARCHAR(100)",
  invoice_id: "BIGINT NULL",
  project_id: "BIGINT NULL",
  currency: "VARCHAR(3) DEFAULT 'KES'",
  result_code: "INT",
  result_desc: "VARCHAR(255)",
  completion_time: "TIMESTAMP NULL",
  payment_method: "ENUM('paybill','till_number','buy_goods') DEFAULT 'paybill'",
  business_number: "VARCHAR(20) DEFAULT '174379'",
  account_reference: "VARCHAR(255)",
  client_id: "BIGINT",
  client_name: "VARCHAR(255)",
  client_email: "VARCHAR(255)",
  reconciled: "BOOLEAN DEFAULT FALSE",
  reconciled_at: "TIMESTAMP NULL",
  reconciled_by: "BIGINT NULL",
  reconciliation_notes: "TEXT",
  mpesa_receipt: "VARCHAR(50)",
  updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  updated_by: "BIGINT",
};

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  try {
    // Ensure table exists at all
    await conn.query(`CREATE TABLE IF NOT EXISTS mpesa_transactions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      transaction_id VARCHAR(100) NOT NULL UNIQUE,
      amount DECIMAL(15,2) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      status ENUM('pending','completed','failed','cancelled','reversed') DEFAULT 'pending',
      response_data JSON,
      created_by BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

    const [cols] = await conn.query("SHOW COLUMNS FROM mpesa_transactions");
    const existing = new Set(cols.map((c) => c.Field));
    console.log(`Existing columns: ${existing.size}`);

    let added = 0;
    for (const [name, def] of Object.entries(REQUIRED_COLUMNS)) {
      if (existing.has(name)) continue;
      await conn.query(`ALTER TABLE mpesa_transactions ADD COLUMN ${name} ${def}`);
      console.log(`  + added ${name}`);
      added++;
    }

    // Widen status enum if an older/narrower variant is present
    const statusCol = cols.find((c) => c.Field === "status");
    if (statusCol && !String(statusCol.Type).includes("reversed")) {
      await conn.query(
        `ALTER TABLE mpesa_transactions MODIFY status ENUM('pending','completed','failed','cancelled','reversed') DEFAULT 'pending'`
      );
      console.log("  ~ widened status ENUM");
    }

    // Allow NULL creator so simulated/portal-initiated entries can be logged
    // even before any user rows exist (FK only enforced for non-NULL values).
    await conn.query("ALTER TABLE mpesa_transactions MODIFY created_by BIGINT NULL");
    console.log("  ~ created_by made nullable");

    // Helpful index for callback/status lookups
    try {
      await conn.query(
        "CREATE INDEX idx_mpesa_tx_transaction_id ON mpesa_transactions (transaction_id)"
      );
      console.log("  + index idx_mpesa_tx_transaction_id");
    } catch (_) { /* already exists or duplicate key covers it */ }

    console.log(added ? `Migration complete — ${added} column(s) added.` : "Migration complete — table already up to date.");
  } finally {
    await conn.end();
  }
})().catch((e) => { console.error("Migration failed:", e.message); process.exit(1); });
