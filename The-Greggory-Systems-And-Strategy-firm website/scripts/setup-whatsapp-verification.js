const mysql = require('mysql2/promise');
require('dotenv').config();

// Columns backend/routes/whatsappAuth.js requires on `users`:
// request-code stores a SHA-256 hash + expiry + attempt counter, verify-code
// burns them. Mirrors scripts/migrate-fcm-columns.js (SHOW COLUMNS probe —
// `ADD COLUMN IF NOT EXISTS` is MariaDB-only and 1064s on MySQL 8 / Aiven).
const REQUIRED_COLUMNS = {
  whatsapp_verified: 'BOOLEAN DEFAULT FALSE',
  whatsapp_auth_key: 'VARCHAR(10) DEFAULT NULL',
  whatsapp_code_hash: 'VARCHAR(64) DEFAULT NULL',
  whatsapp_code_expires: 'DATETIME DEFAULT NULL',
  whatsapp_code_attempts: 'TINYINT UNSIGNED NOT NULL DEFAULT 0',
  whatsapp_code_sent_at: 'DATETIME DEFAULT NULL',
};

const TABLES = ['users', 'admin_users', 'developer_users'];

async function setup() {
  console.log('🚀 Setting up WhatsApp Verification columns...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    let added = 0;
    for (const table of TABLES) {
      const [t] = await connection.query(
        'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
        [table]
      );
      if (t[0].n === 0) {
        console.warn(`  ! table ${table} does not exist — skipped`);
        continue;
      }
      const [cols] = await connection.query(`SHOW COLUMNS FROM ${table}`);
      const existing = new Set(cols.map((c) => c.Field));
      // admin/developer tables only ever carried the legacy pair; the OTP
      // code columns live on `users` (the portal identity).
      const wanted =
        table === 'users' ? Object.entries(REQUIRED_COLUMNS) : Object.entries(REQUIRED_COLUMNS).slice(0, 2);
      for (const [name, def] of wanted) {
        if (existing.has(name)) continue;
        await connection.query(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
        console.log(`  + ${table}.${name}`);
        added++;
      }
    }

    console.log(
      added
        ? `✅ ${added} column(s) added successfully.`
        : 'ℹ️ Columns already exist.'
    );
  } catch (error) {
    console.error('❌ Error updating table:', error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

setup();
