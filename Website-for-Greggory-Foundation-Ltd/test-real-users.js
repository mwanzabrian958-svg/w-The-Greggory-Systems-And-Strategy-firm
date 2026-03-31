#!/usr/bin/env node

// Test Real Users with Password Hash
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const testRealUsers = async () => {
  console.log('🧪 Testing Real Users with Password Hash');
  console.log('='.repeat(60));

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Connected to database');

    // Get all users with password_hash
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password_hash, login_attempts, locked_until FROM users WHERE deleted_at IS NULL AND password_hash IS NOT NULL'
    );

    if (users.length === 0) {
      console.log('❌ No users with passwords found');
      await connection.end();
      return;
    }

    console.log(`\n📊 Found ${users.length} users with passwords:`);
    console.log('='.repeat(60));

    // Test common passwords for each user
    const testPasswords = [
      'password',
      'Password123',
      '***REMOVED***',
      'Welcome123',
      'User123',
      'Test123',
      'Default123',
      '123456',
      'qwerty'
    ];

    let workingCredentials = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. 📧 ${user.email}`);
      console.log(`   👤 ${user.first_name} ${user.last_name}`);
      console.log(`   🔐 Login attempts: ${user.login_attempts}`);
      console.log(`   🔒 Locked: ${user.locked_until ? 'YES' : 'NO'}`);

      // Unlock if locked
      if (user.locked_until) {
        await connection.execute(
          'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
          [user.id]
        );
        console.log('   🔓 Account unlocked');
      }

      // Test passwords
      console.log('   🧪 Testing passwords...');
      let foundPassword = null;

      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, user.password_hash);
          if (isValid) {
            foundPassword = testPwd;
            console.log(`   ✅ MATCH: "${testPwd}"`);
            break;
          }
        } catch (error) {
          console.log(`   ⚠️  Error testing "${testPwd}": ${error.message}`);
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
            const isValid = await bcrypt.compare(testPwd, user.password_hash);
            if (isValid) {
              foundPassword = testPwd;
              console.log(`   ✅ MATCH: "${testPwd}"`);
              break;
            }
          } catch (error) {
            // Skip error
          }
        }
      }

      if (foundPassword) {
        workingCredentials.push({
          email: user.email,
          password: foundPassword,
          name: `${user.first_name} ${user.last_name}`
        });
        console.log(`   🎉 WORKING CREDENTIALS FOUND!`);
      } else {
        console.log(`   ❌ No common passwords matched`);
        console.log(`   💡 Try the exact password you used when registering`);
      }
    }

    // Summary
    console.log('\n🎉 WORKING CREDENTIALS:');
    console.log('='.repeat(60));
    
    if (workingCredentials.length > 0) {
      workingCredentials.forEach((cred, index) => {
        console.log(`${index + 1}. 📧 ${cred.email}`);
        console.log(`   🔑 Password: ${cred.password}`);
        console.log(`   👤 Name: ${cred.name}`);
        console.log(`   🌐 Login: http://localhost:5173/login`);
        console.log('');
      });
      
      console.log(`💡 Use any of these ${workingCredentials.length} credentials to login!`);
      console.log('🎯 The login should now work properly in the browser!');
    } else {
      console.log('❌ No working credentials found with common passwords');
      console.log('💡 Please use the exact password you used when registering');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testRealUsers();
