// Check user credentials in database
const mysql = require('mysql2/promise');

async function checkUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'greggory_auth_platform'
  });

  try {
    console.log('=== Checking User Credentials ===');
    
    // Search for the user
    const [users] = await connection.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.password_hash, u.email_verified, u.is_active, u.role_id, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.deleted_at IS NULL`,
      ['mwanzabrian650@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ User NOT found in database');
      console.log('   Email: mwanzabrian650@gmail.com');
      console.log('   This user may not be registered or may be soft-deleted');
      return;
    }

    const user = users[0];
    console.log('✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.role_name}`);
    console.log(`   Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
    console.log(`   Account Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`   Password Hash: ${user.password_hash ? 'Present' : 'Missing'}`);
    
    if (!user.password_hash) {
      console.log('❌ ERROR: User has no password hash in database');
      console.log('   This user may have been created without a password');
      return;
    }

    if (!user.email_verified) {
      console.log('⚠️  WARNING: Email not verified');
      console.log('   User may need to verify email before logging in');
    }

    if (!user.is_active) {
      console.log('❌ ERROR: Account is not active');
      console.log('   Account may be deactivated');
      return;
    }

    console.log('✅ User account appears to be valid for login');
    console.log('🔍 Possible issues:');
    console.log('   1. Password "***REMOVED***" may not match the stored hash');
    console.log('   2. Frontend may be sending different data');
    console.log('   3. Backend may have validation errors');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUser();
