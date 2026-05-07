// Test database connection and registration
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testRegistration() {
  console.log('=== Testing Database Connection ===\n');
  
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 5000,
      user: 'root',
      password: '',
      database: 'greggory_foundation_db_main'
    });
    
    console.log('✓ Database connected successfully\n');
    
    // Check if users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('✗ ERROR: users table does not exist!');
      return;
    }
    console.log('✓ users table exists\n');
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(required)' : '(optional)'}`);
    });
    console.log('');
    
    // Test INSERT
    console.log('=== Testing User Registration ===\n');
    
    const testEmail = 'test' + Date.now() + '@example.com';
    const password = '***REMOVED***';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Test data:');
    console.log('  Email:', testEmail);
    console.log('  Password hash length:', hashedPassword.length);
    console.log('  First name: Test');
    console.log('  Last name: User');
    console.log('  Display name: Test User\n');
    
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_active, email_verified) VALUES (?, ?, ?, ?, ?, 1, 1)',
        [testEmail, hashedPassword, 'Test', 'User', 'Test User']
      );
      
      console.log('✓ INSERT successful!');
      console.log('  Insert ID:', result.insertId);
      
      // Clean up - delete test user
      await connection.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
      console.log('  Test user cleaned up\n');
      
    } catch (insertError) {
      console.log('✗ INSERT failed!');
      console.log('  Error:', insertError.message);
      console.log('  Error code:', insertError.code);
      console.log('  SQL:', insertError.sql);
    }
    
  } catch (error) {
    console.log('✗ ERROR:', error.message);
    console.log('  Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n=== Connection closed ===');
    }
  }
}

testRegistration();
