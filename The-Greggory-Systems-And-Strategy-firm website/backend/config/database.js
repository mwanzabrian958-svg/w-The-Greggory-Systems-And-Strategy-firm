const mysql = require('mysql2');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main';
const DB_PORT = process.env.DB_PORT || 3306;

const connection = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  multipleStatements: true,
  connectTimeout: 10000,
  // Cloud MySQL (Aiven, TiDB...) requires TLS; local XAMPP does not.
  // Set DB_SSL=true in production (see render.yaml).
  ...(process.env.DB_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } }
    : {}),
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
  } else {
    console.log(`MySQL connected to ${DB_NAME} at ${DB_HOST}`);
  }
});

module.exports = connection;
