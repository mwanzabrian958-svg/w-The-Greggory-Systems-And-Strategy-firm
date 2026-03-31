const db = require('../config/db');

async function checkDatabase() {
  try {
    // Check if we can connect to the database
    const [rows] = await db.query('SELECT DATABASE() as db, USER() as user, VERSION() as version');
    console.log('Database connection successful:');
    console.log('- Database:', rows[0].db);
    console.log('- User:', rows[0].user);
    console.log('- MySQL Version:', rows[0].version);
    
    // Check if users table exists and show its structure
    try {
      const [tables] = await db.query(
        "SHOW TABLES LIKE 'users'"
      );
      
      if (tables.length === 0) {
        console.log('\nError: users table does not exist in the database');
        console.log('Please create the users table with the following structure:');
        console.log(`
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        process.exit(1);
      }
      
      // Show users table structure
      const [columns] = await db.query('DESCRIBE users');
      console.log('\nUsers table structure:');
      console.table(columns);
      
      // Check if there are any users
      const [users] = await db.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nTotal users in database: ${users[0].count}`);
      
      if (users[0].count === 0) {
        console.log('\nNo users found. You may want to create an admin user.');
      } else {
        const [userList] = await db.query(
          'SELECT id, username, email, role, is_verified, created_at FROM users LIMIT 5'
        );
        console.log('\nSample users (up to 5):');
        console.table(userList);
      }
      
    } catch (error) {
      console.error('Error checking users table:', error.message);
      process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('\nPlease check your database configuration in the .env file:');
    console.log('- Make sure MySQL server is running');
    console.log('- Verify DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env');
    console.log('- Ensure the database and user have proper permissions');
    process.exit(1);
  }
}

checkDatabase();
