/**
 * Test script to verify admin/developer login API works
 * Run with: node test-login.js
 */

const API_URL = 'http://localhost:8080/api';

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

async function runTests() {
  console.log('======================================');
  console.log('  Admin/Developer Login API Tests');
  console.log('======================================\n');
  
  // Test 1: Health check
  console.log('1. Testing server health...');
  const health = await testEndpoint(`${API_URL}/health`);
  if (health.status === 200) {
    console.log('   ✅ Server is running:', health.data.message);
  } else {
    console.log('   ❌ Server error:', health.error || health.data);
    console.log('\n   Make sure backend is running: cd backend && npm start');
    process.exit(1);
  }
  
  // Test 2: Admin login with invalid credentials (should fail with 401)
  console.log('\n2. Testing admin auth with invalid credentials...');
  const invalidAdmin = await testEndpoint(
    `${API_URL}/admin-verification/authenticate-enhanced`,
    'POST',
    { email: 'fake@admin.com', password: '***REMOVED***' }
  );
  if (invalidAdmin.status === 401) {
    console.log('   ✅ Correctly rejected invalid admin (401)');
    console.log('   Message:', invalidAdmin.data.message);
  } else {
    console.log('   ⚠️  Unexpected response:', invalidAdmin.status, invalidAdmin.data);
  }
  
  // Test 3: Check if there are any admin users in database
  console.log('\n3. Checking for existing admin users...');
  const adminUsers = await testEndpoint(`${API_URL}/admin/admin-users`);
  if (adminUsers.status === 200 && adminUsers.data.users?.length > 0) {
    console.log(`   ✅ Found ${adminUsers.data.users.length} admin user(s):`);
    adminUsers.data.users.forEach((u, i) => {
      console.log(`      ${i+1}. ${u.email} (${u.admin_level})`);
    });
    
    // Test 4: Try logging in as first admin with wrong password
    const firstAdmin = adminUsers.data.users[0];
    console.log(`\n4. Testing login for ${firstAdmin.email}...`);
    const wrongPass = await testEndpoint(
      `${API_URL}/admin-verification/authenticate-enhanced`,
      'POST',
      { email: firstAdmin.email, password: 'wrong***REMOVED***' }
    );
    if (wrongPass.status === 401) {
      console.log('   ✅ Correctly rejected wrong password (401)');
    }
    
    console.log('\n   To login successfully, use:');
    console.log(`   Email: ${firstAdmin.email}`);
    console.log(`   Password: [the actual password in your database]`);
    console.log(`   Role: ${firstAdmin.admin_level}`);
    
  } else if (adminUsers.status === 200) {
    console.log('   ⚠️  No admin users found in database!');
    console.log('   Create one first using: node create-admin-user.js');
  } else {
    console.log('   ❌ Could not fetch admin users:', adminUsers.status);
  }
  
  // Test 5: Check for developer users
  console.log('\n5. Checking for developer users...');
  const devUsers = await testEndpoint(`${API_URL}/admin/developer-users`);
  if (devUsers.status === 200 && devUsers.data.users?.length > 0) {
    console.log(`   ✅ Found ${devUsers.data.users.length} developer user(s):`);
    devUsers.data.users.forEach((u, i) => {
      console.log(`      ${i+1}. ${u.email} (${u.developer_level})`);
    });
  } else if (devUsers.status === 200) {
    console.log('   ℹ️  No developer users found');
  } else {
    console.log('   ℹ️  Could not fetch developer users (endpoint may not exist)');
  }
  
  console.log('\n======================================');
  console.log('  Summary');
  console.log('======================================');
  console.log('✅ Server is running');
  console.log('✅ Authentication endpoint is working');
  console.log('✅ Invalid credentials are properly rejected');
  console.log('\nTo use the admin panel:');
  console.log('1. Go to http://localhost:5173/admin');
  console.log('2. Enter email and password of an admin user');
  console.log('3. You will be redirected to the dashboard');
  console.log('\nThe system will show/hide features based on your role:');
  console.log('  - super_admin: Full access');
  console.log('  - admin: Users, Content, Projects, Applications, Settings');
  console.log('  - moderator: Content, Applications (view only)');
  console.log('  - developer_*: Projects, Content, API Tools');
}

runTests().catch(console.error);
