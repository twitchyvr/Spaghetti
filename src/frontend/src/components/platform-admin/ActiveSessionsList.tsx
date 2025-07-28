import { useState, useEffect } from 'react';
import { 
  Eye, 
  Clock, 
  User, 
  Building, 
  AlertTriangle, 
  RefreshCw,
  MoreVertical,
  Shield,
  CheckCircle
} from 'lucide-react';
import ImpersonationService from '../../services/impersonationService';
import type { ImpersonationSession, ImpersonationSessionHistory } from '../../types';

interface ActiveSessionsListProps {
  currentSession: ImpersonationSession | null;
  onRefresh: () => void;
}

/**
 * Active Sessions List
 * 
 * Displays currently active impersonation sessions across the platform.
 * Provides session management capabilities and real-time status monitoring.
 * 
 * Key Features:
 * - Real-time list of all active impersonation sessions
 * - Session details including admin, target user, and duration
 * - Session status monitoring with expiration warnings
 * - Quick actions for session management
 * - Emergency session termination capabilities
 */

export default function ActiveSessionsList({ currentSession, onRefresh }: ActiveSessionsListProps) {
  const [activeSessions, setActiveSessions] = useState<ImpersonationSessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Load active sessions
  useEffect(() => {
    loadActiveSessions();
  }, []);

  const loadActiveSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all recent sessions and filter for active ones
      const history = await ImpersonationService.getImpersonationHistory({
        page: 1,
        pageSize: 100 // Should be enough to capture all active sessions
      });

      // Filter for active sessions only
      const active = history.items.filter(session => session.isActive);
      setActiveSessions(active);
    } catch (err: any) {
      console.error('Failed to load active sessions:', err);
      setError('Failed to load active sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadActiveSessions();
    onRefresh();
  };

  const formatDuration = (startedAt: string) => {
    return ImpersonationService.formatSessionDuration(startedAt);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    return ImpersonationService.getTimeUntilExpiration(expiresAt);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const remainingMs = expires.getTime() - now.getTime();
    return remainingMs > 0 && remainingMs < 30 * 60 * 1000; // 30 minutes
  };

  const isCurrentUserSession = (session: ImpersonationSessionHistory) => {
    return currentSession?.id === session.id;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading active sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            Active Impersonation Sessions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Currently active impersonation sessions across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {activeSessions.length > 1 && (
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency End All
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {activeSessions.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h4>
          <p className="text-gray-500">
            There are currently no active impersonation sessions on the platform.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSessions.map(session => (
            <div
              key={session.id}
              className={`bg-white border rounded-lg p-6 transition-colors ${
                isCurrentUserSession(session)
                  ? 'border-blue-200 bg-blue-50'
                  : isExpiringSoon(session.expiresAt)
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Session Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isCurrentUserSession(session)
                        ? 'bg-blue-100 text-blue-800'
                        : isExpiringSoon(session.expiresAt)
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <Eye className="h-4 w-4" />
                      {isCurrentUserSession(session) 
                        ? 'Your Session' 
                        : isExpiringSoon(session.expiresAt)
                        ? 'Expiring Soon'
                        : 'Active'
                      }
                    </div>

                    {/* Session Duration */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {formatDuration(session.startedAt)}
                    </div>

                    {/* Time Remaining */}
                    <div className={`flex items-center gap-1 text-sm ${
                      isExpiringSoon(session.expiresAt) ? 'text-orange-600 font-medium' : 'text-gray-600'
                    }`}>
                      <Shield className="h-4 w-4" />
                      {formatTimeRemaining(session.expiresAt)}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Admin:</span>
                          <span className="text-sm text-gray-600 ml-2">{session.adminUserEmail}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Target:</span>
                          <span className="text-sm text-gray-600 ml-2">{session.targetUserEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Tenant:</span>
                          <span className="text-sm text-gray-600 ml-2">{session.tenantId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Started:</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {new Date(session.startedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Reason:</span>
                    <p className="text-sm text-gray-600 mt-1">{session.reason}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {isCurrentUserSession(session) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Current Session
                    </span>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expiration Warning */}
              {isExpiringSoon(session.expiresAt) && (
                <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      <strong>Warning:</strong> This session will expire in {formatTimeRemaining(session.expiresAt).toLowerCase()}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emergency End All Modal */}
      {isEmergencyModalOpen && (
        <EmergencyEndAllModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          onConfirm={handleRefresh}
          sessionCount={activeSessions.length}
        />
      )}
    </div>
  );
}

// Emergency End All Modal Component
interface EmergencyEndAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionCount: number;
}

function EmergencyEndAllModal({ isOpen, onClose, onConfirm, sessionCount }: EmergencyEndAllModalProps) {
  const [reason, setReason] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const [isEnding, setIsEnding] = useState(false);

  const handleEmergencyEnd = async () => {
    if (confirmationToken !== 'EMERGENCY_END_ALL_SESSIONS' || !reason.trim()) {
      return;
    }

    try {
      setIsEnding(true);
      await ImpersonationService.emergencyEndAllSessions({
        confirmationToken,
        reason: reason.trim()
      });
      onConfirm();
      onClose();
    } catch (err) {
      console.error('Failed to emergency end sessions:', err);
    } finally {
      setIsEnding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Emergency End All Sessions
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action will immediately terminate all {sessionCount} active 
                  impersonation sessions across the platform. This action cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Emergency Termination *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a detailed reason for this emergency action..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Token *
                </label>
                <input
                  type="text"
                  value={confirmationToken}
                  onChange={(e) => setConfirmationToken(e.target.value)}
                  placeholder="Type: EMERGENCY_END_ALL_SESSIONS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Type "EMERGENCY_END_ALL_SESSIONS" to confirm this action
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEmergencyEnd}
              disabled={confirmationToken !== 'EMERGENCY_END_ALL_SESSIONS' || !reason.trim() || isEnding}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isEnding ? 'Ending Sessions...' : 'End All Sessions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}