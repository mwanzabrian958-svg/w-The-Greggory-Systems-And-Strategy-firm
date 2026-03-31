const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Create connection to MySQL server
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined // Use undefined if password is empty
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} is ready`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
        phone_number VARCHAR(50),
        profile_photo_id BIGINT UNSIGNED,
        role_id BIGINT UNSIGNED NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires DATETIME,
        last_login_at TIMESTAMP NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        locale VARCHAR(10) DEFAULT 'en-US',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by BIGINT UNSIGNED,
        updated_by BIGINT UNSIGNED,
        deleted_at TIMESTAMP NULL,
        deleted_by BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE KEY (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Users table is ready');

    // Create roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        permissions JSON,
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Roles table is ready');

    // Insert default roles if they don't exist
    await connection.query(`
      INSERT IGNORE INTO roles (name, description, is_system_role, permissions) VALUES
      ('admin', 'Administrator with full access', TRUE, '{"admin": true, "users": {"create": true, "read": true, "update": true, "delete": true}}'),
      ('user', 'Regular user', TRUE, '{"users": {"read": true, "update": true}}');
    `);
    console.log('Default roles are ready');

    // Create admin user if not exists
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@greggoryfoundation.com']);
    
    if (users.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('***REMOVED***', 10);
      const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['admin']);
      
      if (roles.length > 0) {
        await connection.query(
          'INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, email_verified) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)',
          ['admin@greggoryfoundation.com', hashedPassword, 'Admin', 'User', roles[0].id]
        );
        console.log('Created default admin user with email: admin@greggoryfoundation.com and password: ***REMOVED***');
      }
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
