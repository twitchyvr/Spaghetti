import { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import { 
  Building2,
  Users,
  FileText,
  DollarSign,
  Plus,
  Search,
  Eye,
  Settings,
  Edit2,
  AlertCircle,
  Activity,
  Shield,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Pause
} from 'lucide-react';

/**
 * Client Management Dashboard
 * 
 * This is the comprehensive client/tenant management interface for platform administrators.
 * It provides full lifecycle management of client organizations including onboarding,
 * configuration, monitoring, and support operations.
 * 
 * Key Features:
 * - Client organization listing and search
 * - Detailed client profiles and analytics
 * - License and quota management
 * - Billing and revenue tracking
 * - Support tools and impersonation
 * - Client health monitoring
 */

interface ClientOrganization {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  tier: 'Trial' | 'Professional' | 'Enterprise' | 'Custom';
  status: 'Active' | 'Trial' | 'Suspended' | 'Inactive' | 'Pending';
  userCount: number;
  documentCount: number;
  storageUsedMB: number;
  storageQuotaMB: number;
  monthlyRevenue: number;
  annualContract?: number;
  createdAt: string;
  lastActive: string;
  healthScore: number;
  supportTickets: number;
  billingContact: {
    name: string;
    email: string;
  };
  technicalContact: {
    name: string;
    email: string;
  };
  features: string[];
  customBranding: boolean;
  ssoEnabled: boolean;
  apiAccess: boolean;
}

interface ClientFilters {
  status: string;
  tier: string;
  healthScore: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function ClientManagement() {
  // State management
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [filters, setFilters] = useState<ClientFilters>({
    status: 'all',
    tier: 'all',
    healthScore: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Load client data on component mount
  useEffect(() => {
    fetchClientData();
  }, []);

  // Apply filters and search when dependencies change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [clients, searchTerm, filters]);

  /**
   * Fetch all client organizations data
   * This includes comprehensive client information, analytics, and health metrics
   */
  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual client management APIs
      // For now, using comprehensive demo data that represents enterprise-level clients
      const mockClients: ClientOrganization[] = [
        {
          id: 'client-1',
          name: 'Acme Legal Partners',
          subdomain: 'acme-legal',
          domain: 'acmelegal.com',
          tier: 'Enterprise',
          status: 'Active',
          userCount: 156,
          documentCount: 2847,
          storageUsedMB: 1024,
          storageQuotaMB: 5120,
          monthlyRevenue: 2499,
          annualContract: 29988,
          createdAt: '2024-03-15T10:30:00Z',
          lastActive: '2025-07-25T10:30:00Z',
          healthScore: 98,
          supportTickets: 2,
          billingContact: {
            name: 'Sarah Johnson',
            email: 'billing@acmelegal.com'
          },
          technicalContact: {
            name: 'Michael Chen',
            email: 'tech@acmelegal.com'
          },
          features: ['SSO', 'API Access', 'Custom Branding', 'Advanced Analytics', 'Priority Support'],
          customBranding: true,
          ssoEnabled: true,
          apiAccess: true
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
          storageQuotaMB: 1024,
          monthlyRevenue: 799,
          createdAt: '2024-11-08T14:22:00Z',
          lastActive: '2025-07-25T09:15:00Z',
          healthScore: 95,
          supportTickets: 0,
          billingContact: {
            name: 'Alex Thompson',
            email: 'alex@techstart.io'
          },
          technicalContact: {
            name: 'Jamie Rodriguez',
            email: 'jamie@techstart.io'
          },
          features: ['Standard Support', 'Team Collaboration', 'Document Templates'],
          customBranding: false,
          ssoEnabled: false,
          apiAccess: true
        },
        {
          id: 'client-3',
          name: 'Global Consulting Group',
          subdomain: 'global-consulting',
          domain: 'globalconsulting.com',
          tier: 'Enterprise',
          status: 'Trial',
          userCount: 75,
          documentCount: 1203,
          storageUsedMB: 512,
          storageQuotaMB: 5120,
          monthlyRevenue: 0, // Trial period
          createdAt: '2025-07-10T08:45:00Z',
          lastActive: '2025-07-25T11:45:00Z',
          healthScore: 87,
          supportTickets: 3,
          billingContact: {
            name: 'Robert Kim',
            email: 'finance@globalconsulting.com'
          },
          technicalContact: {
            name: 'Lisa Wang',
            email: 'lisa.wang@globalconsulting.com'  
          },
          features: ['Trial Access', 'SSO', 'Custom Branding', 'Advanced Analytics'],
          customBranding: true,
          ssoEnabled: true,
          apiAccess: false
        },
        {
          id: 'client-4',
          name: 'StartupLaw Advisors',
          subdomain: 'startuplaw',
          tier: 'Professional',
          status: 'Suspended',
          userCount: 12,
          documentCount: 189,
          storageUsedMB: 128,
          storageQuotaMB: 1024,
          monthlyRevenue: 599,
          createdAt: '2024-09-22T16:10:00Z',
          lastActive: '2025-07-20T14:22:00Z',
          healthScore: 65,
          supportTickets: 5,
          billingContact: {
            name: 'David Lee',
            email: 'david@startuplaw.com'
          },
          technicalContact: {
            name: 'Emily Chen',
            email: 'emily@startuplaw.com'
          },
          features: ['Standard Support', 'Team Collaboration'],
          customBranding: false,
          ssoEnabled: false,
          apiAccess: false
        }
      ];

      setClients(mockClients);

    } catch (err) {
      console.error('Failed to fetch client data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply search filters and sorting to client list
   */
  const applyFiltersAndSearch = () => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.domain?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(client => 
        client.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply tier filter
    if (filters.tier !== 'all') {
      filtered = filtered.filter(client => 
        client.tier.toLowerCase() === filters.tier.toLowerCase()
      );
    }

    // Apply health score filter
    if (filters.healthScore !== 'all') {
      filtered = filtered.filter(client => {
        if (filters.healthScore === 'excellent') return client.healthScore >= 90;
        if (filters.healthScore === 'good') return client.healthScore >= 70 && client.healthScore < 90;
        if (filters.healthScore === 'poor') return client.healthScore < 70;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof ClientOrganization];
      let bValue: any = b[filters.sortBy as keyof ClientOrganization];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredClients(filtered);
  };

  /**
   * Format client status with appropriate styling
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { icon: CheckCircle, color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
      'Trial': { icon: Clock, color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' },
      'Suspended': { icon: Pause, color: 'bg-orange-100 text-orange-800', iconColor: 'text-orange-600' },
      'Inactive': { icon: XCircle, color: 'bg-red-100 text-red-800', iconColor: 'text-red-600' },
      'Pending': { icon: Clock, color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <Icon size={12} className={`mr-1 ${config?.iconColor || 'text-gray-600'}`} />
        {status}
      </span>
    );
  };

  /**
   * Format health score with color coding
   */
  const getHealthScoreDisplay = (score: number) => {
    let colorClass = 'text-green-600';
    if (score < 70) colorClass = 'text-red-600';
    else if (score < 90) colorClass = 'text-yellow-600';

    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <Activity size={14} />
        <span className="font-medium">{score}%</span>
      </div>
    );
  };

  // Action handlers
  const handleViewClient = (clientId: string) => {
    // TODO: Navigate to detailed client view
    console.log(`View client details: ${clientId}`);
  };

  const handleImpersonateClient = (clientId: string) => {
    // TODO: Implement secure client impersonation
    console.log(`Impersonate client: ${clientId}`);
  };

  const handleManageClient = (clientId: string) => {
    // TODO: Open client management interface
    console.log(`Manage client: ${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    // TODO: Open client edit modal
    console.log(`Edit client: ${clientId}`);
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="client-management">
        <div className="loading-container">
          <div className="loading-spinner">
            <Activity className="loading-icon animate-spin" />
          </div>
          <p className="loading-text">Loading client organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-management">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchClientData} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="page-header mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor all client organizations across the platform
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredClients.length} of {clients.length} clients displayed
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddClientModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Client</span>
            </button>
            <button className="btn btn-secondary flex items-center space-x-2">
              <Shield size={16} />
              <span>Bulk Actions</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Controls */}
      <section className="search-filters mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, subdomain, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={filters.tier}
                onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tiers</option>
                <option value="trial">Trial</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Custom</option>
              </select>

              <select
                value={filters.healthScore}
                onChange={(e) => setFilters(prev => ({ ...prev, healthScore: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Health</option>
                <option value="excellent">Excellent (90%+)</option>
                <option value="good">Good (70-89%)</option>
                <option value="poor">Poor (&lt;70%)</option>
              </select>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  if (sortBy && sortOrder) {
                    setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="monthlyRevenue-desc">Revenue High-Low</option>
                <option value="healthScore-desc">Health High-Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Client List */}
      <section className="client-list">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Organization</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Tier</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Users</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Documents</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Revenue</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Health</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.subdomain}.spaghetti.app</p>
                          {client.domain && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <Globe size={10} className="mr-1" />
                              {client.domain}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{client.tier}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-900">
                        <Users size={14} />
                        <span className="font-medium">{client.userCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-900">
                        <FileText size={14} />
                        <span className="font-medium">{client.documentCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-900">
                        <DollarSign size={14} />
                        <span className="font-medium">
                          {client.monthlyRevenue > 0 ? `$${client.monthlyRevenue.toLocaleString()}` : 'Trial'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getHealthScoreDisplay(client.healthScore)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewClient(client.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleImpersonateClient(client.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Impersonate"
                        >
                          <Shield size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client.id)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleManageClient(client.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Manage"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {filteredClients.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building2 className="empty-state-icon mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filters.status !== 'all' || filters.tier !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first client organization'
                }
              </p>
              {(!searchTerm && filters.status === 'all' && filters.tier === 'all') && (
                <button 
                  onClick={() => setShowAddClientModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Client
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add Client Modal - TODO: Implement */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
            <p className="text-gray-600 mb-4">Client creation modal will be implemented here.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button className="btn btn-primary flex-1">
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}