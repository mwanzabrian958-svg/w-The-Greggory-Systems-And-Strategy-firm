import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, hasAnyPermission, isAdmin } from '../utils/permissions';

/**
 * AdminRoute - Protected route for admin panel
 * Restored permission protocol
 */
export function AdminRoute({ 
  children, 
  user, 
  isAuthenticated,
  requiredPermission = null,
  requiredPermissions = [],
  requireAny = false,
  fallback = '/admin/login'
}) {
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Admin and Developer checks
  if (!isAdmin(user)) {
    return <Navigate to="/admin/login" replace />;
  }

  // Permission checks
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredPermissions.length > 0) {
    if (requireAny) {
      if (!hasAnyPermission(user, requiredPermissions)) return <Navigate to="/admin" replace />;
    } else {
      const hasAll = requiredPermissions.every(p => hasPermission(user, p));
      if (!hasAll) return <Navigate to="/admin" replace />;
    }
  }
  
  return children;
}

export default AdminRoute;
