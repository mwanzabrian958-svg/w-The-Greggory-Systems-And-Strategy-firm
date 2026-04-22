import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionData = sessionStorage.getItem('gf_admin_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Verify session is still valid with backend
        const response = await fetch(`${API_URL}/admin/verify-session`, {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        });
        
        if (response.ok) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          // Session expired
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/admin-verification/authenticate-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store session
      const session = {
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      sessionStorage.setItem('gf_admin_session', JSON.stringify(session));
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('gf_admin_session');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const sessionData = sessionStorage.getItem('gf_admin_session');
      if (!sessionData) return;
      
      const session = JSON.parse(sessionData);
      const response = await fetch(`${API_URL}/users/${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const updatedSession = { ...session, user: userData };
        sessionStorage.setItem('gf_admin_session', JSON.stringify(updatedSession));
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };
}
