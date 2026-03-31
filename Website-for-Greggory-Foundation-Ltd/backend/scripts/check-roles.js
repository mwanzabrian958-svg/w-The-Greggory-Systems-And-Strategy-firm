const db = require('../config/db');

async function checkRolesTable() {
  try {
    // Check if roles table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'roles'");
    
    if (tables.length === 0) {
      console.log('Roles table does not exist. Creating it...');
      await db.query(`
        CREATE TABLE roles (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          is_system_role BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      
      // Insert default roles
      await db.query(`
        INSERT INTO roles (name, description, is_system_role) VALUES 
        ('admin', 'Administrator with full access', TRUE),
        ('user', 'Regular user', TRUE),
        ('editor', 'Content editor', FALSE);
      `);
      
      console.log('Created roles table with default roles');
      
      // Check if we have a default admin user
      const [users] = await db.query("SELECT id FROM users WHERE email = 'admin@example.com'");
      
      if (users.length === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('***REMOVED***', 10);
        
        await db.query(`
          INSERT INTO users 
          (email, password_hash, first_name, last_name, role_id, is_active, email_verified)
          VALUES (?, ?, 'Admin', 'User', 
            (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 
            TRUE, TRUE);
        `, ['admin@example.com', hashedPassword]);
        
        console.log('Created default admin user: admin@example.com / ***REMOVED***');
      }
    } else {
      console.log('Roles table exists. Current roles:');
      const [roles] = await db.query('SELECT * FROM roles');
      console.table(roles);
    }
    
    // Show role assignments
    console.log('\nUser role assignments:');
    const [userRoles] = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, r.name as role, u.is_active
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    console.table(userRoles);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking roles table:', error);
    process.exit(1);
  }
}

checkRolesTable();
