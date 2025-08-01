import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../../utils/pwa';

interface PWANotificationBarProps {
  onClose: () => void;
  className?: string;
}

export const PWANotificationBar: React.FC<PWANotificationBarProps> = ({
  onClose,
  className = ''
}) => {
  const { installApp, isInstalled } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        onClose();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 bg-blue-600 text-white shadow-lg border-b ${className}`} style={{zIndex: 'var(--z-notification)'}}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">Install Enterprise Docs</span>
            </div>
            <span className="text-blue-100 text-sm hidden sm:inline">
              Get faster access and work offline
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-white text-blue-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-blue-700 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};