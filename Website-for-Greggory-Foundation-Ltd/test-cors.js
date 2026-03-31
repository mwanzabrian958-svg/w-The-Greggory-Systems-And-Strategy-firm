#!/usr/bin/env node

// Test CORS and API Connectivity
const testCORS = async () => {
  console.log('🌐 Testing CORS and API Connectivity');
  console.log('='.repeat(60));

  try {
    // Test 1: Direct backend call
    console.log('\n1️⃣ Testing direct backend call...');
    try {
      const directResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'mwanzabrian650@gmail.com', 
          password: '***REMOVED***', 
          userType: 'user' 
        })
      });
      
      console.log('✅ Direct backend call - Status:', directResponse.status);
      const directData = await directResponse.json();
      console.log('✅ Direct backend call - Response:', directData.success ? 'SUCCESS' : 'FAILED');
      
    } catch (error) {
      console.log('❌ Direct backend call failed:', error.message);
    }

    // Test 2: Check if frontend proxy is working
    console.log('\n2️⃣ Testing frontend proxy...');
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'mwanzabrian650@gmail.com', 
          password: '***REMOVED***', 
          userType: 'user' 
        })
      });
      
      console.log('✅ Frontend proxy - Status:', proxyResponse.status);
      const proxyData = await proxyResponse.json();
      console.log('✅ Frontend proxy - Response:', proxyData.success ? 'SUCCESS' : 'FAILED');
      
    } catch (error) {
      console.log('❌ Frontend proxy failed:', error.message);
    }

    // Test 3: Check if frontend is running
    console.log('\n3️⃣ Testing frontend availability...');
    try {
      const frontendResponse = await fetch('http://localhost:5173');
      console.log('✅ Frontend available - Status:', frontendResponse.status);
    } catch (error) {
      console.log('❌ Frontend not available:', error.message);
    }

    // Test 4: Check backend health
    console.log('\n4️⃣ Testing backend health...');
    try {
      const healthResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'GET'
      });
      console.log('✅ Backend health - Status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('='.repeat(60));
    console.log('💡 If direct backend works but frontend proxy fails, the issue is in frontend');
    console.log('💡 If both fail, backend has issues');
    console.log('💡 If frontend is not available, check if Vite is running');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testCORS();
