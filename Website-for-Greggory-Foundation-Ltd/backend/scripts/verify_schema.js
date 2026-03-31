const path = require('path');
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
    
    console.log('=== USERS TABLE SCHEMA ===');
    const [schema] = await conn.query('DESC users');
    schema.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n=== USERS TABLE COUNT ===');
    const [count] = await conn.query('SELECT COUNT(*) as count FROM users');
    console.log(`Total users: ${count[0].count}`);

    console.log('\n=== ROLES TABLE ===');
    const [roles] = await conn.query('SELECT id, name FROM roles');
    console.log(roles);

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
