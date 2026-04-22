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
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Content Management
  VIEW_CONTENT: 'view_content',
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  
  // Projects
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  
  // Applications
  VIEW_APPLICATIONS: 'view_applications',
  MANAGE_APPLICATIONS: 'manage_applications',
  
  // Financial
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_FINANCIAL: 'manage_financial',
  
  // System Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  
  // Admin Management (Super Admin only)
  MANAGE_ADMINS: 'manage_admins',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  
  // Developer Tools
  ACCESS_API_DOCS: 'access_api_docs',
  VIEW_DATABASE: 'view_database',
  MANAGE_BACKUPS: 'manage_backups'
};

// Permission matrix - which roles get which permissions
const PERMISSION_MATRIX = {
  [ROLES.SUPER_ADMIN]: [
    // Full access to everything
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.MANAGE_FINANCIAL,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ACTIVITY_LOGS,
    PERMISSIONS.ACCESS_API_DOCS,
    PERMISSIONS.VIEW_DATABASE,
    PERMISSIONS.MANAGE_BACKUPS
  ],
  
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.VIEW_SETTINGS
  ],
  
  [ROLES.DEVELOPER_SENIOR]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.ACCESS_API_DOCS,
    PERMISSIONS.VIEW_DATABASE,
    PERMISSIONS.MANAGE_BACKUPS,
    PERMISSIONS.VIEW_SETTINGS
  ],
  
  [ROLES.DEVELOPER_MID]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.ACCESS_API_DOCS,
    PERMISSIONS.VIEW_SETTINGS
  ],
  
  [ROLES.DEVELOPER_JUNIOR]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.ACCESS_API_DOCS
  ],
  
  [ROLES.USER]: []
};

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with admin_level or developer_level
 * @param {String} permission - Permission to check
 * @returns {Boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Determine role from user object
  const role = user.admin_level || user.developer_level || user.primary_role;
  if (!role) return false;
  
  const permissions = PERMISSION_MATRIX[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permissions
 * @returns {Boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the given permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permissions
 * @returns {Boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a role
 * @param {String} role - Role identifier
 * @returns {Array} Array of permissions
 */
export function getRolePermissions(role) {
  return PERMISSION_MATRIX[role] || [];
}

/**
 * Check if user is an admin (any level)
 * @param {Object} user 
 * @returns {Boolean}
 */
export function isAdmin(user) {
  if (!user) return false;
  return ['super_admin', 'admin', 'moderator'].includes(user.admin_level);
}

/**
 * Check if user is a developer (any level)
 * @param {Object} user 
 * @returns {Boolean}
 */
export function isDeveloper(user) {
  if (!user) return false;
  return ['senior', 'mid', 'junior'].includes(user.developer_level);
}

/**
 * Check if user is super admin
 * @param {Object} user 
 * @returns {Boolean}
 */
export function isSuperAdmin(user) {
  return user?.admin_level === ROLES.SUPER_ADMIN;
}

/**
 * Get navigation items based on user role
 * @param {Object} user 
 * @returns {Array} Navigation items
 */
export function getNavigationItems(user) {
  if (!user) return [];
  
  const items = [];
  
  // Dashboard - All admins and developers
  if (isAdmin(user) || isDeveloper(user)) {
    items.push({ path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' });
  }
  
  // Users - Admins only
  if (hasPermission(user, PERMISSIONS.VIEW_USERS)) {
    items.push({ path: '/admin/users', label: 'Users', icon: 'Users' });
  }
  
  // Content - Admins and Senior/Mid developers
  if (hasPermission(user, PERMISSIONS.VIEW_CONTENT)) {
    items.push({ path: '/admin/content', label: 'Content', icon: 'FileText' });
  }
  
  // Projects - Admins and all developers
  if (hasPermission(user, PERMISSIONS.VIEW_PROJECTS)) {
    items.push({ path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' });
  }
  
  // Applications - Admins and all developers
  if (hasPermission(user, PERMISSIONS.VIEW_APPLICATIONS)) {
    items.push({ path: '/admin/applications', label: 'Applications', icon: 'ClipboardList' });
  }
  
  // Financial - Admins only (not moderators)
  if (hasPermission(user, PERMISSIONS.VIEW_FINANCIAL)) {
    items.push({ path: '/admin/financial', label: 'Financial', icon: 'DollarSign' });
  }
  
  // Developer Tools - Developers and Super Admin
  if (hasPermission(user, PERMISSIONS.ACCESS_API_DOCS) || isSuperAdmin(user)) {
    items.push({ path: '/admin/developer', label: 'Developer', icon: 'Code2' });
  }
  
  // Activity Logs - Super Admin and Admin only
  if (hasPermission(user, PERMISSIONS.VIEW_ACTIVITY_LOGS)) {
    items.push({ path: '/admin/activity', label: 'Activity Logs', icon: 'Activity' });
  }
  
  // Settings - Admins and Senior developers
  if (hasPermission(user, PERMISSIONS.VIEW_SETTINGS)) {
    items.push({ path: '/admin/settings', label: 'Settings', icon: 'Settings' });
  }
  
  return items;
}
