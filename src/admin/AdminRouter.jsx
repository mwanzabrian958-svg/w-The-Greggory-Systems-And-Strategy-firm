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
import { Settings } from './pages/Settings';
import { CRM } from './pages/CRM';
import { Tasks } from './pages/Tasks';
import { Communication } from './pages/Communication';
import { Support } from './pages/Support';
import { Security } from './pages/Security';
import { Reports } from './pages/Reports';
import { Financial } from './pages/Financial';
import { PERMISSIONS } from './utils/permissions';

/**
 * AdminRouter - Main routing component for the admin panel
 * UPDATED: Admins now have full access to all routes without permission restrictions
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

                {/* Developer Portal - Requires VIEW_DEVELOPER permission (but admins bypass) */}
                <Route 
                  path="developer" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_DEVELOPER}
                      allowAdmins={true}
                    >
                      <Developer user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Users - Admins have full access, others need VIEW_USERS permission */}
                <Route 
                  path="users" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_USERS}
                      allowAdmins={true}
                    >
                      <Users user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Content Management - Admins have full access */}
                <Route 
                  path="content" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_CONTENT}
                      allowAdmins={true}
                    >
                      <Content user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Projects - Admins and developers have access */}
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

                {/* Applications - Admins have full access */}
                <Route 
                  path="applications" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_APPLICATIONS}
                      allowAdmins={true}
                    >
                      <Applications user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Financial - Admins have full access */}
                <Route 
                  path="financial" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_FINANCIAL}
                      allowAdmins={true}
                    >
                      <Financial user={user} />
                    </AdminRoute>
                  } 
                />

                {/* CRM - Admins have full access */}
                <Route 
                  path="crm" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_CRM, PERMISSIONS.MANAGE_CLIENTS]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <CRM user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Tasks - Admins have full access */}
                <Route 
                  path="tasks" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_TASKS, PERMISSIONS.MANAGE_PROJECTS]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Tasks user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Communication - Admins have full access */}
                <Route 
                  path="communication" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_COMMUNICATION, PERMISSIONS.SEND_MESSAGES]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Communication user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Support - Admins have full access */}
                <Route 
                  path="support" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_SUPPORT, PERMISSIONS.MANAGE_TICKETS]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Support user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Security - Admins have full access */}
                <Route 
                  path="security" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_SECURITY, PERMISSIONS.AUDIT_LOGS]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Security user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Reports - Admins have full access */}
                <Route 
                  path="reports" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_DATA]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Reports user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Activity Logs - Admins have full access */}
                <Route 
                  path="activity" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_ACTIVITY_LOGS}
                      allowAdmins={true}
                    >
                      <ActivityLogs user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Settings - Admins have full access */}
                <Route 
                  path="settings" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermissions={[PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.EDIT_SETTINGS]}
                      requireAny={true}
                      allowAdmins={true}
                    >
                      <Settings user={user} />
                    </AdminRoute>
                  } 
                />

                {/* Analytics - Admins have full access */}
                <Route 
                  path="analytics" 
                  element={
                    <AdminRoute
                      user={user}
                      isAuthenticated={isAuthenticated}
                      requiredPermission={PERMISSIONS.VIEW_REPORTS}
                      allowAdmins={true}
                    >
                      <Reports user={user} />
                    </AdminRoute>
                  } 
                />

                {/* 404 Page */}
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