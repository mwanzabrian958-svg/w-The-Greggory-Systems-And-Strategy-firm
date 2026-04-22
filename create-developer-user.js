/**
 * Script to create initial developer user in developer_users table
 * Usage: node create-developer-user.js
 */

const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
  port: process.env.DB_PORT || 3306
};

const developerUser = {
  email: 'dev@example.com',
  password: '***REMOVED***',  // Change this!
  first_name: 'Developer',
  last_name: 'User',
  phone_number: '+254700000000',
  developer_level: 'senior',
  tech_stack: JSON.stringify(['React', 'Node.js', 'MySQL', 'TailwindCSS'])
};

async function createDeveloperUser() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if developer_users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'developer_users'"
    );
    
    if (tables.length === 0) {
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
    
    // Check if developer already exists
    const [existing] = await connection.execute(
      'SELECT id FROM developer_users WHERE email = ?',
      [developerUser.email]
    );
    
    if (existing.length > 0) {
      console.log(`Developer user ${developerUser.email} already exists`);
      
      // Ask if they want to update password
      console.log('\nTo update the password, run:');
      const hashedPw = await bcryptjs.hash(developerUser.password, 10);
      console.log(`UPDATE developer_users SET password_hash = '${hashedPw}' WHERE email = '${developerUser.email}';`);
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(developerUser.password, saltRounds);
    
    // Insert developer user
    const [result] = await connection.execute(
      `INSERT INTO developer_users (
        email, email_verified, password_hash, first_name, last_name, 
        phone_number, developer_level, tech_stack, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        developerUser.email,
        true,
        hashedPassword,
        developerUser.first_name,
        developerUser.last_name,
        developerUser.phone_number,
        developerUser.developer_level,
        developerUser.tech_stack,
        true
      ]
    );
    
    console.log('\n✅ Developer user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${developerUser.email}`);
    console.log(`Password: ${developerUser.password}`);
    console.log(`Name:     ${developerUser.first_name} ${developerUser.last_name}`);
    console.log(`Level:    ${developerUser.developer_level}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nDeveloper Login Details:');
    console.log('  Endpoint: /api/developer/authenticate');
    console.log('  Or use the same admin code (***REMOVED***) if DEV_CODE not set');
    console.log('\nMake sure to set DEV_CODE in your .env file (optional):');
    console.log('Example: DEV_CODE=GF-DEV-2024-SECURE');
    
  } catch (error) {
    console.error('Error creating developer user:', error);
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
  createDeveloperUser();
}

module.exports = { createDeveloperUser };
