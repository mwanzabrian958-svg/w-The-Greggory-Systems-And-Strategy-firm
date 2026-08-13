const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    await conn.query('UPDATE users SET whatsapp_verified = 0 WHERE email = ?', ['brianmwanza651@gmail.com']);
    await conn.query('UPDATE admin_users SET whatsapp_verified = 0 WHERE email = ?', ['brianmwanza651@gmail.com']);
    console.log('✅ Brian status reset to unverified');
  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

fix();
