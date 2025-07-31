import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';
import { 
  Users, 
  Building2,
  DollarSign,
  Activity,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Settings,
  BarChart3,
  Shield,
  PieChart,
  Target,
  Zap,
  Filter,
  FileText,
  HardDrive,
  Calendar
} from 'lucide-react';
import { RevenueAnalytics } from '../components/charts/RevenueAnalytics';
import { CustomerAnalytics } from '../components/charts/CustomerAnalytics';
import { 
  UsageAnalyticsChart, 
  HealthMetricsChart, 
  KPICard 
} from '../components/charts/AnalyticsCharts';

import { platformAdminApi } from '../services/api';

/**
 * Platform Admin Dashboard
 * 
 * Comprehensive dashboard for platform administrators to:
 * - Monitor platform metrics and health
 * - Manage client organizations
 * - View revenue and usage analytics
 * - Track system performance
 */
export default function PlatformAdminDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [platformData, setPlatformData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);

  // Mock data for demonstration
  const mockPlatformData = {
    totalClients: 47,
    activeClients: 42,
    totalUsers: 1247,
    activeUsers: 892,
    totalDocuments: 15678,
    monthlyRecurringRevenue: 18950,
    annualRecurringRevenue: 227400,
    platformHealth: {
      apiResponseTime: 145,
      databaseHealth: true,
      systemUptime: 99.97,
      activeIncidents: 0
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [metrics, clientsList] = await Promise.all([
        platformAdminApi.getPlatformMetrics(),
        platformAdminApi.getClients()
      ]);
      
      setPlatformData(metrics);
      setClients(clientsList);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
      setError('Failed to load platform data. Please try again.');
      // Use mock data as fallback
      setPlatformData(mockPlatformData);
      setClients([
        {
          id: 'client-1',
          name: 'Acme Legal Partners',
          status: 'Active',
          tier: 'Enterprise',
          userCount: 156,
          documentCount: 2847,
          storageUsedMB: 1024,
          storageQuotaMB: 5120,
          monthlyRevenue: 2499,
          lastActive: '2025-07-25T10:30:00Z',
          healthScore: 98
        },
        {
          id: 'client-2',
          name: 'TechStart Innovation',
          status: 'Active',
          tier: 'Professional',
          userCount: 28,
          documentCount: 445,
          storageUsedMB: 256,
          storageQuotaMB: 1024,
          monthlyRevenue: 799,
          lastActive: '2025-07-25T09:15:00Z',
          healthScore: 95
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMetricCards = () => {
    if (!platformData) return [];
    
    return [
      {
        id: 'total-clients',
        title: 'Total Clients',
        value: platformData.totalClients.toLocaleString(),
        icon: <Building2 size={24} />,
        change: 12,
        changeType: 'increase' as const
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: platformData.activeUsers.toLocaleString(),
        icon: <Users size={24} />,
        change: 8,
        changeType: 'increase' as const
      },
      {
        id: 'mrr',
        title: 'Monthly Recurring Revenue',
        value: `$${platformData.monthlyRecurringRevenue.toLocaleString()}`,
        icon: <DollarSign size={24} />,
        change: 15,
        changeType: 'increase' as const
      },
      {
        id: 'system-health',
        title: 'System Uptime',
        value: `${platformData.platformHealth.systemUptime}%`,
        icon: <Activity size={24} />,
        change: 0.03,
        changeType: 'increase' as const
      }
    ];
  };

  const handleAddClient = () => {
    console.log('Add client clicked');
  };

  const handleViewClient = (clientId: string) => {
    console.log('View client:', clientId);
  };

  const handleManageClient = (clientId: string) => {
    console.log('Manage client:', clientId);
  };

  const renderOverviewTab = () => (
    <>
      {/* Platform Metrics Overview */}
      <section className="metrics-overview mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generateMetricCards().map((metric) => (
            <KPICard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              change={metric.change}
              changeType={metric.changeType}
            />
          ))}
        </div>
      </section>

      {/* Client Organizations Management */}
      <section className="client-management">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Client Organizations
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and monitor all client organizations
                </p>
              </div>
              
              <div className="flex space-x-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="btn btn-secondary">
                  <Filter size={16} />
                </button>
                <button 
                  onClick={handleAddClient}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  Add Client
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {clients.map((client) => (
              <div key={client.id} className="border-b border-gray-100 last:border-b-0">
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            client.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : client.status === 'Trial' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {client.tier}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users size={14} className="mr-1" />
                            {client.userCount} users
                          </div>
                          <div className="flex items-center">
                            <FileText size={14} className="mr-1" />
                            {client.documentCount.toLocaleString()} docs
                          </div>
                          <div className="flex items-center">
                            <HardDrive size={14} className="mr-1" />
                            {client.storageUsedMB}MB / {client.storageQuotaMB}MB
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(client.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${client.monthlyRevenue?.toLocaleString() || '0'}/mo
                        </div>
                        <div className="text-sm text-gray-500">
                          Health: {client.healthScore}%
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewClient(client.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="View client details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleManageClient(client.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Manage client"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderUsageAnalytics = () => {
    const mockUsageData = [
      { name: 'Documents Created', value: 2847 },
      { name: 'API Calls', value: 125000 },
      { name: 'Active Users', value: 892 },
      { name: 'Storage Used (GB)', value: 1247 }
    ];

    return (
      <div className="space-y-6">
        <UsageAnalyticsChart data={mockUsageData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documents Created</span>
                <span className="font-semibold">2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Calls</span>
                <span className="font-semibold">125,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">892</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Storage Used</span>
                <span className="font-semibold">1.2 TB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bandwidth</span>
                <span className="font-semibold">45 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Rate Limit</span>
                <span className="font-semibold">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthAnalytics = () => {
    const mockHealthData = [
      { name: 'API Response Time', value: 145, unit: 'ms', status: 'good' },
      { name: 'Database Performance', value: 98, unit: '%', status: 'excellent' },
      { name: 'System Uptime', value: 99.97, unit: '%', status: 'excellent' },
      { name: 'Error Rate', value: 0.03, unit: '%', status: 'good' }
    ];

    return (
      <div className="space-y-6">
        <HealthMetricsChart data={mockHealthData} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockHealthData.map((metric) => (
            <div key={metric.name} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {metric.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}{metric.unit}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800">All systems operational</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800">Scheduled maintenance: System backup at 2:00 AM UTC</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'revenue':
        return <RevenueAnalytics className="mt-6" />;
      case 'customers':
        return <CustomerAnalytics className="mt-6" />;
      case 'usage':
        return renderUsageAnalytics();
      case 'health':
        return renderHealthAnalytics();
      default:
        return renderOverviewTab();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">
            <Activity className="loading-icon animate-spin" />
          </div>
          <p className="loading-text">Loading platform administration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-admin-dashboard">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchPlatformData} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Platform Admin Header */}
      <section className="dashboard-header mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Platform Administration
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive oversight of the Spaghetti documentation platform
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.firstName || 'Platform Admin'} • Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button 
              onClick={handleAddClient}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Client</span>
            </button>
            <button className="btn btn-secondary flex items-center space-x-2">
              <Shield size={16} />
              <span>Impersonate</span>
            </button>
            <button className="btn btn-secondary flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="tab-navigation mb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign size={16} />
                <span>Revenue</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>Customers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>Usage Analytics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity size={16} />
                <span>Platform Health</span>
              </div>
            </button>
          </nav>
        </div>
      </section>

      {/* Dynamic Content Based on Active Tab */}
      {renderTabContent()}
    </div>
  );
}