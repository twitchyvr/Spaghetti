import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  requireAll = false,
  fallback = null,
  showFallback = true
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't show content
  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Get user roles from user object
  const userRoles = user.userRoles?.map(ur => ur.role?.name).filter(Boolean) || [];
  
  // Convert roles to array if string
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  // Check role requirements
  const hasAccess = requireAll
    ? requiredRoles.every(role => userRoles.includes(role))
    : requiredRoles.some(role => userRoles.includes(role));

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
};

interface RoleBasedProps {
  children: React.ReactNode;
  role: string;
  fallback?: React.ReactNode;
}

/**
 * Simple role-based wrapper component
 */
export const RequireRole: React.FC<RoleBasedProps> = ({
  children,
  role,
  fallback = null
}) => (
  <RoleGuard roles={role} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Platform admin only wrapper
 */
export const RequirePlatformAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleGuard roles="Platform.Admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Client admin or higher wrapper
 */
export const RequireClientAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleGuard roles={["Platform.Admin", "Client.Admin"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Hook to check user roles
 */
export const useRoles = () => {
  const { user, isAuthenticated } = useAuth();

  const userRoles = user?.userRoles?.map(ur => ur.role?.name).filter(Boolean) || [];

  const hasRole = (role: string) => userRoles.includes(role);

  const hasAnyRole = (roles: string[]) => roles.some(role => userRoles.includes(role));

  const hasAllRoles = (roles: string[]) => roles.every(role => userRoles.includes(role));

  const isPlatformAdmin = hasRole('Platform.Admin');
  const isClientAdmin = hasRole('Client.Admin');
  const isUser = hasRole('Client.User');

  return {
    userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isPlatformAdmin,
    isClientAdmin,
    isUser,
    isAuthenticated
  };
};