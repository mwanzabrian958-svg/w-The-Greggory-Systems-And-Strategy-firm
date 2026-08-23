const mysql = require('mysql2');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db';

// Default admin credentials are generated per-run unless provided via env.
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thegreggorysystemsandstrategyfirm.org';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
const DEFAULT_ADMIN_HASH = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

// Connect without database to create it
const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  multipleStatements: true
});

console.log('Creating database and tables...');

const setupSQL = `
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
USE ${DB_NAME};

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(100),
  admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  access_level INT DEFAULT 1,
  department VARCHAR(100),
  profile_image_id INT,
  is_active BOOLEAN DEFAULT true,
  failed_login_attempts INT DEFAULT 0,
  last_login_at DATETIME,
  last_login_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- Insert default admin user (password is generated or read from ADMIN_PASSWORD env)
INSERT IGNORE INTO admin_users (email, password_hash, first_name, last_name, display_name, admin_level, access_level, is_active) 
VALUES ('${DEFAULT_ADMIN_EMAIL}', '${DEFAULT_ADMIN_HASH}', 'System', 'Admin', 'Administrator', 'super_admin', 99, true);

SELECT 'Database setup complete!' as message;
SELECT COUNT(*) as admin_count FROM admin_users;
`;

connection.query(setupSQL, (err, results) => {
  if (err) {
    console.error('Setup error:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Database created');
    console.log('✓ admin_users table created');
    console.log('✓ Default admin user created');
    console.log('\nLogin credentials:');
    console.log(`  Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`  Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log('  (Store it securely — it will not be shown again)');
    connection.end();
    process.exit(0);
  }
});
