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
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
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
    <nav style={{
      flex: 1,
      padding: '24px 16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {navigationSections.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        
        return (
          <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Section Header */}
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--font-xs)',
                  fontWeight: '600',
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color var(--transition-base)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
              >
                <span>{section.label}</span>
                <ChevronRight 
                  style={{
                    width: '16px',
                    height: '16px',
                    transition: 'transform var(--transition-base)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                />
              </button>
            ) : (
              <h3 style={{
                padding: '8px 12px',
                fontSize: 'var(--font-xs)',
                fontWeight: '600',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0
              }}>
                {section.label}
              </h3>
            )}

            {/* Navigation Items */}
            {(!section.collapsible || isExpanded) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => {
                  const isActive = isActiveItem(item.path);
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        fontSize: 'var(--font-sm)',
                        fontWeight: '500',
                        borderRadius: 'var(--radius-lg)',
                        textDecoration: 'none',
                        transition: 'all var(--transition-base)',
                        overflow: 'hidden',
                        background: isActive 
                          ? 'linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-brand-primary)20 100%)' 
                          : 'transparent',
                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        border: isActive ? '1px solid var(--color-brand-primary)40' : '1px solid transparent',
                        boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }
                      }}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          background: 'linear-gradient(to bottom, var(--color-brand-primary), var(--color-brand-secondary))',
                          borderRadius: '0 2px 2px 0'
                        }} />
                      )}

                      {/* Icon */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                        transition: 'color var(--transition-base)'
                      }}>
                        <IconComponent style={{ width: '20px', height: '20px' }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{item.label}</span>
                          {item.badge && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              fontSize: 'var(--font-xs)',
                              fontWeight: '500',
                              backgroundColor: 'var(--color-brand-primary)',
                              color: 'white',
                              borderRadius: 'var(--radius-full)'
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p style={{
                            fontSize: 'var(--font-xs)',
                            color: isActive ? 'var(--color-brand-secondary)' : 'var(--color-text-muted)',
                            marginTop: '2px',
                            marginBottom: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            transition: 'color var(--transition-base)'
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Hover Glow Effect */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, var(--color-brand-light) 50%, transparent 100%)',
                        opacity: 0,
                        transition: 'opacity var(--transition-slow)',
                        pointerEvents: 'none'
                      }} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationItems;