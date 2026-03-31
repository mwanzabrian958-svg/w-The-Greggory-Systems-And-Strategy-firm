#!/usr/bin/env node

// Find All Users and Working Credentials
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const findUsers = async () => {
  console.log('🔍 Finding All Users & Working Credentials');
  console.log('='.repeat(60));

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Connected to database');

    // Get all users
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password, role, login_attempts, locked_until FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );

    if (users.length === 0) {
      console.log('❌ No users found');
      await connection.end();
      return;
    }

    console.log(`\n📊 Found ${users.length} users:`);
    console.log('='.repeat(60));

    // Test common passwords for each user
    const testPasswords = [
      'password',
      'Password123',
      '***REMOVED***',
      'Welcome123',
      'User123',
      'Test123',
      'Default123'
    ];

    let workingCredentials = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. 📧 ${user.email}`);
      console.log(`   👤 ${user.first_name} ${user.last_name}`);
      console.log(`   🔑 Role: ${user.role}`);
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

      if (!user.password) {
        console.log('   ⚠️  No password set');
        continue;
      }

      // Test passwords
      console.log('   🧪 Testing passwords...');
      let foundPassword = null;

      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, user.password);
          if (isValid) {
            foundPassword = testPwd;
            console.log(`   ✅ MATCH: "${testPwd}"`);
            break;
          }
        } catch (error) {
          // Skip error
        }
      }

      // Test username-based passwords
      if (!foundPassword) {
        const username = user.email.split('@')[0];
        const usernamePasswords = [
          username,
          username.toLowerCase(),
          username + '123',
          username.toLowerCase() + '123'
        ];

        for (const testPwd of usernamePasswords) {
          try {
            const isValid = await bcrypt.compare(testPwd, user.password);
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
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        });
        console.log(`   🎉 WORKING CREDENTIALS FOUND!`);
      } else {
        console.log(`   ❌ No common passwords matched`);
      }
    }

    // Summary
    console.log('\n🎉 WORKING CREDENTIALS SUMMARY:');
    console.log('='.repeat(60));
    
    if (workingCredentials.length > 0) {
      workingCredentials.forEach((cred, index) => {
        console.log(`${index + 1}. 📧 ${cred.email}`);
        console.log(`   🔑 Password: ${cred.password}`);
        console.log(`   👤 Name: ${cred.name}`);
        console.log(`   🔑 Role: ${cred.role}`);
        console.log(`   🌐 Login: http://localhost:5173/login`);
        console.log('');
      });
      
      console.log(`💡 Use any of these ${workingCredentials.length} credentials to login!`);
    } else {
      console.log('❌ No working credentials found with common passwords');
      console.log('💡 You may need to use the exact password you used when registering');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

findUsers();
