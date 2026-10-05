// Migration: add FCM push-notification columns to users / admin_users.
// Idempotent — inspects current columns, adds only the missing ones.
//
// Columns referenced by backend/routes/fcm.js:
//   POST /api/fcm/register-token    -> users.fcm_token, device_info, last_active_at
//   POST /api/fcm/unregister-token  -> users.fcm_token, device_info (SET NULL)
//   GET  /api/fcm/devices           -> users + admin_users (UNION ALL)
//   POST /api/fcm/send (by userId)  -> users.fcm_token
//
// None of these appear in the canonical dump
// (The-Greggory-Systems-And-Strategy-firm-db-main.sql), so without this
// migration every FCM route that touches the DB fails with
// "Unknown column 'fcm_token'".
//
// Usage: node scripts/migrate-fcm-columns.js
require("dotenv").config();
const mysql = require("mysql2/promise");

const REQUIRED_COLUMNS = {
  fcm_token: "VARCHAR(512) NULL",
  device_info: "TEXT NULL",
  last_active_at: "TIMESTAMP NULL",
};

const TABLES = ["users", "admin_users"];

// TLS policy mirrored from server/config/dbEndpoints.js so this script talks
// to the same endpoint the app does (Aiven requires TLS; local XAMPP does not).
const IS_LOCAL_HOST = (h) =>
  ["localhost", "127.0.0.1", "::1"].includes((h || "").toLowerCase());
const sslEnabled =
  process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === "true"
    : !IS_LOCAL_HOST(process.env.DB_HOST || "");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    ...(sslEnabled
      ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } }
      : {}),
    connectTimeout: 30000,
  });

  try {
    let added = 0;

    for (const table of TABLES) {
      // Bail out clearly if the table does not exist at all
      const [t] = await conn.query(
        "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [table]
      );
      if (t[0].n === 0) {
        console.warn(`  ! table ${table} does not exist — skipped`);
        continue;
      }

      const [cols] = await conn.query(`SHOW COLUMNS FROM ${table}`);
      const existing = new Set(cols.map((c) => c.Field));
      console.log(`${table}: ${existing.size} existing column(s)`);

      for (const [name, def] of Object.entries(REQUIRED_COLUMNS)) {
        if (existing.has(name)) continue;
        await conn.query(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
        console.log(`  + added ${name}`);
        added++;
      }
    }

    console.log(
      added
        ? `Migration complete — ${added} column(s) added.`
        : "Migration complete — schema already up to date."
    );
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});