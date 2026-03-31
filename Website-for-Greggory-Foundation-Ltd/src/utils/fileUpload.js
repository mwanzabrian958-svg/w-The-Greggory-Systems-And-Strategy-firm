const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileUploader {
  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.STORAGE_BUCKET_MEDIA;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async uploadFile(file, destinationPath = '') {
    try {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = destinationPath ? `${destinationPath}/${fileName}` : fileName;
      
      const fileStream = this.bucket.file(filePath).createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        fileStream.on('error', (err) => {
          console.error('Error uploading file:', err);
          reject(err);
        });

        fileStream.on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
          resolve({
            fileName,
            filePath,
            publicUrl,
            contentType: file.mimetype,
            size: file.size,
          });
        });

        fileStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      await this.bucket.file(filePath).delete();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getSignedUrl(filePath, options = {}) {
    try {
      const [url] = await this.bucket
        .file(filePath)
        .getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          ...options
        });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
}

module.exports = new FileUploader();
