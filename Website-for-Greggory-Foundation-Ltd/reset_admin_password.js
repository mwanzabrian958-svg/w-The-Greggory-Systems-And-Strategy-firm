const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'greggory_auth_platform'
    });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('***REMOVED***', salt);

    // Update the admin password
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
      [hashedPassword, 'mwanzabrian958@gmail.com']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Password reset successful!');
      console.log('Email: mwanzabrian958@gmail.com');
      console.log('New Password: ***REMOVED***');
      console.log('---');
      console.log('You can now login to the admin panel with these credentials.');
    } else {
      console.log('❌ Failed to reset password');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetPassword();
