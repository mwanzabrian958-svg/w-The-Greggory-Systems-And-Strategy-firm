/**
 * Admin Permissions System
 * Defines what each role can access
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
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
  VIEW_RECORDS: 'view_records',
  EXPORT_DATA: 'export_data',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  ACCESS_API_DOCS: 'access_api_docs',
  VIEW_DATABASE: 'view_database',
  MANAGE_BACKUPS: 'manage_backups',
  MANAGE_TEAM: 'manage_team',
  VIEW_DATA_SAFETY: 'view_data_safety',
  MANAGE_DATA_SAFETY: 'manage_data_safety'
};

export function isAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin', 'moderator'].includes(level);
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
  if (!user || !permission) return false;

  // SUPER_ADMIN and ADMIN get full access (no matrix required)
  if (hasFullAdminAccess(user)) return true;

  // MODERATOR: allowed read-only + team management; all others require matrix
  const moderatorPerms = new Set([
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.VIEW_COMMUNICATION,
    PERMISSIONS.VIEW_SUPPORT,
    PERMISSIONS.VIEW_SECURITY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.VIEW_ACTIVITY_LOGS,
    PERMISSIONS.VIEW_DATA_SAFETY,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.VIEW_DATA_SAFETY,
    PERMISSIONS.ACCESS_API_DOCS,
    PERMISSIONS.MANAGE_BACKUPS,
    PERMISSIONS.EXPORT_DATA
  ]);
  if (user.admin_level === ROLES.MODERATOR) {
    return moderatorPerms.has(permission);
  }

  // USER role: minimal read-only access
  if (user.admin_level === ROLES.USER) {
    return [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_CONTENT,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.VIEW_FINANCIAL,
      PERMISSIONS.VIEW_COMMUNICATION,
      PERMISSIONS.VIEW_SUPPORT,
      PERMISSIONS.VIEW_SECURITY,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_RECORDS,
      PERMISSIONS.VIEW_ACTIVITY_LOGS,
      PERMISSIONS.VIEW_DATA_SAFETY,
      PERMISSIONS.ACCESS_API_DOCS
    ].includes(permission);
  }

  // Fallback for any unrecognised role — deny by default
  return false;
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
 * Get navigation items based on user role.
 * If a role-permissions matrix has been saved from the Permissions Manager
 * (cached in localStorage as `gf_role_permissions`, sourced from the
 * `admin_settings` DB table), the sidebar is FILTERED by it. Without a saved
 * matrix, admins see everything (legacy behaviour).
 */
const NAV_PERMISSION_MAP = {
  '/admin/users': 'VIEW_USERS',
  '/admin/projects': 'VIEW_PROJECTS',
  '/admin/applications': 'VIEW_APPLICATIONS',
  '/admin/content': 'VIEW_CONTENT',
  '/admin/posts': 'VIEW_CONTENT',
  '/admin/portfolio': 'VIEW_CONTENT',
  '/admin/media': 'VIEW_CONTENT',
  '/admin/personnel': 'VIEW_CONTENT',
  '/admin/billing': 'VIEW_FINANCIAL',
  '/admin/reports': 'VIEW_REPORTS',
  '/admin/records': 'VIEW_RECORDS',
  '/admin/settings': 'VIEW_SETTINGS',
  '/admin/push-notifications': 'VIEW_SETTINGS',
  '/admin/support': 'VIEW_SUPPORT',
  '/admin/security': 'VIEW_SECURITY',
  '/admin/activity': 'VIEW_ACTIVITY_LOGS',
  '/admin/team': 'MANAGE_TEAM',
  '/admin/data-safety': 'VIEW_DATA_SAFETY',
  '/admin/messages': 'VIEW_COMMUNICATION',
  '/admin/permissions': 'MANAGE_ADMINS'
};

function cachedRoleLevel(user) {
  const level = user.admin_level || user.role || '';
  if (level === 'super_admin') return 'super';
  if (level === 'admin') return 'admin';
  if (level === 'moderator') return 'manager';
  return 'viewer';
}

export function getRolePermissions(user) {
  if (!user) return null;
  try {
    const matrix = JSON.parse(localStorage.getItem('gf_role_permissions') || 'null');
    if (!matrix) return null;
    const perms = matrix[cachedRoleLevel(user)];
    return Array.isArray(perms) ? perms : null;
  } catch { return null; }
}

export function getNavigationItems(user) {
  if (!user) return [];

  const allItems = [
    { path: '/admin', label: 'Dashboard', icon: 'Home' },
    { path: '/admin/users', label: 'User Management', icon: 'Users' },
    { path: '/admin/personnel', label: 'Personnel', icon: 'Users' },
    { path: '/admin/team', label: 'Team', icon: 'Users' },
    { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/admin/applications', label: 'Applications', icon: 'ClipboardList' },
    { path: '/admin/content', label: 'Blog', icon: 'Briefcase' },
    { path: '/admin/posts', label: 'Posts & Testimonials', icon: 'MessageSquare' },
    { path: '/admin/portfolio', label: 'Portfolio Manager', icon: 'Briefcase' },
    { path: '/admin/media', label: 'Media Library', icon: 'Image' },
    { path: '/admin/messages', label: 'Messages', icon: 'MessageSquare' },
    { path: '/admin/support', label: 'Support', icon: 'LifeBuoy' },
    { path: '/admin/billing', label: 'Financial Hub', icon: 'Calculator' },
    { path: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
    { path: '/admin/records', label: 'Records', icon: 'FileText' },
    { path: '/admin/security', label: 'Security', icon: 'ShieldCheck' },
    { path: '/admin/data-safety', label: 'Data Safety', icon: 'Building2' },
    { path: '/admin/activity', label: 'Activity Logs', icon: 'Activity' },
    { path: '/admin/permissions', label: 'Roles & Permissions', icon: 'KeyRound' },
    { path: '/admin/settings', label: 'Settings', icon: 'ShieldCheck' },
    { path: '/admin/push-notifications', label: 'Push Notifications', icon: 'Bell' }
  ];

  if (!isAdmin(user)) return [{ path: '/admin', label: 'Dashboard', icon: 'Home' }];

  const rolePerms = getRolePermissions(user);
  if (!rolePerms) return allItems; // no saved matrix yet — full access

  // Dashboard is always visible; everything else requires its mapped permission.
  return allItems.filter(item =>
    item.path === '/admin' || rolePerms.includes(NAV_PERMISSION_MAP[item.path])
  );
}
