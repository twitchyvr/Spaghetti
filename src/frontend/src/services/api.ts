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
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available (check both storage types)
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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

// Generic HTTP client for services
export const httpClient = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetchApi<T>(endpoint, { ...options, method: 'GET' });
    return { data: response };
  },

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
    return { data: response };
  },

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
    return { data: response };
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
    return { data: response };
  },
};

export default {
  admin: adminApi,
  documents: documentApi,
  users: userApi,
  auth: authApi,
  health: healthApi,
  // Add HTTP client methods for compatibility
  get: httpClient.get,
  post: httpClient.post,
  put: httpClient.put,
  delete: httpClient.delete,
};