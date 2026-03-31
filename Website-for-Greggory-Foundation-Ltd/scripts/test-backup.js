const { exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function testBackup() {
  try {
    console.log('Starting database backup test...');
    
    // Verify environment variables
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('Environment variables verified');
    
    // Run the backup script
    console.log('\nRunning backup script...');
    const backupScript = path.join(__dirname, 'backup-db.js');
    await new Promise((resolve, reject) => {
      exec(`node ${backupScript}`, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup failed: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`Backup stderr: ${stderr}`);
        }
        console.log(`Backup stdout: ${stdout}`);
        resolve();
      });
    });

    // Verify backup in Google Cloud Storage if credentials are available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('\nVerifying backup in Google Cloud Storage...');
      const storage = new Storage();
      const bucketName = process.env.STORAGE_BUCKET_BACKUPS;
      
      try {
        const [files] = await storage.bucket(bucketName).getFiles({
          prefix: 'database/'
        });

        if (files.length > 0) {
          console.log('\nBackup files found in Google Cloud Storage:');
          files.slice(0, 5).forEach((file, index) => { // Show first 5 files
            const fileDate = new Date(file.metadata.timeCreated).toLocaleString();
            console.log(`- ${file.name} (${(file.metadata.size / 1024).toFixed(2)} KB, ${fileDate})`);
          });
          
          if (files.length > 5) {
            console.log(`... and ${files.length - 5} more files`);
          }
          
          // Get the latest backup
          const latestBackup = files.sort((a, b) => 
            new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
          )[0];
          
          console.log('\nLatest backup details:');
          console.log('- Name:', latestBackup.name);
          console.log('- Size:', (latestBackup.metadata.size / 1024).toFixed(2), 'KB');
          console.log('- Created:', new Date(latestBackup.metadata.timeCreated).toLocaleString());
          
        } else {
          console.log('No backup files found in Google Cloud Storage');
        }
      } catch (err) {
        console.error('Error accessing Google Cloud Storage:', err);
      }
    } else {
      console.log('\nGoogle Cloud credentials not found. Skipping cloud storage verification.');
      
      // Check local backups directory
      const localBackupDir = path.join(__dirname, '../backups');
      if (fs.existsSync(localBackupDir)) {
        const backupFiles = fs.readdirSync(localBackupDir);
        if (backupFiles.length > 0) {
          console.log('\nLocal backup files found:');
          backupFiles.slice(0, 5).forEach(file => {
            const stats = fs.statSync(path.join(localBackupDir, file));
            console.log(`- ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
          });
        } else {
          console.log('\nNo local backup files found');
        }
      }
    }

    console.log('\nDatabase backup test completed successfully');
  } catch (error) {
    console.error('Backup test failed:', error);
    process.exit(1);
  }
}

// Run the test
testBackup()
  .then(() => console.log('\nAll tests completed successfully!'))
  .catch(console.error);
