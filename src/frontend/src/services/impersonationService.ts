import { fetchApi } from './api';
import type {
  ImpersonationTarget,
  ImpersonationSession,
  ImpersonationSessionHistory,
  StartImpersonationRequest,
  EndImpersonationRequest,
  EmergencyEndRequest,
  PaginatedResult
} from '../types';

/**
 * Impersonation Service
 * 
 * Provides secure user impersonation capabilities for platform administrators
 * and support team members. All operations are logged and audited for compliance.
 */

export class ImpersonationService {
  /**
   * Get available users for impersonation within a client organization
   * @param clientId - The client tenant ID to search for users
   */
  static async getImpersonationTargets(clientId: string): Promise<ImpersonationTarget[]> {
    return fetchApi<ImpersonationTarget[]>(`/impersonation/clients/${clientId}/users`);
  }

  /**
   * Start an impersonation session for the specified user
   * @param request - Request containing target user ID, reason, and duration
   */
  static async startImpersonation(request: StartImpersonationRequest): Promise<ImpersonationSession> {
    return fetchApi<ImpersonationSession>('/impersonation/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get the current active impersonation session (if any)
   */
  static async getCurrentSession(): Promise<ImpersonationSession | null> {
    try {
      return await fetchApi<ImpersonationSession>('/impersonation/session');
    } catch (error: any) {
      // Return null if no active session found (404)
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * End the current impersonation session
   * @param request - Optional reason for ending the session
   */
  static async endImpersonation(request?: EndImpersonationRequest): Promise<{ message: string; duration: string }> {
    return fetchApi<{ message: string; duration: string }>('/impersonation/end', {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * Get impersonation session history for audit purposes
   * @param options - Filter and pagination options
   */
  static async getImpersonationHistory(options: {
    page?: number;
    pageSize?: number;
    adminUserId?: string;
    targetUserId?: string;
    fromDate?: string;
    toDate?: string;
  } = {}): Promise<PaginatedResult<ImpersonationSessionHistory>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options.adminUserId) params.append('adminUserId', options.adminUserId);
    if (options.targetUserId) params.append('targetUserId', options.targetUserId);
    if (options.fromDate) params.append('fromDate', options.fromDate);
    if (options.toDate) params.append('toDate', options.toDate);

    const queryString = params.toString();
    const endpoint = queryString ? `/impersonation/history?${queryString}` : '/impersonation/history';
    
    return fetchApi<PaginatedResult<ImpersonationSessionHistory>>(endpoint);
  }

  /**
   * Emergency termination of all active impersonation sessions
   * WARNING: This should only be used in emergency situations
   * @param request - Request with confirmation token and reason
   */
  static async emergencyEndAllSessions(request: EmergencyEndRequest): Promise<{ message: string; terminatedSessions: number }> {
    return fetchApi<{ message: string; terminatedSessions: number }>('/impersonation/emergency-end-all', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search for users across all tenants for impersonation
   * @param searchQuery - Email, name, or organization to search for
   */
  static async searchUsers(searchQuery: string): Promise<ImpersonationTarget[]> {
    // This would typically search across all tenants, but for now we'll implement
    // a client-based search. This could be enhanced with a platform-wide search endpoint
    const params = new URLSearchParams({ search: searchQuery });
    return fetchApi<ImpersonationTarget[]>(`/impersonation/search?${params.toString()}`);
  }

  /**
   * Check if the current user has impersonation permissions
   */
  static async hasImpersonationPermission(): Promise<boolean> {
    try {
      // Try to access the history endpoint with minimal parameters
      await this.getImpersonationHistory({ page: 1, pageSize: 1 });
      return true;
    } catch (error: any) {
      // If we get a 403 Forbidden, user doesn't have permission
      if (error.status === 403) {
        return false;
      }
      // For other errors, assume permission exists (could be network issues)
      return true;
    }
  }

  /**
   * Format session duration for display
   * @param startedAt - Session start time
   * @param endedAt - Session end time (optional, uses current time if not provided)
   */
  static formatSessionDuration(startedAt: string, endedAt?: string): string {
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Check if a session is expired
   * @param expiresAt - Session expiration time
   */
  static isSessionExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  }

  /**
   * Get time remaining until session expires
   * @param expiresAt - Session expiration time
   */
  static getTimeUntilExpiration(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const remainingMs = expires.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }
}

export default ImpersonationService;