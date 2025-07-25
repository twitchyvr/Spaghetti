// API Service Layer for Enterprise Docs Platform

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Generic API response type
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

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
  
  const defaultHeaders = {
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
    return fetchApi<{
      totalUsers: number;
      totalDocuments: number;
      totalTenants: number;
      totalRoles: number;
      totalPermissions: number;
      totalAuditEntries: number;
      databaseSize: string;
      lastBackup: string | null;
      systemHealth: {
        database: boolean;
        redis: boolean;
        elasticsearch: boolean;
      };
    }>('/admin/database-stats');
  },

  // Check sample data status
  async getSampleDataStatus() {
    return fetchApi<{
      hasSampleData: boolean;
      counts: {
        users: number;
        documents: number;
        tenants: number;
      };
    }>('/admin/sample-data-status');
  },

  // Seed sample data
  async seedSampleData() {
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

export default {
  admin: adminApi,
  documents: documentApi,
  users: userApi,
  auth: authApi,
  health: healthApi,
};