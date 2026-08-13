/**
 * Admin Permissions System
 * Defines what each role can access
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  DEVELOPER_SENIOR: 'senior',
  DEVELOPER_MID: 'mid',
  DEVELOPER_JUNIOR: 'junior',
  USER: 'user'
};

export const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  VIEW_CONTENT: 'view_content',
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  VIEW_APPLICATIONS: 'view_applications',
  MANAGE_APPLICATIONS: 'manage_applications',
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_FINANCIAL: 'manage_financial',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  VIEW_DEVELOPER: 'view_developer',
  VIEW_CRM: 'view_crm',
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_TASKS: 'view_tasks',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_COMMUNICATION: 'view_communication',
  SEND_MESSAGES: 'send_messages',
  VIEW_SUPPORT: 'view_support',
  MANAGE_TICKETS: 'manage_tickets',
  VIEW_SECURITY: 'view_security',
  AUDIT_LOGS: 'audit_logs',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  ACCESS_API_DOCS: 'access_api_docs',
  VIEW_DATABASE: 'view_database',
  MANAGE_BACKUPS: 'manage_backups'
};

/**
 * Check if user is an admin (any level)
 */
export function isAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin', 'moderator'].includes(level);
}

/**
 * Check if user has full admin access
 */
export function hasFullAdminAccess(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin'].includes(level);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  if (hasFullAdminAccess(user)) return true;
  return true;
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !permissions) return false;
  if (hasFullAdminAccess(user)) return true;
  return permissions.some(p => hasPermission(user, p));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !permissions) return false;
  if (hasFullAdminAccess(user)) return true;
  return permissions.every(p => hasPermission(user, p));
}

export function isDeveloper(user) {
  if (!user) return false;
  return user.role === 'developer' || !!user.developer_level;
}

export function isSuperAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return level === ROLES.SUPER_ADMIN;
}

/**
 * Get navigation items based on user role
 * RESTORED: Uses your full mission-critical list
 */
export function getNavigationItems(user) {
  if (!user) return [];

  if (hasFullAdminAccess(user)) {
    return [
      { path: '/admin', label: 'Dashboard', icon: 'Home' },
      { path: '/admin/users', label: 'User Management', icon: 'Users' },
      { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' },
      { path: '/admin/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/admin/crm', label: 'CRM', icon: 'Building2' },
      { path: '/admin/applications', label: 'Applications', icon: 'ClipboardList' },
      { path: '/admin/content', label: 'Blog Management', icon: 'Briefcase' },
      { path: '/admin/financial', label: 'Financial Hub', icon: 'Calculator' },
      { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
      { path: '/admin/reports', label: 'Reports', icon: 'FileText' },
      { path: '/admin/communication', label: 'Communication', icon: 'MessageSquare' },
      { path: '/admin/support', label: 'Support', icon: 'LifeBuoy' },
      { path: '/admin/security', label: 'Security', icon: 'ShieldCheck' },
      { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
      { path: '/admin/activity', label: 'Activity Logs', icon: 'Activity' }
    ];
  }

  // Developer node fallback
  if (isDeveloper(user)) {
    return [
      { path: '/admin', label: 'Dashboard', icon: 'Home' },
      { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' }
    ];
  }

  return [{ path: '/admin', label: 'Dashboard', icon: 'Home' }];
}
