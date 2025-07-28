import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  User, 
  Building, 
  Clock, 
  FileText, 
  Shield,
  AlertTriangle,
  Loader2,
  Users
} from 'lucide-react';
import ImpersonationService from '../../services/impersonationService';
import { fetchApi } from '../../services/api';
import type { 
  ImpersonationTarget, 
  ImpersonationSession, 
  StartImpersonationRequest,
  Tenant 
} from '../../types';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImpersonationStarted: (session: ImpersonationSession) => void;
}

interface SearchResult extends ImpersonationTarget {
  tenant?: {
    name: string;
    tier: string;
    status: string;
  } | undefined;
}

/**
 * User Search Modal
 * 
 * Modal interface for searching and selecting users to impersonate.
 * Provides comprehensive user search across all tenants with detailed
 * user information and one-click impersonation capabilities.
 * 
 * Key Features:
 * - Real-time search across all tenants
 * - User details including role, last login, and document count
 * - Organization context and tenant information
 * - Reason capture and session duration settings
 * - Security warnings and confirmation
 */

export default function UserSearchModal({ isOpen, onClose, onImpersonationStarted }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingImpersonation, setIsStartingImpersonation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'tenant' | 'global'>('tenant');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load tenants on mount
  useEffect(() => {
    if (isOpen) {
      loadTenants();
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Search users when query or tenant changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() || selectedTenantId) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedTenantId, searchMode]);

  const loadTenants = async () => {
    try {
      // Use the existing client management endpoint
      const response = await fetchApi<{ clients: Tenant[] }>('/clients');
      setTenants(response.clients || []);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setError('Failed to load organizations. Please try again.');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() && !selectedTenantId) return;

    try {
      setIsSearching(true);
      setError(null);

      let results: ImpersonationTarget[] = [];

      if (searchMode === 'tenant' && selectedTenantId) {
        // Search within specific tenant
        results = await ImpersonationService.getImpersonationTargets(selectedTenantId);
        
        // Filter by search query if provided
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          results = results.filter(user => 
            user.email.toLowerCase().includes(query) ||
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query)
          );
        }
      } else if (searchMode === 'global' && searchQuery.trim()) {
        // Global search across all tenants
        results = await ImpersonationService.searchUsers(searchQuery);
      }

      // Enrich results with tenant information
      const enrichedResults: SearchResult[] = results.map(user => {
        const tenant = tenants.find(t => t.id === user.tenantId);
        return {
          ...user,
          tenant: tenant ? {
            name: tenant.name,
            tier: tenant.tier.toString(),
            status: tenant.status.toString()
          } : undefined
        };
      });

      setSearchResults(enrichedResults);
    } catch (err: any) {
      console.error('Failed to search users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartImpersonation = async () => {
    if (!selectedUser || !reason.trim()) {
      setError('Please select a user and provide a reason for impersonation.');
      return;
    }

    try {
      setIsStartingImpersonation(true);
      setError(null);

      const request: StartImpersonationRequest = {
        targetUserId: selectedUser.userId,
        reason: reason.trim(),
        durationHours
      };

      const session = await ImpersonationService.startImpersonation(request);
      onImpersonationStarted(session);
    } catch (err: any) {
      console.error('Failed to start impersonation:', err);
      setError(err.message || 'Failed to start impersonation session.');
    } finally {
      setIsStartingImpersonation(false);
    }
  };

  const formatLastLogin = (lastLoginAt?: string) => {
    if (!lastLoginAt) return 'Never';
    
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Start User Impersonation
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Search for a user to impersonate for support or troubleshooting purposes
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {/* Search Mode Toggle */}
            <div className="mb-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tenant"
                    checked={searchMode === 'tenant'}
                    onChange={(e) => setSearchMode(e.target.value as 'tenant' | 'global')}
                    className="mr-2"
                  />
                  Search within organization
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="global"
                    checked={searchMode === 'global'}
                    onChange={(e) => setSearchMode(e.target.value as 'tenant' | 'global')}
                    className="mr-2"
                  />
                  Global search
                </label>
              </div>
            </div>

            {/* Tenant Selection */}
            {searchMode === 'tenant' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Organization
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose an organization...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.tier} - {tenant.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode === 'tenant' ? 'Search users in selected organization...' : 'Search users by email or name...'}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User List */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Search Results ({searchResults.length})
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.userId}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.userId === user.userId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.tenantName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatLastLogin(user.lastLoginAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {user.documentCount} docs
                            </span>
                          </div>
                        </div>
                        {user.isImpersonationActive && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            Active Session
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {searchResults.length === 0 && !isSearching && (searchQuery || selectedTenantId) && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No users found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Impersonation Form */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Impersonation Details
                </h4>
                
                {selectedUser ? (
                  <div className="space-y-4">
                    {/* Selected User Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Selected User</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Role:</strong> {selectedUser.role}</p>
                        <p><strong>Organization:</strong> {selectedUser.tenantName}</p>
                        {selectedUser.tenant && (
                          <p><strong>Tier:</strong> {selectedUser.tenant.tier} ({selectedUser.tenant.status})</p>
                        )}
                      </div>
                    </div>

                    {/* Reason Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Impersonation *
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Provide a detailed business reason for this impersonation session..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Duration Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration (hours)
                      </label>
                      <select
                        value={durationHours}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={8}>8 hours</option>
                        <option value={24}>24 hours</option>
                      </select>
                    </div>

                    {/* Security Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-yellow-800">Security Notice</h5>
                          <p className="text-sm text-yellow-700 mt-1">
                            This impersonation session will be logged and audited. Only proceed if you have 
                            legitimate business reasons for accessing this user's account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Select a user to configure impersonation details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              All impersonation activities are logged for security and compliance.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleStartImpersonation}
                disabled={!selectedUser || !reason.trim() || isStartingImpersonation}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isStartingImpersonation && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Impersonation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}