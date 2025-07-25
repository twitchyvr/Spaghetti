import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'documents', label: 'Documents', icon: '📄', path: '/documents' },
    { id: 'database', label: 'Database Admin', icon: '🗄️', path: '/database', badge: 'ADMIN' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Professional Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-elevation-4 border-r border-gray-200/50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-out`}>
        {/* Premium Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90"></div>
          <div className="relative flex items-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-white font-bold text-2xl filter drop-shadow-sm">📚</span>
            </div>
            <div className="text-white">
              <div className="font-bold text-xl tracking-tight">Enterprise Docs</div>
              <div className="text-blue-100 text-sm font-medium">AI-Powered Platform</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="relative w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 md:hidden flex items-center justify-center"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Premium Navigation */}
        <nav className="mt-8 px-6">
          <div className="space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActiveRoute(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 shadow-sm border-l-4 border-blue-500 font-semibold'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center relative z-10">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all duration-300 ${
                    isActiveRoute(item.path) 
                      ? 'bg-blue-500/10 shadow-sm' 
                      : 'bg-gray-100/50 group-hover:bg-gray-200/70'
                  }`}>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-3 py-1 text-xs font-bold text-orange-700 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full shadow-sm border border-orange-200">
                    {item.badge}
                  </span>
                )}
                {isActiveRoute(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Premium User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center p-3 rounded-xl bg-white/60 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user?.firstName?.[0] || 'D'}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{user?.fullName || 'Demo User'}</div>
              <div className="text-gray-500 text-xs truncate">{user?.email || 'demo@enterprise-docs.com'}</div>
              <div className="text-success-600 text-xs font-medium mt-1 flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </div>
            </div>
            <button className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center group-hover:bg-gray-200/50">
              <span className="text-base">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`${sidebarOpen ? 'ml-72' : 'ml-0'} transition-all duration-300 ease-out`}>
        {/* Premium Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-elevation-1 border-b border-gray-200/50 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="group p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{sidebarOpen ? '◀' : '☰'}</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enhanced Search */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Search documents, users, projects..."
                className="input w-80 pl-12 pr-4 py-3 bg-gray-50/80 border-gray-200/50 focus:bg-white focus:shadow-lg transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <span className="text-lg">🔍</span>
              </div>
            </div>

            {/* Notifications with Badge */}
            <button className="relative group p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                3
              </span>
            </button>

            {/* Premium User Menu */}
            <button className="group flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/70 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                {user?.firstName?.[0] || 'D'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">{user?.firstName || 'Demo'}</div>
                <div className="text-xs text-gray-500">Professional</div>
              </div>
              <span className="text-gray-400 text-sm group-hover:text-gray-600 transition-colors">▼</span>
            </button>
          </div>
        </header>

        {/* Premium Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-50/50">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>

      {/* Premium Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}