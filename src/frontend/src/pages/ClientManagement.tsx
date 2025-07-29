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
  Pause,
  X
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
  tier: string; // Changed from specific string literals to string
  status: string; // Changed from specific string literals to string  
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

interface CreateClientForm {
  name: string;
  subdomain: string;
  domain: string;
  tier: 'Trial' | 'Professional' | 'Enterprise' | 'Custom';
  billingContactName: string;
  billingContactEmail: string;
  technicalContactName: string;
  technicalContactEmail: string;
  notes: string;
}

export default function ClientManagement() {
  // State management
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState<any>(null);
  const [isLoadingClientDetails, setIsLoadingClientDetails] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [createClientForm, setCreateClientForm] = useState<CreateClientForm>({
    name: '',
    subdomain: '',
    domain: '',
    tier: 'Trial',
    billingContactName: '',
    billingContactEmail: '',
    technicalContactName: '',
    technicalContactEmail: '',
    notes: ''
  });
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

      // Import API service and fetch real client data
      const { platformAdminApi } = await import('../services/api');
      const clientsData = await platformAdminApi.getClients();
      
      setClients(clientsData);

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

  /**
   * Create a new client organization
   */
  const handleCreateClient = async () => {
    try {
      setIsCreatingClient(true);
      
      // Import API service
      const { platformAdminApi } = await import('../services/api');
      
      // Validate form
      if (!createClientForm.name.trim()) {
        alert('Organization name is required');
        return;
      }
      
      if (!createClientForm.subdomain.trim()) {
        alert('Subdomain is required');
        return;
      }
      
      // Validate subdomain format
      if (!/^[a-z0-9-]+$/.test(createClientForm.subdomain)) {
        alert('Subdomain can only contain lowercase letters, numbers, and hyphens');
        return;
      }
      
      // Create the client
      const clientData = {
        name: createClientForm.name.trim(),
        subdomain: createClientForm.subdomain.trim().toLowerCase(),
        tier: createClientForm.tier,
        ...(createClientForm.domain.trim() && { domain: createClientForm.domain.trim() }),
        ...(createClientForm.billingContactName.trim() && { billingContactName: createClientForm.billingContactName.trim() }),
        ...(createClientForm.billingContactEmail.trim() && { billingContactEmail: createClientForm.billingContactEmail.trim() }),
        ...(createClientForm.technicalContactName.trim() && { technicalContactName: createClientForm.technicalContactName.trim() }),
        ...(createClientForm.technicalContactEmail.trim() && { technicalContactEmail: createClientForm.technicalContactEmail.trim() }),
        ...(createClientForm.notes.trim() && { notes: createClientForm.notes.trim() })
      };
      
      const newClient = await platformAdminApi.createClient(clientData);
      
      // Add to the client list
      setClients(prev => [newClient as ClientOrganization, ...prev]);
      
      // Reset form and close modal
      setCreateClientForm({
        name: '',
        subdomain: '',
        domain: '',
        tier: 'Trial',
        billingContactName: '',
        billingContactEmail: '',
        technicalContactName: '',
        technicalContactEmail: '',
        notes: ''
      });
      setShowAddClientModal(false);
      
      // Show success message
      alert(`Client "${newClient.name}" created successfully!`);
      
    } catch (err) {
      console.error('Failed to create client:', err);
      alert(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsCreatingClient(false);
    }
  };

  /**
   * Handle subdomain auto-generation from organization name
   */
  const handleNameChange = (name: string) => {
    setCreateClientForm(prev => ({
      ...prev,
      name,
      // Auto-generate subdomain if empty
      subdomain: prev.subdomain || name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
    }));
  };

  // Action handlers
  const handleViewClient = async (clientId: string) => {
    try {
      setIsLoadingClientDetails(true);
      setShowClientDetailsModal(true);
      
      // Import API service and fetch client details
      const { platformAdminApi } = await import('../services/api');
      const clientDetails = await platformAdminApi.getClient(clientId);
      
      setSelectedClientDetails(clientDetails);
    } catch (err) {
      console.error('Failed to load client details:', err);
      alert(err instanceof Error ? err.message : 'Failed to load client details');
      setShowClientDetailsModal(false);
    } finally {
      setIsLoadingClientDetails(false);
    }
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

      {/* Create Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Client Organization</h3>
                <button 
                  onClick={() => setShowAddClientModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateClient(); }} className="space-y-6">
                {/* Organization Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Organization Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={createClientForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Acme Legal Partners"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subdomain *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={createClientForm.subdomain}
                        onChange={(e) => setCreateClientForm(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="acme-legal"
                        pattern="^[a-z0-9-]+$"
                        required
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                        .spaghetti.app
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Domain (Optional)
                    </label>
                    <input
                      type="text"
                      value={createClientForm.domain}
                      onChange={(e) => setCreateClientForm(prev => ({ ...prev, domain: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. docs.acmelegal.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Tier *
                    </label>
                    <select
                      value={createClientForm.tier}
                      onChange={(e) => setCreateClientForm(prev => ({ ...prev, tier: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Trial">Trial (Free, 30 days)</option>
                      <option value="Professional">Professional ($799/month)</option>
                      <option value="Enterprise">Enterprise ($2,499/month)</option>
                      <option value="Custom">Custom (Contact sales)</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Contact Name
                      </label>
                      <input
                        type="text"
                        value={createClientForm.billingContactName}
                        onChange={(e) => setCreateClientForm(prev => ({ ...prev, billingContactName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Contact Email
                      </label>
                      <input
                        type="email"
                        value={createClientForm.billingContactEmail}
                        onChange={(e) => setCreateClientForm(prev => ({ ...prev, billingContactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="billing@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technical Contact Name
                      </label>
                      <input
                        type="text"
                        value={createClientForm.technicalContactName}
                        onChange={(e) => setCreateClientForm(prev => ({ ...prev, technicalContactName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technical Contact Email
                      </label>
                      <input
                        type="email"
                        value={createClientForm.technicalContactEmail}
                        onChange={(e) => setCreateClientForm(prev => ({ ...prev, technicalContactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tech@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Platform Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Admin Notes
                  </label>
                  <textarea
                    value={createClientForm.notes}
                    onChange={(e) => setCreateClientForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Internal notes about this client organization..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowAddClientModal(false)}
                    className="btn btn-secondary"
                    disabled={isCreatingClient}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary flex items-center space-x-2"
                    disabled={isCreatingClient}
                  >
                    {isCreatingClient ? (
                      <>
                        <Activity className="animate-spin" size={16} />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Create Client</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Client Organization Details</h3>
                <button 
                  onClick={() => {
                    setShowClientDetailsModal(false);
                    setSelectedClientDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {isLoadingClientDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Activity className="animate-spin" size={48} />
                  <span className="ml-3">Loading client details...</span>
                </div>
              ) : selectedClientDetails ? (
                <div className="space-y-6">
                  {/* Organization Overview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 size={32} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{selectedClientDetails.name}</h4>
                        <p className="text-gray-600">{selectedClientDetails.subdomain}.spaghetti.app</p>
                        {selectedClientDetails.domain && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Globe size={12} className="mr-1" />
                            {selectedClientDetails.domain}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{selectedClientDetails.userCount}</p>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{selectedClientDetails.activeUsers || Math.floor(selectedClientDetails.userCount * 0.7)}</p>
                        <p className="text-sm text-gray-600">Active Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{selectedClientDetails.documentCount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Documents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{selectedClientDetails.healthScore}%</p>
                        <p className="text-sm text-gray-600">Health Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subscription & Billing */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900">Subscription & Billing</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tier:</span>
                          <span className="font-medium">{selectedClientDetails.tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Revenue:</span>
                          <span className="font-medium">
                            {selectedClientDetails.monthlyRevenue > 0 ? `$${selectedClientDetails.monthlyRevenue.toLocaleString()}` : 'Trial'}
                          </span>
                        </div>
                        {selectedClientDetails.annualContract && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Annual Contract:</span>
                            <span className="font-medium">${selectedClientDetails.annualContract.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedClientDetails.status === 'Active' ? 'bg-green-100 text-green-800' :
                            selectedClientDetails.status === 'Trial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedClientDetails.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Storage & Usage */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900">Storage & Usage</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage Used:</span>
                          <span className="font-medium">{selectedClientDetails.storageUsedMB} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage Quota:</span>
                          <span className="font-medium">{selectedClientDetails.storageQuotaMB} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{
                              width: `${Math.min((selectedClientDetails.storageUsedMB / selectedClientDetails.storageQuotaMB) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Documents This Month:</span>
                          <span className="font-medium">{selectedClientDetails.documentsThisMonth || Math.floor(selectedClientDetails.documentCount * 0.3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features & Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Features */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900">Features</h5>
                      <div className="space-y-2">
                        {selectedClientDetails.features && selectedClientDetails.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          {selectedClientDetails.customBranding ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-gray-400" />
                          )}
                          <span className="text-gray-700">Custom Branding</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedClientDetails.ssoEnabled ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-gray-400" />
                          )}
                          <span className="text-gray-700">SSO Integration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedClientDetails.apiAccess ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-gray-400" />
                          )}
                          <span className="text-gray-700">API Access</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900">Contact Information</h5>
                      <div className="space-y-4">
                        <div>
                          <h6 className="font-medium text-gray-900">Billing Contact</h6>
                          <p className="text-gray-600">{selectedClientDetails.billingContact?.name || 'Not provided'}</p>
                          <p className="text-gray-600">{selectedClientDetails.billingContact?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-900">Technical Contact</h6>
                          <p className="text-gray-600">{selectedClientDetails.technicalContact?.name || 'Not provided'}</p>
                          <p className="text-gray-600">{selectedClientDetails.technicalContact?.email || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-gray-900">Timeline</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium">{new Date(selectedClientDetails.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Active:</span>
                        <span className="ml-2 font-medium">{new Date(selectedClientDetails.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setShowClientDetailsModal(false);
                        setSelectedClientDetails(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                    <button className="btn btn-primary">
                      Manage Client
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Failed to load client details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}