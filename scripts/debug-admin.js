const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    const [rows] = await conn.query('SELECT email, whatsapp_auth_key, whatsapp_verified, phone_number FROM admin_users WHERE email = ?', ['brianmwanza651@gmail.com']);
    console.log('Admin User Status:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

check();
