import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, isAdmin, isDeveloper } from '../utils/permissions';

/**
 * AdminRoute - Protected route for admin panel
 * Checks authentication and optionally specific permissions
 */
export function AdminRoute({ 
  children, 
  user, 
  isAuthenticated,
  requiredPermission = null,
  requiredPermissions = [],
  requireAny = false, // If true, user needs ANY of the requiredPermissions. If false, needs ALL
  allowAdmins = true,
  allowDevelopers = false,
  fallback = '/login'
}) {
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  const isUserAdmin = isAdmin(user);
  const isUserDeveloper = isDeveloper(user);
  
  const roleAllowed = (allowAdmins && isUserAdmin) || (allowDevelopers && isUserDeveloper);
  
  if (!roleAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this area.</p>
          <p className="text-sm text-gray-500 mt-2">
            Role: {user.admin_level || user.developer_level || user.primary_role}
          </p>
        </div>
      </div>
    );
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Permission Required</h1>
          <p className="text-gray-600">You need additional permissions to access this feature.</p>
          <p className="text-sm text-gray-500 mt-2">
            Required: {requiredPermission}
          </p>
        </div>
      </div>
    );
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAny
      ? requiredPermissions.some(p => hasPermission(user, p))
      : requiredPermissions.every(p => hasPermission(user, p));

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Permissions Required</h1>
            <p className="text-gray-600">
              You need {requireAny ? 'one of' : 'all of'} the following permissions:
            </p>
            <ul className="text-sm text-gray-500 mt-2">
              {requiredPermissions.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  }

  // All checks passed - render children
  return children;
}

export default AdminRoute;
