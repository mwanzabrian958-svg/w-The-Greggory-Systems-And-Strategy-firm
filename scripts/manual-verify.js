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
    const [result] = await conn.query('UPDATE users SET whatsapp_verified = 1 WHERE email = ?', ['brianmwanza651@gmail.com']);
    console.log('✅ Update result:', result.affectedRows, 'row(s) affected');

    // Also set a password if it's NULL or empty just in case
    // But usually it's not.
  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

fix();
