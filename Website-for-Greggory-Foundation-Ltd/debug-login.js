#!/usr/bin/env node

// Debug Login Script
// Check user account and authentication details
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const debugLogin = async (email) => {
  console.log('🔍 Debugging Login Issue');
  console.log('='.repeat(40));
  console.log(`Email: ${email}`);
  console.log('='.repeat(40));

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Database connected');

    // Step 1: Check if user exists
    console.log('\n📋 Step 1: Checking if user exists...');
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, password, role, email_verified, created_at, deleted_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found in database');
      console.log('💡 User needs to register first');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('✅ User found in database');
    console.log(`📊 User ID: ${user.id}`);
    console.log(`📊 Name: ${user.first_name} ${user.last_name}`);
    console.log(`📊 Role: ${user.role}`);
    console.log(`📊 Email Verified: ${user.email_verified}`);
    console.log(`📊 Created: ${user.created_at}`);
    console.log(`📊 Deleted: ${user.deleted_at}`);

    // Step 2: Check password hash
    console.log('\n🔐 Step 2: Checking password hash...');
    if (!user.password) {
      console.log('❌ No password found in database');
      console.log('💡 User account may be incomplete');
      await connection.end();
      return;
    }

    console.log('✅ Password hash exists');
    console.log(`🔑 Hash length: ${user.password.length} characters`);
    console.log(`🔑 Hash starts with: ${user.password.substring(0, 10)}...`);

    // Step 3: Test password comparison
    console.log('\n🧪 Step 3: Testing password comparison...');
    
    // Test with common passwords
    const testPasswords = [
      'password',
      'Password123',
      '123456',
      email.split('@')[0], // username part
      '***REMOVED***'
    ];

    let passwordMatch = false;
    let matchedPassword = null;

    for (const testPwd of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPwd, user.password);
        if (isValid) {
          passwordMatch = true;
          matchedPassword = testPwd;
          console.log(`✅ Password matches: "${testPwd}"`);
          break;
        } else {
          console.log(`❌ Password does not match: "${testPwd}"`);
        }
      } catch (error) {
        console.log(`⚠️  Error testing password "${testPwd}": ${error.message}`);
      }
    }

    if (!passwordMatch) {
      console.log('❌ No common passwords matched');
      console.log('💡 User may have used a different password');
    }

    // Step 4: Check if account is active
    console.log('\n📋 Step 4: Checking account status...');
    if (user.deleted_at) {
      console.log('❌ Account is deleted');
      console.log(`📅 Deleted on: ${user.deleted_at}`);
    } else {
      console.log('✅ Account is active');
    }

    // Step 5: Test JWT token generation
    console.log('\n🎫 Step 5: Testing JWT token generation...');
    try {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || '***REMOVED***',
        { expiresIn: '7d' }
      );
      console.log('✅ JWT token generated successfully');
      console.log(`🎫 Token length: ${token.length} characters`);
    } catch (error) {
      console.log('❌ JWT token generation failed:', error.message);
    }

    // Step 6: Check recent login attempts (if logs exist)
    console.log('\n📋 Step 6: Checking for login logs...');
    try {
      const [logs] = await connection.execute(
        'SELECT * FROM login_logs WHERE email = ? ORDER BY created_at DESC LIMIT 5',
        [email]
      );
      
      if (logs.length > 0) {
        console.log('📊 Recent login attempts:');
        logs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.created_at} - ${log.success ? 'SUCCESS' : 'FAILED'} - ${log.ip_address || 'N/A'}`);
        });
      } else {
        console.log('📊 No login logs found');
      }
    } catch (error) {
      console.log('⚠️  Could not check login logs:', error.message);
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log('='.repeat(40));
    console.log(`✅ User exists: ${users.length > 0}`);
    console.log(`✅ Password set: ${!!user.password}`);
    console.log(`✅ Account active: ${!user.deleted_at}`);
    console.log(`✅ Password found: ${passwordMatch}`);
    
    if (passwordMatch) {
      console.log(`🔑 Working password: "${matchedPassword}"`);
      console.log('💡 Try logging in with this password');
    } else {
      console.log('❌ Could not determine correct password');
      console.log('💡 User may need to reset password');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
};

// Run debug
const email = process.argv[2] || 'muenimwa11@gmail.com';
debugLogin(email);
