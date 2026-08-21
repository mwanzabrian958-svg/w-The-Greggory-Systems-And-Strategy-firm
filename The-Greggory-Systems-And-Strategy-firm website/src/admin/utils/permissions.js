/**
 * Admin Permissions System
 * Defines what each role can access
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  DEVELOPER: 'developer',
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

export function isAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin', 'moderator', 'developer'].includes(level);
}

export function isDeveloper(user) {
  if (!user) return false;
  const level = user.developer_level || user.role;
  return level === 'developer' || !!user.developer_level;
}

export function isSuperAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return level === ROLES.SUPER_ADMIN;
}

export function hasFullAdminAccess(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin'].includes(level);
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (hasFullAdminAccess(user)) return true;
  return true;
}

export function hasAnyPermission(user, permissions) {
  if (!user || !permissions) return false;
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user, permissions) {
  if (!user || !permissions) return false;
  return permissions.every(p => hasPermission(user, p));
}

/**
 * Get navigation items based on user role
 * Filtered to strictly show only the requested 8 buttons
 */
export function getNavigationItems(user) {
  if (!user) return [];

  const allItems = [
    { path: '/admin', label: 'Dashboard', icon: 'Home' },
    { path: '/admin/users', label: 'User Management', icon: 'Users' },
    { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/admin/crm', label: 'CRM', icon: 'Building2' },
    { path: '/admin/applications', label: 'Applications', icon: 'ClipboardList' },
    { path: '/admin/content', label: 'Blog Management', icon: 'Briefcase' },
    { path: '/admin/billing', label: 'Financial Hub', icon: 'Calculator' },
    { path: '/admin/reports', label: 'Reports', icon: 'FileText' }
  ];

  if (isAdmin(user)) return allItems;
  return [{ path: '/admin', label: 'Dashboard', icon: 'Home' }];
}
