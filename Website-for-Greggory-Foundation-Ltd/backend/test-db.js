// test-db.js
const db = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    console.log('✅ Database connection successful!');
    console.log('1 + 1 =', rows[0].solution);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure XAMPP is running with both Apache and MySQL services started');
    console.log('2. Verify MySQL is accessible with these credentials:');
    console.log('   - Host: localhost');
    console.log('   - User: root');
    console.log('   - Password: (empty)');
    console.log('3. Check if the database "greggory_foundation_db" exists in phpMyAdmin');
    console.log('\nIf the database does not exist, you can create it with:');
    console.log('1. Open phpMyAdmin (http://localhost/phpmyadmin)');
    console.log('2. Click "New" in the left sidebar');
    console.log('3. Enter "greggory_foundation_db" as the database name');
    console.log('4. Click "Create"');
    process.exit(1);
  }
}

testConnection();
