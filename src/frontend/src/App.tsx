import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PlatformAdminDashboard = React.lazy(() => import('./pages/PlatformAdminDashboard'));
const ClientManagement = React.lazy(() => import('./pages/ClientManagement'));
const Documents = React.lazy(() => import('./pages/Documents'));
const DatabaseAdmin = React.lazy(() => import('./pages/DatabaseAdmin'));
const Login = React.lazy(() => import('./pages/Login'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Layout components
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const AuthLayout = React.lazy(() => import('./components/layout/AuthLayout'));

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Immediately remove loading container
    document.body.classList.add('app-ready');
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
      (loadingContainer as HTMLElement).style.display = 'none';
    }
  }, []);

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
                    <Route 
                      path="/clients/*" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin', 'PlatformAdmin']}>
                          <ClientManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/documents/*" element={<Documents />} />
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