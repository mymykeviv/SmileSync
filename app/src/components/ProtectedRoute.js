import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requiredPermission, 
  requiredPermissions,
  requireAllPermissions = false,
  fallbackPath = '/unauthorized'
}) => {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    hasRole, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check single role access
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check multiple roles access (user needs ANY of the roles)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role));
    if (!hasAnyRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check single permission access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check multiple permissions access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;