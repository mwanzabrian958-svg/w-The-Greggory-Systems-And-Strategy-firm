// setup-db.js
const db = require('./config/db');

async function setupDatabase() {
  try {
    // First, create tables without foreign key constraints
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created users table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created donations table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created contacts table');

    // Now add foreign key constraints
    try {
      await db.query(`
        ALTER TABLE donations 
        ADD CONSTRAINT fk_donations_user
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key to donations table');
    } catch (error) {
      console.warn('⚠️ Could not add foreign key to donations table. This might be because the tables already exist.');
    }

    // Create default admin user if not exists
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@greggoryfoundation.org']);
    if (users.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('***REMOVED***', 10);
      await db.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@greggoryfoundation.org', hashedPassword, 'Admin', 'User', 'admin', true]
      );
      console.log('✅ Created default admin user (email: admin@greggoryfoundation.org, password: ***REMOVED***)');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now log in to the admin panel with:');
    console.log('Email: admin@greggoryfoundation.org');
    console.log('Password: ***REMOVED***');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
