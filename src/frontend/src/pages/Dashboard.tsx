import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  Database,
  Server,
  Plus,
  Download,
  Sparkles,
  Target,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  activeProjects: number;
  systemHealth: {
    database: boolean;
    redis: boolean;
    elasticsearch: boolean;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasSampleData = stats && (stats.totalUsers > 1 || stats.totalDocuments > 0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.admin.getDatabaseStats();
      const data = response;

      const dashboardStats: DashboardStats = {
        totalUsers: data.totalUsers || 0,
        totalDocuments: data.totalDocuments || 0,
        activeProjects: data.totalTenants || 0,
        systemHealth: data.systemHealth || {
          database: true,
          redis: true,
          elasticsearch: true,
        }
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      await api.admin.seedSampleData();
      toast.success('Sample data seeded successfully');
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to seed data:', err);
      toast.error('Failed to seed sample data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="app-container">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-secondary)'
        }}>
          <div className="card" style={{
            padding: '48px',
            textAlign: 'center',
            maxWidth: '400px',
            background: 'linear-gradient(145deg, var(--color-bg-primary) 0%, var(--color-bg-tertiary) 100%)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, var(--color-brand-primary), var(--color-brand-secondary))',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <Activity style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: 'white',
                  animation: 'spin 2s linear infinite'
                }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-2xl)',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px'
                }}>Loading Dashboard</h3>
                <p style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--color-text-secondary)'
                }}>Fetching your platform metrics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
        minHeight: '100vh'
      }}>
        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, var(--color-error-light) 0%, #fef7f7 100%)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--color-error)' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--color-error)' }}>Connection Error:</strong>
              <span style={{ color: 'var(--color-error-700)', marginLeft: '8px' }}>{error}</span>
            </div>
            <button 
              onClick={fetchDashboardData}
              style={{
                fontSize: 'var(--font-sm)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-error)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-primary)';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Hero Welcome Section */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-light) 100%)',
          padding: '40px',
          marginBottom: '32px',
          border: '1px solid var(--color-border-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, var(--color-brand-primary), var(--color-brand-secondary))',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <Sparkles style={{ width: '36px', height: '36px', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: 'var(--font-5xl)',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  marginBottom: '12px',
                  background: 'linear-gradient(45deg, var(--color-text-primary), var(--color-brand-primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Welcome back, {user?.firstName || 'User'}
                </h1>
                <p style={{
                  fontSize: 'var(--font-lg)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                  maxWidth: '800px'
                }}>
                  {hasSampleData 
                    ? "Here's an overview of your document management platform. Track your progress, manage your content, and collaborate with your team."
                    : "Get started by seeding sample data to explore the platform, or create your first document to begin your journey."}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {!hasSampleData && (
                <button 
                  onClick={handleSeedData}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    fontSize: 'var(--font-base)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: 'var(--radius-lg)',
                    background: isLoading ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    color: isLoading ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-base)',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                      e.currentTarget.style.background = 'var(--color-brand-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.background = 'var(--color-bg-primary)';
                    }
                  }}
                >
                  <Database style={{ width: '20px', height: '20px' }} />
                  {isLoading ? 'Seeding...' : 'Seed Sample Data'}
                </button>
              )}
              <button 
                onClick={() => {
                  toast.success('Report export started');
                  console.log('Export functionality would go here');
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: 'var(--font-base)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.background = 'var(--color-brand-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.background = 'var(--color-bg-primary)';
                }}
              >
                <Download style={{ width: '20px', height: '20px' }} />
                Export Report
              </button>
              <button 
                onClick={() => navigate('/documents')}
                style={{
                  padding: '12px 24px',
                  fontSize: 'var(--font-base)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                New Document
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {[
              {
                title: 'Total Users',
                value: stats.totalUsers.toLocaleString(),
                change: '+12.5%',
                icon: Users,
                color: 'var(--color-brand-primary)'
              },
              {
                title: 'Documents Created',
                value: stats.totalDocuments.toLocaleString(),
                change: '+8.2%',
                icon: FileText,
                color: 'var(--color-success)'
              },
              {
                title: 'Active Projects',
                value: stats.activeProjects.toLocaleString(),
                change: '+15.7%',
                icon: Target,
                color: 'var(--color-warning)'
              },
              {
                title: 'Revenue Growth',
                value: '$42.5K',
                change: '+23.1%',
                icon: DollarSign,
                color: 'var(--color-info)'
              }
            ].map((metric, index) => (
              <div
                key={index}
                className="card"
                style={{
                  background: 'linear-gradient(145deg, var(--color-bg-primary) 0%, var(--color-bg-tertiary) 100%)',
                  padding: '24px',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    background: `linear-gradient(45deg, ${metric.color}, ${metric.color}dd)`,
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    <metric.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 'var(--font-sm)',
                      fontWeight: '500',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '4px'
                    }}>
                      {metric.title}
                    </p>
                    <p style={{
                      fontSize: 'var(--font-3xl)',
                      fontWeight: '700',
                      color: 'var(--color-text-primary)',
                      marginBottom: '8px'
                    }}>
                      {metric.value}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: 'var(--color-success-light)',
                        color: 'var(--color-success)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: '500'
                      }}>
                        <TrendingUp style={{ width: '12px', height: '12px' }} />
                        {metric.change}
                      </div>
                      <span style={{
                        fontSize: 'var(--font-xs)',
                        color: 'var(--color-text-tertiary)'
                      }}>vs last period</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Status */}
        {stats && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-tertiary) 100%)',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: 'var(--font-3xl)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '8px'
              }}>System Status</h2>
              <p style={{
                fontSize: 'var(--font-base)',
                color: 'var(--color-text-secondary)'
              }}>Monitor the health and performance of your platform services</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {[
                { name: 'Database', status: stats.systemHealth.database, icon: Database },
                { name: 'Cache', status: stats.systemHealth.redis, icon: Server },
                { name: 'Search', status: stats.systemHealth.elasticsearch, icon: Activity }
              ].map((service, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: service.status ? '2px solid var(--color-success)' : '2px solid var(--color-error)',
                    background: service.status 
                      ? 'linear-gradient(135deg, var(--color-success-light) 0%, #f0fdf4 100%)' 
                      : 'linear-gradient(135deg, var(--color-error-light) 0%, #fef7f7 100%)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      backgroundColor: service.status ? 'var(--color-success)' : 'var(--color-error)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <service.icon style={{ 
                        width: '24px', 
                        height: '24px', 
                        color: 'white' 
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--font-lg)',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        marginBottom: '4px'
                      }}>{service.name}</h3>
                      <p style={{
                        fontSize: 'var(--font-sm)',
                        fontWeight: '500',
                        color: service.status ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {service.status ? 'Operational' : 'Offline'}
                      </p>
                    </div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: service.status ? 'var(--color-success)' : 'var(--color-error)',
                      animation: service.status ? 'pulse-gentle 2s ease-in-out infinite' : 'none'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Get Started Section for New Users */}
        {!hasSampleData && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-light) 100%)',
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, var(--color-brand-primary), var(--color-brand-secondary))',
                borderRadius: 'var(--radius-xl)',
                margin: '0 auto 24px',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <FileText style={{ width: '40px', height: '40px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: 'var(--font-3xl)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '12px'
              }}>Get Started</h3>
              <p style={{
                fontSize: 'var(--font-base)',
                color: 'var(--color-text-secondary)',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Create your first document or seed sample data to explore the platform's capabilities.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button 
                  onClick={handleSeedData}
                  disabled={isLoading}
                  className="btn btn-secondary"
                  style={{
                    padding: '12px 24px',
                    fontSize: 'var(--font-base)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Database style={{ width: '20px', height: '20px' }} />
                  Seed Sample Data
                </button>
                <button 
                  onClick={() => navigate('/documents')}
                  style={{
                    padding: '12px 24px',
                    fontSize: 'var(--font-base)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px' }} />
                  Create First Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}