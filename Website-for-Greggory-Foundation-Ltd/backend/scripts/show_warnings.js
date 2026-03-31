const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

(async () => {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'greggory_foundation_db',
  };

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    const [rows] = await conn.query('SHOW WARNINGS');
    if (!rows || rows.length === 0) {
      console.log('No warnings.');
    } else {
      console.log('MySQL Warnings:');
      rows.forEach(r => console.log(`${r.Level}: ${r.Code} - ${r.Message}`));
    }
    await conn.end();
  } catch (err) {
    console.error('Failed to fetch warnings:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
