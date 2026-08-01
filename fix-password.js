const db = require('./backend/config/database');
const bcrypt = require('bcryptjs');

const email = 'admin@thegreggorysystemsandstrategyfirm.org';
const password = '***REMOVED***';
const hash = bcrypt.hashSync(password, 10);

console.log('Generated hash:', hash);

db.query('UPDATE admin_users SET password_hash = ? WHERE email = ?', [hash, email], (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Updated:', res);
  
  // Verify
  db.query('SELECT password_hash FROM admin_users WHERE email = ?', [email], (e, rows) => {
    if (e) {
      console.error('Select error:', e);
    } else {
      console.log('Stored hash:', rows[0]?.password_hash);
      const valid = bcrypt.compareSync(password, rows[0]?.password_hash);
      console.log('Password valid:', valid);
    }
    process.exit(0);
  });
});
