const { exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const BACKUP_DIR = path.join(__dirname, '../backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = `backup-${TIMESTAMP}.sql.gz`;
const BACKUP_PATH = path.join(BACKUP_DIR, BACKUP_FILE);

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create database dump
console.log('Creating database backup...');
const dumpCmd = `mysqldump --host=${DB_CONFIG.host} --user=${DB_CONFIG.user} --password=${DB_CONFIG.password} --databases ${DB_CONFIG.database} | gzip > ${BACKUP_PATH}`;

exec(dumpCmd, async (error) => {
  if (error) {
    console.error('Error creating backup:', error);
    process.exit(1);
  }

  console.log(`Backup created at ${BACKUP_PATH}`);

  // Upload to Google Cloud Storage
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Uploading to Google Cloud Storage...');
    const storage = new Storage();
    const bucketName = process.env.STORAGE_BUCKET_BACKUPS;
    
    try {
      await storage.bucket(bucketName).upload(BACKUP_PATH, {
        destination: `database/${BACKUP_FILE}`,
        metadata: {
          contentType: 'application/gzip',
        },
      });
      console.log(`Backup uploaded to gs://${bucketName}/database/${BACKUP_FILE}`);
      
      // Delete local backup after successful upload
      fs.unlinkSync(BACKUP_PATH);
      console.log('Local backup file removed');
    } catch (err) {
      console.error('Error uploading to Google Cloud Storage:', err);
      process.exit(1);
    }
  } else {
    console.log('Google Cloud credentials not found. Skipping upload to cloud storage.');
  }
});
