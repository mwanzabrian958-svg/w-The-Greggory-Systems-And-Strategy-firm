/**
 * TEST: Test the personnel API endpoints
 * 
 * Run with: node scripts/test-personnel-api.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAPI() {
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    console.log('✅ Connected to database\n');

    // Test 1: Check all personnel
    console.log('--- Test 1: All personnel in database ---');
    const [allPersonnel] = await connection.query(
      'SELECT id, name, position, is_active, deleted_at FROM company_personnel'
    );
    console.log(`Found ${allPersonnel.length} personnel:`);
    allPersonnel.forEach(p => {
      console.log(`  ID: ${p.id}, Name: ${p.name}, Active: ${p.is_active}, Deleted: ${p.deleted_at}`);
    });

    // Test 2: Check Brian Mwanza specifically
    console.log('\n--- Test 2: Brian Mwanza record ---');
    const [brian] = await connection.query(
      'SELECT * FROM company_personnel WHERE name = ?',
      ['Brian Mwanza']
    );
    if (brian.length > 0) {
      console.log('Found Brian Mwanza:');
      console.log(`  ID: ${brian[0].id}`);
      console.log(`  Name: ${brian[0].name}`);
      console.log(`  Position: ${brian[0].position}`);
      console.log(`  Active: ${brian[0].is_active}`);
      console.log(`  Deleted At: ${brian[0].deleted_at}`);
      console.log(`  Bio length: ${brian[0].bio?.length || 0} chars`);
    } else {
      console.log('Brian Mwanza NOT found!');
    }

    // Test 3: Simulate the API query for ID 1 (after fix)
    console.log('\n--- Test 3: Simulate API query for ID 1 (after fix) ---');
    const [id1] = await connection.query(
      "SELECT * FROM company_personnel WHERE id = ? AND deleted_at IS NULL",
      [1]
    );
    if (id1.length > 0) {
      console.log('API would return:');
      console.log(JSON.stringify({ success: true, personnel: { id: id1[0].id, name: id1[0].name, position: id1[0].position } }, null, 2));
    } else {
      console.log('API would return 404 - Personnel not found');
    }

    // Test 4: Check for ID 0 (the fallback ID)
    console.log('\n--- Test 4: Check for ID 0 (fallback) ---');
    const [id0] = await connection.query(
      "SELECT * FROM company_personnel WHERE id = ? AND deleted_at IS NULL",
      [0]
    );
    if (id0.length > 0) {
      console.log('Found ID 0:', id0[0].name);
    } else {
      console.log('ID 0 not found - this is expected (fallback ID causes the error)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testAPI();
