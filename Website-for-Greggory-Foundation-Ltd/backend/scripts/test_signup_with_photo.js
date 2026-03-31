const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

(async () => {
  // Create a simple test image (1x1 pixel PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  const tempImagePath = '/tmp/test-photo.png';
  fs.writeFileSync(tempImagePath, pngData);

  const form = new FormData();
  form.append('email', 'testuser@example.com');
  form.append('password', '***REMOVED***4');
  form.append('firstName', 'John');
  form.append('lastName', 'Doe');
  form.append('photo', fs.createReadStream(tempImagePath));

  try {
    console.log('Sending registration request with photo...');
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    fs.unlinkSync(tempImagePath);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
