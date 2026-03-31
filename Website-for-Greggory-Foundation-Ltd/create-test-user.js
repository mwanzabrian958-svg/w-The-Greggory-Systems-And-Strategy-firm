const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
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
    console.log('🔍 Connecting to database...');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('***REMOVED***', salt);
    
    // Test user data
    const testUser = {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      primary_role: 'admin',
      is_active: 1
    };

    console.log('👤 Creating test user...');
    
    // Insert test user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name, primary_role, is_active) VALUES (?, ?, ?, ?, ?)',
      [testUser.email, testUser.password, testUser.name, testUser.primary_role, testUser.is_active]
    );
    
    console.log('✅ Test user created successfully!');
    console.log('📋 User ID:', result.insertId);
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password: ***REMOVED***');
    
    return result.insertId;
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️ Test user already exists');
      
      // Get existing user
      const [users] = await pool.execute(
        'SELECT id, email, name FROM users WHERE email = ?',
        ['test@example.com']
      );
      
      if (users.length > 0) {
        console.log('👤 Existing test user:');
        console.log('   ID:', users[0].id);
        console.log('   Name:', users[0].name);
        console.log('   Email:', users[0].email);
      }
      
      return users[0]?.id;
    } else {
      console.error('❌ Error creating test user:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

createTestUser()
  .then(() => console.log('✅ Test user setup complete'))
  .catch(err => {
    console.error('❌ Error in test user setup:', err);
    process.exit(1);
  });
