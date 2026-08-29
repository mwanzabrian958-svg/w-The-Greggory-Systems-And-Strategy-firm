const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Cloud MySQL (Aiven, TiDB...) requires TLS; local XAMPP does not.
  ...(process.env.DB_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } }
    : {}),
});

module.exports = pool;
