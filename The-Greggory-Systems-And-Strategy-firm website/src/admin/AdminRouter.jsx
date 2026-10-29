import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { PageLoader } from '../components/Loading';
import { Login } from './pages/Login';
import { AdvancedDashboard } from './pages/AdvancedDashboard';
import { Users } from './pages/Users';
import { Content } from './pages/Content';
import { Projects } from './pages/Projects';
import { Applications } from './pages/Applications';
import { ActivityLogs } from './pages/Activity';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { Security } from './pages/Security';
import { Reports } from './pages/Reports';
import { Billing } from './pages/Financial';
import { Communication } from './pages/Communication';
import { CreateInvoice } from './pages/CreateInvoice';
import { ManualEntry } from './pages/ManualEntry';
import { ProfitLossReport } from './pages/ProfitLossReport';
import { InvoicePreview } from './pages/InvoicePreview';
import { UserForm } from './pages/UserForm';
import { UserDetail } from './pages/UserDetail';
import { ClientPortalData } from './pages/ClientPortalData';
import { CreateBlog } from './pages/CreateBlog';
import { BlogPreview } from './pages/BlogPreview';
import { Personnel } from './pages/Personnel';
import { CreatePersonnel } from './pages/CreatePersonnel';
import { PersonnelPreview } from './pages/PersonnelPreview';
import { ProjectTasks } from './pages/ProjectTasks';
import { ProjectDetail } from './pages/ProjectDetail';
import { SearchResults } from './pages/SearchResults';
import { Team } from './pages/Team';
import { DataSafety } from './pages/DataSafety';
import { MediaLibrary } from './pages/MediaLibrary';
import { EmailInbox } from './pages/EmailInbox';
import { PermissionsManager } from './pages/PermissionsManager';
import { Records } from './pages/Records';
import { PERMISSIONS } from './utils/permissions';
import { Posts } from './pages/Posts';
import { PortfolioManager } from './pages/PortfolioManager';
import { apiCall, getApiUrl } from '../services/api';
import PushNotificationsPage from './pages/PushNotifications';

export function AdminRouter() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.removeItem('gf_admin_session');
    localStorage.removeItem('gf_admin_session_token');
    localStorage.removeItem('gf_admin_user');
    localStorage.removeItem('gf_admin_authenticated_hint');
    localStorage.removeItem('gf_role_permissions');
    verifySession();
  }, []);

  const clearAdminSession = () => {
    sessionStorage.removeItem('gf_admin_session');
    sessionStorage.removeItem('gf_admin_user');
    sessionStorage.removeItem('gf_admin_authenticated_hint');
    localStorage.removeItem('gf_admin_session');
    localStorage.removeItem('gf_admin_session_token');
    localStorage.removeItem('gf_admin_user');
    localStorage.removeItem('gf_admin_authenticated_hint');
    localStorage.removeItem('gf_role_permissions');
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('gf-admin-session-changed'));
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'gf_admin_logout_at' || !event.newValue) return;
      clearAdminSession();
      navigate('/', { replace: true });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const checkRevokedSession = async () => {
      try {
        await apiCall('/admin/session');
      } catch (error) {
        if (/401|403|session|authentication/i.test(error.message)) {
          clearAdminSession();
          navigate('/', { replace: true });
        } else {
          console.error('Admin session refresh failed:', error.message);
        }
      }
    };
    const interval = window.setInterval(checkRevokedSession, 30000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const handlePageHide = (event) => {
      if (event.persisted) return;
      try {
        localStorage.setItem('gf_admin_logout_at', String(Date.now()));
        const queued = navigator.sendBeacon(
          getApiUrl('/admin-verification/logout'),
          new Blob(['{}'], { type: 'application/json' }),
        );
        if (!queued) {
          fetch(getApiUrl('/admin-verification/logout'), {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: true,
          }).catch((error) => {
            console.warn('Admin session close could not reach the server:', error.message);
          });
        }
      } catch (error) {
        console.warn('Admin session close could not be queued:', error.message);
      }
      clearAdminSession();
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [isAuthenticated]);

  const verifySession = async () => {
    try {
      const data = await apiCall("/admin/session");
      if (data.success && data.user) { setUser(data.user); setIsAuthenticated(true); }
      else { handleLogout('/', false); }
    } catch (error) {
      if (/401|403|session|authentication/i.test(error.message)) {
        handleLogout('/', false);
      } else {
        console.error("Session sync failure", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit and revoked-session logouts return the admin to the public home page.
  const handleLogout = async (redirectTo = '/', revokeSessions = true) => {
    if (isLoggingOut) return;
    setLogoutError('');
    setIsLoggingOut(true);
    try {
      if (revokeSessions) {
        await apiCall('/admin-verification/logout', { method: 'POST' });
        localStorage.setItem('gf_admin_logout_at', String(Date.now()));
        localStorage.removeItem('gf_admin_authenticated_hint');
      }
      clearAdminSession();
      if (redirectTo === '/' || !location.pathname.includes('/login')) {
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Admin logout failed:', error.message);
      setLogoutError('Could not close this admin session. Check your connection and try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) return (
    <PageLoader
      label="Verifying session"
      messages={[
        'Verifying session',
        'Checking credentials',
        'Loading workspace',
      ]}
      tone="teal"
    />
  );

  return (
    <>
    {logoutError && (
      <div role="alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] rounded-lg bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-xl">
        {logoutError}
      </div>
    )}
    <Routes>
      <Route path="login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login onLoginSuccess={(u) => { setUser(u); setIsAuthenticated(true); }} />} />

      {/* WORKSTATIONS */}
      <Route path="billing/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreateInvoice /></AdminRoute>} />
      <Route path="billing/entry" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ManualEntry /></AdminRoute>} />
      <Route path="billing/pl-report" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProfitLossReport /></AdminRoute>} />
      <Route path="billing/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><InvoicePreview /></AdminRoute>} />
      <Route path="users/manage" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserForm /></AdminRoute>} />
      <Route path="users/manage/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserForm /></AdminRoute>} />
      <Route path="users/detail/:id/:roleType" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserDetail /></AdminRoute>} />
      <Route path="users/portal/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ClientPortalData user={user} /></AdminRoute>} />
      <Route path="content/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreateBlog /></AdminRoute>} />
      <Route path="content/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><BlogPreview /></AdminRoute>} />
      <Route path="projects/:projectId/tasks" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProjectTasks /></AdminRoute>} />
              <Route path="projects/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProjectDetail /></AdminRoute>} />
      <Route path="personnel/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreatePersonnel /></AdminRoute>} />
      <Route path="personnel/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><PersonnelPreview /></AdminRoute>} />

      <Route path="*" element={
        isAuthenticated ? (
          <AdminLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route index element={<AdvancedDashboard user={user} />} />
               <Route path="users" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_USERS}><Users /></AdminRoute>} />
               <Route path="projects" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_PROJECTS}><Projects user={user} /></AdminRoute>} />
               <Route path="billing" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_FINANCIAL}><Billing /></AdminRoute>} />
               <Route path="content" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Content user={user} /></AdminRoute>} />
               <Route path="posts" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Posts /></AdminRoute>} />
                <Route path="portfolio" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><PortfolioManager /></AdminRoute>} />

              <Route path="personnel" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Personnel /></AdminRoute>} />
               <Route path="applications" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_APPLICATIONS}><Applications /></AdminRoute>} />
               <Route path="support" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SUPPORT}><Support /></AdminRoute>} />
               <Route path="security" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SECURITY}><Security /></AdminRoute>} />
               <Route path="reports" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_REPORTS}><Reports user={user} /></AdminRoute>} />
               <Route path="records" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_RECORDS}><Records user={user} /></AdminRoute>} />
               <Route path="settings" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings user={user} /></AdminRoute>} />
               <Route path="activity" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_ACTIVITY_LOGS}><ActivityLogs /></AdminRoute>} />
               <Route path="team" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.MANAGE_TEAM}><Team /></AdminRoute>} />
               <Route path="data-safety" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_DATA_SAFETY}><DataSafety /></AdminRoute>} />
                <Route path="media" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><MediaLibrary /></AdminRoute>} />
                <Route path="messages" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><EmailInbox /></AdminRoute>} />
                <Route path="communication" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><Communication /></AdminRoute>} />
                <Route path="permissions" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><PermissionsManager /></AdminRoute>} />
               <Route path="push-notifications" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><PushNotificationsPage /></AdminRoute>} />
                <Route path="search" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><SearchResults /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
    </Routes>
    </>
  );
}
