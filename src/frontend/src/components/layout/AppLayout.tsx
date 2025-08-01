import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import '../../styles/layout.css';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  User,
  Building2,
  Users,
  Activity,
  LogOut,
  ChevronDown,
  UserCircle,
  Bell,
  Sparkles
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize sidebar state from localStorage, default to true for desktop
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default to closed on mobile, open on desktop
    return window.innerWidth >= 1024;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Navigation Items - Updated to match existing pages
  const navigationItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/dashboard' 
    },
    { 
      id: 'ai-documents', 
      label: 'AI Document Generator', 
      icon: <Sparkles size={20} />, 
      path: '/ai-documents',
      badge: 'NEW'
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: <FileText size={20} />, 
      path: '/documents'
    },
    { 
      id: 'clients', 
      label: 'Client Management', 
      icon: <Building2 size={20} />, 
      path: '/clients'
    },
    { 
      id: 'platform-admin', 
      label: 'Platform Admin', 
      icon: <Users size={20} />, 
      path: '/platform-admin',
      badge: 'ADMIN'
    },
    { 
      id: 'monitoring', 
      label: 'System Monitoring', 
      icon: <Activity size={20} />, 
      path: '/monitoring'
    },
    { 
      id: 'database', 
      label: 'Database Admin', 
      icon: <Database size={20} />, 
      path: '/database', 
      badge: 'DEV' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings size={20} />, 
      path: '/settings' 
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // On mobile, always start closed
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const collapseSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <FileText size={24} />
            </div>
            <div className="logo-text">
              <h2 className="logo-title">Enterprise Docs</h2>
              <p className="logo-subtitle">AI-Powered Platform</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
          <button 
            className="sidebar-collapse hidden lg:flex"
            onClick={collapseSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight size={20} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
              {isActiveRoute(item.path) && (
                <ChevronRight className="nav-active-indicator" size={16} />
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.firstName || 'Demo User'}</p>
              <p className="user-role">Professional</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <button
              className="header-menu-btn lg:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <Menu size={24} />
            </button>
            <button
              className="header-menu-btn hidden lg:flex"
              onClick={toggleSidebar}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <Menu size={24} />
            </button>
            
            <div className="header-title flex-1">
              <h1 className="page-title">
                {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Page'}
              </h1>
            </div>

            <div className="header-actions">
              {/* Notifications */}
              <button className="header-action-btn" title="Notifications">
                <Bell className="icon-sm" />
                <span className="sr-only">Notifications</span>
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserCircle className="icon-sm text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'demo@enterprise-docs.com'}
                    </p>
                  </div>
                  <ChevronDown className={`icon-sm text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserCircle className="icon-md text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user?.email || 'demo@enterprise-docs.com'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            Professional Plan
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="icon-sm mr-3" />
                        Account Settings
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="icon-sm mr-3" />
                        Profile
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="icon-sm mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className="connection-status hidden md:flex">
                <span className="status-dot"></span>
                Connected
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}