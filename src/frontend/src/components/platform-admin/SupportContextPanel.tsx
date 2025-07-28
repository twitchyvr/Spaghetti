import { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  FileText, 
  Activity, 
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Phone,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import type { ImpersonationSession, User as UserType, Tenant, Document } from '../../types';

interface SupportContextPanelProps {
  currentSession: ImpersonationSession | null;
}

interface UserContext {
  user: UserType;
  tenant: Tenant;
  recentDocuments: Document[];
  userActivity: UserActivity[];
  supportTickets: SupportTicket[];
  systemHealth: SystemHealth;
}

interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastUpdated: string;
  assignee?: string;
}

interface SystemHealth {
  apiResponseTime: number;
  databaseHealth: boolean;
  storageStatus: 'healthy' | 'warning' | 'critical';
  lastBackup: string;
  activeUsers: number;
}

/**
 * Support Context Panel
 * 
 * Comprehensive customer context and support information panel for active
 * impersonation sessions. Provides all necessary information for effective
 * customer support and troubleshooting.
 * 
 * Key Features:
 * - Customer profile and organization details
 * - Recent user activity and document history
 * - Support ticket integration and history
 * - System health and performance metrics
 * - Quick actions and contact information
 * - Session notes and communication tools
 */

export default function SupportContextPanel({ currentSession }: SupportContextPanelProps) {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'documents' | 'support' | 'system'>('profile');

  // Load user context when session changes
  useEffect(() => {
    if (currentSession) {
      loadUserContext();
    } else {
      setUserContext(null);
    }
  }, [currentSession]);

  const loadUserContext = async () => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would be a dedicated endpoint
      // For now, we'll simulate the data structure
      const mockContext: UserContext = {
        user: {
          id: currentSession.targetUserId,
          firstName: currentSession.targetUserEmail.split('@')[0] || 'Unknown',
          lastName: 'User',
          email: currentSession.targetUserEmail,
          fullName: currentSession.targetUserEmail.split('@')[0] + ' User',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-07-25T15:30:00Z',
          lastLoginAt: '2024-07-25T14:20:00Z',
          tenantId: currentSession.targetTenantId,
          profile: {
            jobTitle: 'Senior Manager',
            department: 'Operations',
            industry: 'Technology',
            phoneNumber: '+1 (555) 123-4567',
            timeZone: 'America/New_York',
            language: 'en',
            customFields: {}
          },
          settings: {
            enableAIAssistance: true,
            enableAutoDocumentation: true,
            enableVoiceCapture: false,
            enableScreenCapture: false,
            enableFileMonitoring: false,
            privacyLevel: 'Standard' as any,
            allowDataRetention: true,
            dataRetentionDays: 365,
            enableEmailNotifications: true,
            enablePushNotifications: true,
            enableSlackNotifications: false,
            enableTeamsNotifications: false,
            theme: 'light',
            defaultDocumentType: 'general',
            favoriteAgents: [],
            moduleSettings: {},
            customSettings: {}
          },
          userRoles: []
        },
        tenant: {
          id: currentSession.targetTenantId,
          name: 'Example Corporation',
          subdomain: 'example-corp',
          description: 'A leading technology company',
          status: 'Active' as any,
          tier: 'Professional' as any,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-07-25T12:00:00Z',
          billing: {
            subscriptionId: 'sub_1234567890',
            planId: 'pro_plan',
            subscriptionStartDate: '2024-01-01T00:00:00Z',
            nextBillingDate: '2024-08-01T00:00:00Z',
            monthlyRate: 299.99,
            currency: 'USD',
            isTrialActive: false,
            paymentStatus: 'Current' as any,
            documentsCreatedThisMonth: 125,
            apiCallsThisMonth: 4567,
            storageUsedBytes: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
            billingMetadata: {}
          },
          configuration: {
            requireMFA: true,
            requireSSO: false,
            passwordExpiryDays: 90,
            sessionTimeoutMinutes: 480,
            documentRetentionDays: 2555,
            auditLogRetentionDays: 2555,
            enableDataExport: true,
            enableAIFeatures: true,
            enableAutoDocumentation: true,
            enableVoiceCapture: false,
            enableScreenCapture: false,
            enabledIntegrations: { sharepoint: true, teams: false },
            complianceFrameworks: ['SOC2', 'GDPR'],
            enableAuditLogging: true,
            enableDataEncryption: true,
            defaultTimeZone: 'America/New_York',
            defaultLanguage: 'en',
            customSettings: {}
          },
          quotas: {
            maxStorageBytes: 1024 * 1024 * 1024 * 10, // 10 GB
            usedStorageBytes: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
            maxUsers: 50,
            activeUsers: 23,
            maxDocumentsPerMonth: 500,
            documentsCreatedThisMonth: 125,
            maxAPICallsPerMonth: 10000,
            apiCallsThisMonth: 4567,
            maxAIProcessingMinutesPerMonth: 1000,
            aiProcessingMinutesUsedThisMonth: 234,
            moduleQuotas: {},
            quotaResetDate: '2024-08-01T00:00:00Z'
          },
          branding: {
            companyName: 'Example Corporation',
            primaryColor: '#0066CC',
            hidePlatformBranding: false,
            customDomain: false,
            customLabels: {}
          },
          modules: []
        },
        recentDocuments: [
          {
            id: '1',
            title: 'Q3 Project Review',
            content: 'Comprehensive review of Q3 project deliverables...',
            documentType: 'project-review',
            industry: 'technology',
            status: 'Published' as any,
            createdAt: '2024-07-24T16:00:00Z',
            updatedAt: '2024-07-24T16:30:00Z',
            createdBy: currentSession.targetUserId,
            tenantId: currentSession.targetTenantId,
            metadata: {
              properties: {},
              keywords: ['project', 'review', 'Q3'],
              summary: 'Q3 project review document',
              wordCount: 1247,
              language: 'en'
            },
            version: 1,
            childDocuments: [],
            tags: [],
            attachments: [],
            permissions: [],
            auditEntries: []
          }
        ],
        userActivity: [
          {
            id: '1',
            action: 'Document Created',
            timestamp: '2024-07-25T14:30:00Z',
            details: 'Created document: Q3 Project Review',
            ipAddress: '192.168.1.100'
          },
          {
            id: '2',
            action: 'Login',
            timestamp: '2024-07-25T14:20:00Z',
            details: 'User logged in successfully',
            ipAddress: '192.168.1.100'
          }
        ],
        supportTickets: [
          {
            id: 'TICK-001',
            title: 'Unable to export documents',
            status: 'in-progress',
            priority: 'medium',
            createdAt: '2024-07-23T10:00:00Z',
            lastUpdated: '2024-07-24T15:30:00Z',
            assignee: 'Sarah Johnson'
          }
        ],
        systemHealth: {
          apiResponseTime: 145,
          databaseHealth: true,
          storageStatus: 'healthy',
          lastBackup: '2024-07-25T02:00:00Z',
          activeUsers: 23
        }
      };

      setUserContext(mockContext);
    } catch (err: any) {
      console.error('Failed to load user context:', err);
      setError('Failed to load user context information.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSessionNote = () => {
    if (!sessionNotes.trim()) return;
    
    // In a real implementation, this would save the note to the backend
    console.log('Adding session note:', sessionNotes);
    setSessionNotes('');
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = () => {
    if (!userContext) return 0;
    return (userContext.tenant.quotas.usedStorageBytes / userContext.tenant.quotas.maxStorageBytes) * 100;
  };

  if (!currentSession) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h4>
          <p className="text-gray-500">
            Start an impersonation session to view customer context and support information.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading customer context...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userContext) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-800">{error || 'Failed to load customer context'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Customer Support Context
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Complete customer information for {userContext.user.fullName}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'support', label: 'Support', icon: MessageSquare },
            { id: 'system', label: 'System', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{userContext.user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{userContext.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Title:</span>
                  <span className="font-medium">{userContext.user.profile.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{userContext.user.profile.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {userContext.user.profile.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">
                    {userContext.user.lastLoginAt && new Date(userContext.user.lastLoginAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{userContext.tenant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tier:</span>
                  <span className="font-medium">{userContext.tenant.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{userContext.tenant.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">
                    {userContext.tenant.quotas.activeUsers} / {userContext.tenant.quotas.maxUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage:</span>
                  <span className="font-medium">
                    {formatBytes(userContext.tenant.quotas.usedStorageBytes)} / {formatBytes(userContext.tenant.quotas.maxStorageBytes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rate:</span>
                  <span className="font-medium">
                    ${userContext.tenant.billing.monthlyRate} {userContext.tenant.billing.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent User Activity
            </h4>
            <div className="space-y-3">
              {userContext.userActivity.map(activity => (
                <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-600 mt-1">{activity.details}</div>
                      {activity.ipAddress && (
                        <div className="text-xs text-gray-500 mt-1">IP: {activity.ipAddress}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Documents
            </h4>
            <div className="space-y-3">
              {userContext.recentDocuments.map(document => (
                <div key={document.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {document.title}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {document.documentType} • {document.metadata.wordCount} words
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Status: {document.status}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Support Tickets */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Support Tickets
              </h4>
              <div className="space-y-3">
                {userContext.supportTickets.map(ticket => (
                  <div key={ticket.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{ticket.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                        {ticket.assignee && (
                          <div className="text-sm text-gray-600 mt-1">
                            Assigned to: {ticket.assignee}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Session Notes</h4>
              <div className="space-y-3">
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about this support session..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addSessionNote}
                  disabled={!sessionNotes.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Health
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time:</span>
                  <span className="text-sm font-medium">{userContext.systemHealth.apiResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Health:</span>
                  <span className={`text-sm font-medium ${
                    userContext.systemHealth.databaseHealth ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {userContext.systemHealth.databaseHealth ? 'Healthy' : 'Issues Detected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Status:</span>
                  <span className={`text-sm font-medium capitalize ${
                    userContext.systemHealth.storageStatus === 'healthy' ? 'text-green-600' :
                    userContext.systemHealth.storageStatus === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {userContext.systemHealth.storageStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup:</span>
                  <span className="text-sm font-medium">
                    {new Date(userContext.systemHealth.lastBackup).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users:</span>
                  <span className="text-sm font-medium">{userContext.systemHealth.activeUsers}</span>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage Statistics
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Storage Usage:</span>
                    <span className="font-medium">{getStorageUsagePercentage().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getStorageUsagePercentage()}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents This Month:</span>
                  <span className="text-sm font-medium">
                    {userContext.tenant.billing.documentsCreatedThisMonth} / {userContext.tenant.quotas.maxDocumentsPerMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Calls This Month:</span>
                  <span className="text-sm font-medium">
                    {userContext.tenant.billing.apiCallsThisMonth} / {userContext.tenant.quotas.maxAPICallsPerMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Processing:</span>
                  <span className="text-sm font-medium">
                    {userContext.tenant.quotas.aiProcessingMinutesUsedThisMonth} / {userContext.tenant.quotas.maxAIProcessingMinutesPerMonth} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}