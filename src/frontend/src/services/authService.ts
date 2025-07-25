import { User } from '../types';
import { config } from '../config';

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
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

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Failed to logout on server:', error);
      }
    }
  }

  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to reset password' }));
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to change password' }));
      throw new Error(error.message || 'Failed to change password');
    }
  }
}

export const authService = new AuthService();