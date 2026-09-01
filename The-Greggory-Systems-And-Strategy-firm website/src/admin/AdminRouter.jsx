import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { Login } from './pages/Login';
import { AdvancedDashboard } from './pages/AdvancedDashboard';
import { Users } from './pages/Users';
import { Content } from './pages/Content';
import { Projects } from './pages/Projects';
import { Applications } from './pages/Applications';
import { ActivityLogs } from './pages/Activity';
import { Settings } from './pages/Settings';
import { CRM } from './pages/CRM';
import { Support } from './pages/Support';
import { Security } from './pages/Security';
import { Reports } from './pages/Reports';
import { Billing } from './pages/Financial';
import { CreateInvoice } from './pages/CreateInvoice';
import { ManualEntry } from './pages/ManualEntry';
import { ProfitLossReport } from './pages/ProfitLossReport';
import { InvoicePreview } from './pages/InvoicePreview';
import { UserForm } from './pages/UserForm';
import { UserDetail } from './pages/UserDetail';
import { CreateBlog } from './pages/CreateBlog';
import { BlogPreview } from './pages/BlogPreview';
import { Personnel } from './pages/Personnel';
import { CreatePersonnel } from './pages/CreatePersonnel';
import { PersonnelPreview } from './pages/PersonnelPreview';
import { ProjectTasks } from './pages/ProjectTasks';
import { SearchResults } from './pages/SearchResults';
import { Team } from './pages/Team';
import { DataSafety } from './pages/DataSafety';
import { PERMISSIONS } from './utils/permissions';
import { apiCall } from '../services/api';

export function AdminRouter() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { verifySession(); }, []);

  const verifySession = async () => {
    try {
      const sessionStr = sessionStorage.getItem('gf_admin_session') || localStorage.getItem('gf_admin_session');
      if (!sessionStr || sessionStr === "undefined") { setIsLoading(false); return; }
      const session = JSON.parse(sessionStr);
      const token = session?.token || localStorage.getItem('gf_admin_session_token');
      if (!token) { setIsLoading(false); return; }
      const data = await apiCall("/admin/session", { headers: { 'Authorization': `Bearer ${token}` } });
      if (data.success && data.user) { setUser(data.user); setIsAuthenticated(true); } else { handleLogout(); }
    } catch (e) { console.error("Session sync failure", e); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.clear(); localStorage.clear(); setUser(null); setIsAuthenticated(false);
    if (!location.pathname.includes('/login')) navigate('/admin/login', { replace: true });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[7px] font-black text-slate-600 uppercase tracking-[0.6em]">Synchronizing Secure Relay...</p>
    </div>
  );

  return (
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
      <Route path="content/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreateBlog /></AdminRoute>} />
      <Route path="content/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><BlogPreview /></AdminRoute>} />
      <Route path="projects/:projectId/tasks" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProjectTasks /></AdminRoute>} />
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
               <Route path="crm" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CRM}><CRM /></AdminRoute>} />
               <Route path="content" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Content user={user} /></AdminRoute>} />
              <Route path="personnel" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Personnel /></AdminRoute>} />
               <Route path="applications" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_APPLICATIONS}><Applications /></AdminRoute>} />
               <Route path="support" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SUPPORT}><Support /></AdminRoute>} />
               <Route path="security" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SECURITY}><Security /></AdminRoute>} />
               <Route path="reports" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_REPORTS}><Reports user={user} /></AdminRoute>} />
               <Route path="settings" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings user={user} /></AdminRoute>} />
               <Route path="activity" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_ACTIVITY_LOGS}><ActivityLogs /></AdminRoute>} />
               <Route path="team" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.MANAGE_TEAM}><Team /></AdminRoute>} />
               <Route path="data-safety" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_DATA_SAFETY}><DataSafety /></AdminRoute>} />
               <Route path="search" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><SearchResults /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
    </Routes>
  );
}
