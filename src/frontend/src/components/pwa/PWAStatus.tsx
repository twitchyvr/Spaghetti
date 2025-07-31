import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, Check, X } from 'lucide-react';
import { usePWA } from '../../utils/pwa';

interface PWAStatusProps {
  className?: string;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({ className = '' }) => {
  const { isOffline, updateAvailable, updateApp, showInstallPrompt, installApp } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  useEffect(() => {
    if (showInstallPrompt) {
      // Show install banner after a delay to avoid being intrusive
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstallPrompt]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      setShowUpdatePrompt(false);
    }
  };

  const handleInstall = async () => {
    try {
      await installApp();
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {/* Offline status */}
      {isOffline && (
        <div className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 min-w-64">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You're offline</span>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Online status (brief notification) */}
      {!isOffline && (
        <OnlineNotification />
      )}

      {/* Update available */}
      {showUpdatePrompt && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Update Available</h4>
              <p className="text-xs text-blue-100 mt-1">
                A new version of the app is ready with improvements and bug fixes.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 disabled:opacity-50 flex items-center gap-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      Update Now
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="text-blue-200 hover:text-white px-2 py-1 rounded text-xs"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-blue-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Install banner */}
      {showInstallBanner && (
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Install Enterprise Docs</h4>
              <p className="text-xs text-green-100 mt-1">
                Get faster access and work offline by installing the app.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-green-50"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="text-green-200 hover:text-white px-2 py-1 rounded text-xs"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-green-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const OnlineNotification: React.FC = () => {
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        setShow(true);
        setTimeout(() => setShow(false), 3000);
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (!show) return null;

  return (
    <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 min-w-64">
      <Wifi className="w-4 h-4" />
      <span className="text-sm font-medium">Back online</span>
      <div className="ml-auto">
        <Check className="w-4 h-4" />
      </div>
    </div>
  );
};