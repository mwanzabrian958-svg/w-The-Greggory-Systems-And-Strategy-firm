const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'greggory_foundation_db';

// Export a promise-based connection pool so callers can use db.query().then()/await
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

pool.getConnection()
  .then(conn => {
    conn.release();
    console.log(`MySQL connected to ${DB_NAME} at ${DB_HOST}`);
  })
  .catch(err => console.error('MySQL connection error:', err.message));

module.exports = pool;
