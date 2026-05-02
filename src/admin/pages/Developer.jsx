import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';

export function Developer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [developerName, setDeveloperName] = useState('');

  useEffect(() => {
    // Check if developer is logged in
    const session = sessionStorage.getItem('gf_developer_session');
    if (session) {
      const parsed = JSON.parse(session);
      setIsLoggedIn(true);
      setDeveloperName(parsed.display_name || parsed.first_name || 'Developer');
    }
  }, []);

  const handleLogin = () => {
    // Redirect to home page for login
    window.location.href = '/';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gf_developer_session');
    setIsLoggedIn(false);
    setDeveloperName('');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">Developer Platform</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Name Display */}
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="text-sm">
                {isLoggedIn ? developerName : 'Guest'}
              </span>
            </div>
            
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Blank White Page Content */}
      <div className="p-8">
        {/* Empty white space - nothing else visible */}
      </div>
    </div>
  );
}

export default Developer;
