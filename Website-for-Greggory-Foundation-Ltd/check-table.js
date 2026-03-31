#!/usr/bin/env node

// Check Users Table Structure and Data
require('dotenv').config();
const mysql = require('mysql2/promise');

const checkTable = async () => {
  console.log('🔍 Checking Users Table Structure');
  console.log('='.repeat(50));

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greggory_auth_platform'
    });

    console.log('✅ Connected to database');

    // Get table structure
    console.log('\n📋 USERS TABLE STRUCTURE:');
    console.log('='.repeat(50));
    
    const [columns] = await connection.execute('DESCRIBE users');
    
    columns.forEach((col, index) => {
      console.log(`${index + 1}. 📊 ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key || 'No key'}`);
    });

    // Get all users data
    console.log('\n👥 ALL USERS DATA:');
    console.log('='.repeat(50));
    
    const [users] = await connection.execute('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10');
    
    if (users.length === 0) {
      console.log('❌ No users found');
    } else {
      console.log(`📊 Found ${users.length} users:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. 📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.first_name || 'N/A'} ${user.last_name || 'N/A'}`);
        console.log(`   🔑 Role: ${user.role_id || 'N/A'}`);
        console.log(`   📅 Created: ${user.created_at || 'N/A'}`);
        
        // Show all fields that might be password-related
        Object.keys(user).forEach(key => {
          if (key.toLowerCase().includes('pass') || key.toLowerCase().includes('hash')) {
            console.log(`   🔐 ${key}: ${user[key] ? 'SET' : 'NULL'}`);
          }
        });
        
        console.log('');
      });
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkTable();
