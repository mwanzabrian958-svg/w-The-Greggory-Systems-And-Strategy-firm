#!/usr/bin/env node

// Check User Credentials in Database
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const checkUser = async (email) => {
  console.log('🔍 Checking User Credentials');
  console.log('='.repeat(50));
  console.log(`Email: ${email}`);
  console.log('='.repeat(50));

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Database connected');

    // Get user from database
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password, role, email_verified, created_at, deleted_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found in database');
      console.log('💡 This email is not registered');
      await connection.end();
      return;
    }

    const user = users[0];
    
    console.log('\n📊 USER FOUND:');
    console.log('='.repeat(50));
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.first_name} ${user.last_name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`✅ Email Verified: ${user.email_verified}`);
    console.log(`📅 Created: ${user.created_at}`);
    console.log(`🗑️ Deleted: ${user.deleted_at || 'Not deleted'}`);

    if (user.deleted_at) {
      console.log('\n❌ ACCOUNT IS DELETED');
      console.log('💡 Cannot login with deleted account');
      await connection.end();
      return;
    }

    console.log('\n🔑 PASSWORD INFORMATION:');
    console.log('='.repeat(50));
    
    if (user.password) {
      console.log('✅ Password hash exists');
      console.log(`📏 Hash length: ${user.password.length} characters`);
      console.log(`🔑 Hash preview: ${user.password.substring(0, 20)}...`);
      
      // Test common passwords
      console.log('\n🧪 TESTING COMMON PASSWORDS:');
      const testPasswords = [
        'password',
        'Password123',
        '123456',
        email.split('@')[0], // username part
        '***REMOVED***',
        'Welcome123',
        'User123',
        email.split('@')[0].toLowerCase() + '123'
      ];

      let foundPassword = null;
      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, user.password);
          if (isValid) {
            foundPassword = testPwd;
            console.log(`✅ MATCH FOUND: "${testPwd}"`);
            break;
          } else {
            console.log(`❌ "${testPwd}" - No match`);
          }
        } catch (error) {
          console.log(`⚠️  Error testing "${testPwd}": ${error.message}`);
        }
      }

      if (foundPassword) {
        console.log('\n🎉 LOGIN CREDENTIALS:');
        console.log('='.repeat(50));
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${foundPassword}`);
        console.log(`🌐 Login URL: http://localhost:5173/login`);
        console.log('\n💡 Use these credentials to login');
      } else {
        console.log('\n❌ NO COMMON PASSWORDS MATCHED');
        console.log('💡 User may have used a custom password');
        console.log('💡 Consider password reset if you own this account');
      }
    } else {
      console.log('❌ No password found in database');
      console.log('💡 Account may be incomplete');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('💡 Check database connection credentials');
  }
};

// Run check
const email = process.argv[2] || 'muenimwa11@gmail.com';
checkUser(email);
