import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Folder, 
  BarChart3, 
  Brain, 
  Users, 
  Building2, 
  Shield, 
  Workflow, 
  Share2, 
  Network, 
  Database, 
  Settings, 
  User,
  Sparkles,
  TrendingUp,
  Zap,
  Globe,
  Monitor,
  PieChart,
  Lock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
  requiredRoles?: string[];
}

interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const navigationSections: NavigationSection[] = [
  {
    id: 'core',
    label: 'Core Features',
    defaultExpanded: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        description: 'Overview and key metrics'
      },
      {
        id: 'documents',
        label: 'Noodles',
        path: '/documents',
        icon: FileText,
        description: 'Document management'
      },
      {
        id: 'collections',
        label: 'Collections',
        path: '/collections',
        icon: Folder,
        description: 'Organize your content'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & AI',
    defaultExpanded: true,
    items: [
      {
        id: 'ai-analytics',
        label: 'AI Analytics',
        path: '/ai-analytics',
        icon: Brain,
        description: 'AI-powered insights',
        badge: 'New'
      },
      {
        id: 'predictive-analytics',
        label: 'Predictive Analytics',
        path: '/predictive-analytics',
        icon: TrendingUp,
        description: 'Future trends and forecasts'
      },
      {
        id: 'ml-classification',
        label: 'ML Classification',
        path: '/ml-classification',
        icon: Sparkles,
        description: 'Machine learning models'
      },
      {
        id: 'advanced-analytics',
        label: 'Advanced Analytics',
        path: '/advanced-analytics',
        icon: PieChart,
        description: 'Deep analytical insights'
      }
    ]
  },
  {
    id: 'management',
    label: 'Management',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'clients',
        label: 'Client Management',
        path: '/clients',
        icon: Users,
        description: 'Manage client relationships'
      },
      {
        id: 'tenant-management',
        label: 'Tenant Management',
        path: '/tenant-management',
        icon: Building2,
        description: 'Multi-tenant administration'
      },
      {
        id: 'platform-admin',
        label: 'Platform Admin',
        path: '/platform-admin',
        icon: Shield,
        description: 'Platform administration'
      }
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced Features',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'workflows',
        label: 'Advanced Workflows',
        path: '/advanced-workflows',
        icon: Workflow,
        description: 'Process automation'
      },
      {
        id: 'collaborative-editor',
        label: 'Collaborative Editor',
        path: '/collaborative-editor',
        icon: Share2,
        description: 'Real-time collaboration'
      },
      {
        id: 'knowledge-graph',
        label: 'Knowledge Graph',
        path: '/knowledge-graph',
        icon: Network,
        description: 'Connected insights'
      },
      {
        id: 'enterprise-integrations',
        label: 'Enterprise Integrations',
        path: '/enterprise-integrations',
        icon: Globe,
        description: 'Third-party connections'
      },
      {
        id: 'mobile-app',
        label: 'Mobile App',
        path: '/mobile-app',
        icon: Monitor,
        description: 'Mobile experience'
      }
    ]
  },
  {
    id: 'system',
    label: 'System & Settings',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'database',
        label: 'Database Admin',
        path: '/database',
        icon: Database,
        description: 'Database management'
      },
      {
        id: 'security-compliance',
        label: 'Security & Compliance',
        path: '/security-compliance',
        icon: Lock,
        description: 'Security settings'
      },
      {
        id: 'performance-monitoring',
        label: 'Performance Monitoring',
        path: '/performance-monitoring',
        icon: Zap,
        description: 'System performance'
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        description: 'Application settings'
      },
      {
        id: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: User,
        description: 'Your account settings'
      }
    ]
  }
];

export const NavigationItems: React.FC = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigationSections
      .filter(section => section.defaultExpanded)
      .map(section => section.id)
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActiveItem = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
      {navigationSections.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        
        return (
          <div key={section.id} className="space-y-3">
            {/* Section Header */}
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-800 transition-colors duration-200 group"
              >
                <span>{section.label}</span>
                <ChevronRight 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            ) : (
              <h3 className="px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {section.label}
              </h3>
            )}

            {/* Navigation Items */}
            {(!section.collapsible || isExpanded) && (
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveItem(item.path);
                  const IconComponent = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`
                          group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200/50' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r" />
                        )}

                        {/* Icon */}
                        <div className={`
                          flex-shrink-0 mr-3 transition-colors duration-200
                          ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                        `}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className={`
                              text-xs mt-0.5 truncate transition-colors duration-200
                              ${isActive ? 'text-blue-600/70' : 'text-gray-500 group-hover:text-gray-600'}
                            `}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/20 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationItems;