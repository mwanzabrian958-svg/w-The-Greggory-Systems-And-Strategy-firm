const db = require('./backend/config/database');

const hash = '***REMOVED***';

db.query(
  "UPDATE admin_users SET password_hash = ? WHERE email = 'admin@thegreggorysystemsandstrategyfirm.org'",
  [hash],
  (err, res) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Password updated successfully:', res);
    }
    process.exit();
  }
);
