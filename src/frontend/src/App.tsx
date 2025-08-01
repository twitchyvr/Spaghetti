import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PWAStatus } from './components/pwa/PWAStatus';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWANotificationBar } from './components/pwa/PWANotificationBar';
import { usePWA } from './utils/pwa';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PlatformAdminDashboard = React.lazy(() => import('./pages/PlatformAdminDashboard'));
const PlatformMonitoringDashboard = React.lazy(() => import('./pages/PlatformMonitoringDashboard'));
const ClientManagement = React.lazy(() => import('./pages/ClientManagement'));
const Noodles = React.lazy(() => import('./pages/Noodles'));
const Collections = React.lazy(() => import('./pages/Collections'));
const DatabaseAdmin = React.lazy(() => import('./pages/DatabaseAdmin'));
const AIDocuments = React.lazy(() => import('./pages/AIDocuments'));
const Login = React.lazy(() => import('./pages/Login'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Sprint 7: Advanced Enterprise Features
const AIAnalytics = React.lazy(() => import('./pages/AIAnalytics'));
const TenantManagement = React.lazy(() => import('./pages/TenantManagement'));
const AdvancedAnalytics = React.lazy(() => import('./pages/AdvancedAnalytics'));
const EnterpriseIntegrations = React.lazy(() => import('./pages/EnterpriseIntegrations'));
const SecurityCompliance = React.lazy(() => import('./pages/SecurityCompliance'));

// Sprint 8: Advanced Enterprise AI Platform Features
const MLDocumentClassification = React.lazy(() => import('./pages/MLDocumentClassification'));
const PredictiveAnalytics = React.lazy(() => import('./pages/PredictiveAnalytics'));
const AdvancedWorkflows = React.lazy(() => import('./pages/AdvancedWorkflows'));
const CollaborativeEditor = React.lazy(() => import('./pages/CollaborativeEditor'));
const KnowledgeGraph = React.lazy(() => import('./pages/KnowledgeGraph'));
const MobileApp = React.lazy(() => import('./pages/MobileApp'));
const PerformanceMonitoring = React.lazy(() => import('./pages/PerformanceMonitoring'));

// Layout components
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const AuthLayout = React.lazy(() => import('./components/layout/AuthLayout'));

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { showInstallPrompt } = usePWA();
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);
  const [showPWANotificationBar, setShowPWANotificationBar] = useState(false);
  const [pwaPromptDismissed, setPwaPromptDismissed] = useState(() => {
    return localStorage.getItem('pwaPromptDismissed') === 'true';
  });

  useEffect(() => {
    // Immediately remove loading container
    document.body.classList.add('app-ready');
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
      (loadingContainer as HTMLElement).style.display = 'none';
    }

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[App] Service worker cache updated, refreshing...');
          window.location.reload();
        }
      });
    }
  }, []);

  // Show PWA notification bar after user is authenticated and settled (only if not dismissed)
  useEffect(() => {
    if (isAuthenticated && showInstallPrompt && !pwaPromptDismissed) {
      // Only show PWA prompt once per session after 2 minutes
      const timer = setTimeout(() => {
        setShowPWANotificationBar(true);
      }, 120000); // Show after 2 minutes of being authenticated
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAuthenticated, showInstallPrompt, pwaPromptDismissed]);

  const handlePWAPromptClose = () => {
    setShowPWAInstallPrompt(false);
    setPwaPromptDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  const handlePWANotificationClose = () => {
    setShowPWANotificationBar(false);
    setPwaPromptDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen bg-background text-foreground ${showPWANotificationBar ? 'pwa-notification-active' : ''}`}>
      {/* PWA Status notifications */}
      <PWAStatus />
      
      {/* PWA Notification Bar */}
      {showPWANotificationBar && (
        <PWANotificationBar onClose={handlePWANotificationClose} />
      )}
      
      {/* PWA Install prompt */}
      {showPWAInstallPrompt && (
        <PWAInstallPrompt onClose={handlePWAPromptClose} />
      )}
      
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : (
                <AuthLayout>
                  <Login />
                </AuthLayout>
              )
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route 
                      path="/dashboard" 
                      element={<Dashboard />}
                    />
                    <Route 
                      path="/platform-admin" 
                      element={<PlatformAdminDashboard />}
                    />
                    <Route path="/client-dashboard" element={<Dashboard />} />
                    <Route path="/clients/*" element={<ClientManagement />} />
                    <Route path="/monitoring/*" element={<PlatformMonitoringDashboard />} />
                    <Route path="/documents/*" element={<Noodles />} />
                    <Route path="/collections/*" element={<Collections />} />
                    <Route path="/ai-documents" element={<AIDocuments />} />
                    <Route 
                      path="/database/*" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin', 'PlatformAdmin']}>
                          <DatabaseAdmin />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Sprint 7: Advanced Enterprise Features */}
                    <Route path="/ai-analytics" element={<AIAnalytics />} />
                    <Route path="/tenant-management" element={<TenantManagement />} />
                    <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                    <Route path="/enterprise-integrations" element={<EnterpriseIntegrations />} />
                    <Route path="/security-compliance" element={<SecurityCompliance />} />
                    
                    {/* Sprint 8: Advanced Enterprise AI Platform Features */}
                    <Route path="/ml-classification" element={<MLDocumentClassification />} />
                    <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
                    <Route path="/advanced-workflows" element={<AdvancedWorkflows />} />
                    <Route path="/collaborative-editor" element={<CollaborativeEditor />} />
                    <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
                    <Route path="/mobile-app" element={<MobileApp />} />
                    <Route path="/performance-monitoring" element={<PerformanceMonitoring />} />
                    <Route path="/settings/*" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;