// Test database connection
const connection = require('./backend/config/database.js');

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST || '127.0.0.1');
console.log('DB_PORT:', process.env.DB_PORT || 3306);
console.log('DB_NAME:', process.env.DB_NAME || 'greggory_foundation_db_main');

connection.query('SELECT 1 as test', (err, results) => {
  if (err) {
    console.error('❌ DB CONNECTION FAILED:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  } else {
    console.log('✅ DB CONNECTED SUCCESSFULLY!');
    console.log('Result:', results);
    
    // Test if users table exists
    connection.query('SHOW TABLES LIKE "users"', (err2, results2) => {
      if (err2) {
        console.error('❌ Error checking tables:', err2.message);
      } else if (results2.length === 0) {
        console.error('❌ users table does NOT exist!');
      } else {
        console.log('✅ users table exists!');
      }
      connection.end();
      process.exit(0);
    });
  }
});
