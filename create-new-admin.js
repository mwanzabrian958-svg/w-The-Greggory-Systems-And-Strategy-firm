const db = require('./backend/config/database');
const bcrypt = require('bcryptjs');

const email = 'newadmin@thegreggorysystemsandstrategyfirm.org';
const password = '***REMOVED***';
const hash = bcrypt.hashSync(password, 10);

console.log('Creating new admin user...');
console.log('Email:', email);
console.log('Password:', password);

db.query(
  `INSERT INTO admin_users (email, password_hash, first_name, last_name, display_name, admin_level, access_level, is_active)
   VALUES (?, ?, 'New', 'Admin', 'New Admin', 'super_admin', 99, true)
   ON DUPLICATE KEY UPDATE password_hash = ?`,
  [email, hash, hash],
  (err, res) => {
    if (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
    console.log('Admin created/updated:', res);
    process.exit(0);
  }
);
