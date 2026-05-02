import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';

export function Developer() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in
  const [developerName, setDeveloperName] = useState("Developer's Name"); // Placeholder

  useEffect(() => {
    // Check if developer is logged in and update name
    const session = sessionStorage.getItem('gf_developer_session');
    if (session) {
      const parsed = JSON.parse(session);
      setIsLoggedIn(true);
      setDeveloperName(parsed.display_name || parsed.first_name || parsed.name || "Developer's Name");
    } else {
      // No session - show placeholder but keep Logout button (they shouldn't be here)
      setIsLoggedIn(true); // Keep Logout button as default
      setDeveloperName("Developer's Name");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('gf_developer_session');
    sessionStorage.removeItem('gf_admin_session');
    setIsLoggedIn(false);
    setDeveloperName("Developer's Name");
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">Developer Platform</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Name Display - Shows placeholder or actual name */}
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">
                {developerName}
              </span>
            </div>
            
            {/* Logout Button - Always shown since developer should be logged in */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
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
