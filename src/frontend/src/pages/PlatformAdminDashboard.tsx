import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';
import { 
  Users, 
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';

/**
 * Platform Admin Dashboard
 * 
 * This is the main dashboard interface for Spaghetti platform administrators.
 * It provides comprehensive oversight of all client organizations, revenue metrics,
 * platform health, and administrative operations.
 * 
 * Key Features:
 * - Cross-tenant analytics and KPIs
 * - Client organization management
 * - Revenue and billing oversight
 * - Platform health monitoring
 * - User impersonation capabilities
 * - System administration tools
 */

interface PlatformMetrics {
  totalClients: number;
  activeClients: number;
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  platformHealth: {
    apiResponseTime: number;
    databaseHealth: boolean;
    systemUptime: number;
    activeIncidents: number;
  };
}

interface ClientSummary {
  id: string;
  name: string;
  subdomain: string;
  tier: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Inactive';
  userCount: number;
  documentCount: number;
  storageUsedMB: number;
  monthlyRevenue: number;
  lastActive: string;
  healthScore: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description?: string;
  actionLabel?: string;
  actionCallback?: () => void;
}

export default function PlatformAdminDashboard() {
  const { user } = useAuth();
  
  // State management
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange] = useState('30d');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  // Load platform admin data on component mount
  useEffect(() => {
    fetchPlatformData();
  }, [selectedTimeRange]);

  /**
   * Fetch comprehensive platform administration data
   * This includes cross-tenant metrics, client summaries, and system health
   */
  const fetchPlatformData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual platform admin APIs
      // For now, using demo data that represents what the platform admin should see
      const mockMetrics: PlatformMetrics = {
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

      const mockClients: ClientSummary[] = [
        {
          id: 'client-1',
          name: 'Acme Legal Partners',
          subdomain: 'acme-legal',
          tier: 'Enterprise',
          status: 'Active',
          userCount: 156,
          documentCount: 2847,
          storageUsedMB: 1024,
          monthlyRevenue: 2499,
          lastActive: '2025-07-25T10:30:00Z',
          healthScore: 98
        },
        {
          id: 'client-2', 
          name: 'TechStart Innovation',
          subdomain: 'techstart',
          tier: 'Professional',
          status: 'Active',
          userCount: 28,
          documentCount: 445,
          storageUsedMB: 256,
          monthlyRevenue: 799,
          lastActive: '2025-07-25T09:15:00Z',
          healthScore: 95
        },
        {
          id: 'client-3',
          name: 'Global Consulting Group',
          subdomain: 'global-consulting',
          tier: 'Enterprise',
          status: 'Trial',
          userCount: 75,
          documentCount: 1203,
          storageUsedMB: 512,
          monthlyRevenue: 0, // Trial period
          lastActive: '2025-07-25T11:45:00Z',
          healthScore: 87
        }
      ];

      setMetrics(mockMetrics);
      setClients(mockClients);

    } catch (err) {
      console.error('Failed to fetch platform admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load platform data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate metric cards for the platform admin overview
   */
  const generateMetricCards = (): MetricCard[] => {
    if (!metrics) return [];

    return [
      {
        id: 'total-clients',
        title: 'Total Clients',
        value: metrics.totalClients,
        change: 12.5,
        changeType: 'positive',
        icon: <Building2 size={24} />,
        color: 'primary',
        description: 'Active client organizations',
        actionLabel: 'Add Client',
        actionCallback: () => handleAddClient()
      },
      {
        id: 'monthly-revenue',
        title: 'Monthly Recurring Revenue',
        value: `$${(metrics.monthlyRecurringRevenue / 1000).toFixed(0)}K`,
        change: 8.3,
        changeType: 'positive',
        icon: <DollarSign size={24} />,
        color: 'success',
        description: 'Platform MRR',
        actionLabel: 'View Details',
        actionCallback: () => handleViewRevenue()
      },
      {
        id: 'total-users',
        title: 'Platform Users',
        value: metrics.totalUsers.toLocaleString(),
        change: 15.7,
        changeType: 'positive',
        icon: <Users size={24} />,
        color: 'info',
        description: 'Users across all clients',
        actionLabel: 'User Analytics',
        actionCallback: () => handleViewUsers()
      },
      {
        id: 'system-health',
        title: 'System Health',
        value: `${metrics.platformHealth.systemUptime}%`,
        change: 0.02,
        changeType: 'positive',
        icon: <Activity size={24} />,
        color: 'warning',
        description: 'Platform uptime',
        actionLabel: 'Monitor',
        actionCallback: () => handleViewHealth()
      }
    ];
  };

  // Action handlers
  const handleAddClient = () => {
    // TODO: Open client creation modal
    console.log('Add new client organization');
  };

  const handleViewRevenue = () => {
    // TODO: Navigate to revenue analytics
    console.log('View revenue analytics');
  };

  const handleViewUsers = () => {
    // TODO: Navigate to user management
    console.log('View user analytics');
  };

  const handleViewHealth = () => {
    // TODO: Navigate to system health monitoring
    console.log('View system health monitoring');
  };

  const handleImpersonateUser = (clientId: string) => {
    // TODO: Implement secure user impersonation
    console.log(`Impersonate user in client: ${clientId}`);
  };

  const handleManageClient = (clientId: string) => {
    // TODO: Open client management interface
    console.log(`Manage client: ${clientId}`);
  };

  /**
   * Filter clients based on search term and status filter
   */
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                         client.subdomain.toLowerCase().includes(clientSearchTerm.toLowerCase());
    const matchesFilter = clientFilter === 'all' || client.status.toLowerCase() === clientFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  /**
   * Format change percentage with appropriate styling
   */
  const formatChange = (change: number, type: 'positive' | 'negative' | 'neutral') => {
    const Icon = change > 0 ? TrendingUp : TrendingUp;
    const colorClass = type === 'positive' ? 'text-green-600' : 
                      type === 'negative' ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <Icon size={14} />
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">
            <Activity className="animate-spin" size={48} />
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

      {/* Platform Metrics Overview */}
      <section className="metrics-overview mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generateMetricCards().map((metric) => (
            <div key={metric.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                  <div className={`text-${metric.color}-600`}>
                    {metric.icon}
                  </div>
                </div>
                {metric.change && formatChange(metric.change, metric.changeType!)}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {metric.value}
                </h3>
                <p className="text-sm text-gray-600">{metric.title}</p>
                {metric.description && (
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                )}
              </div>
              
              {metric.actionCallback && (
                <button 
                  onClick={metric.actionCallback}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {metric.actionLabel} →
                </button>
              )}
            </div>
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
              
              {/* Client Management Controls */}
              <div className="flex space-x-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Clients</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Client List */}
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.subdomain}.spaghetti.app</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          client.status === 'Active' ? 'bg-green-100 text-green-800' :
                          client.status === 'Trial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                        <span className="text-xs text-gray-500">{client.tier}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{client.userCount}</p>
                      <p className="text-xs text-gray-600">Users</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{client.documentCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Documents</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        ${client.monthlyRevenue > 0 ? client.monthlyRevenue.toLocaleString() : 'Trial'}
                      </p>
                      <p className="text-xs text-gray-600">Monthly</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleImpersonateUser(client.id)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Impersonate user"
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}