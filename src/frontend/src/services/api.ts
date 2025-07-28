// API Service Layer for Enterprise Docs Platform

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:5001/api';
const DEMO_MODE = import.meta.env['VITE_DEMO_MODE'] === 'true' || API_BASE_URL.includes('api-placeholder');


// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error'
    );
  }
}

// Admin API endpoints
export const adminApi = {
  // Get database statistics
  async getDatabaseStats() {
    if (DEMO_MODE) {
      // Return demo data for production deployment
      return Promise.resolve({
        totalUsers: 12,
        totalDocuments: 247,
        totalTenants: 3,
        totalRoles: 5,
        totalPermissions: 15,
        totalAuditEntries: 156,
        databaseSize: '15.2 MB',
        lastBackup: new Date().toISOString(),
        systemHealth: {
          database: true,
          redis: true,
          elasticsearch: true,
        },
      });
    }
    
    const response = await fetchApi<{
      tenants: number;
      users: number;
      documents: number;
      documentTags: number;
      documentPermissions: number;
      roles: number;
      userRoles: number;
      tenantModules: number;
      documentAudits: number;
      userAudits: number;
      tenantAudits: number;
      databaseStatus: string;
      lastChecked: string;
    }>('/admin/database-stats');

    // Transform API response to match frontend expectations
    return {
      totalUsers: response.users,
      totalDocuments: response.documents,
      totalTenants: response.tenants,
      totalRoles: response.roles,
      totalPermissions: response.documentPermissions,
      totalAuditEntries: response.documentAudits + response.userAudits + response.tenantAudits,
      databaseSize: '0 MB', // API doesn't return this yet
      lastBackup: null, // API doesn't return this yet
      systemHealth: {
        database: response.databaseStatus === 'healthy',
        redis: true, // Assume healthy for now
        elasticsearch: true // Assume healthy for now
      }
    };
  },

  // Check sample data status
  async getSampleDataStatus() {
    if (DEMO_MODE) {
      // Return demo data for production deployment
      return Promise.resolve({
        hasSampleData: true,
        counts: {
          users: 12,
          documents: 247,
          tenants: 3,
        },
      });
    }
    
    const response = await fetchApi<{
      hasSampleData: boolean;
      hasDemoUser: boolean;
      sampleTenantsCount: number;
      totalUsers: number;
      totalDocuments: number;
      lastChecked: string;
    }>('/admin/sample-data-status');

    // Transform API response to match frontend expectations
    return {
      hasSampleData: response.hasSampleData,
      counts: {
        users: response.totalUsers,
        documents: response.totalDocuments,
        tenants: response.sampleTenantsCount
      }
    };
  },

  // Seed sample data
  async seedSampleData() {
    if (DEMO_MODE) {
      // Return success message for demo mode
      return Promise.resolve({
        message: 'Demo data is already available in production mode',
        seededCounts: {
          tenants: 3,
          users: 12,
          documents: 247,
          tags: 25,
          permissions: 15,
          auditEntries: 156,
        },
      });
    }
    
    return fetchApi<{
      message: string;
      seededCounts: {
        tenants: number;
        users: number;
        documents: number;
        tags: number;
        permissions: number;
        auditEntries: number;
      };
    }>('/admin/seed-sample-data', {
      method: 'POST',
    });
  },

  // Clear all data (dangerous!)
  async clearAllData(confirmationToken: string) {
    return fetchApi<{
      message: string;
      clearedTables: string[];
    }>(`/admin/clear-all-data?confirmationToken=${confirmationToken}`, {
      method: 'DELETE',
    });
  },

  // Create admin user
  async createAdminUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    return fetchApi<{
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }>('/admin/create-admin-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Document API endpoints
export const documentApi = {
  // Get all documents
  async getDocuments(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    tenantId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.tenantId) queryParams.append('tenantId', params.tenantId);

    const query = queryParams.toString();
    return fetchApi<{
      items: Array<{
        id: string;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        tenantId: string;
        tags: string[];
      }>;
      totalCount: number;
      page: number;
      pageSize: number;
    }>(`/documents${query ? `?${query}` : ''}`);
  },

  // Get document by ID
  async getDocument(id: string) {
    return fetchApi<{
      id: string;
      title: string;
      content: string;
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      tenantId: string;
      tags: string[];
      attachments: Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
      }>;
    }>(`/documents/${id}`);
  },

  // Create document
  async createDocument(data: {
    title: string;
    content: string;
    tags?: string[];
  }) {
    return fetchApi<{
      id: string;
      title: string;
      content: string;
    }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update document
  async updateDocument(id: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
  }) {
    return fetchApi<{
      id: string;
      title: string;
      content: string;
    }>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete document
  async deleteDocument(id: string) {
    return fetchApi<{
      message: string;
    }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// User API endpoints
export const userApi = {
  // Get current user
  async getCurrentUser() {
    return fetchApi<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      tenantId: string;
      roles: string[];
    }>('/users/me');
  },

  // Update user profile
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    return fetchApi<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get all users (admin only)
  async getUsers() {
    return fetchApi<{
      items: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
        createdAt: string;
        isActive: boolean;
      }>;
      totalCount: number;
    }>('/users');
  },
};

// Auth API endpoints
export const authApi = {
  // Login
  async login(credentials: {
    email: string;
    password: string;
  }) {
    return fetchApi<{
      token: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName?: string;
  }) {
    return fetchApi<{
      token: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Logout
  async logout() {
    return fetchApi<{
      message: string;
    }>('/auth/logout', {
      method: 'POST',
    });
  },

  // Refresh token
  async refreshToken() {
    return fetchApi<{
      token: string;
    }>('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Health check
export const healthApi = {
  async check() {
    return fetchApi<{
      status: string;
      timestamp: string;
      services: {
        database: boolean;
        redis: boolean;
        elasticsearch: boolean;
      };
    }>('/health');
  },
};

// Platform Admin API endpoints
export const platformAdminApi = {
  // Get platform metrics
  async getPlatformMetrics() {
    if (DEMO_MODE) {
      return Promise.resolve({
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
      });
    }
    
    return fetchApi<{
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
    }>('/platform-admin/metrics');
  },

  // Get all clients
  async getClients() {
    if (DEMO_MODE) {
      return Promise.resolve([
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
          monthlyRevenue: 0,
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
        }
      ]);
    }
    
    return fetchApi<Array<{
      id: string;
      name: string;
      subdomain: string;
      domain?: string;
      tier: string;
      status: string;
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
    }>>('/platform-admin/clients');
  },

  // Get client details
  async getClient(clientId: string) {
    if (DEMO_MODE) {
      const clients = await this.getClients();
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        throw new ApiError(404, 'Client not found');
      }
      return {
        ...client,
        activeUsers: Math.floor(client.userCount * 0.7),
        adminUsers: Math.floor(client.userCount * 0.1),
        documentsThisMonth: Math.floor(client.documentCount * 0.3),
        publicDocuments: Math.floor(client.documentCount * 0.1)
      };
    }
    
    return fetchApi<{
      id: string;
      name: string;
      subdomain: string;
      domain?: string;
      tier: string;
      status: string;
      createdAt: string;
      lastActive: string;
      userCount: number;
      activeUsers: number;
      adminUsers: number;
      documentCount: number;
      documentsThisMonth: number;
      publicDocuments: number;
      storageUsedMB: number;
      storageQuotaMB: number;
      monthlyRevenue: number;
      annualContract?: number;
      healthScore: number;
      supportTickets: number;
      features: string[];
      customBranding: boolean;
      ssoEnabled: boolean;
      apiAccess: boolean;
    }>(`/platform-admin/clients/${clientId}`);
  },

  // Create new client
  async createClient(data: {
    name: string;
    subdomain: string;
    domain?: string;
    tier: string;
    billingContactName?: string;
    billingContactEmail?: string;
    technicalContactName?: string;
    technicalContactEmail?: string;
    notes?: string;
  }) {
    if (DEMO_MODE) {
      return Promise.resolve({
        id: `client-${Date.now()}`,
        name: data.name,
        subdomain: data.subdomain,
        domain: data.domain,
        tier: data.tier,
        status: 'Active',
        userCount: 0,
        documentCount: 0,
        storageUsedMB: 0,
        storageQuotaMB: data.tier === 'Enterprise' ? 5120 : 1024,
        monthlyRevenue: data.tier === 'Enterprise' ? 2499 : data.tier === 'Professional' ? 799 : 0,
        annualContract: data.tier === 'Enterprise' ? 29988 : data.tier === 'Professional' ? 9588 : null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        healthScore: 100,
        supportTickets: 0,
        billingContact: {
          name: data.billingContactName || 'Billing Contact',
          email: data.billingContactEmail || `billing@${data.subdomain}.com`
        },
        technicalContact: {
          name: data.technicalContactName || 'Technical Contact',
          email: data.technicalContactEmail || `tech@${data.subdomain}.com`
        },
        features: data.tier === 'Enterprise' ? ['SSO', 'API Access', 'Custom Branding'] : data.tier === 'Professional' ? ['API Access', 'Team Collaboration'] : ['Trial Access'],
        customBranding: data.tier === 'Enterprise',
        ssoEnabled: data.tier === 'Enterprise',
        apiAccess: data.tier !== 'Trial'
      });
    }
    
    return fetchApi<{
      id: string;
      name: string;
      subdomain: string;
      domain?: string;
      tier: string;
      status: string;
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
    }>('/platform-admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update client
  async updateClient(clientId: string, data: {
    name?: string;
    domain?: string;
    tier?: string;
    isActive?: boolean;
    notes?: string;
  }) {
    if (DEMO_MODE) {
      const client = await this.getClient(clientId);
      return {
        ...client,
        ...data,
        status: data.isActive !== undefined ? (data.isActive ? 'Active' : 'Inactive') : client.status,
      };
    }
    
    return fetchApi<{
      id: string;
      name: string;
      subdomain: string;
      domain?: string;
      tier: string;
      status: string;
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
    }>(`/platform-admin/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Client Management API endpoints
export const clientManagementApi = {
  // Get client users
  async getClientUsers(clientId: string) {
    if (DEMO_MODE) {
      return Promise.resolve([
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          role: 'Client.Admin',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2025-07-25T08:45:00Z',
          documentCount: 25,
          storageUsedMB: 150
        }
      ]);
    }
    
    return fetchApi<Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      lastLoginAt?: string;
      documentCount: number;
      storageUsedMB: number;
    }>>(`/client-management/${clientId}/users`);
  },

  // Get client documents
  async getClientDocuments(clientId: string, page = 1, pageSize = 50) {
    if (DEMO_MODE) {
      return Promise.resolve({
        items: [
          {
            id: 'doc-1',
            title: 'Sample Document',
            authorName: 'John Smith',
            createdAt: '2025-07-20T10:30:00Z',
            updatedAt: '2025-07-25T14:22:00Z',
            publicAccessLevel: 'Private',
            tags: ['legal', 'contract'],
            sizeBytes: 2048,
            viewCount: 45
          }
        ],
        totalCount: 1,
        page: 1,
        pageSize: 50,
        totalPages: 1
      });
    }
    
    return fetchApi<{
      items: Array<{
        id: string;
        title: string;
        authorName: string;
        createdAt: string;
        updatedAt: string;
        publicAccessLevel: string;
        tags: string[];
        sizeBytes: number;
        viewCount: number;
      }>;
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/client-management/${clientId}/documents?page=${page}&pageSize=${pageSize}`);
  },

  // Suspend client
  async suspendClient(clientId: string, reason: string) {
    if (DEMO_MODE) {
      return Promise.resolve({
        message: 'Client organization suspended successfully'
      });
    }
    
    return fetchApi<{
      message: string;
    }>(`/client-management/${clientId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Reactivate client
  async reactivateClient(clientId: string) {
    if (DEMO_MODE) {
      return Promise.resolve({
        message: 'Client organization reactivated successfully'
      });
    }
    
    return fetchApi<{
      message: string;
    }>(`/client-management/${clientId}/reactivate`, {
      method: 'POST',
    });
  },

  // Delete client (dangerous!)
  async deleteClient(clientId: string, confirmationToken: string) {
    if (DEMO_MODE) {
      return Promise.resolve({
        message: 'Client organization deleted successfully',
        deletedData: {
          clientName: 'Demo Client',
          userCount: 5,
          documentCount: 25
        }
      });
    }
    
    return fetchApi<{
      message: string;
      deletedData: {
        clientName: string;
        userCount: number;
        documentCount: number;
      };
    }>(`/client-management/${clientId}?confirmationToken=${confirmationToken}`, {
      method: 'DELETE',
    });
  },

  // Create admin user for client
  async createAdminUser(clientId: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    if (DEMO_MODE) {
      return Promise.resolve({
        id: `user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: 'Client.Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        documentCount: 0,
        storageUsedMB: 0
      });
    }
    
    return fetchApi<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      lastLoginAt?: string;
      documentCount: number;
      storageUsedMB: number;
    }>(`/client-management/${clientId}/admin-user`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update client subscription
  async updateSubscription(clientId: string, tier: string) {
    if (DEMO_MODE) {
      return Promise.resolve({
        message: 'Subscription updated successfully',
        oldTier: 'Professional',
        newTier: tier
      });
    }
    
    return fetchApi<{
      message: string;
      oldTier: string;
      newTier: string;
    }>(`/client-management/${clientId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  },
};

export default {
  admin: adminApi,
  documents: documentApi,
  users: userApi,
  auth: authApi,
  health: healthApi,
  platformAdmin: platformAdminApi,
  clientManagement: clientManagementApi,
};