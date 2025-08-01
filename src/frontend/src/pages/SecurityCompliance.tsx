import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Settings,
  Activity,
  Key,
  FileText,
  Clock
} from 'lucide-react';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';

interface SecurityMetric {
  id: string;
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  standard: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  coverage: number;
  lastAudit: string;
  requirements: {
    total: number;
    met: number;
    pending: number;
    failed: number;
  };
}

interface SecurityIncident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'authentication' | 'data-breach' | 'access-violation' | 'malware' | 'other';
  detectedAt: string;
  resolvedAt?: string;
  affectedUsers: number;
  description: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  details: string;
}

const SecurityCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [securityMetrics] = useState<SecurityMetric[]>([
    {
      id: '1',
      title: 'Security Score',
      value: '94.8%',
      status: 'good',
      trend: 'up',
      description: 'Overall security posture rating'
    },
    {
      id: '2',
      title: 'Failed Login Attempts',
      value: 47,
      status: 'warning',
      trend: 'up',
      description: 'Suspicious authentication attempts in last 24h'
    },
    {
      id: '3',
      title: 'Data Encryption Coverage',
      value: '100%',
      status: 'good',
      trend: 'stable',
      description: 'Percentage of data encrypted at rest and in transit'
    },
    {
      id: '4',
      title: 'Active Security Incidents',
      value: 2,
      status: 'warning',
      trend: 'stable',
      description: 'Open security incidents requiring attention'
    },
    {
      id: '5',
      title: 'Vulnerability Scan Score',
      value: '98.2%',
      status: 'good',
      trend: 'up',
      description: 'Latest security vulnerability assessment'
    },
    {
      id: '6',
      title: 'Compliance Score',
      value: '96.5%',
      status: 'good',
      trend: 'stable',
      description: 'Overall regulatory compliance rating'
    }
  ]);

  const [complianceFrameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'SOC 2 Type II',
      standard: 'SOC 2',
      status: 'compliant',
      coverage: 98.5,
      lastAudit: '2025-06-15T10:00:00Z',
      requirements: {
        total: 127,
        met: 125,
        pending: 2,
        failed: 0
      }
    },
    {
      id: '2',
      name: 'GDPR Compliance',
      standard: 'GDPR',
      status: 'compliant',
      coverage: 95.8,
      lastAudit: '2025-07-20T14:30:00Z',
      requirements: {
        total: 89,
        met: 85,
        pending: 3,
        failed: 1
      }
    },
    {
      id: '3',
      name: 'HIPAA Compliance',
      standard: 'HIPAA',
      status: 'partial',
      coverage: 87.4,
      lastAudit: '2025-05-10T09:15:00Z',
      requirements: {
        total: 164,
        met: 143,
        pending: 18,
        failed: 3
      }
    },
    {
      id: '4',
      name: 'ISO 27001',
      standard: 'ISO 27001',
      status: 'compliant',
      coverage: 92.1,
      lastAudit: '2025-07-01T11:45:00Z',
      requirements: {
        total: 114,
        met: 105,
        pending: 7,
        failed: 2
      }
    }
  ]);

  const [securityIncidents] = useState<SecurityIncident[]>([
    {
      id: '1',
      title: 'Unusual Login Pattern Detected',
      severity: 'medium',
      status: 'investigating',
      category: 'authentication',
      detectedAt: '2025-08-01T09:15:00Z',
      affectedUsers: 1,
      description: 'Multiple failed login attempts from unusual geographic location for user account'
    },
    {
      id: '2',
      title: 'Elevated Privilege Access Attempt',
      severity: 'high',
      status: 'open',
      category: 'access-violation',
      detectedAt: '2025-08-01T08:30:00Z',
      affectedUsers: 0,
      description: 'User attempted to access admin functions without proper authorization'
    },
    {
      id: '3',
      title: 'Suspicious File Upload Activity',
      severity: 'low',
      status: 'resolved',
      category: 'malware',
      detectedAt: '2025-07-31T16:45:00Z',
      resolvedAt: '2025-07-31T18:20:00Z',
      affectedUsers: 0,
      description: 'File upload contained suspicious patterns, automatically quarantined and scanned'
    }
  ]);

  const [auditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: '2025-08-01T10:30:00Z',
      user: 'admin@acme-legal.com',
      action: 'USER_PERMISSION_CHANGE',
      resource: 'user:john.doe@acme-legal.com',
      result: 'success',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Added document editor permissions'
    },
    {
      id: '2',
      timestamp: '2025-08-01T10:25:00Z',
      user: 'security@techstart.io',
      action: 'DOCUMENT_ACCESS',
      resource: 'document:confidential-merger-plan.pdf',
      result: 'success',
      ipAddress: '10.0.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Accessed highly sensitive document'
    },
    {
      id: '3',
      timestamp: '2025-08-01T10:20:00Z',
      user: 'unauthorized@external.com',
      action: 'LOGIN_ATTEMPT',
      resource: 'authentication',
      result: 'failure',
      ipAddress: '203.0.113.45',
      userAgent: 'curl/7.68.0',
      details: 'Failed login attempt with invalid credentials'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': case 'compliant': case 'resolved': case 'closed': case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning': case 'partial': case 'investigating': case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical': case 'non-compliant': case 'failure':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': case 'compliant': case 'resolved': case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': case 'partial': case 'investigating':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': case 'non-compliant': case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateComplianceReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security & Compliance Center</h1>
              <p className="text-gray-600">Advanced security monitoring and regulatory compliance management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedPeriod === '24h' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('24h')}
              >
                24 Hours
              </Button>
              <Button 
                variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
              >
                7 Days
              </Button>
              <Button 
                variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
              >
                30 Days
              </Button>
            </div>
            <Button 
              onClick={generateComplianceReport}
              disabled={isGeneratingReport}
              className="bg-red-600 hover:bg-red-700"
            >
              {isGeneratingReport ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Compliance Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {securityMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getStatusIcon(metric.status)}
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Security Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Trends</CardTitle>
                  <CardDescription>Security metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={[
                      { name: 'Week 1', value: 92.1 },
                      { name: 'Week 2', value: 93.5 },
                      { name: 'Week 3', value: 94.2 },
                      { name: 'Week 4', value: 94.8 }
                    ]}
                    type="line"
                    title="Security Score & Incidents"
                    colors={['#DC2626']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threat Detection</CardTitle>
                  <CardDescription>Real-time threat monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Firewall Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Intrusion Detection</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Threat Intelligence</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">2 Alerts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Access Control</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Protection Status</CardTitle>
                  <CardDescription>Encryption and data security metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data at Rest Encryption</span>
                      <span className="text-sm text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data in Transit Encryption</span>
                      <span className="text-sm text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Backup Encryption</span>
                      <span className="text-sm text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Database Encryption</span>
                      <span className="text-sm text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Management</CardTitle>
                  <CardDescription>User access and authentication metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Multi-Factor Authentication</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">87% adoption</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Single Sign-On</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">1,245 users</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password Policy Compliance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">94% compliant</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Session Management</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Active</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="space-y-4">
              {complianceFrameworks.map((framework, index) => (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{framework.name}</h3>
                            <p className="text-sm text-gray-600">{framework.standard}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(framework.status)}>
                            {framework.status}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {framework.coverage.toFixed(1)}% Coverage
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{framework.requirements.met}</p>
                          <p className="text-xs text-gray-600">Requirements Met</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{framework.requirements.pending}</p>
                          <p className="text-xs text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{framework.requirements.failed}</p>
                          <p className="text-xs text-gray-600">Failed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{framework.requirements.total}</p>
                          <p className="text-xs text-gray-600">Total Requirements</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          Last Audit: {new Date(framework.lastAudit).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${framework.coverage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="space-y-4">
              {securityIncidents.map((incident, index) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                            <p className="text-sm text-gray-600">{incident.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Category: {incident.category.replace('-', ' ')}</span>
                          <span>Affected Users: {incident.affectedUsers}</span>
                          <span>Detected: {new Date(incident.detectedAt).toLocaleString()}</span>
                          {incident.resolvedAt && (
                            <span>Resolved: {new Date(incident.resolvedAt).toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log Events</CardTitle>
                <CardDescription>Comprehensive system and user activity tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(event.result)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{event.action}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.resource}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {event.user} • {event.ipAddress} • {event.details}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityCompliance;