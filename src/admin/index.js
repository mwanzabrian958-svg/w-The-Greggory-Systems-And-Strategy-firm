// Admin Module Exports
// ====================

// Components
export { AdminRoute } from './components/AdminRoute';
export { AdminLayout } from './components/AdminLayout';

// Pages
export { Dashboard } from './pages/Dashboard';
export { Users } from './pages/Users';
export { Content } from './pages/Content';
export { Projects } from './pages/Projects';
export { Applications } from './pages/Applications';
export { Developer } from './pages/Developer';
export { ActivityLogs } from './pages/Activity';
export { SettingsPage } from './pages/Settings';
export { Login } from './pages/Login';
export { CRM } from './pages/CRM';
export { Tasks } from './pages/Tasks';
export { Communication } from './pages/Communication';
export { Support } from './pages/Support';
export { Security } from './pages/Security';
export { Reports } from './pages/Reports';
export { Financial } from './pages/Financial';

// Hooks
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';

// Utilities
export { 
  ROLES, 
  PERMISSIONS, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getRolePermissions,
  isAdmin,
  isDeveloper,
  isSuperAdmin,
  getNavigationItems
} from './utils/permissions';

// Router
export { AdminRouter } from './AdminRouter';
