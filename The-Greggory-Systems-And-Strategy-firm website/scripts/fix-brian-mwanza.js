/**
 * FIX: Insert Brian Mwanza into company_personnel table
 * This script fixes the "Person not found" error on the About page
 * 
 * Run with: node scripts/fix-brian-mwanza.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixBrianMwanza() {
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

    console.log('✅ Connected to database');

    // Check if Brian Mwanza already exists
    const [existing] = await connection.query(
      'SELECT id, name, position, is_active FROM company_personnel WHERE name = ?',
      ['Brian Mwanza']
    );

    if (existing.length > 0) {
      console.log('✅ Brian Mwanza already exists in the database:');
      console.log(`   ID: ${existing[0].id}`);
      console.log(`   Name: ${existing[0].name}`);
      console.log(`   Position: ${existing[0].position}`);
      console.log(`   Active: ${existing[0].is_active}`);
      return;
    }

    // Insert Brian Mwanza
    const [result] = await connection.query(
      `INSERT INTO company_personnel (name, position, bio, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Brian Mwanza',
        'Founder & Managing Director',
        '<p>Brian Mwanza is the visionary force behind The-Greggory-Systems-And-Strategy-firm. With over a decade of experience in systemic design and business strategy, he has guided some of the most ambitious organizations through complex digital and operational transformations.</p><p>His philosophy is rooted in the belief that "Strategy is not a document; it\'s a pulse." Under his leadership, the firm has evolved from a boutique advisory to a global architect of business resonance, known for its uncompromising commitment to clarity and human-centric systems.</p>',
        '/images/brian-mwanza-ceo.jpg',
        0,
        true
      ]
    );

    console.log('✅ Brian Mwanza inserted successfully!');
    console.log(`   ID: ${result.insertId}`);

    // Verify the insertion
    const [verify] = await connection.query(
      'SELECT id, name, position, is_active FROM company_personnel WHERE id = ?',
      [result.insertId]
    );

    if (verify.length > 0) {
      console.log('\n✅ Verification - Record in database:');
      console.log(`   ID: ${verify[0].id}`);
      console.log(`   Name: ${verify[0].name}`);
      console.log(`   Position: ${verify[0].position}`);
      console.log(`   Active: ${verify[0].is_active}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Check your .env configuration.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Access denied. Check your database credentials.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist. Run the schema setup first.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixBrianMwanza();
