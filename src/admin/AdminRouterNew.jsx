import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdvancedDashboard } from './pages/AdvancedDashboard';
import { Users } from './pages/Users';
import { Content } from './pages/Content';
import { Projects } from './pages/Projects';
import { Applications } from './pages/Applications';
import { Developer } from './pages/Developer';
import { ActivityLogs } from './pages/Activity';
import { SettingsPage } from './pages/Settings';
import { PERMISSIONS } from './utils/permissions';

/**
 * AdminRouterNew - Enhanced routing component for the admin panel
 * Includes advanced dashboard and comprehensive feature navigation
 */
export function AdminRouterNew() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const sessionData = sessionStorage.getItem('gf_admin_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.expiresAt && session.expiresAt > Date.now()) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
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

      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AdminLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="advanced" element={<AdvancedDashboard user={user} />} />
                <Route 
                  path="developer" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_DEVELOPER}
                    >
                      <Developer user={user} />
                    </AdminRoute>
                  } 
                />
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
                <Route 
                  path="activity" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_ACTIVITY_LOGS}
                    >
                      <ActivityLogs user={user} />
                    </AdminRoute>
                  } 
                />
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

export default AdminRouterNew;