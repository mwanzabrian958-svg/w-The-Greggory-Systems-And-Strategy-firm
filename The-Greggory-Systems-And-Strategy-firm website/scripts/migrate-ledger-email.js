require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
  port: process.env.DB_PORT || 3306
};

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'accounting_entries' AND TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );

    const hasClientEmail = columns.some(col => col.COLUMN_NAME === 'client_email');

    if (!hasClientEmail) {
      console.log('Adding client_email column to accounting_entries...');
      await connection.execute(`
        ALTER TABLE accounting_entries
        ADD COLUMN client_email VARCHAR(255) NULL AFTER contract_id
      `);
      console.log('✓ Added client_email to accounting_entries');
    } else {
      console.log('✓ client_email already exists in accounting_entries');
    }

  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
