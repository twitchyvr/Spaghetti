import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Building2, 
  Users, 
  Settings, 
  Activity,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  DollarSign,
  Package
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'trial' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  userCount: number;
  documentCount: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  monthlySpend: number;
  createdAt: string;
  lastActivity: string;
  features: string[];
  customBranding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
  };
}

interface TenantMetrics {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  avgDocumentsPerTenant: number;
  totalStorageUsed: number;
  totalUsers: number;
}

const TenantManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<TenantMetrics>({
    totalTenants: 847,
    activeTenants: 823,
    totalRevenue: 2450000,
    avgDocumentsPerTenant: 342,
    totalStorageUsed: 15680, // GB
    totalUsers: 12450
  });

  useEffect(() => {
    // Load sample tenants
    const sampleTenants: Tenant[] = [
      {
        id: '1',
        name: 'Acme Legal Partners',
        domain: 'acme-legal.com',
        plan: 'enterprise',
        status: 'active',
        userCount: 145,
        documentCount: 2847,
        storageUsed: 89.5,
        storageLimit: 500,
        monthlySpend: 12500,
        createdAt: '2024-01-15T10:00:00Z',
        lastActivity: '2025-08-01T09:30:00Z',
        features: ['Advanced Analytics', 'SSO', 'Custom Branding', 'API Access', 'Priority Support'],
        customBranding: {
          primaryColor: '#1E40AF',
          secondaryColor: '#3B82F6',
          companyName: 'Acme Legal Partners'
        }
      },
      {
        id: '2',
        name: 'TechStart Innovations',
        domain: 'techstart.io',
        plan: 'professional',
        status: 'active',
        userCount: 24,
        documentCount: 489,
        storageUsed: 12.3,
        storageLimit: 100,
        monthlySpend: 2400,
        createdAt: '2024-06-20T14:30:00Z',
        lastActivity: '2025-08-01T08:15:00Z',
        features: ['Analytics', 'Collaboration', 'Document Workflow'],
        customBranding: {
          primaryColor: '#10B981',
          secondaryColor: '#34D399',
          companyName: 'TechStart Innovations'
        }
      },
      {
        id: '3',
        name: 'Global Consulting Group',
        domain: 'gcg-consulting.com',
        plan: 'enterprise',
        status: 'active',
        userCount: 312,
        documentCount: 5624,
        storageUsed: 245.8,
        storageLimit: 1000,
        monthlySpend: 25000,
        createdAt: '2023-11-10T09:00:00Z',
        lastActivity: '2025-08-01T10:45:00Z',
        features: ['Advanced Analytics', 'SSO', 'Custom Branding', 'API Access', 'Priority Support', 'AI Features'],
        customBranding: {
          primaryColor: '#7C3AED',
          secondaryColor: '#A78BFA',
          companyName: 'Global Consulting Group'
        }
      },
      {
        id: '4',
        name: 'StartupCorp',
        domain: 'startupcorp.com',
        plan: 'trial',
        status: 'pending',
        userCount: 5,
        documentCount: 23,
        storageUsed: 0.8,
        storageLimit: 10,
        monthlySpend: 0,
        createdAt: '2025-07-28T16:20:00Z',
        lastActivity: '2025-07-31T14:30:00Z',
        features: ['Basic Features'],
        customBranding: {
          primaryColor: '#F59E0B',
          secondaryColor: '#FBBF24',
          companyName: 'StartupCorp'
        }
      }
    ];
    
    setTenants(sampleTenants);
  }, []);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'trial': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createNewTenant = () => {
    // Simulate new tenant creation
    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: 'New Enterprise Client',
      domain: 'new-client.com',
      plan: 'trial',
      status: 'pending',
      userCount: 1,
      documentCount: 0,
      storageUsed: 0,
      storageLimit: 10,
      monthlySpend: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      features: ['Basic Features'],
      customBranding: {
        primaryColor: '#6B7280',
        secondaryColor: '#9CA3AF',
        companyName: 'New Enterprise Client'
      }
    };
    
    setTenants(prev => [newTenant, ...prev]);
    setMetrics(prev => ({
      ...prev,
      totalTenants: prev.totalTenants + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Tenant Management</h1>
              <p className="text-gray-600">Manage multi-tenant configurations and enterprise features</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={createNewTenant}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Tenant
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Global Settings
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalTenants}</p>
                  <p className="text-xs text-green-600">+12 this month</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeTenants}</p>
                  <p className="text-xs text-green-600">97.2% uptime</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${(metrics.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600">+15% MoM</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">Across all tenants</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tenant Overview</TabsTrigger>
            <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
            <TabsTrigger value="branding">Custom Branding</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              {tenants.map((tenant, index) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: tenant.customBranding.primaryColor }}
                          >
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                            <p className="text-sm text-gray-600">{tenant.domain}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPlanColor(tenant.plan)}>
                                {tenant.plan}
                              </Badge>
                              <Badge className={getStatusColor(tenant.status)}>
                                {tenant.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-8 text-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Users</p>
                            <p className="text-lg font-semibold text-gray-900">{tenant.userCount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Documents</p>
                            <p className="text-lg font-semibold text-gray-900">{tenant.documentCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Storage</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {tenant.storageUsed}GB / {tenant.storageLimit}GB
                            </p>
                            <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${(tenant.storageUsed / tenant.storageLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${tenant.monthlySpend.toLocaleString()}
                            </p>
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
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Features:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tenant.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="provisioning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Tenant Provisioning</CardTitle>
                <CardDescription>Configure automated tenant setup and resource allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Trial Plan Defaults</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Storage Limit</span>
                        <span className="text-sm font-medium">10 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">User Limit</span>
                        <span className="text-sm font-medium">5 users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Trial Duration</span>
                        <span className="text-sm font-medium">14 days</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Professional Plan Defaults</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Storage Limit</span>
                        <span className="text-sm font-medium">100 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">User Limit</span>
                        <span className="text-sm font-medium">50 users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Features</span>
                        <span className="text-sm font-medium">Standard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Global Branding Settings</CardTitle>
                  <CardDescription>Configure default branding for new tenants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Primary Color</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded border"></div>
                      <span className="text-sm">#3B82F6</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Upload default logo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tenant Custom Branding</CardTitle>
                  <CardDescription>Preview tenant-specific branding</CardDescription>
                </CardHeader>
                <CardContent>
                  {tenants.slice(0, 3).map((tenant) => (
                    <div key={tenant.id} className="mb-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: tenant.customBranding.primaryColor }}
                        >
                          {tenant.customBranding.companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tenant.customBranding.companyName}</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tenant.customBranding.primaryColor }}
                            ></div>
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tenant.customBranding.secondaryColor }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: 'Jan', count: 45 },
                      { month: 'Feb', count: 52 },
                      { month: 'Mar', count: 61 },
                      { month: 'Apr', count: 58 },
                      { month: 'May', count: 67 },
                      { month: 'Jun', count: 74 },
                      { month: 'Jul', count: 82 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(item.count / 82) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { plan: 'Enterprise', revenue: 1850000, percentage: 75.5 },
                      { plan: 'Professional', revenue: 480000, percentage: 19.6 },
                      { plan: 'Trial', revenue: 120000, percentage: 4.9 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.plan}</span>
                          <span className="text-sm text-gray-600">
                            ${(item.revenue / 1000).toFixed(0)}K ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantManagement;