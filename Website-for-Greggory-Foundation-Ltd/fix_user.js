// Fix user email verification and reset password
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'greggory_auth_platform'
  });

  try {
    console.log('=== Fixing User Account ===');
    
    // Hash the new password
    const newPassword = '***REMOVED***';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('🔐 New password hashed:', newPassword);
    
    // Update user record
    const [result] = await connection.execute(
      `UPDATE users 
       SET email_verified = TRUE, 
           password_hash = ?,
           updated_at = NOW()
       WHERE email = ?`,
      [hashedPassword, 'mwanzabrian650@gmail.com']
    );

    if (result.affectedRows > 0) {
      console.log('✅ User account fixed successfully!');
      console.log('   Email: mwanzabrian650@gmail.com');
      console.log('   New Password: ***REMOVED***');
      console.log('   Email Verified: TRUE');
      console.log('   Account Active: TRUE');
      console.log('\n🎉 You can now login with:');
      console.log('   Email: mwanzabrian650@gmail.com');
      console.log('   Password: ***REMOVED***');
    } else {
      console.log('❌ Failed to update user account');
    }

  } catch (error) {
    console.error('❌ Error fixing user:', error.message);
  } finally {
    await connection.end();
  }
}

fixUser();
