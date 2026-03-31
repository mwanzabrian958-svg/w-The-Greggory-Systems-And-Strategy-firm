#!/usr/bin/env node

// Test Login API Directly
require('dotenv').config();

const testLoginAPI = async () => {
  console.log('🧪 Testing Login API');
  console.log('='.repeat(40));

  try {
    // Test common credentials
    const testCredentials = [
      { email: 'muenimwa11@gmail.com', password: 'password' },
      { email: 'muenimwa11@gmail.com', password: 'Password123' },
      { email: 'muenimwa11@gmail.com', password: '***REMOVED***' },
      { email: 'admin@example.com', password: '***REMOVED***' },
      { email: 'test@example.com', password: 'password' }
    ];

    for (const credentials of testCredentials) {
      console.log(`\n🔍 Testing: ${credentials.email} / ${credentials.password}`);
      
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        console.log(`📊 Status: ${response.status}`);
        console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
          console.log('✅ JSON Response:', responseData);
          
          if (response.ok && responseData.success) {
            console.log('🎉 LOGIN SUCCESSFUL!');
            console.log(`🎫 Token: ${responseData.token?.substring(0, 50)}...`);
            console.log(`👤 User: ${responseData.user?.first_name} ${responseData.user?.last_name}`);
            console.log(`🔑 Role: ${responseData.user?.role}`);
            console.log('\n💡 Use these credentials to login in the browser!');
          }
        } else {
          const text = await response.text();
          console.log('⚠️  Non-JSON Response:', text.substring(0, 200));
        }

      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLoginAPI();
