import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  User,
  Building2,
  Activity,
  LogOut,
  ChevronDown,
  UserCircle,
  Bell,
  Sparkles,
  Utensils,
  ChefHat,
  Layers,
  BrainCircuit,
  BarChart3,
  Plug,
  Shield,
  Brain,
  TrendingUp,
  Zap,
  Users,
  GitBranch,
  Monitor
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
      label: 'Al Dente Editor', 
      icon: <Sparkles size={20} />, 
      path: '/ai-documents',
      badge: 'NEW'
    },
    { 
      id: 'documents', 
      label: 'Noodles', 
      icon: <Utensils size={20} />, 
      path: '/documents'
    },
    { 
      id: 'collections', 
      label: 'Plates', 
      icon: <Layers size={20} />, 
      path: '/collections'
    },
    { 
      id: 'clients', 
      label: 'Client Management', 
      icon: <Building2 size={20} />, 
      path: '/clients'
    },
    { 
      id: 'platform-admin', 
      label: 'The Kitchen', 
      icon: <ChefHat size={20} />, 
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
    // Sprint 7: Advanced Enterprise Features
    { 
      id: 'ai-analytics', 
      label: 'AI Document Intelligence', 
      icon: <BrainCircuit size={20} />, 
      path: '/ai-analytics',
      badge: 'SPRINT 7'
    },
    { 
      id: 'tenant-management', 
      label: 'Enterprise Tenants', 
      icon: <Building2 size={20} />, 
      path: '/tenant-management',
      badge: 'SPRINT 7'
    },
    { 
      id: 'advanced-analytics', 
      label: 'Advanced Analytics', 
      icon: <BarChart3 size={20} />, 
      path: '/advanced-analytics',
      badge: 'SPRINT 7'
    },
    { 
      id: 'enterprise-integrations', 
      label: 'Enterprise Integrations', 
      icon: <Plug size={20} />, 
      path: '/enterprise-integrations',
      badge: 'SPRINT 7'
    },
    { 
      id: 'security-compliance', 
      label: 'Security & Compliance', 
      icon: <Shield size={20} />, 
      path: '/security-compliance',
      badge: 'SPRINT 7'
    },
    // Sprint 8: Advanced Enterprise AI Platform Features
    { 
      id: 'ml-classification', 
      label: 'ML Document Classification', 
      icon: <Brain size={20} />, 
      path: '/ml-classification',
      badge: 'SPRINT 8'
    },
    { 
      id: 'predictive-analytics', 
      label: 'Predictive Analytics', 
      icon: <TrendingUp size={20} />, 
      path: '/predictive-analytics',
      badge: 'SPRINT 8'
    },
    { 
      id: 'advanced-workflows', 
      label: 'Advanced Workflows', 
      icon: <Zap size={20} />, 
      path: '/advanced-workflows',
      badge: 'SPRINT 8'
    },
    { 
      id: 'collaborative-editor', 
      label: 'Real-time Collaboration', 
      icon: <Users size={20} />, 
      path: '/collaborative-editor',
      badge: 'SPRINT 8'
    },
    { 
      id: 'knowledge-graph', 
      label: 'Knowledge Graph', 
      icon: <GitBranch size={20} />, 
      path: '/knowledge-graph',
      badge: 'SPRINT 8'
    },
    { 
      id: 'performance-monitoring', 
      label: 'Performance Monitoring', 
      icon: <Monitor size={20} />, 
      path: '/performance-monitoring',
      badge: 'SPRINT 8'
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
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out",
        {
          "w-80": !sidebarCollapsed,
          "w-20": sidebarCollapsed,
          "translate-x-0": sidebarOpen,
          "-translate-x-full": !sidebarOpen,
        },
        "lg:translate-x-0 lg:static lg:inset-0"
      )}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
              <ChefHat size={24} className="text-orange-600" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xl font-bold text-neutral-900 truncate">Spaghetti Platform</h2>
                <p className="text-sm text-neutral-600 truncate">The Pantry Enterprise Suite</p>
              </div>
            )}
          </div>
          
          <button 
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
          
          <button 
            className="hidden lg:flex p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            onClick={collapseSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight size={20} className={cn("transition-transform", {
              "rotate-180": sidebarCollapsed
            })} />
          </button>
        </div>

        {/* Navigation - CRITICAL FIX: Proper scrolling container */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  {
                    "bg-orange-50 text-orange-700 shadow-sm": isActiveRoute(item.path),
                    "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900": !isActiveRoute(item.path),
                    "justify-center": sidebarCollapsed,
                  }
                )}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActiveRoute(item.path) && (
                      <ChevronRight size={16} className="opacity-60" />
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-orange-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-6 border-t border-neutral-200 flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 p-3 bg-neutral-50 rounded-xl",
            { "justify-center": sidebarCollapsed }
          )}>
            <div className="flex items-center justify-center w-10 h-10 bg-orange-600 rounded-full text-white flex-shrink-0">
              <User size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate">
                  {user?.firstName || 'Demo User'}
                </p>
                <p className="text-sm text-neutral-600 truncate">Chef Professional</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 transition-all duration-300",
        {
          "lg:ml-80": sidebarOpen && !sidebarCollapsed,
          "lg:ml-20": sidebarOpen && sidebarCollapsed,
          "lg:ml-0": !sidebarOpen,
        }
      )}>
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
                onClick={toggleSidebar}
                aria-label="Toggle navigation menu"
              >
                <Menu size={24} />
              </button>
              <button
                className="hidden lg:flex p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                onClick={toggleSidebar}
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <Menu size={24} />
              </button>
              
              <h1 className="text-2xl font-bold text-neutral-900">
                {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Notifications">
                <Bell size={20} className="text-neutral-600" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                    <UserCircle size={20} className="text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {user?.email || 'demo@enterprise-docs.com'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={cn(
                    "text-neutral-400 transition-transform",
                    { "rotate-180": userMenuOpen }
                  )} />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                          <UserCircle size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {user?.email || 'demo@enterprise-docs.com'}
                          </p>
                          <p className="text-xs text-orange-600 font-semibold">
                            Chef Professional
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Account Settings
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-neutral-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connected
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - This is where children are rendered */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}