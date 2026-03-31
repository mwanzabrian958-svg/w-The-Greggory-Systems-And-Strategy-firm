const mysql = require('mysql2/promise');

async function checkAdmin() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'greggory_auth_platform'
    });

    const [users] = await connection.execute('SELECT u.id, u.email, u.first_name, u.last_name, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = "admin" AND u.deleted_at IS NULL');
    console.log('Admin users found:', users.length);
    if (users.length > 0) {
      console.log('Admin login credentials:');
      users.forEach(user => {
        console.log('Email:', user.email);
        console.log('Name:', user.first_name, user.last_name);
        console.log('Role:', user.role_name);
        console.log('---');
      });
    } else {
      console.log('No admin users found. Creating admin user...');
      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, first_name, last_name, role_id, email_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin@greggory.com', '$2b$12$***REMOVED***', 'Admin', 'User', 1, true, true]
      );
      console.log('Admin user created with ID:', result.insertId);
      console.log('Email: admin@greggory.com');
      console.log('Password: ***REMOVED***');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdmin();
