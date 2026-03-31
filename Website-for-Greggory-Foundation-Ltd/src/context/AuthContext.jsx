import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { usersAPI, profilePhotoAPI } from '../services/api';

const defaultContext = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({}),
  register: async () => ({}),
  logout: () => {},
  forgotPassword: async () => ({}),
  resetPassword: async () => ({}),
  updateProfile: async () => ({}),
};

const AuthContext = createContext(defaultContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  // Fetch user profile photo on login/user change
  const fetchProfilePhoto = async () => {
    if (user) {
      try {
        const response = await profilePhotoAPI.getProfilePhotoUrl(user.id);
        if (response.success) {
          setProfilePhotoUrl(response.data.photoUrl);
        } else {
          console.error('Failed to fetch profile photo URL:', response.message);
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user data
          const response = await usersAPI.verifyToken(token);
          if (response.success) {
            setUser(response.data);
            await fetchProfilePhoto(); // Fetch profile photo after login
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Update profile photo URL when user changes
  useEffect(() => {
    if (user) {
      fetchProfilePhoto();
    } else {
      setProfilePhotoUrl(null);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Login attempt:', { email, password: '***' });
      
      const response = await usersAPI.login({ email, password, userType: 'user' });
      
      console.log('[AuthContext] API response:', response);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      await fetchProfilePhoto(); // Fetch profile photo after login
      
      console.log('[AuthContext] Login successful:', { user: user.email, role: user.role });
      
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    loading,
    profilePhotoUrl,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile
  }), [user, loading, profilePhotoUrl, login, register, logout, forgotPassword, resetPassword, updateProfile]);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
