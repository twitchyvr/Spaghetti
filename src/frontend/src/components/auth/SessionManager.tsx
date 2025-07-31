import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  LogOut,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface SessionInfo {
  id: string;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: string;
  isCurrentSession: boolean;
  isImpersonated: boolean;
}

interface SessionManagerProps {
  onSessionRevoked?: (sessionId: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ onSessionRevoked }) => {
  const { refreshAuthToken, logout } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Mock session data for demo
  const mockSessions: SessionInfo[] = [
    {
      id: 'current-session',
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceType: 'Desktop',
      location: 'New York, NY',
      isCurrentSession: true,
      isImpersonated: false
    },
    {
      id: 'mobile-session',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      lastAccessedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      deviceType: 'Mobile',
      location: 'New York, NY',
      isCurrentSession: false,
      isImpersonated: false
    },
    {
      id: 'tablet-session',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      lastAccessedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      expiresAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago (expired)
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      deviceType: 'Tablet',
      location: 'Boston, MA',
      isCurrentSession: false,
      isImpersonated: false
    }
  ];

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(mockSessions);
    } catch (error) {
      toast.error('Failed to load session information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      // In a real implementation, this would revoke via backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session revoked successfully');
      onSessionRevoked?.(sessionId);
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      // In a real implementation, this would revoke all other sessions via backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(session => session.isCurrentSession));
      toast.success('All other sessions revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke other sessions');
    }
  };

  const extendCurrentSession = async () => {
    try {
      await refreshAuthToken();
      await loadSessions();
      toast.success('Session extended successfully');
    } catch (error) {
      toast.error('Failed to extend session');
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const isSessionExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) <= new Date();
  };

  const isSessionExpiringSoon = (expiresAt: string): boolean => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return diff > 0 && diff <= 15 * 60 * 1000; // 15 minutes
  };

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    // Check for session expiry warnings
    const currentSession = sessions.find(s => s.isCurrentSession);
    if (currentSession) {
      const isExpiringSoon = isSessionExpiringSoon(currentSession.expiresAt);
      setShowExpiredWarning(isExpiringSoon);
      setTimeUntilExpiry(formatTimeRemaining(currentSession.expiresAt));
    }

    // Update time remaining every minute
    const interval = setInterval(() => {
      if (currentSession) {
        setTimeUntilExpiry(formatTimeRemaining(currentSession.expiresAt));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [sessions]);

  const activeSessions = sessions.filter(s => !isSessionExpired(s.expiresAt));
  const expiredSessions = sessions.filter(s => isSessionExpired(s.expiresAt));
  const displaySessions = showAllSessions ? sessions : activeSessions;

  return (
    <div className="space-y-6">
      {/* Session Warning */}
      {showExpiredWarning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Your session will expire in {timeUntilExpiry}. 
            <button 
              variant="link" 
              className="p-0 h-auto text-orange-800 underline ml-1"
              onClick={extendCurrentSession}
            >
              Extend session
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Session */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5" />
            Current Session
          </h3>
        </div>
        <div className="p-6">
          {sessions.filter(s => s.isCurrentSession).map(session => (
            <div key={session.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getDeviceIcon(session.deviceType)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.deviceType}</span>
                      <Badge variant="default">Current</Badge>
                      {session.isImpersonated && (
                        <Badge variant="destructive">Impersonated</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Expires in {formatTimeRemaining(session.expiresAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    variant="outline" 
                    size="sm"
                    onClick={extendCurrentSession}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Extend
                  </button>
                  <button 
                    variant="destructive" 
                    size="sm"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                <div>IP Address: {session.ipAddress}</div>
                <div>Last accessed: {new Date(session.lastAccessedAt).toLocaleString()}</div>
                <div className="break-all">User Agent: {session.userAgent}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Sessions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Monitor className="h-5 w-5" />
              Other Sessions
              <span className="ml-2 px-2 py-1 bg-gray-200 text-sm rounded-full">{activeSessions.length - 1}</span>
            </h3>
            <div className="flex gap-2">
              {expiredSessions.length > 0 && (
                <button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSessions(!showAllSessions)}
                >
                  {showAllSessions ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide Expired
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show All ({expiredSessions.length} expired)
                    </>
                  )}
                </button>
              )}
              {activeSessions.length > 1 && (
                <button 
                  variant="destructive" 
                  size="sm"
                  onClick={revokeAllOtherSessions}
                >
                  Revoke All
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading sessions...
            </div>
          ) : displaySessions.filter(s => !s.isCurrentSession).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No other sessions found
            </div>
          ) : (
            <div className="space-y-4">
              {displaySessions
                .filter(session => !session.isCurrentSession)
                .map(session => {
                  const expired = isSessionExpired(session.expiresAt);
                  const expiringSoon = isSessionExpiringSoon(session.expiresAt);
                  
                  return (
                    <div 
                      key={session.id} 
                      className={`
                        p-4 border rounded-lg
                        ${expired ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={expired ? 'text-gray-400' : ''}>
                            {getDeviceIcon(session.deviceType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${expired ? 'text-gray-500' : ''}`}>
                                {session.deviceType}
                              </span>
                              {expired && <Badge variant="secondary">Expired</Badge>}
                              {expiringSoon && <Badge variant="destructive">Expiring Soon</Badge>}
                              {session.isImpersonated && (
                                <Badge variant="destructive">Impersonated</Badge>
                              )}
                            </div>
                            <div className={`text-sm mt-1 ${expired ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {expired 
                                  ? `Expired ${formatTimeRemaining(session.expiresAt)}`
                                  : `Expires in ${formatTimeRemaining(session.expiresAt)}`
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        {!expired && (
                          <button 
                            variant="outline" 
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Revoke
                          </button>
                        )}
                      </div>
                      
                      <div className={`text-xs space-y-1 pt-2 border-t mt-3 ${expired ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div>IP Address: {session.ipAddress}</div>
                        <div>Started: {new Date(session.createdAt).toLocaleString()}</div>
                        <div>Last accessed: {new Date(session.lastAccessedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Session Security Tips */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5" />
            Security Tips
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Always sign out from public or shared computers</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Revoke sessions from devices you no longer use</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Monitor your sessions regularly for suspicious activity</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Contact support if you notice any unauthorized sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};