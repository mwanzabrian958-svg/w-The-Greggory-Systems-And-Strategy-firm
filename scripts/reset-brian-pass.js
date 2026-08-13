const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function reset() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    const password = '***REMOVED***';
    const hash = await bcrypt.hash(password, 10);

    // Update users table
    const [res1] = await conn.query('UPDATE users SET password_hash = ?, whatsapp_verified = 1 WHERE email = ?', [hash, 'brianmwanza651@gmail.com']);
    console.log('✅ Users table updated:', res1.affectedRows);

    // Update admin_users table
    const [res2] = await conn.query('UPDATE admin_users SET password_hash = ? WHERE email = ?', [hash, 'brianmwanza651@gmail.com']);
    console.log('✅ Admin Users table updated:', res2.affectedRows);

    console.log('Password for brianmwanza651@gmail.com set to ***REMOVED***');
  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

reset();
