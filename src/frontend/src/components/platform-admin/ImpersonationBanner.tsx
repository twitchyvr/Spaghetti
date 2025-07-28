import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  User, 
  Clock, 
  LogOut, 
  Shield,
  Building
} from 'lucide-react';
import ImpersonationService from '../../services/impersonationService';
import type { ImpersonationSession } from '../../types';

interface ImpersonationBannerProps {
  session: ImpersonationSession;
  onEndImpersonation: () => void;
}

/**
 * Impersonation Banner
 * 
 * Prominent banner displayed at the top of the screen during active impersonation sessions.
 * Provides clear visual indication that the user is currently impersonating another user,
 * along with session details and quick actions.
 * 
 * Key Features:
 * - Highly visible warning banner with distinct styling
 * - Target user information and session details
 * - Real-time session expiration countdown
 * - Quick access to end impersonation
 * - Security reminders and session context
 */

export default function ImpersonationBanner({ session, onEndImpersonation }: ImpersonationBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const remaining = ImpersonationService.getTimeUntilExpiration(session.expiresAt);
      setTimeRemaining(remaining);
      
      // Check if session is expiring soon (less than 30 minutes)
      const now = new Date();
      const expires = new Date(session.expiresAt);
      const remainingMs = expires.getTime() - now.getTime();
      setIsExpiringSoon(remainingMs > 0 && remainingMs < 30 * 60 * 1000); // 30 minutes
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [session.expiresAt]);

  const formatSessionDuration = () => {
    return ImpersonationService.formatSessionDuration(session.startedAt);
  };

  const handleEndClick = () => {
    if (window.confirm('Are you sure you want to end this impersonation session?')) {
      onEndImpersonation();
    }
  };

  return (
    <div className={`w-full border-b-2 ${
      isExpiringSoon 
        ? 'bg-red-600 border-red-700' 
        : 'bg-orange-500 border-orange-600'
    } text-white shadow-lg`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Main Banner Content */}
          <div className="flex items-center space-x-6">
            {/* Warning Icon */}
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <span className="font-bold text-lg">IMPERSONATION MODE</span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/30"></div>

            {/* Target User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="font-medium">Impersonating:</span>
                  <span className="text-white/90">{session.targetUserEmail}</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span className="text-white/90 text-sm">
                  Tenant: {session.targetTenantId}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-white/30"></div>

            {/* Session Details */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Duration: {formatSessionDuration()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span className={isExpiringSoon ? 'font-bold' : ''}>
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Session Info for smaller screens */}
            <div className="lg:hidden text-sm text-right">
              <div>{formatSessionDuration()}</div>
              <div className={`text-xs ${isExpiringSoon ? 'font-bold' : 'text-white/80'}`}>
                {timeRemaining}
              </div>
            </div>

            {/* End Impersonation Button */}
            <button
              onClick={handleEndClick}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">End Impersonation</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>

        {/* Additional Details Row for Mobile */}
        <div className="mt-2 sm:hidden">
          <div className="flex items-center justify-between text-sm text-white/90">
            <span>Tenant: {session.targetTenantId}</span>
            <span>Admin: {session.adminUserEmail}</span>
          </div>
        </div>

        {/* Expiration Warning */}
        {isExpiringSoon && (
          <div className="mt-3 p-3 bg-red-700/50 border border-red-600 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-200" />
              <div className="flex-1">
                <p className="text-sm font-medium">Session Expiring Soon</p>
                <p className="text-xs text-red-200 mt-1">
                  This impersonation session will automatically end in {timeRemaining.toLowerCase()}. 
                  Please complete your support activities or extend the session if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Reminder */}
        <div className="mt-2 text-xs text-white/70">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>
              All activities during this session are being logged for security and audit purposes. 
              Reason: "{session.reason}"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}