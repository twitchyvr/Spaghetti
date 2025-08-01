import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plug, 
  Shield, 
  Key, 
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Trash2,
  Activity,
  Webhook,
  Database,
  RefreshCw
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'sso' | 'ldap' | 'crm' | 'erp' | 'webhook' | 'api';
  status: 'active' | 'inactive' | 'error' | 'pending';
  provider: string;
  description: string;
  endpoints: number;
  lastSync: string;
  connectedUsers: number;
  configuration: {
    method: string;
    authentication: string;
    encryption: string;
  };
  healthCheck: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
  };
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string;
  successRate: number;
  retryPolicy: string;
}

interface APIKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
}

const EnterpriseIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Load sample integrations
    const sampleIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Azure Active Directory SSO',
        type: 'sso',
        status: 'active',
        provider: 'Microsoft Azure',
        description: 'Single Sign-On integration with Azure AD for seamless user authentication',
        endpoints: 3,
        lastSync: '2025-08-01T10:15:00Z',
        connectedUsers: 1245,
        configuration: {
          method: 'SAML 2.0',
          authentication: 'Certificate-based',
          encryption: 'AES-256'
        },
        healthCheck: {
          status: 'healthy',
          responseTime: 145,
          uptime: 99.98
        }
      },
      {
        id: '2',
        name: 'Corporate LDAP Directory',
        type: 'ldap',
        status: 'active',
        provider: 'Active Directory',
        description: 'Enterprise LDAP integration for user provisioning and group management',
        endpoints: 2,
        lastSync: '2025-08-01T09:30:00Z',
        connectedUsers: 892,
        configuration: {
          method: 'LDAPS',
          authentication: 'Service Account',
          encryption: 'TLS 1.3'
        },
        healthCheck: {
          status: 'healthy',
          responseTime: 98,
          uptime: 99.95
        }
      },
      {
        id: '3',
        name: 'Salesforce CRM Integration',
        type: 'crm',
        status: 'active',
        provider: 'Salesforce',
        description: 'Bi-directional sync with Salesforce for customer and opportunity data',
        endpoints: 8,
        lastSync: '2025-08-01T10:45:00Z',
        connectedUsers: 156,
        configuration: {
          method: 'REST API',
          authentication: 'OAuth 2.0',
          encryption: 'HTTPS/TLS'
        },
        healthCheck: {
          status: 'healthy',
          responseTime: 234,
          uptime: 99.92
        }
      },
      {
        id: '4',
        name: 'SAP ERP Connector',
        type: 'erp',
        status: 'error',
        provider: 'SAP',
        description: 'Enterprise resource planning integration for financial and operational data',
        endpoints: 12,
        lastSync: '2025-07-31T14:20:00Z',
        connectedUsers: 67,
        configuration: {
          method: 'RFC/BAPI',
          authentication: 'Service User',
          encryption: 'SAP Secure'
        },
        healthCheck: {
          status: 'down',
          responseTime: 0,
          uptime: 87.45
        }
      },
      {
        id: '5',
        name: 'Slack Notifications',
        type: 'webhook',
        status: 'active',
        provider: 'Slack',
        description: 'Real-time notifications and alerts delivered to Slack channels',
        endpoints: 5,
        lastSync: '2025-08-01T10:50:00Z',
        connectedUsers: 234,
        configuration: {
          method: 'Webhook',
          authentication: 'Token-based',
          encryption: 'HTTPS'
        },
        healthCheck: {
          status: 'healthy',
          responseTime: 89,
          uptime: 99.99
        }
      }
    ];

    const sampleWebhooks: WebhookEndpoint[] = [
      {
        id: '1',
        name: 'Document Creation Webhook',
        url: 'https://api.client.com/webhooks/documents',
        events: ['document.created', 'document.updated', 'document.deleted'],
        status: 'active',
        lastTriggered: '2025-08-01T10:30:00Z',
        successRate: 98.5,
        retryPolicy: '3 attempts with exponential backoff'
      },
      {
        id: '2',
        name: 'User Activity Webhook',
        url: 'https://analytics.company.com/api/events',
        events: ['user.login', 'user.logout', 'user.action'],
        status: 'active',
        lastTriggered: '2025-08-01T10:45:00Z',
        successRate: 99.2,
        retryPolicy: '5 attempts with linear backoff'
      },
      {
        id: '3',
        name: 'Security Alert Webhook',
        url: 'https://security.client.com/alerts',
        events: ['security.breach', 'security.warning', 'authentication.failed'],
        status: 'inactive',
        lastTriggered: '2025-07-28T16:20:00Z',
        successRate: 96.8,
        retryPolicy: '2 attempts immediate retry'
      }
    ];

    const sampleApiKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production API Key',
        keyPreview: 'sk-prod-****-****-****-a7b2',
        permissions: ['read:documents', 'write:documents', 'read:users', 'write:analytics'],
        createdAt: '2025-01-15T10:00:00Z',
        lastUsed: '2025-08-01T09:45:00Z',
        expiresAt: '2026-01-15T10:00:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'Analytics Service Key',
        keyPreview: 'sk-analytics-****-****-****-c9d4',
        permissions: ['read:analytics', 'read:metrics', 'read:reports'],
        createdAt: '2025-03-20T14:30:00Z',
        lastUsed: '2025-08-01T10:20:00Z',
        status: 'active'
      },
      {
        id: '3',
        name: 'Deprecated Integration Key',
        keyPreview: 'sk-old-****-****-****-e5f6',
        permissions: ['read:documents'],
        createdAt: '2024-08-10T09:15:00Z',
        lastUsed: '2025-06-15T11:30:00Z',
        expiresAt: '2025-08-10T09:15:00Z',
        status: 'revoked'
      }
    ];

    setIntegrations(sampleIntegrations);
    setWebhooks(sampleWebhooks);
    setApiKeys(sampleApiKeys);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': case 'down': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sso': return <Shield className="w-5 h-5" />;
      case 'ldap': return <Users className="w-5 h-5" />;
      case 'crm': return <Database className="w-5 h-5" />;
      case 'erp': return <Database className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      case 'api': return <Key className="w-5 h-5" />;
      default: return <Plug className="w-5 h-5" />;
    }
  };

  const connectNewIntegration = async () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: 'New OAuth Provider',
        type: 'sso',
        status: 'pending',
        provider: 'OAuth Provider',
        description: 'New OAuth 2.0 integration being configured',
        endpoints: 1,
        lastSync: new Date().toISOString(),
        connectedUsers: 0,
        configuration: {
          method: 'OAuth 2.0',
          authentication: 'Token-based',
          encryption: 'HTTPS'
        },
        healthCheck: {
          status: 'degraded',
          responseTime: 0,
          uptime: 0
        }
      };
      
      setIntegrations(prev => [newIntegration, ...prev]);
      setIsConnecting(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plug className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Integrations</h1>
              <p className="text-gray-600">Manage SSO, LDAP, APIs, and enterprise system connections</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={connectNewIntegration}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </>
              )}
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Global Settings
            </Button>
          </div>
        </div>

        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.filter(i => i.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connected Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.reduce((sum, i) => sum + i.connectedUsers, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Endpoints</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrations.reduce((sum, i) => sum + i.endpoints, 0)}
                  </p>
                </div>
                <Key className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Integration Overview</TabsTrigger>
            <TabsTrigger value="sso-ldap">SSO & LDAP</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api-keys">API Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getTypeIcon(integration.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{integration.provider}</p>
                            <p className="text-xs text-gray-500">{integration.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getStatusColor(integration.status)}>
                                {integration.status}
                              </Badge>
                              <Badge variant="outline">
                                {integration.type.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 text-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Connected Users</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {integration.connectedUsers.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Health Status</p>
                            <div className="flex items-center justify-center gap-1">
                              {getStatusIcon(integration.healthCheck.status)}
                              <span className="text-sm font-medium">
                                {integration.healthCheck.uptime.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Response Time</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {integration.healthCheck.responseTime}ms
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Method:</span>
                            <span className="ml-2">{integration.configuration.method}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Authentication:</span>
                            <span className="ml-2">{integration.configuration.authentication}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Encryption:</span>
                            <span className="ml-2">{integration.configuration.encryption}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sso-ldap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Single Sign-On Configuration</CardTitle>
                  <CardDescription>Configure SAML, OAuth, and OpenID Connect providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrations.filter(i => i.type === 'sso').map((sso) => (
                    <div key={sso.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{sso.name}</h4>
                        {getStatusIcon(sso.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{sso.provider}</p>
                      <div className="text-xs text-gray-500">
                        Method: {sso.configuration.method} | 
                        Users: {sso.connectedUsers.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add SSO Provider
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LDAP Directory Integration</CardTitle>
                  <CardDescription>Configure Active Directory and LDAP connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrations.filter(i => i.type === 'ldap').map((ldap) => (
                    <div key={ldap.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{ldap.name}</h4>
                        {getStatusIcon(ldap.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ldap.provider}</p>
                      <div className="text-xs text-gray-500">
                        Protocol: {ldap.configuration.method} | 
                        Sync: {new Date(ldap.lastSync).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add LDAP Connection
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <div className="space-y-4">
              {webhooks.map((webhook, index) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Webhook className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                            <Badge className={getStatusColor(webhook.status)}>
                              {webhook.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{webhook.url}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {webhook.events.map((event, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Success Rate: {webhook.successRate}%</span>
                            <span>Last Triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create New Webhook</CardTitle>
                <CardDescription>Set up real-time event notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="space-y-4">
              {apiKeys.map((apiKey, index) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Key className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                            <Badge className={getStatusColor(apiKey.status)}>
                              {apiKey.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 font-mono">{apiKey.keyPreview}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {apiKey.permissions.map((permission, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                            <span>Last Used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                            {apiKey.expiresAt && (
                              <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate New API Key</CardTitle>
                <CardDescription>Create API keys with custom permissions and expiration</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseIntegrations;