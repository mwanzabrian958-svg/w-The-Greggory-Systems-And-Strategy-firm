const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkPassword() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'greggory_auth_platform'
    });

    const [users] = await connection.execute('SELECT u.id, u.email, u.first_name, u.last_name, u.password_hash FROM users u WHERE u.email = ? AND u.deleted_at IS NULL', ['mwanzabrian958@gmail.com']);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('Admin account found:');
      console.log('Email:', user.email);
      console.log('Name:', user.first_name, user.last_name);
      console.log('Password Hash:', user.password_hash);
      console.log('---');
      
      // Test some common passwords
      const testPasswords = ['***REMOVED***', '***REMOVED***', 'admin', '123456', 'password'];
      
      for (const testPwd of testPasswords) {
        const match = await bcrypt.compare(testPwd, user.password_hash);
        if (match) {
          console.log('✅ PASSWORD FOUND:', testPwd);
          console.log('You can login with:');
          console.log('Email: mwanzabrian958@gmail.com');
          console.log('Password:', testPwd);
          return;
        }
      }
      
      console.log('❌ No common passwords matched. You may need to reset the password.');
      console.log('Would you like me to reset the password to "***REMOVED***"?');
      
    } else {
      console.log('Admin account not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPassword();
