import React, { useState } from 'react';
import { RoleGuard, RequirePlatformAdmin, RequireClientAdmin, useRoles } from '../components/auth/RoleGuard';
import { PermissionGate, RequirePermission, RequireDocumentPermission, usePermissions } from '../components/auth/PermissionGate';
import { MFASetup } from '../components/auth/MFASetup';
import { SessionManager } from '../components/auth/SessionManager';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  Lock,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export const AuthenticationDemo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasRole, hasAnyRole, isPlatformAdmin, isClientAdmin } = useRoles();
  const { 
    hasPermission, 
    canCreateDocuments, 
    canManageTenants, 
    canImpersonateUsers,
    canManageClientUsers 
  } = usePermissions();
  
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'mfa' | 'sessions'>('roles');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view this demo.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'roles', label: 'Role-Based Access', icon: <Users className="h-4 w-4" /> },
    { id: 'permissions', label: 'Permission Gates', icon: <Shield className="h-4 w-4" /> },
    { id: 'mfa', label: 'MFA Setup', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'sessions', label: 'Session Management', icon: <Settings className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Enhanced Authentication Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.fullName}</span>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user?.userType}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="py-8">
          {activeTab === 'roles' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Access Control</h2>
                <p className="text-gray-600 mb-6">
                  Demonstrate how different components are shown or hidden based on user roles.
                </p>
              </div>

              {/* Current User Roles */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Your Current Roles</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Platform Admin:</span>
                    <span className={`px-2 py-1 rounded text-sm ${isPlatformAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {isPlatformAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Client Admin:</span>
                    <span className={`px-2 py-1 rounded text-sm ${isClientAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {isClientAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Has Admin Role:</span>
                    <span className={`px-2 py-1 rounded text-sm ${hasAnyRole(['Platform.Admin', 'Client.Admin']) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {hasAnyRole(['Platform.Admin', 'Client.Admin']) ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-Based Components */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Platform Admin Only</h3>
                  <RequirePlatformAdmin
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        This content is only visible to Platform Administrators
                      </div>
                    }
                  >
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Platform Administration Panel</h4>
                      <p className="text-blue-800 text-sm">
                        You can see this because you have Platform Admin privileges. This might include
                        tenant management, system-wide analytics, or user impersonation controls.
                      </p>
                    </div>
                  </RequirePlatformAdmin>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Client Admin or Higher</h3>
                  <RequireClientAdmin
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        This content requires Client Admin or Platform Admin role
                      </div>
                    }
                  >
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Client Management Panel</h4>
                      <p className="text-green-800 text-sm">
                        You can manage users, view analytics, and configure settings for your organization.
                      </p>
                    </div>
                  </RequireClientAdmin>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Multiple Role Requirements</h3>
                  <RoleGuard
                    roles={['Platform.Admin', 'Client.Admin', 'Client.User']}
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        This content requires one of: Platform Admin, Client Admin, or Client User roles
                      </div>
                    }
                  >
                    <div className="bg-purple-50 p-4 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-2">General User Content</h4>
                      <p className="text-purple-800 text-sm">
                        This content is available to most authenticated users with appropriate roles.
                      </p>
                    </div>
                  </RoleGuard>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Permission-Based Gates</h2>
                <p className="text-gray-600 mb-6">
                  Demonstrate fine-grained permission checking for specific actions and resources.
                </p>
              </div>

              {/* Current User Permissions */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Your Current Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">Create Documents:</span>
                      <span className={`px-2 py-1 rounded text-sm ${canCreateDocuments ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {canCreateDocuments ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">Manage Tenants:</span>
                      <span className={`px-2 py-1 rounded text-sm ${canManageTenants ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {canManageTenants ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">Impersonate Users:</span>
                      <span className={`px-2 py-1 rounded text-sm ${canImpersonateUsers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {canImpersonateUsers ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">Manage Client Users:</span>
                      <span className={`px-2 py-1 rounded text-sm ${canManageClientUsers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {canManageClientUsers ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-40">Custom Permission:</span>
                      <span className={`px-2 py-1 rounded text-sm ${hasPermission('document.publish') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {hasPermission('document.publish') ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permission-Based Components */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Document Creation</h3>
                  <RequireDocumentPermission
                    action="create"
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        You don't have permission to create documents
                      </div>
                    }
                  >
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Create New Document</h4>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        + New Document
                      </button>
                    </div>
                  </RequireDocumentPermission>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Document Publishing</h3>
                  <RequireDocumentPermission
                    action="publish"
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        You don't have permission to publish documents
                      </div>
                    }
                  >
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Publish to Portal</h4>
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Publish Document
                      </button>
                    </div>
                  </RequireDocumentPermission>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Platform Management</h3>
                  <RequirePermission
                    permission="platform.manage_tenants"
                    fallback={
                      <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        Platform management requires elevated permissions
                      </div>
                    }
                  >
                    <div className="bg-purple-50 p-4 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-2">Platform Administration</h4>
                      <div className="space-x-2">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                          Manage Tenants
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                          View Analytics
                        </button>
                      </div>
                    </div>
                  </RequirePermission>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mfa' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Multi-Factor Authentication</h2>
                <p className="text-gray-600 mb-6">
                  Set up additional security for your account with multi-factor authentication.
                </p>
              </div>

              <MFASetup 
                onComplete={() => {
                  console.log('MFA setup completed');
                }}
                onCancel={() => {
                  console.log('MFA setup cancelled');
                }}
              />
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Management</h2>
                <p className="text-gray-600 mb-6">
                  Monitor and manage your active sessions across different devices.
                </p>
              </div>

              <SessionManager 
                onSessionRevoked={(sessionId) => {
                  console.log('Session revoked:', sessionId);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};