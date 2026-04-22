const http = require('http');

const postData = JSON.stringify({
  email: 'admin@greggoryfoundation.org',
  password: '***REMOVED***'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin-verification/authenticate-enhanced',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing admin auth...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', data);
    try {
      const json = JSON.parse(data);
      console.log('PARSED:', json);
    } catch (e) {
      console.log('Not JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
