import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AdminRoute - Protected route for admin panel
 * Access restrictions removed - admins can access all areas
 */
export function AdminRoute({ 
  children, 
  user, 
  isAuthenticated,
  requiredPermission = null,
  requiredPermissions = [],
  requireAny = false,
  allowAdmins = true,
  allowDevelopers = false,
  fallback = '/login'
}) {
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // All access restrictions removed - authenticated admins can access all areas
  // Role-based restrictions and permission checks disabled
  
  // All checks passed - render children
  return children;
}

export default AdminRoute;