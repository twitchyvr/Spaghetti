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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Apple Style */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition-all duration-500 ease-out",
        {
          "w-80": !sidebarCollapsed,
          "w-20": sidebarCollapsed,
          "translate-x-0": sidebarOpen,
          "-translate-x-full": !sidebarOpen,
        },
        "lg:translate-x-0 lg:static lg:inset-0"
      )}>
        {/* Logo Section - Apple Style */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat size={28} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-2xl font-light text-gray-900 truncate tracking-tight">Spaghetti Platform</h2>
                <p className="text-sm text-gray-500 font-light truncate">Intelligent Document Suite</p>
              </div>
            )}
          </div>
          
          <button 
            className="lg:hidden p-3 hover:bg-gray-100/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-gray-600" />
          </button>
          
          <button 
            className="hidden lg:flex p-3 hover:bg-gray-100/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onClick={collapseSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight size={18} className={cn("transition-all duration-300 text-gray-600", {
              "rotate-180": sidebarCollapsed
            })} />
          </button>
        </div>

        {/* Navigation - Apple Style */}
        <nav className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                  {
                    "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105": isActiveRoute(item.path),
                    "text-gray-700 hover:bg-gray-100/60 hover:text-gray-900 hover:scale-102": !isActiveRoute(item.path),
                    "justify-center px-4": sidebarCollapsed,
                  }
                )}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0 relative z-10">
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate relative z-10">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full relative z-10",
                        isActiveRoute(item.path) 
                          ? "bg-white/20 text-white" 
                          : "bg-blue-100 text-blue-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {isActiveRoute(item.path) && (
                      <ChevronRight size={16} className="opacity-80 relative z-10" />
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-4 py-3 bg-gray-900/90 backdrop-blur-xl text-white text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/90 rotate-45"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section - Apple Style */}
        <div className="p-6 border-t border-gray-200/30 flex-shrink-0">
          <div className={cn(
            "flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/50 rounded-2xl border border-gray-200/50 backdrop-blur-sm",
            { "justify-center": sidebarCollapsed }
          )}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <User size={22} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-base">
                  {user?.firstName || 'Demo User'}
                </p>
                <p className="text-sm text-gray-500 font-light truncate">Professional</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay - Apple Style */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-lg transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - Apple Style */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 transition-all duration-500 bg-gray-50",
        {
          "lg:ml-80": sidebarOpen && !sidebarCollapsed,
          "lg:ml-20": sidebarOpen && sidebarCollapsed,
          "lg:ml-0": !sidebarOpen,
        }
      )}>
        {/* Header - Apple Style */}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                className="p-3 hover:bg-gray-100/60 rounded-2xl transition-all duration-300 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onClick={toggleSidebar}
                aria-label="Toggle navigation menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <button
                className="hidden lg:flex p-3 hover:bg-gray-100/60 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onClick={toggleSidebar}
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-3 hover:bg-gray-100/60 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50" title="Notifications">
                <Bell size={20} className="text-gray-700" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100/60 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <UserCircle size={22} className="text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      {user?.email || 'demo@enterprise-docs.com'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={cn(
                    "text-gray-500 transition-all duration-300",
                    { "rotate-180": userMenuOpen }
                  )} />
                </button>

                {/* User Dropdown Menu - Apple Style */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 py-4 z-50">
                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-200/30">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <UserCircle size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-base">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user?.email || 'demo@enterprise-docs.com'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1 px-2 py-1 bg-blue-50 rounded-full inline-block">
                            Professional
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center gap-4 px-6 py-3 text-sm text-gray-700 hover:bg-gray-100/60 transition-all duration-300 mx-2 rounded-2xl"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={18} />
                        Account Settings
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-4 px-6 py-3 text-sm text-gray-700 hover:bg-gray-100/60 transition-all duration-300 mx-2 rounded-2xl"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={18} />
                        Profile
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200/30 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-300 mx-2 rounded-2xl focus:outline-none focus:bg-red-50/80"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-medium border border-green-200/50 backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                Online
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Apple Style */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}