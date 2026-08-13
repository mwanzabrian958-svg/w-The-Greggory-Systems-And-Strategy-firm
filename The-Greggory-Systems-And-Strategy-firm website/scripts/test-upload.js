const fileUploader = require('../src/utils/fileUpload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testUpload() {
  try {
    console.log('Starting file upload test...');
    
    // Create a test file
    const testDir = path.join(__dirname, '../test-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testFilePath = path.join(testDir, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Google Cloud Storage upload');

    // Prepare file object similar to what multer would provide
    const file = {
      originalname: 'test-upload.txt',
      mimetype: 'text/plain',
      buffer: fs.readFileSync(testFilePath),
      size: fs.statSync(testFilePath).size
    };

    console.log('Uploading test file...');
    const result = await fileUploader.uploadFile(file, 'test-uploads');
    
    console.log('\nUpload successful!');
    console.log('File Details:');
    console.log('- File Name:', result.fileName);
    console.log('- File Path:', result.filePath);
    console.log('- Public URL:', result.publicUrl);
    console.log('- Content Type:', result.contentType);
    console.log('- File Size:', result.size, 'bytes');

    // Test getting a signed URL
    console.log('\nGenerating signed URL...');
    const signedUrl = await fileUploader.getSignedUrl(result.filePath);
    console.log('Signed URL (valid for 15 min):', signedUrl);

    // Test file deletion (uncomment to enable)
    // console.log('\nDeleting test file...');
    // await fileUploader.deleteFile(result.filePath);
    // console.log('File deleted successfully');
    
    // Clean up local test file
    fs.unlinkSync(testFilePath);
    console.log('\nLocal test file removed');
    
    return result;
  } catch (error) {
    console.error('Test upload failed:', error);
    throw error;
  }
}

// Run the test
testUpload()
  .then(() => console.log('\nTest completed successfully!'))
  .catch(console.error);
