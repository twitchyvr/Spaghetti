import { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  History, 
  Clock,
  RefreshCw,
  Settings,
  AlertCircle,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ImpersonationService from '../../services/impersonationService';
import type { 
  ImpersonationSession
} from '../../types';
import UserSearchModal from './UserSearchModal';
import ImpersonationBanner from './ImpersonationBanner';
import ActiveSessionsList from './ActiveSessionsList';
import ImpersonationHistory from './ImpersonationHistory';
import SupportContextPanel from './SupportContextPanel';

/**
 * Impersonation Dashboard
 * 
 * Main interface for platform administrators to manage user impersonation sessions.
 * Provides secure user search, session management, and comprehensive audit trails.
 * 
 * Key Features:
 * - User search across all tenants
 * - One-click impersonation with session management
 * - Real-time session monitoring
 * - Historical audit trail with filtering
 * - Emergency session termination
 * - Support context and customer information
 */

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  todaySessions: number;
  averageDuration: number;
}

export default function ImpersonationDashboard() {
  const {} = useAuth(); // Keep for future use
  const [currentSession, setCurrentSession] = useState<ImpersonationSession | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'context'>('active');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    todaySessions: 0,
    averageDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permissions and load initial data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user has impersonation permissions
        const permission = await ImpersonationService.hasImpersonationPermission();
        setHasPermission(permission);

        if (!permission) {
          setError('You do not have permission to access the impersonation system.');
          return;
        }

        // Load current session if any
        const session = await ImpersonationService.getCurrentSession();
        setCurrentSession(session);

        // Load dashboard statistics
        await loadDashboardStats();
      } catch (err: any) {
        console.error('Failed to initialize impersonation dashboard:', err);
        setError('Failed to load impersonation dashboard. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      // Get recent history to calculate stats
      const history = await ImpersonationService.getImpersonationHistory({
        page: 1,
        pageSize: 100 // Get enough data for meaningful stats
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySessions = history.items.filter(session => 
        new Date(session.startedAt) >= today
      ).length;

      const activeSessions = history.items.filter(session => session.isActive).length;

      // Calculate average duration for completed sessions
      const completedSessions = history.items.filter(session => !session.isActive);
      const averageDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, session) => sum + session.durationMinutes, 0) / completedSessions.length
        : 0;

      setDashboardStats({
        totalSessions: history.totalCount,
        activeSessions,
        todaySessions,
        averageDuration
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Handle successful impersonation start
  const handleImpersonationStarted = (session: ImpersonationSession) => {
    setCurrentSession(session);
    setIsSearchModalOpen(false);
    loadDashboardStats(); // Refresh stats
  };

  // Handle impersonation end
  const handleEndImpersonation = async () => {
    try {
      await ImpersonationService.endImpersonation({
        reason: 'Manual termination from dashboard'
      });
      setCurrentSession(null);
      loadDashboardStats(); // Refresh stats
    } catch (err: any) {
      console.error('Failed to end impersonation:', err);
      setError('Failed to end impersonation session.');
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    await loadDashboardStats();
    const session = await ImpersonationService.getCurrentSession();
    setCurrentSession(session);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading impersonation dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the impersonation system. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Required permissions:</strong> Platform.Admin or Platform.Support role
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Impersonation Banner - shown when actively impersonating */}
      {currentSession && (
        <ImpersonationBanner 
          session={currentSession}
          onEndImpersonation={handleEndImpersonation}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                User Impersonation & Support
              </h1>
              <p className="text-gray-600 mt-2">
                Secure user impersonation for customer support and troubleshooting
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                disabled={currentSession !== null}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                Start Impersonation
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalSessions}</p>
              </div>
              <History className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeSessions}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.todaySessions}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(dashboardStats.averageDuration)}m
                </p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Session History
            </button>
            <button
              onClick={() => setActiveTab('context')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'context'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Support Context
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'active' && (
            <ActiveSessionsList 
              currentSession={currentSession}
              onRefresh={refreshDashboard}
            />
          )}
          {activeTab === 'history' && (
            <ImpersonationHistory />
          )}
          {activeTab === 'context' && (
            <SupportContextPanel 
              currentSession={currentSession}
            />
          )}
        </div>
      </div>

      {/* User Search Modal */}
      {isSearchModalOpen && (
        <UserSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onImpersonationStarted={handleImpersonationStarted}
        />
      )}
    </div>
  );
}