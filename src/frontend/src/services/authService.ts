import { User, PrivacyLevel } from '../types';
import { config } from '../config';

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors: string[];
  timestamp: string;
}

// Backend DTO interfaces matching the API
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: BackendUserDto;
  tenant?: BackendTenantDto;
  roles: string[];
  permissions: string[];
}

interface BackendUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userType: string;
  isActive: boolean;
  lastLoginAt?: string;
  tenantId?: string;
  profile: {
    jobTitle?: string;
    department?: string;
    industry?: string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
    timeZone?: string;
    language: string;
  };
  settings: {
    enableAIAssistance: boolean;
    enableAutoDocumentation: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    theme: string;
    defaultDocumentType: string;
    favoriteAgents: string[];
  };
  roles: string[];
  permissions: string[];
}

interface BackendTenantDto {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  tier: string;
  industry: string;
  isActive: boolean;
  createdAt: string;
  trialExpiresAt?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
}

class AuthService {
  private baseUrl = config.apiBaseUrl;

  private isDemoMode(): boolean {
    // Check if we're on the production DigitalOcean deployment without backend
    const hostname = window.location.hostname;
    return hostname.includes('ondigitalocean.app') || hostname.includes('spaghetti-platform');
  }

  private createDemoLoginResponse(email: string, _tenantSubdomain?: string): { user: User; token: string; refreshToken: string } {
    const demoUser: User = {
      id: 'demo-user-12345',
      firstName: 'Demo',
      lastName: 'User',
      email: email,
      fullName: 'Demo User',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      tenantId: 'demo-tenant-67890',
      profile: {
        jobTitle: 'Platform Administrator',
        department: 'IT',
        industry: 'Legal',
        timeZone: 'UTC',
        language: 'en',
        customFields: {}
      },
      settings: {
        enableAIAssistance: true,
        enableAutoDocumentation: true,
        enableVoiceCapture: true,
        enableScreenCapture: true,
        enableFileMonitoring: true,
        privacyLevel: PrivacyLevel.Standard,
        allowDataRetention: true,
        dataRetentionDays: 365,
        enableEmailNotifications: true,
        enablePushNotifications: false,
        enableSlackNotifications: false,
        enableTeamsNotifications: false,
        theme: 'light',
        defaultDocumentType: 'Meeting Notes',
        favoriteAgents: ['AI Assistant', 'Document Generator'],
        moduleSettings: {},
        customSettings: {}
      },
      userRoles: [{
        id: 'demo-role-1',
        userId: 'demo-user-12345',
        roleId: 'admin',
        assignedAt: new Date().toISOString(),
        assignedBy: 'system',
        isActive: true
      }]
    };

    return {
      user: demoUser,
      token: 'demo-jwt-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now()
    };
  }

  private mapBackendUserToFrontend(backendUser: BackendUserDto): User {
    const user: User = {
      id: backendUser.id,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      email: backendUser.email,
      fullName: backendUser.fullName,
      isActive: backendUser.isActive,
      createdAt: new Date().toISOString(), // Backend doesn't provide this
      updatedAt: new Date().toISOString(), // Backend doesn't provide this
      lastLoginAt: backendUser.lastLoginAt || new Date().toISOString(),
      profile: {
        jobTitle: backendUser.profile.jobTitle || '',
        department: backendUser.profile.department || '',
        industry: backendUser.profile.industry || '',
        timeZone: backendUser.profile.timeZone || 'UTC',
        language: backendUser.profile.language || 'en',
        customFields: {}
      },
      settings: {
        enableAIAssistance: backendUser.settings.enableAIAssistance,
        enableAutoDocumentation: backendUser.settings.enableAutoDocumentation,
        enableVoiceCapture: true, // Default value
        enableScreenCapture: true, // Default value
        enableFileMonitoring: true, // Default value
        privacyLevel: PrivacyLevel.Standard, // Default value
        allowDataRetention: true, // Default value
        dataRetentionDays: 365, // Default value
        enableEmailNotifications: backendUser.settings.enableEmailNotifications,
        enablePushNotifications: backendUser.settings.enablePushNotifications,
        enableSlackNotifications: false, // Default value
        enableTeamsNotifications: false, // Default value
        theme: backendUser.settings.theme as any,
        defaultDocumentType: backendUser.settings.defaultDocumentType,
        favoriteAgents: backendUser.settings.favoriteAgents,
        moduleSettings: {},
        customSettings: {}
      },
      userRoles: backendUser.roles.map(roleName => ({
        id: `${backendUser.id}-${roleName}`,
        userId: backendUser.id,
        roleId: roleName,
        assignedAt: new Date().toISOString(),
        assignedBy: 'system',
        isActive: true
      }))
    };

    // Set optional properties conditionally
    if (backendUser.tenantId) {
      user.tenantId = backendUser.tenantId;
    }

    return user;
  }

  async login(email: string, password: string, tenantSubdomain?: string, rememberMe?: boolean): Promise<{ user: User; token: string; refreshToken: string }> {
    // Check if we're in demo mode (production frontend without backend)
    if (this.isDemoMode()) {
      // Store demo user email for getCurrentUser
      localStorage.setItem('demo_user_email', email);
      return this.createDemoLoginResponse(email, tenantSubdomain);
    }

    const requestBody = {
      email,
      password,
      rememberMe: rememberMe || false,
      tenantSubdomain: tenantSubdomain || undefined
    };

    const response = await fetch(`${this.baseUrl}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' })) as ApiResponse<any>;
      const errorMessage = errorData.message || errorData.errors?.[0] || 'Login failed';
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json() as ApiResponse<LoginResponse>;
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'Login failed');
    }

    const backendData = apiResponse.data;
    
    return {
      user: this.mapBackendUserToFrontend(backendData.user),
      token: backendData.accessToken,
      refreshToken: backendData.refreshToken
    };
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await fetch(`${this.baseUrl}/authentication/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' })) as ApiResponse<any>;
      const errorMessage = errorData.message || errorData.errors?.[0] || 'Registration failed';
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json() as ApiResponse<LoginResponse>;
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'Registration failed');
    }

    const backendData = apiResponse.data;
    
    return {
      user: this.mapBackendUserToFrontend(backendData.user),
      token: backendData.accessToken,
      refreshToken: backendData.refreshToken
    };
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Handle demo mode
    if (this.isDemoMode() && token.startsWith('demo-jwt-token-')) {
      const email = localStorage.getItem('demo_user_email') || 'demo@enterprise-docs.com';
      return this.createDemoLoginResponse(email).user;
    }

    const response = await fetch(`${this.baseUrl}/authentication/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get current user' })) as ApiResponse<any>;
      const errorMessage = errorData.message || 'Failed to get current user';
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json() as ApiResponse<BackendUserDto>;
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'Failed to get current user');
    }

    return this.mapBackendUserToFrontend(apiResponse.data);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    const response = await fetch(`${this.baseUrl}/authentication/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to refresh token' })) as ApiResponse<any>;
      const errorMessage = errorData.message || 'Failed to refresh token';
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json() as ApiResponse<RefreshTokenResponse>;
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'Failed to refresh token');
    }

    return {
      token: apiResponse.data.accessToken,
      refreshToken: apiResponse.data.refreshToken
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
      try {
        const requestBody = {
          refreshToken: refreshToken || undefined,
          logoutFromAllDevices: false
        };

        await fetch(`${this.baseUrl}/authentication/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      } catch (error) {
        console.warn('Failed to logout on server:', error);
      }
    }
  }

  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/authentication/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reset password' })) as ApiResponse<any>;
      const errorMessage = errorData.message || 'Failed to reset password';
      throw new Error(errorMessage);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const requestBody = {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    };

    const response = await fetch(`${this.baseUrl}/authentication/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to change password' })) as ApiResponse<any>;
      const errorMessage = errorData.message || 'Failed to change password';
      throw new Error(errorMessage);
    }
  }
}

export const authService = new AuthService();