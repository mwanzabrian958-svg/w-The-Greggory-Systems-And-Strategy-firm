const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'greggory_foundation_db_main',
};

const BACKUP_DIR = path.join(__dirname, '../backups');

console.log('='.repeat(60));
console.log('DATABASE RESTORE FROM GITHUB');
console.log('='.repeat(60));
console.log(`Database: ${DB_CONFIG.database}`);
console.log(`Host: ${DB_CONFIG.host}`);
console.log(`Backup directory: ${BACKUP_DIR}`);
console.log('='.repeat(60));

// List available backups
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        size: fs.statSync(path.join(BACKUP_DIR, f)).size,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      console.log('\n❌ No backup files found in backups/ directory');
      console.log('\nPlease ensure:');
      console.log('1. You have pulled the latest from GitHub');
      console.log('2. Backup files exist in the backups/ directory');
      process.exit(1);
    }
    
    console.log('\n📋 Available backups:');
    console.log('-'.repeat(60));
    files.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name}`);
      console.log(`   Size: ${(f.size / 1024).toFixed(2)} KB`);
      console.log(`   Date: ${f.time.toLocaleString()}`);
      console.log(`   Path: ${f.path}`);
      console.log('-'.repeat(60));
    });
    
    return files;
  } catch (err) {
    console.error('❌ Error reading backups directory:', err.message);
    process.exit(1);
  }
}

// Restore from specific backup file
function restoreBackup(backupPath) {
  console.log(`\n🔄 Restoring from: ${backupPath}`);
  
  const restoreCmd = `mysql --host=${DB_CONFIG.host} --user=${DB_CONFIG.user} --password=${DB_CONFIG.password} < ${backupPath}`;
  
  exec(restoreCmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error restoring backup:', error.message);
      
      // Fallback: Try alternative method
      console.log('\n⚠️  Trying alternative restore method...');
      restoreWithNodeJS(backupPath);
      return;
    }
    
    if (stderr) {
      console.warn('Warning:', stderr);
    }
    
    console.log('✅ Database restored successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('RESTORE COMPLETE');
    console.log('='.repeat(60));
    console.log('You can now start the application:');
    console.log('  npm run dev');
    console.log('='.repeat(60));
  });
}

// Alternative restore method using Node.js
async function restoreWithNodeJS(backupPath) {
  const mysql = require('mysql2/promise');
  
  try {
    const sql = fs.readFileSync(backupPath, 'utf8');
    console.log('✅ Read backup file');
    
    // Connect to MySQL (without database)
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.query(statements[i]);
        if ((i + 1) % 10 === 0 || i === statements.length - 1) {
          process.stdout.write(`\r⏳ Progress: ${i + 1}/${statements.length} statements`);
        }
      } catch (err) {
        // Ignore certain errors that are expected
        if (!err.message.includes('already exists') && !err.message.includes('Unknown table')) {
          console.warn(`\n⚠️  Warning on statement ${i + 1}:`, err.message);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n✅ Database restored successfully using Node.js!');
    console.log('\n' + '='.repeat(60));
    console.log('RESTORE COMPLETE');
    console.log('='.repeat(60));
    console.log('You can now start the application:');
    console.log('  npm run dev');
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ Alternative restore method failed:', err.message);
    console.error('\nPlease ensure:');
    console.error('1. XAMPP MySQL is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Backup file is not corrupted');
    process.exit(1);
  }
}

// Main execution
const backups = listBackups();

// If command line argument provided, use that backup
const args = process.argv.slice(2);
if (args.length > 0) {
  const backupName = args[0];
  const backup = backups.find(b => b.name === backupName || b.path === backupName);
  
  if (backup) {
    restoreBackup(backup.path);
  } else {
    console.error(`❌ Backup not found: ${backupName}`);
    process.exit(1);
  }
} else {
  // Use the most recent backup
  console.log(`\n🔄 Restoring from most recent backup: ${backups[0].name}`);
  restoreBackup(backups[0].path);
}
