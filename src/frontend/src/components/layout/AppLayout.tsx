import React, { useState } from 'react';
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
  User
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
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/dashboard' 
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: <FileText size={20} />, 
      path: '/documents' 
    },
    { 
      id: 'database', 
      label: 'Database Admin', 
      icon: <Database size={20} />, 
      path: '/database', 
      badge: 'ADMIN' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings size={20} />, 
      path: '/settings' 
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="header-title">
              <h1 className="page-title">
                {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Page'}
              </h1>
            </div>

            <div className="header-actions">
              <span className="connection-status">
                <span className="status-dot"></span>
                Database Connected
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