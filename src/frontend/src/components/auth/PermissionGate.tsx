import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: string | string[];
  resource?: string;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  resource,
  requireAll = false,
  fallback = null,
  showFallback = true
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't show content
  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  // For demo purposes, we'll use a simplified permission check
  // In a real implementation, this would use the user's permissions from the backend
  const userPermissions = getUserPermissions(user);
  
  // Convert permissions to array if string
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  // Build full permission strings with resource if provided
  const fullPermissions = requiredPermissions.map(permission => 
    resource ? `${permission}.${resource}` : permission
  );

  // Check permission requirements
  const hasAccess = requireAll
    ? fullPermissions.every(permission => {
        const basePermission = permission.includes('.') ? permission.split('.')[0] ?? permission : permission;
        return userPermissions.includes(permission) || userPermissions.includes(basePermission);
      })
    : fullPermissions.some(permission => {
        const basePermission = permission.includes('.') ? permission.split('.')[0] ?? permission : permission;
        return userPermissions.includes(permission) || userPermissions.includes(basePermission);
      });

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
};

interface PermissionBasedProps {
  children: React.ReactNode;
  permission: string;
  resource?: string;
  fallback?: React.ReactNode;
}

/**
 * Simple permission-based wrapper component
 */
export const RequirePermission: React.FC<PermissionBasedProps> = ({
  children,
  permission,
  resource,
  fallback = null
}) => (
  <PermissionGate permissions={permission} resource={resource || undefined} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * Document management permission wrapper
 */
export const RequireDocumentPermission: React.FC<{
  children: React.ReactNode;
  action: 'create' | 'read' | 'update' | 'delete' | 'publish' | 'share';
  fallback?: React.ReactNode;
}> = ({ children, action, fallback = null }) => (
  <PermissionGate permissions={`document.${action}`} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * Platform management permission wrapper
 */
export const RequirePlatformPermission: React.FC<{
  children: React.ReactNode;
  action: 'manage_tenants' | 'manage_users' | 'view_analytics' | 'impersonate';
  fallback?: React.ReactNode;
}> = ({ children, action, fallback = null }) => (
  <PermissionGate permissions={`platform.${action}`} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const userPermissions = getUserPermissions(user);

  const hasPermission = (permission: string, resource?: string) => {
    const fullPermission = resource ? `${permission}.${resource}` : permission;
    return userPermissions.includes(fullPermission) || userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[], resource?: string) => 
    permissions.some(permission => hasPermission(permission, resource));

  const hasAllPermissions = (permissions: string[], resource?: string) => 
    permissions.every(permission => hasPermission(permission, resource));

  // Document permissions
  const canCreateDocuments = hasPermission('document.create');
  const canReadDocuments = hasPermission('document.read');
  const canUpdateDocuments = hasPermission('document.update');
  const canDeleteDocuments = hasPermission('document.delete');
  const canPublishDocuments = hasPermission('document.publish');
  const canShareDocuments = hasPermission('document.share');

  // Platform permissions
  const canManageTenants = hasPermission('platform.manage_tenants');
  const canManageUsers = hasPermission('platform.manage_users');
  const canViewPlatformAnalytics = hasPermission('platform.view_analytics');
  const canImpersonateUsers = hasPermission('platform.impersonate');

  // Client permissions
  const canManageClientUsers = hasPermission('client.manage_users');
  const canManageClientSettings = hasPermission('client.manage_settings');
  const canViewClientAnalytics = hasPermission('client.view_analytics');
  const canManageClientBilling = hasPermission('client.manage_billing');

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Document permissions
    canCreateDocuments,
    canReadDocuments,
    canUpdateDocuments,
    canDeleteDocuments,
    canPublishDocuments,
    canShareDocuments,
    // Platform permissions
    canManageTenants,
    canManageUsers,
    canViewPlatformAnalytics,
    canImpersonateUsers,
    // Client permissions
    canManageClientUsers,
    canManageClientSettings,
    canViewClientAnalytics,
    canManageClientBilling,
    isAuthenticated
  };
};

/**
 * Helper function to extract user permissions
 * In a real implementation, this would come from the backend
 */
function getUserPermissions(user: any): string[] {
  if (!user) return [];

  // Extract permissions from roles
  const rolePermissions: string[] = [];
  
  if (user.userRoles) {
    user.userRoles.forEach((userRole: any) => {
      if (userRole.role?.rolePermissions) {
        userRole.role.rolePermissions.forEach((rolePermission: any) => {
          if (rolePermission.isGranted) {
            const permission = rolePermission.resource 
              ? `${rolePermission.permission}.${rolePermission.resource}`
              : rolePermission.permission;
            rolePermissions.push(permission);
          }
        });
      }
    });
  }

  // For demo purposes, assign permissions based on user type
  const demoPermissions: string[] = [];
  
  switch (user.userType) {
    case 'PlatformAdmin':
      demoPermissions.push(
        'platform.manage_tenants',
        'platform.manage_users',
        'platform.view_analytics',
        'platform.impersonate',
        'document.create',
        'document.read',
        'document.update',
        'document.delete',
        'document.publish',
        'document.share',
        'client.manage_users',
        'client.manage_settings',
        'client.view_analytics',
        'client.manage_billing'
      );
      break;
    case 'ClientAdmin':
      demoPermissions.push(
        'client.manage_users',
        'client.manage_settings',
        'client.view_analytics',
        'client.manage_billing',
        'document.create',
        'document.read',
        'document.update',
        'document.delete',
        'document.publish',
        'document.share'
      );
      break;
    case 'RegisteredUser':
      demoPermissions.push(
        'document.create',
        'document.read',
        'document.update',
        'document.share'
      );
      break;
    case 'GuestUser':
      demoPermissions.push(
        'document.read'
      );
      break;
  }

  return [...new Set([...rolePermissions, ...demoPermissions])];
}