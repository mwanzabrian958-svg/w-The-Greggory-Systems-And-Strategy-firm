const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

(async () => {
  const sqlPath = path.resolve(__dirname, '../database/migrations/002_sync_users_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'greggory_foundation_db',
    multipleStatements: true,
  };

  console.log('Connecting to DB at', connectionConfig.host, 'as', connectionConfig.user);

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log('Connected. Running migration...');

    const [results] = await conn.query(sql);

    console.log('Migration executed. Check results below.');
    console.log(results);

    await conn.end();
    console.log('Done.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
