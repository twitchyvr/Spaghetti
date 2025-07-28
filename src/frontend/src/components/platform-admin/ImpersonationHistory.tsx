import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  User, 
  Building, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ImpersonationService from '../../services/impersonationService';
import type { ImpersonationSessionHistory, PaginatedResult } from '../../types';

/**
 * Impersonation History
 * 
 * Comprehensive audit trail of all impersonation sessions with advanced filtering,
 * search, and export capabilities. Provides complete visibility into platform
 * impersonation activities for compliance and security monitoring.
 * 
 * Key Features:
 * - Complete historical audit trail
 * - Advanced filtering by admin, target user, date range
 * - Search functionality across all session data
 * - Pagination for large datasets
 * - Export capabilities for compliance reporting
 * - Session status and outcome tracking
 */

interface HistoryFilters {
  search: string;
  adminUserId: string;
  targetUserId: string;
  fromDate: string;
  toDate: string;
  sessionStatus: 'all' | 'active' | 'completed' | 'expired';
}

export default function ImpersonationHistory() {
  const [history, setHistory] = useState<PaginatedResult<ImpersonationSessionHistory>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  });
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    adminUserId: '',
    targetUserId: '',
    fromDate: '',
    toDate: '',
    sessionStatus: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load history when component mounts or filters change
  useEffect(() => {
    loadHistory();
  }, [history.page, filters]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ImpersonationService.getImpersonationHistory({
        page: history.page,
        pageSize: history.pageSize,
        ...(filters.adminUserId && { adminUserId: filters.adminUserId }),
        ...(filters.targetUserId && { targetUserId: filters.targetUserId }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate })
      });

      // Apply client-side filtering for search and status
      let filteredItems = response.items;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(session =>
          session.adminUserEmail.toLowerCase().includes(searchLower) ||
          session.targetUserEmail.toLowerCase().includes(searchLower) ||
          session.reason.toLowerCase().includes(searchLower) ||
          session.tenantId.toLowerCase().includes(searchLower)
        );
      }

      if (filters.sessionStatus !== 'all') {
        filteredItems = filteredItems.filter(session => {
          switch (filters.sessionStatus) {
            case 'active':
              return session.isActive;
            case 'completed':
              return !session.isActive && session.endedAt;
            case 'expired':
              return !session.isActive && !session.endedAt;
            default:
              return true;
          }
        });
      }

      setHistory({
        ...response,
        items: filteredItems
      });
    } catch (err: any) {
      console.error('Failed to load impersonation history:', err);
      setError('Failed to load impersonation history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setHistory(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setHistory(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      adminUserId: '',
      targetUserId: '',
      fromDate: '',
      toDate: '',
      sessionStatus: 'all'
    });
  };

  const formatDuration = (durationMinutes: number) => {
    if (durationMinutes < 60) {
      return `${Math.round(durationMinutes)}m`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const getSessionStatusBadge = (session: ImpersonationSessionHistory) => {
    if (session.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      );
    }

    if (session.endedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3" />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <XCircle className="h-3 w-3" />
        Expired
      </span>
    );
  };

  const exportHistory = () => {
    // This would typically generate a CSV or PDF export
    // For now, we'll create a simple CSV download
    const csvData = [
      ['Session ID', 'Admin Email', 'Target Email', 'Tenant ID', 'Reason', 'Started At', 'Ended At', 'Duration (minutes)', 'Status', 'End Reason', 'Admin IP'].join(','),
      ...history.items.map(session => [
        session.id,
        session.adminUserEmail,
        session.targetUserEmail,
        session.tenantId,
        `"${session.reason}"`,
        session.startedAt,
        session.endedAt || '',
        session.durationMinutes.toFixed(1),
        session.isActive ? 'Active' : 'Ended',
        session.endReason || '',
        session.adminIPAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impersonation-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            Impersonation History
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Complete audit trail of all impersonation sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={exportHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={loadHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search emails, reasons, tenants..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Session Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.sessionStatus}
                onChange={(e) => handleFilterChange('sessionStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Sessions</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Admin User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin User ID</label>
              <input
                type="text"
                value={filters.adminUserId}
                onChange={(e) => handleFilterChange('adminUserId', e.target.value)}
                placeholder="Filter by admin user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Target User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target User ID</label>
              <input
                type="text"
                value={filters.targetUserId}
                onChange={(e) => handleFilterChange('targetUserId', e.target.value)}
                placeholder="Filter by target user ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {history.items.length} of {history.totalCount} sessions
        </span>
        <span>
          Page {history.page} of {history.totalPages}
        </span>
      </div>

      {/* History Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading history...</p>
          </div>
        </div>
      ) : history.items.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No History Found</h4>
          <p className="text-gray-500">
            No impersonation sessions match your current filters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.items.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {session.id.substring(0, 8)}...
                        </div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.startedAt).toLocaleString()}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {session.tenantId.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500">Admin:</span>
                          <span className="text-gray-900">{session.adminUserEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-500">Target:</span>
                          <span className="text-gray-900">{session.targetUserEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{formatDuration(session.durationMinutes)}</span>
                        </div>
                        {session.endedAt && (
                          <div className="text-gray-500 text-xs mt-1">
                            Ended: {new Date(session.endedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        {getSessionStatusBadge(session)}
                        {session.endReason && (
                          <span className="text-xs text-gray-500">
                            {session.endReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <p className="truncate" title={session.reason}>
                          {session.reason}
                        </p>
                        {session.adminIPAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {session.adminIPAddress}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {history.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(history.page - 1)}
                  disabled={history.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(history.page + 1)}
                  disabled={history.page === history.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(history.page - 1) * history.pageSize + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(history.page * history.pageSize, history.totalCount)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{history.totalCount}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(history.page - 1)}
                      disabled={history.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, history.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === history.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(history.page + 1)}
                      disabled={history.page === history.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}