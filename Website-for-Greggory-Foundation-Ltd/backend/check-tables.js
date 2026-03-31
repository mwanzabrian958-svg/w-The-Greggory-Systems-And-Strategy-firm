// check-tables.js
const db = require('./config/db');

async function checkTables() {
  try {
    // Check users table structure
    const [usersColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'greggory_foundation_db' 
      AND TABLE_NAME = 'users'
    `);
    
    console.log('📋 Users Table Structure:');
    console.table(usersColumns);

    // Check if there are any users
    const [users] = await db.query('SELECT * FROM users LIMIT 5');
    console.log('\n👥 First 5 users (if any):');
    console.table(users);

    // List all tables in the database
    const [tables] = await db.query(`
      SELECT TABLE_NAME, TABLE_ROWS, ENGINE, TABLE_COLLATION 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'greggory_foundation_db'
    `);
    
    console.log('\n📊 All tables in the database:');
    console.table(tables);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
}

checkTables();
