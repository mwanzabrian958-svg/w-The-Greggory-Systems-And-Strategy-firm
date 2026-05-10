/**
 * INITIALIZE AUTH ENDPOINTS TABLES
 * File: scripts/init-auth-endpoints-tables.js
 * 
 * Initializes the auth_platform_mapping tables in the database
 * Run once after database creation
 * 
 * Usage: node scripts/init-auth-endpoints-tables.js
 */

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
  multipleStatements: true
});

/**
 * Run SQL file
 */
function runSQLFile(filePath) {
  return new Promise((resolve, reject) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    connection.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Initialize tables
 */
async function initializeAuthEndpointsTables() {
  try {
    console.log('🔒 Initializing Auth Endpoints Tables...\n');

    // Create tables
    console.log('📋 Creating auth_platform_mapping table...');
    connection.query(`
      CREATE TABLE IF NOT EXISTS auth_platform_mapping (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        platform_name VARCHAR(50) NOT NULL UNIQUE,
        table_name VARCHAR(100) NOT NULL UNIQUE,
        register_endpoint VARCHAR(255) NOT NULL,
        login_endpoint VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        is_locked BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        locked_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        locked_by VARCHAR(100) DEFAULT 'SYSTEM',
        INDEX idx_platform_name (platform_name),
        INDEX idx_table_name (table_name),
        INDEX idx_is_locked (is_locked),
        CONSTRAINT check_platform_name CHECK (platform_name IN ('user', 'admin', 'developer')),
        CONSTRAINT check_table_name CHECK (table_name IN ('users', 'admin_users', 'developer_users'))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `, (err) => {
      if (err) {
        console.error('❌ Error creating auth_platform_mapping table:', err.message);
        process.exit(1);
      }
      console.log('✅ auth_platform_mapping table created/verified\n');
    });

    // Create auth_request_log table
    console.log('📋 Creating auth_request_log table...');
    connection.query(`
      CREATE TABLE IF NOT EXISTS auth_request_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(100) NOT NULL UNIQUE,
        platform VARCHAR(50) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        ip_address VARCHAR(45),
        request_method VARCHAR(10),
        request_body_hash VARCHAR(64),
        response_status INT,
        response_message VARCHAR(255),
        error_message VARCHAR(500),
        execution_time_ms INT,
        is_success BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_platform (platform),
        INDEX idx_table_name (table_name),
        INDEX idx_endpoint (endpoint),
        INDEX idx_email (email),
        INDEX idx_created_at (created_at),
        INDEX idx_is_success (is_success)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `, (err) => {
      if (err) {
        console.error('❌ Error creating auth_request_log table:', err.message);
        process.exit(1);
      }
      console.log('✅ auth_request_log table created/verified\n');
    });

    // Create auth_validation_rules table
    console.log('📋 Creating auth_validation_rules table...');
    connection.query(`
      CREATE TABLE IF NOT EXISTS auth_validation_rules (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        rule_name VARCHAR(100) NOT NULL,
        rule_type ENUM('required_field', 'table_isolation', 'cross_check', 'password_policy', 'rate_limit') DEFAULT 'required_field',
        rule_value VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        enforcement_level ENUM('strict', 'warning', 'info') DEFAULT 'strict',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_platform_rule (platform, rule_name),
        INDEX idx_platform (platform),
        INDEX idx_rule_type (rule_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `, (err) => {
      if (err) {
        console.error('❌ Error creating auth_validation_rules table:', err.message);
        process.exit(1);
      }
      console.log('✅ auth_validation_rules table created/verified\n');
    });

    // Insert locked platform mappings
    console.log('🔐 Inserting locked auth platform mappings...');
    connection.query(`
      DELETE FROM auth_platform_mapping;
      
      INSERT INTO auth_platform_mapping (
        platform_name, 
        table_name, 
        register_endpoint, 
        login_endpoint, 
        description, 
        is_active, 
        is_locked,
        locked_by
      ) VALUES 
      (
        'user',
        'users',
        'POST /api/users/register',
        'POST /api/users/login',
        'Regular user authentication - public user accounts, donors, beneficiaries',
        TRUE,
        TRUE,
        'SYSTEM'
      ),
      (
        'admin',
        'admin_users',
        'POST /api/admin/create (admin-create via users.js)',
        'POST /api/admin-verification/authenticate-enhanced',
        'Administrative staff - super admins, admins, moderators',
        TRUE,
        TRUE,
        'SYSTEM'
      ),
      (
        'developer',
        'developer_users',
        'POST /api/admin/developer-create (admin-create via users.js)',
        'POST /api/developer-verification/authenticate',
        'Development team - senior, mid, junior, lead level developers',
        TRUE,
        TRUE,
        'SYSTEM'
      );
    `, (err) => {
      if (err) {
        console.error('❌ Error inserting mappings:', err.message);
        process.exit(1);
      }
      console.log('✅ Auth platform mappings locked in database\n');
    });

    // Insert validation rules
    console.log('📏 Inserting validation rules...');
    const rules = [
      // User platform rules
      ['user', 'email_required', 'required_field', 'email', 'Email field is mandatory for user registration', 'strict'],
      ['user', 'password_required', 'required_field', 'password', 'Password field is mandatory for user registration', 'strict'],
      ['user', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for user registration', 'strict'],
      ['user', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for user registration', 'strict'],
      ['user', 'only_users_table', 'table_isolation', 'users', 'User auth MUST ONLY reference users table', 'strict'],
      ['user', 'no_admin_check', 'cross_check', 'admin_users', 'NEVER check admin_users table in user auth flow', 'strict'],
      ['user', 'no_developer_check', 'cross_check', 'developer_users', 'NEVER check developer_users table in user auth flow', 'strict'],
      ['user', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict'],
      // Admin platform rules
      ['admin', 'email_required', 'required_field', 'email', 'Email field is mandatory for admin registration', 'strict'],
      ['admin', 'password_required', 'required_field', 'password', 'Password field is mandatory for admin registration', 'strict'],
      ['admin', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for admin registration', 'strict'],
      ['admin', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for admin registration', 'strict'],
      ['admin', 'role_required', 'required_field', 'role', 'Role field is mandatory for admin registration', 'strict'],
      ['admin', 'only_admin_users_table', 'table_isolation', 'admin_users', 'Admin auth MUST ONLY reference admin_users table', 'strict'],
      ['admin', 'no_users_check', 'cross_check', 'users', 'NEVER check users table in admin auth flow', 'strict'],
      ['admin', 'no_developer_check', 'cross_check', 'developer_users', 'NEVER check developer_users table in admin auth flow', 'strict'],
      ['admin', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict'],
      // Developer platform rules
      ['developer', 'email_required', 'required_field', 'email', 'Email field is mandatory for developer registration', 'strict'],
      ['developer', 'password_required', 'required_field', 'password', 'Password field is mandatory for developer registration', 'strict'],
      ['developer', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for developer registration', 'strict'],
      ['developer', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for developer registration', 'strict'],
      ['developer', 'role_required', 'required_field', 'role', 'Role field is mandatory for developer registration', 'strict'],
      ['developer', 'only_developer_users_table', 'table_isolation', 'developer_users', 'Developer auth MUST ONLY reference developer_users table', 'strict'],
      ['developer', 'no_users_check', 'cross_check', 'users', 'NEVER check users table in developer auth flow', 'strict'],
      ['developer', 'no_admin_check', 'cross_check', 'admin_users', 'NEVER check admin_users table in developer auth flow', 'strict'],
      ['developer', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict']
    ];

    connection.query('DELETE FROM auth_validation_rules', (err) => {
      if (err) {
        console.error('❌ Error clearing validation rules:', err.message);
        process.exit(1);
      }

      let inserted = 0;
      rules.forEach((rule, index) => {
        connection.query(
          `INSERT INTO auth_validation_rules 
            (platform, rule_name, rule_type, rule_value, description, enforcement_level) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          rule,
          (err) => {
            if (err) {
              console.error(`❌ Error inserting rule ${rule[1]}:`, err.message);
            } else {
              inserted++;
            }
            
            if (index === rules.length - 1) {
              console.log(`✅ Inserted ${inserted}/${rules.length} validation rules\n`);
              
              // Display summary
              console.log('=' .repeat(60));
              console.log('✅ AUTH ENDPOINTS INITIALIZATION COMPLETE');
              console.log('=' .repeat(60));
              console.log('\n📊 Database Summary:');
              console.log('  • auth_platform_mapping: 3 locked platforms');
              console.log('  • auth_request_log: Ready for audit logging');
              console.log('  • auth_validation_rules: 25 strict validation rules');
              console.log('\n🔒 Locked Platforms:');
              console.log('  1. user → users table');
              console.log('     POST /api/users/register');
              console.log('     POST /api/users/login');
              console.log('  2. admin → admin_users table');
              console.log('     POST /api/users/admin-create');
              console.log('     POST /api/admin-verification/authenticate-enhanced');
              console.log('  3. developer → developer_users table');
              console.log('     POST /api/users/admin-create');
              console.log('     POST /api/developer-verification/authenticate');
              console.log('\n📝 View mappings: SELECT * FROM v_active_auth_platforms;');
              console.log('📊 View stats: SELECT * FROM v_auth_request_stats;');
              console.log('=' .repeat(60) + '\n');
              
              connection.end();
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
console.log('\n🔐 AUTH ENDPOINTS TABLE INITIALIZATION\n');
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  initializeAuthEndpointsTables();
});
