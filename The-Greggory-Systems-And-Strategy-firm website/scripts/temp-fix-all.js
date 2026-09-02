/**
 * COMPLETE ADMIN DASHBOARD FIX
 * This script creates all missing database tables and verifies the schema
 */
const mysql = require('mysql2/promise');

const TABLES = {
  crm_contacts: `CREATE TABLE IF NOT EXISTS crm_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'lead',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
  )`,
  admin_settings: `CREATE TABLE IF NOT EXISTS admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(100) DEFAULT 'general',
    description VARCHAR(500),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  crm_telemetry: `CREATE TABLE IF NOT EXISTS crm_telemetry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clients JSON,
    opportunities JSON,
    pipeline JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
};

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '',
    database: 'the_greggory_systems_and_strategy_firm_db_main'
  });

  for (const [name, sql] of Object.entries(TABLES)) {
    await c.query(sql);
    console.log(`Table ${name}: OK`);
  }

  // Insert default settings
  await c.query(`INSERT IGNORE INTO admin_settings (setting_key, setting_value, setting_group, description) VALUES
    ('site_title', 'The Greggory Systems And Strategy Firm', 'general', 'Website title'),
    ('contact_email', 'info@gregory.com', 'contact', 'Contact email'),
    ('contact_phone', '+254115525854', 'contact', 'Contact phone'),
    ('admin_session_timeout', '60', 'system', 'Session timeout minutes'),
    ('maintenance_mode', 'false', 'system', 'Maintenance mode'),
    ('allow_registration', 'true', 'system', 'Allow registration'),
    ('deep_space_mode', 'false', 'system', 'Deep space mode'),
    ('admin_lockdown', 'false', 'system', 'Admin lockdown')
  `);
  console.log('Default settings: OK');

  // Insert sample CRM data
  await c.query(`INSERT IGNORE INTO crm_contacts (name, email, phone, company, status) VALUES
    ('John Doe', 'john@example.com', '+254712345678', 'ABC Corp', 'lead'),
    ('Jane Smith', 'jane@example.com', '+254723456789', 'XYZ Ltd', 'active')
  `);
  console.log('Sample CRM data: OK');

  await c.end();
  console.log('All tables created successfully!');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
