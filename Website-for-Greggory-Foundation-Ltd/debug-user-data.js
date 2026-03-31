#!/usr/bin/env node

// Debug User Data Structure
require('dotenv').config();
const mysql = require('mysql2/promise');

const debugUserData = async () => {
  console.log('🔍 Debugging User Data Structure');
  console.log('='.repeat(60));

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Connected to database');

    // Get a sample user to see actual data structure
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, role_id FROM users WHERE email = ?',
      ['mwanzabrian650@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      await connection.end();
      return;
    }

    const user = users[0];
    
    console.log('\n📊 ACTUAL USER DATA FROM DATABASE:');
    console.log('='.repeat(60));
    console.log('🆔 ID:', user.id);
    console.log('📧 Email:', user.email);
    console.log('👤 First Name:', user.first_name);
    console.log('👤 Last Name:', user.last_name);
    console.log('🔑 Role ID:', user.role_id);

    // Get role name
    const [roles] = await connection.execute(
      'SELECT name FROM roles WHERE id = ?',
      [user.role_id]
    );

    if (roles.length > 0) {
      console.log('🔑 Role Name:', roles[0].name);
    }

    // Show what backend should return
    const backendUserData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      role: roles[0]?.name || 'unknown',
      roleId: user.role_id,
      emailVerified: 1,
      isActive: 1
    };

    console.log('\n📋 WHAT BACKEND RETURNS:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(backendUserData, null, 2));

    console.log('\n💡 WHAT FRONTEND EXPECTS:');
    console.log('='.repeat(60));
    console.log('👤 user.fullName -> Should be:', `${user.first_name} ${user.last_name}`);
    console.log('👤 user.firstName -> Should be:', user.first_name);
    console.log('👤 user.lastName -> Should be:', user.last_name);
    console.log('🔑 user.role -> Should be:', roles[0]?.name || 'unknown');

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

debugUserData();
