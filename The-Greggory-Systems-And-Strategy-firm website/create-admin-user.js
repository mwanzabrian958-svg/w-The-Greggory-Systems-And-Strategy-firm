/**
 * Script to create initial admin user in admin_users table
 * Usage: node create-admin-user.js
 */

const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
  port: process.env.DB_PORT || 3306
};

const crypto = require("crypto");

// Credentials come from env or CLI args — never hardcoded.
// Usage: node create-admin-user.js <email> [password]
const adminUser = {
  email: process.env.ADMIN_EMAIL || process.argv[2],
  password: process.env.ADMIN_PASSWORD || process.argv[3] || crypto.randomBytes(12).toString("base64url"),
  first_name: 'Brian',
  last_name: 'Mwanza',
  phone_number: '+254799789956',
  admin_level: 'super_admin',
  access_level: 'full'
};

if (!adminUser.email) {
  console.error('Usage: node create-admin-user.js <email> [password]');
  console.error('(or set ADMIN_EMAIL / ADMIN_PASSWORD environment variables)');
  process.exit(1);
}

async function createAdminUser() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if admin_users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'admin_users'"
    );
    
    if (tables.length === 0) {
      console.log('Creating admin_users table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          email_verified BOOLEAN DEFAULT FALSE,
          password_hash VARCHAR(255) DEFAULT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          display_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
          phone_number VARCHAR(50),
          admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
          admin_permissions JSON,
          access_level ENUM('full', 'limited', 'read_only') DEFAULT 'full',
          department VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          last_login_at TIMESTAMP NULL DEFAULT NULL,
          last_login_ip VARCHAR(45) DEFAULT NULL,
          failed_login_attempts INT DEFAULT 0,
          account_locked_until TIMESTAMP NULL DEFAULT NULL,
          two_factor_enabled BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          INDEX idx_admin_users_email (email),
          INDEX idx_admin_users_active (is_active, deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ admin_users table created');
    } else {
      console.log('✓ admin_users table exists');
    }
    
    // Check if developer_users table exists
    const [devTables] = await connection.execute(
      "SHOW TABLES LIKE 'developer_users'"
    );
    
    if (devTables.length === 0) {
      console.log('Creating developer_users table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS developer_users (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          email_verified BOOLEAN DEFAULT FALSE,
          password_hash VARCHAR(255) DEFAULT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          display_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
          phone_number VARCHAR(50),
          developer_level ENUM('senior', 'mid', 'junior', 'lead') DEFAULT 'mid',
          tech_stack JSON,
          is_active BOOLEAN DEFAULT TRUE,
          last_login_at TIMESTAMP NULL DEFAULT NULL,
          last_login_ip VARCHAR(45) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          INDEX idx_developer_users_email (email),
          INDEX idx_developer_users_active (is_active, deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ developer_users table created');
    } else {
      console.log('✓ developer_users table exists');
    }
    
    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      [adminUser.email]
    );
    
    if (existing.length > 0) {
      console.log(`Admin user ${adminUser.email} already exists`);
      
      // Ask if they want to update password
      console.log('\nTo update the password, run:');
      console.log(`UPDATE admin_users SET password_hash = '${await bcryptjs.hash(adminUser.password, 10)}' WHERE email = '${adminUser.email}';`);
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(adminUser.password, saltRounds);
    
    // Insert admin user
    const [result] = await connection.execute(
      `INSERT INTO admin_users (
        email, email_verified, password_hash, first_name, last_name, 
        phone_number, admin_level, access_level, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUser.email,
        true,
        hashedPassword,
        adminUser.first_name,
        adminUser.last_name,
        adminUser.phone_number,
        adminUser.admin_level,
        adminUser.access_level,
        true
      ]
    );
    
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Name:     ${adminUser.first_name} ${adminUser.last_name}`);
    console.log(`Role:     ${adminUser.admin_level}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nMake sure to set ADMIN_CODE in your .env file!');
    console.log('Example: ADMIN_CODE=***REMOVED***');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
