const mysql = require('mysql2/promise');
require('dotenv').config();

async function solidify() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    const email = 'brianmwanza651@gmail.com';

    // Solidify across all tables
    await conn.query('UPDATE users SET whatsapp_verified = 1, whatsapp_auth_key = NULL WHERE email = ?', [email]);
    await conn.query('UPDATE admin_users SET whatsapp_verified = 1, whatsapp_auth_key = NULL WHERE email = ?', [email]);
    await conn.query('UPDATE developer_users SET whatsapp_verified = 1, whatsapp_auth_key = NULL WHERE email = ?', [email]);

    console.log(`✅ Account Ownership Solidified across all tables for: ${email}`);
    console.log('You can now log in directly without a verification key.');
  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

solidify();
