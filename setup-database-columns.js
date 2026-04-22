/**
 * Script to add access code columns to admin_users and developer_users tables
 * Run: node setup-database-columns.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
  port: process.env.DB_PORT || 3306
};

async function setupColumns() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');
    
    // Check if columns already exist in admin_users
    const [adminColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'admin_users' AND TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );
    
    const adminHasCodeId = adminColumns.some(col => col.COLUMN_NAME === 'access_code_id');
    const adminHasCodeValue = adminColumns.some(col => col.COLUMN_NAME === 'access_code_value');
    
    if (!adminHasCodeId || !adminHasCodeValue) {
      console.log('Adding columns to admin_users table...');
      await connection.execute(`
        ALTER TABLE admin_users 
        ADD COLUMN access_code_id BIGINT NULL AFTER created_by,
        ADD COLUMN access_code_value VARCHAR(255) NULL AFTER access_code_id
      `);
      console.log('✓ Added access_code_id and access_code_value to admin_users');
    } else {
      console.log('✓ admin_users already has access code columns');
    }
    
    // Check if columns already exist in developer_users
    const [devColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'developer_users' AND TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );
    
    const devHasCodeId = devColumns.some(col => col.COLUMN_NAME === 'access_code_id');
    const devHasCodeValue = devColumns.some(col => col.COLUMN_NAME === 'access_code_value');
    
    if (!devHasCodeId || !devHasCodeValue) {
      console.log('Adding columns to developer_users table...');
      await connection.execute(`
        ALTER TABLE developer_users 
        ADD COLUMN access_code_id BIGINT NULL AFTER created_by,
        ADD COLUMN access_code_value VARCHAR(255) NULL AFTER access_code_id
      `);
      console.log('✓ Added access_code_id and access_code_value to developer_users');
    } else {
      console.log('✓ developer_users already has access code columns');
    }
    
    // Create access_code_usage_log table if it doesn't exist
    console.log('Creating access_code_usage_log table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS access_code_usage_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        code_id BIGINT NOT NULL,
        code_value VARCHAR(255) NOT NULL,
        code_type ENUM('admin', 'developer', 'super_admin') NOT NULL,
        user_id BIGINT NOT NULL,
        user_type ENUM('admin', 'developer') NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        action ENUM('registration', 'login') NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code_usage_code_id (code_id),
        INDEX idx_code_usage_user_id (user_id),
        INDEX idx_code_usage_action (action),
        INDEX idx_code_usage_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ access_code_usage_log table ready');
    
    console.log('\n========================================');
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('========================================');
    console.log('\nAdmin code columns are now available in:');
    console.log('  • admin_users table');
    console.log('  • developer_users table');
    console.log('\nYou can now register admins with access codes.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nMake sure:');
    console.log('  1. MySQL server is running');
    console.log('  2. Database credentials in .env are correct');
    console.log('  3. Database exists');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupColumns();
