#!/usr/bin/env node

// Unlock Account and Show Credentials
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const unlockAccount = async (email) => {
  console.log('🔓 Unlock Account & Check Credentials');
  console.log('='.repeat(50));
  console.log(`Email: ${email}`);
  console.log('='.repeat(50));

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Connected to database');

    // Get user info
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password, role, login_attempts, locked_until, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      await connection.end();
      return;
    }

    const user = users[0];
    
    console.log('\n📊 USER INFO:');
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.first_name} ${user.last_name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`🔐 Login attempts: ${user.login_attempts}`);
    console.log(`🔒 Locked until: ${user.locked_until || 'Not locked'}`);
    console.log(`📅 Created: ${user.created_at}`);

    // Unlock the account
    console.log('\n🔓 Unlocking account...');
    await connection.execute(
      'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = ?',
      [email]
    );
    console.log('✅ Account unlocked successfully');

    // Test common passwords
    console.log('\n🧪 Testing common passwords:');
    const testPasswords = [
      'password',
      'Password123',
      '***REMOVED***',
      'Welcome123',
      'User123',
      email.split('@')[0],
      email.split('@')[0] + '123'
    ];

    let foundPassword = null;
    for (const testPwd of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPwd, user.password);
        if (isValid) {
          foundPassword = testPwd;
          console.log(`✅ MATCH: "${testPwd}"`);
          break;
        } else {
          console.log(`❌ "${testPwd}" - No match`);
        }
      } catch (error) {
        console.log(`⚠️  Error testing "${testPwd}": ${error.message}`);
      }
    }

    if (foundPassword) {
      console.log('\n🎉 WORKING CREDENTIALS:');
      console.log('='.repeat(50));
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: ${foundPassword}`);
      console.log(`🌐 Login: http://localhost:5173/login`);
      console.log('\n💡 Try these credentials in the browser now!');
    } else {
      console.log('\n❌ No common passwords matched');
      console.log('💡 You may have used a custom password');
      console.log('💡 Try the password you used when registering');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run unlock
const email = process.argv[2] || 'muenimwa11@gmail.com';
unlockAccount(email);
