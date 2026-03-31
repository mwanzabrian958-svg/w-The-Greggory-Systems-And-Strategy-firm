const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'greggory_foundation_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔍 Attempting to connect to the database...');
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('📊 Test query result:', rows);
    
    // Check if users table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Users table exists');
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Total users: ${users[0].count}`);
    } else {
      console.log('❌ Users table does not exist');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
