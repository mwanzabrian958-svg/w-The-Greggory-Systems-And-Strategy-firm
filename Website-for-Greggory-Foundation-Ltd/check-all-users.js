#!/usr/bin/env node

// Check All Users in Database
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const checkAllUsers = async () => {
  console.log('🔍 Checking All Users in Database');
  console.log('='.repeat(60));

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Database connected');

    // Get all users from database
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password, role, email_verified, created_at, deleted_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database');
      await connection.end();
      return;
    }

    console.log(`📊 Found ${users.length} users in database`);
    console.log('='.repeat(60));

    // Test common passwords for each user
    const testPasswords = [
      'password',
      'Password123',
      '123456',
      '***REMOVED***',
      'Welcome123',
      'User123',
      'Test123',
      'Default123'
    ];

    let validCredentials = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n👤 USER ${i + 1}/${users.length}:`);
      console.log('─'.repeat(40));
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.first_name} ${user.last_name}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`✅ Email Verified: ${user.email_verified}`);
      console.log(`📅 Created: ${user.created_at}`);

      if (!user.password) {
        console.log('❌ No password found - Cannot login');
        continue;
      }

      console.log(`🔑 Password hash: ${user.password.substring(0, 20)}...`);

      // Test passwords
      console.log('\n🧪 Testing passwords:');
      let foundPassword = null;

      // Test common passwords
      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, user.password);
          if (isValid) {
            foundPassword = testPwd;
            console.log(`✅ MATCH: "${testPwd}"`);
            break;
          }
        } catch (error) {
          // Skip error, continue testing
        }
      }

      // Test username-based passwords
      if (!foundPassword) {
        const username = user.email.split('@')[0];
        const usernamePasswords = [
          username,
          username.toLowerCase(),
          username + '123',
          username.toLowerCase() + '123',
          username + '1',
          username.toLowerCase() + '1'
        ];

        for (const testPwd of usernamePasswords) {
          try {
            const isValid = await bcrypt.compare(testPwd, user.password);
            if (isValid) {
              foundPassword = testPwd;
            console.log(`✅ MATCH: "${testPwd}"`);
            break;
            }
          } catch (error) {
            // Skip error, continue testing
          }
        }
      }

      if (foundPassword) {
        console.log(`\n🎉 VALID CREDENTIALS FOUND:`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${foundPassword}`);
        console.log(`🌐 Login: http://localhost:5173/login`);
        validCredentials.push({
          email: user.email,
          password: foundPassword,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        });
      } else {
        console.log('❌ No common passwords matched');
        console.log('💡 User may have custom password');
      }
    }

    // Summary
    console.log('\n📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`👥 Total users checked: ${users.length}`);
    console.log(`✅ Valid credentials found: ${validCredentials.length}`);

    if (validCredentials.length > 0) {
      console.log('\n🎉 WORKING LOGIN CREDENTIALS:');
      console.log('='.repeat(60));
      validCredentials.forEach((cred, index) => {
        console.log(`${index + 1}. 📧 ${cred.email}`);
        console.log(`   🔑 Password: ${cred.password}`);
        console.log(`   👤 Name: ${cred.name}`);
        console.log(`   🔑 Role: ${cred.role}`);
        console.log(`   🌐 Login: http://localhost:5173/login`);
        console.log('');
      });
    }

    console.log('\n💡 Use any of these credentials to login to the website');
    console.log('🌐 Website URL: http://localhost:5173/login');

    await connection.end();

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('💡 Check database connection credentials in .env file');
  }
};

// Run check
checkAllUsers();
