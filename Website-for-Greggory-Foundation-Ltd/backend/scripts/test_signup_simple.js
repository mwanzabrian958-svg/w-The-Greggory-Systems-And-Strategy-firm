const fetch = require('node-fetch');

(async () => {
  try {
    console.log('Testing registration WITHOUT photo...');
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: '***REMOVED***4',
        firstName: 'Jane',
        lastName: 'Smith'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Registration successful without photo!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
