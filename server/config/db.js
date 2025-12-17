const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Replace with your database host if different
  user: process.env.DB_USER || 'root',     // Default XAMPP username
  password: process.env.DB_PASSWORD || '', // Default XAMPP password is empty
  database: process.env.DB_NAME || 'greggory_foundation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
