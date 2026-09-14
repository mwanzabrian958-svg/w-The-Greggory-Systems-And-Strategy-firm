require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );

    const hasToken = columns.some(col => col.COLUMN_NAME === 'auth_token');

    if (!hasToken) {
      console.log('Adding auth_token column to users table...');
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN auth_token VARCHAR(255) NULL UNIQUE AFTER password_hash
      `);
      console.log('✓ Added auth_token column.');
    } else {
      console.log('✓ auth_token column already exists.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
