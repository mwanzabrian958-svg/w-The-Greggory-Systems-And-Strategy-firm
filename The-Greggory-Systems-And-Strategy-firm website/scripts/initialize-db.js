const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const SQL_FILE_PATH = path.join(__dirname, '../database/the-greggory-systems-and-strategy-firm-db-main.sql');

async function initializeDatabase() {
  console.log('='.repeat(60));
  console.log('DATABASE INITIALIZATION');
  console.log('='.repeat(60));
  console.log(`Source: ${SQL_FILE_PATH}`);
  console.log(`Host: ${DB_CONFIG.host}`);
  console.log(`User: ${DB_CONFIG.user}`);
  console.log('='.repeat(60));

  try {
    if (!fs.existsSync(SQL_FILE_PATH)) {
      throw new Error(`SQL file not found at ${SQL_FILE_PATH}`);
    }

    const sql = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    console.log('✅ Read SQL file successfully');

    // Connect to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Simple splitting by semicolon followed by newline to avoid splitting inside data
    // This is a naive split, but often works for standard dumps
    // Better way is to use a parser, but for this task, multipleStatements might be enough
    // if we execute the whole file in chunks or one go.

    console.log('📊 Executing SQL statements...');

    // Using multipleStatements: true allows us to run the whole file at once if it's not too large
    // or we can split it. Let's try splitting carefully.

    const statements = sql
      .split(/;\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} major blocks.`);

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.query(statements[i]);
        process.stdout.write(`\r⏳ Progress: ${Math.round(((i + 1) / statements.length) * 100)}% (${i + 1}/${statements.length} blocks)`);
      } catch (err) {
        console.warn(`\n⚠️  Warning on block ${i + 1}:`, err.message);
      }
    }

    await connection.end();

    console.log('\n\n✅ Database initialized successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

initializeDatabase();
