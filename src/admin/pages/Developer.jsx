import React, { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Developer() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in
  const [developerName, setDeveloperName] = useState("Developer's Name"); // Placeholder
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [developerId, setDeveloperId] = useState(null);

  useEffect(() => {
    // Check if developer is logged in - uses gf_admin_user for both admin and developer
    const userData = sessionStorage.getItem('gf_admin_user');
    const token = sessionStorage.getItem('gf_admin_session_token');
    
    if (userData && token) {
      const parsed = JSON.parse(userData);
      setIsLoggedIn(true);
      setDeveloperName(parsed.display_name || parsed.first_name || parsed.name || "Developer's Name");
      setDeveloperId(parsed.id);
      
      // Fetch profile photo if available
      if (parsed.id && parsed.profile_photo) {
        fetchProfilePhoto(parsed.id, token);
      }
    } else {
      // No session - show placeholder but keep Logout button
      setIsLoggedIn(true);
      setDeveloperName("Developer's Name");
    }
  }, []);

  const fetchProfilePhoto = async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/admin/profile-photo/developer/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.photoUrl) {
          setProfilePhoto(data.photoUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile photo:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gf_admin_session_token');
    sessionStorage.removeItem('gf_admin_user');
    setIsLoggedIn(false);
    setDeveloperName("Developer's Name");
    setProfilePhoto(null);
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
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">
                {developerName}
              </span>
              
              {/* Profile Photo or User Icon */}
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
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
