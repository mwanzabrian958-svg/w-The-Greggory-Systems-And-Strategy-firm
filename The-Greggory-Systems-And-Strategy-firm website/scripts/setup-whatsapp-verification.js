const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  console.log('🚀 Setting up WhatsApp Verification columns...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    console.log('Adding columns to users table...');
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS whatsapp_auth_key VARCHAR(10) DEFAULT NULL;
    `);

    console.log('Adding columns to admin_users table...');
    await connection.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS whatsapp_auth_key VARCHAR(10) DEFAULT NULL;
    `);

    console.log('Adding columns to developer_users table...');
    await connection.query(`
      ALTER TABLE developer_users
      ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS whatsapp_auth_key VARCHAR(10) DEFAULT NULL;
    `);

    console.log('✅ All columns added successfully.');
  } catch (error) {
    if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('ℹ️ Columns already exist.');
    } else {
      console.error('❌ Error updating table:', error.message);
    }
  } finally {
    await connection.end();
  }
}

setup();
