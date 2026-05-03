import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Content } from './pages/Content';
import { Projects } from './pages/Projects';
import { Applications } from './pages/Applications';
import { Developer } from './pages/Developer';
import { ActivityLogs } from './pages/Activity';
import { SettingsPage } from './pages/Settings';
import { PERMISSIONS } from './utils/permissions';

/**
 * AdminRouter - Main routing component for the admin panel
 * Handles authentication state and route protection
 */
export function AdminRouter() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const sessionData = sessionStorage.getItem('gf_admin_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is expired
        if (session.expiresAt && session.expiresAt > Date.now()) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          // Session expired - clear it
          sessionStorage.removeItem('gf_admin_session');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      sessionStorage.removeItem('gf_admin_session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gf_admin_session');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route - Public */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        } 
      />

      {/* Admin Routes - Protected */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AdminLayout user={user} onLogout={handleLogout}>
              <Routes>
                {/* Dashboard - All authenticated admins/developers */}
                <Route 
                  path="/" 
                  element={<Dashboard user={user} />} 
                />

                {/* Users - Requires VIEW_USERS permission */}
                <Route 
                  path="users" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_USERS}
                    >
                      <Users user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Content Management - Requires VIEW_CONTENT permission */}
                <Route 
                  path="content" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_CONTENT}
                    >
                      <Content user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Projects - Requires VIEW_PROJECTS permission */}
                <Route 
                  path="projects" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_PROJECTS}
                      allowAdmins={true}
                      allowDevelopers={true}
                    >
                      <Projects user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Applications - Requires VIEW_APPLICATIONS permission */}
                <Route 
                  path="applications" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_APPLICATIONS}
                    >
                      <Applications user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Financial - Requires VIEW_FINANCIAL permission */}
                <Route 
                  path="financial" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_FINANCIAL}
                    >
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <h2 className="text-lg font-medium text-gray-900">Financial Management</h2>
                          <p className="text-gray-500 mt-1">Financial module coming soon.</p>
                        </div>
                      </div>
                    </AdminRoute>
                  } 
                />

                {/* Activity Logs - Requires VIEW_LOGS permission */}
                <Route 
                  path="activity" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_LOGS}
                    >
                      <ActivityLogs user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Settings - Requires VIEW_SETTINGS permission */}
                <Route 
                  path="settings" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_SETTINGS}
                    >
                      <SettingsPage user={user} />
                    </AdminRoute>
                  } 
                />

                {/* 404 - Catch all */}
                <Route 
                  path="*" 
                  element={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">404</h2>
                        <p className="text-gray-600">Page not found</p>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default AdminRouter;
