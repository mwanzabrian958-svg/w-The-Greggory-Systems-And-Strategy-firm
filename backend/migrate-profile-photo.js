const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main'
});

db.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  
  // Check if column exists
  db.query(`
    SELECT COUNT(*) as count 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'admin_users' 
    AND column_name = 'profile_image_id'
  `, (err, results) => {
    if (err) {
      console.error('Error checking column:', err);
      db.end();
      process.exit(1);
    }
    
    if (results[0].count > 0) {
      console.log('✓ profile_image_id column already exists');
      db.end();
      process.exit(0);
    }
    
    // Add the column
    db.query(`
      ALTER TABLE admin_users 
      ADD COLUMN profile_image_id INT NULL
    `, (err) => {
      if (err) {
        console.error('Error adding column:', err);
        db.end();
        process.exit(1);
      }
      
      console.log('✓ Added profile_image_id column to admin_users table');
      db.end();
      process.exit(0);
    });
  });
});
