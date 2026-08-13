import { useMemo } from 'react';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  isAdmin,
  isDeveloper,
  isSuperAdmin,
  getNavigationItems,
  PERMISSIONS
} from '../utils/permissions';

export function usePermissions(user) {
  return useMemo(() => ({
    // Permission checks
    can: (permission) => hasPermission(user, permission),
    canAny: (permissions) => hasAnyPermission(user, permissions),
    canAll: (permissions) => hasAllPermissions(user, permissions),
    
    // Role checks
    isAdmin: () => isAdmin(user),
    isDeveloper: () => isDeveloper(user),
    isSuperAdmin: () => isSuperAdmin(user),
    
    // Navigation
    getNavigation: () => getNavigationItems(user),
    
    // User data
    user,
    role: user?.admin_level || user?.developer_level || user?.primary_role,
    
    // Constants for convenience
    PERMISSIONS
  }), [user]);
}
