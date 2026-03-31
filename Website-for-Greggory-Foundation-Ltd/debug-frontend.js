#!/usr/bin/env node

// Debug Frontend Login Flow
const testFrontendLogin = async () => {
  console.log('🧪 Testing Frontend Login Flow');
  console.log('='.repeat(50));

  try {
    // Test 1: Direct API call (like my working test)
    console.log('\n1️⃣ Testing direct API call...');
    const directResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'mwanzabrian650@gmail.com', 
        password: '***REMOVED***', 
        userType: 'user' 
      })
    });
    
    console.log('Direct API Status:', directResponse.status);
    const directData = await directResponse.json();
    console.log('Direct API Response:', directData);
    
    // Test 2: Test with usersAPI.login function
    console.log('\n2️⃣ Testing usersAPI.login function...');
    
    // Import usersAPI
    const { usersAPI } = await import('./src/services/api.js');
    
    try {
      const apiResponse = await usersAPI.login({ 
        email: 'mwanzabrian650@gmail.com', 
        password: '***REMOVED***', 
        userType: 'user' 
      });
      
      console.log('UsersAPI Response:', apiResponse);
      
      if (apiResponse.data && apiResponse.data.success) {
        console.log('✅ UsersAPI login successful');
      } else {
        console.log('❌ UsersAPI login failed');
        console.log('Error:', apiResponse.message || 'Unknown error');
      }
      
    } catch (error) {
      console.log('❌ UsersAPI error:', error.message);
    }
    
    // Test 3: Test AuthContext login function
    console.log('\n3️⃣ Testing AuthContext login function...');
    
    try {
      // Mock localStorage
      global.localStorage = {
        setItem: (key, value) => console.log(`📦 localStorage set ${key}:`, value),
        getItem: (key) => global.localStorage[key] || null
      };
      
      // Mock setUser
      let mockUser = null;
      const setUser = (user) => {
        mockUser = user;
        console.log('👤 setUser called with:', user);
      };
      
      // Mock fetchProfilePhoto
      const fetchProfilePhoto = async () => {
        console.log('📸 fetchProfilePhoto called');
      };
      
      // Simulate AuthContext login
      const login = async (email, password) => {
        try {
          console.log('[AuthContext] Login attempt:', { email, password: '***' });
          
          const credentials = { email, password, userType: 'user' };
          console.log('[AuthContext] Sending credentials:', { email, userType: 'user' });
          
          const response = await usersAPI.login(credentials);
          
          console.log('[AuthContext] API response:', response);
          console.log('[AuthContext] Response data:', response.data);
          
          if (!response.data) {
            console.error('[AuthContext] No response data');
            return { success: false, message: 'No response from server' };
          }
          
          const { token, user } = response.data;
          
          if (!token || !user) {
            console.error('[AuthContext] Missing token or user in response');
            return { success: false, message: 'Invalid server response' };
          }
          
          localStorage.setItem('token', token);
          setUser(user);
          await fetchProfilePhoto();
          
          console.log('[AuthContext] Login successful:', { user: user.email, role: user.role });
          
          return { success: true };
        } catch (error) {
          console.error('[AuthContext] Login error:', error);
          console.error('[AuthContext] Error message:', error.message);
          return { 
            success: false, 
            message: error.message || 'Login failed' 
          };
        }
      };
      
      const authResult = await login('mwanzabrian650@gmail.com', '***REMOVED***');
      console.log('AuthContext Result:', authResult);
      
    } catch (error) {
      console.log('❌ AuthContext error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testFrontendLogin();
