import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestDBConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState({
    connection: false,
    users: false,
    createUser: false
  });

  const testConnection = async () => {
    setIsLoading(prev => ({ ...prev, connection: true }));
    try {
      const response = await axios.get('http://localhost:5000/api/test/test-db');
      setTestResult(response.data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: error.message
      });
    } finally {
      setIsLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const fetchUsers = async () => {
    setIsLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await axios.get('http://localhost:5000/api/test/test-users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to fetch users: ' + error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, users: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, createUser: true }));
    try {
      await axios.post('http://localhost:5000/api/test/test-insert', formData);
      alert('Test user created successfully!');
      setFormData({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to create test user:', error);
      alert('Failed to create test user: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(prev => ({ ...prev, createUser: false }));
    }
  };

  useEffect(() => {
    testConnection();
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connection Status</h2>
          <button
            onClick={testConnection}
            disabled={isLoading.connection}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm disabled:opacity-50"
          >
            {isLoading.connection ? 'Testing...' : 'Test Again'}
          </button>
        </div>
        
        {testResult ? (
          <div className={`p-3 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-medium">{testResult.message}</div>
            {testResult.error && (
              <div className="mt-2 p-2 bg-white rounded text-sm font-mono overflow-auto">
                {testResult.error}
              </div>
            )}
          </div>
        ) : (
          <div>Testing connection...</div>
        )}
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Database Operations</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Create Test User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Test User"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="test@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading.createUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading.createUser ? 'Creating...' : 'Create Test User'}
            </button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Users in Database</h3>
            <button
              onClick={fetchUsers}
              disabled={isLoading.users}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoading.users ? 'Refreshing...' : 'Refresh'}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {isLoading.users ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No users found in the database
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-xl font-semibold mb-3">Troubleshooting</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-yellow-800">Database connection failed?</h3>
            <ul className="mt-1 pl-5 list-disc text-sm text-yellow-700 space-y-1">
              <li>Check if your MySQL server is running</li>
              <li>Verify database credentials in your .env file</li>
              <li>Make sure the database exists and is accessible</li>
              <li>Check the backend console for detailed error messages</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-yellow-800">API requests failing?</h3>
            <ul className="mt-1 pl-5 list-disc text-sm text-yellow-700 space-y-1">
              <li>Make sure your backend server is running on port 5000</li>
              <li>Check for CORS errors in the browser console</li>
              <li>Verify the API endpoint URLs in the code</li>
              <li>Look for network errors in the browser's Network tab</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-yellow-800">Need to create the users table?</h3>
            <div className="mt-1 bg-gray-800 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
              <pre>{
`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
              }</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDBConnection;
