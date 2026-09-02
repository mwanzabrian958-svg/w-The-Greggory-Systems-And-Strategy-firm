const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '',
    database: 'the_greggory_systems_and_strategy_firm_db_main'
  });

  // CRM Contacts table
  await c.query(`CREATE TABLE IF NOT EXISTS crm_contacts (
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
  )`);
  console.log('crm_contacts table created/verified');

  // Admin Settings table
  await c.query(`CREATE TABLE IF NOT EXISTS admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(100) DEFAULT 'general',
    description VARCHAR(500),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  console.log('admin_settings table created/verified');

  // Insert default settings
  await c.query(`INSERT IGNORE INTO admin_settings (setting_key, setting_value, setting_group, description) VALUES
    ('site_name', 'The Greggory Systems', 'general', 'Website name'),
    ('site_description', 'Strategic Systems and Business Solutions', 'general', 'Website description'),
    ('admin_email', 'admin@greggory.com', 'contact', 'Admin contact email'),
    ('phone', '+254115525854', 'contact', 'Company phone number'),
    ('address', 'Nairobi, Kenya', 'contact', 'Physical address'),
    ('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
    ('session_timeout', '480', 'system', 'Session timeout in minutes')
  `);
  console.log('Default settings inserted');

  // Insert sample CRM contacts
  await c.query(`INSERT IGNORE INTO crm_contacts (name, email, phone, company, status) VALUES
    ('John Doe', 'john@example.com', '+254712345678', 'ABC Corp', 'lead'),
    ('Jane Smith', 'jane@example.com', '+254723456789', 'XYZ Ltd', 'active')
  `);
  console.log('Sample CRM contacts inserted');

  await c.end();
  console.log('Done!');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
