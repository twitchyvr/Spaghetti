import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PWAStatus } from './components/pwa/PWAStatus';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { usePWA } from './utils/pwa';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PlatformAdminDashboard = React.lazy(() => import('./pages/PlatformAdminDashboard'));
const PlatformMonitoringDashboard = React.lazy(() => import('./pages/PlatformMonitoringDashboard'));
const ClientManagement = React.lazy(() => import('./pages/ClientManagement'));
// const Documents = React.lazy(() => import('./pages/Documents')); // Temporarily disabled
const DatabaseAdmin = React.lazy(() => import('./pages/DatabaseAdmin'));
const AIDocuments = React.lazy(() => import('./pages/AIDocuments'));
const Login = React.lazy(() => import('./pages/Login'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Layout components
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const AuthLayout = React.lazy(() => import('./components/layout/AuthLayout'));

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { showInstallPrompt } = usePWA();
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);

  useEffect(() => {
    // Immediately remove loading container
    document.body.classList.add('app-ready');
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
      (loadingContainer as HTMLElement).style.display = 'none';
    }
  }, []);

  // Show PWA install prompt after user is authenticated and settled
  useEffect(() => {
    if (isAuthenticated && showInstallPrompt) {
      const timer = setTimeout(() => {
        setShowPWAInstallPrompt(true);
      }, 5000); // Show after 5 seconds of being authenticated
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAuthenticated, showInstallPrompt]);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* PWA Status notifications */}
      <PWAStatus />
      
      {/* PWA Install prompt */}
      {showPWAInstallPrompt && (
        <PWAInstallPrompt onClose={() => setShowPWAInstallPrompt(false)} />
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
                      element={
                        // Determine dashboard based on user type
                        // For now, showing Platform Admin dashboard
                        // TODO: Add user role detection logic
                        <PlatformAdminDashboard />
                      } 
                    />
                    <Route path="/client-dashboard" element={<Dashboard />} />
                    <Route path="/clients/*" element={<ClientManagement />} />
                    <Route path="/monitoring/*" element={<PlatformMonitoringDashboard />} />
                    <Route path="/documents/*" element={<div className="p-6"><h1>Documents - Under Development</h1></div>} />
                    <Route path="/ai-documents" element={<AIDocuments />} />
                    <Route 
                      path="/database/*" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin', 'PlatformAdmin']}>
                          <DatabaseAdmin />
                        </ProtectedRoute>
                      } 
                    />
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