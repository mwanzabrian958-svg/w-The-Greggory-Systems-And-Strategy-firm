const http = require('http');

const testData = {
  email: 'testuser@example.com',
  password: '***REMOVED***',
  firstName: 'Test',
  lastName: 'User'
};

console.log('[TEST] Attempting to register user:', testData.email);

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/register-simple',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`[TEST] Status Code: ${res.statusCode}`);
  console.log(`[TEST] Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[TEST] Response body:', data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('\n✅ SUCCESS! User registered with ID:', parsed.userId);
        console.log('\n[TEST] Now checking users list...');
        
        // Get users list
        const optionsGet = {
          hostname: 'localhost',
          port: 8080,
          path: '/api/auth/users-list',
          method: 'GET'
        };
        
        const reqGet = http.request(optionsGet, (res2) => {
          let data2 = '';
          res2.on('data', (chunk) => {
            data2 += chunk;
          });
          res2.on('end', () => {
            const users = JSON.parse(data2);
            console.log('\n[TEST] Total users in database:', users.totalUsers);
            console.log('[TEST] Users:', users.users);
          });
        });
        
        reqGet.on('error', (error) => {
          console.error('[TEST] Error getting users:', error);
        });
        reqGet.end();
      } else {
        console.log('\n❌ FAILED:', parsed.message);
      }
    } catch (e) {
      console.log('[TEST] Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('[TEST] Error:', error);
  process.exit(1);
});

req.write(postData);
req.end();

console.log('[TEST] Request sent...\n');
