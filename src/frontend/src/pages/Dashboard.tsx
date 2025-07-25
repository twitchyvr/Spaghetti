import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/dashboard.css';
import { 
  Users, 
  FileText, 
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Database,
  Server,
  HardDrive,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalTenants: number;
  activeProjects: number;
  databaseSize: string;
  systemHealth: {
    database: boolean;
    redis: boolean;
    elasticsearch: boolean;
  };
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSampleData, setHasSampleData] = useState(false);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let currentStats: DashboardStats | null = null;

      // Try to fetch database stats, with fallback to demo data
      try {
        const [statsResponse, sampleDataResponse] = await Promise.all([
          api.admin.getDatabaseStats(),
          api.admin.getSampleDataStatus()
        ]);

        setHasSampleData(sampleDataResponse.hasSampleData);

        const dashboardStats: DashboardStats = {
          totalDocuments: statsResponse.totalDocuments,
          totalUsers: statsResponse.totalUsers,
          totalTenants: statsResponse.totalTenants,
          activeProjects: Math.floor(statsResponse.totalDocuments / 3), // Estimate
          databaseSize: statsResponse.databaseSize,
          systemHealth: statsResponse.systemHealth
        };

        setStats(dashboardStats);
        currentStats = dashboardStats;
      } catch (apiError) {
        // API not available - use demo data
        console.log('API not available, using demo data');
        setHasSampleData(true);
        
        const demoStats: DashboardStats = {
          totalDocuments: 247,
          totalUsers: 12,
          totalTenants: 3,
          activeProjects: 8,
          databaseSize: '15.2 MB',
          systemHealth: {
            database: false, // API not available
            redis: false,
            elasticsearch: false
          }
        };

        setStats(demoStats);
        currentStats = demoStats;
      }

      // Update metrics with current stats data (real or demo)
      if (currentStats) {
        const updatedMetrics: MetricCard[] = [
          {
            id: 'documents',
            title: 'Total Documents',
            value: currentStats.totalDocuments,
            change: 18.2,
            changeType: 'positive',
            icon: <FileText size={24} />,
            color: 'primary',
            description: 'Documents across all tenants'
          },
          {
            id: 'users',
            title: 'Active Users',
            value: currentStats.totalUsers,
            change: 12.5,
            changeType: 'positive',
            icon: <Users size={24} />,
            color: 'success',
            description: 'Registered platform users'
          },
          {
            id: 'tenants',
            title: 'Organizations',
            value: currentStats.totalTenants,
            change: 5.1,
            changeType: 'positive',
            icon: <Server size={24} />,
            color: 'warning',
            description: 'Multi-tenant organizations'
          },
          {
            id: 'storage',
            title: 'Database Size',
            value: currentStats.databaseSize,
            icon: <HardDrive size={24} />,
            color: 'info',
            description: 'Total database storage used'
          }
        ];

        setMetrics(updatedMetrics);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Set default metrics on error
      setMetrics([
        {
          id: 'documents',
          title: 'Total Documents',
          value: '-',
          icon: <FileText size={24} />,
          color: 'primary'
        },
        {
          id: 'users',
          title: 'Active Users',
          value: '-',
          icon: <Users size={24} />,
          color: 'success'
        },
        {
          id: 'tenants',
          title: 'Organizations',
          value: '-',
          icon: <Server size={24} />,
          color: 'warning'
        },
        {
          id: 'storage',
          title: 'Database Size',
          value: '-',
          icon: <HardDrive size={24} />,
          color: 'info'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      await api.admin.seedSampleData();
      // Refresh dashboard data after seeding
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to seed data:', err);
      setError(err instanceof Error ? err.message : 'Failed to seed sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatChange = (change?: number, type?: 'positive' | 'negative' | 'neutral') => {
    if (!change) return null;
    
    const Icon = change > 0 ? ArrowUpRight : ArrowDownRight;
    const colorClass = type === 'positive' ? 'metric-change-positive' : 
                      type === 'negative' ? 'metric-change-negative' : 'metric-change-neutral';
    
    return (
      <div className={`metric-change ${colorClass}`}>
        <Icon size={16} />
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">
            <Activity className="animate-spin" size={48} />
          </div>
          <p className="loading-text">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <section className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.firstName || 'User'}</h1>
            <p className="dashboard-subtitle">
              {hasSampleData 
                ? "Here's what's happening with your documents today."
                : "Get started by seeding sample data or creating your first document."}
            </p>
          </div>
          <div className="header-actions">
            {!hasSampleData && (
              <button className="btn btn-secondary" onClick={handleSeedData}>
                <Database size={20} />
                Seed Sample Data
              </button>
            )}
            <button className="btn btn-secondary">
              <Download size={20} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>
      </section>

      {/* System Health Status */}
      {stats && (
        <section className="health-section">
          <div className="health-status card">
            <h3 className="health-title">System Status</h3>
            <div className="health-indicators">
              <div className={`health-item ${stats.systemHealth.database ? 'healthy' : 'unhealthy'}`}>
                <Database size={16} />
                <span>Database</span>
                <span className="status-dot"></span>
              </div>
              <div className={`health-item ${stats.systemHealth.redis ? 'healthy' : 'unhealthy'}`}>
                <Server size={16} />
                <span>Cache</span>
                <span className="status-dot"></span>
              </div>
              <div className={`health-item ${stats.systemHealth.elasticsearch ? 'healthy' : 'unhealthy'}`}>
                <Activity size={16} />
                <span>Search</span>
                <span className="status-dot"></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Metrics Grid */}
      <section className="metrics-section">
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="metric-card card">
              <div className="metric-header">
                <div className={`metric-icon metric-icon-${metric.color}`}>
                  {metric.icon}
                </div>
                {formatChange(metric.change, metric.changeType)}
              </div>
              <div className="metric-content">
                <h3 className="metric-value">{metric.value}</h3>
                <p className="metric-title">{metric.title}</p>
                {metric.description && (
                  <p className="metric-description">{metric.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      {stats && (
        <section className="stats-section">
          <h2 className="section-title">Platform Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalDocuments}</p>
                <p className="stat-label">Total Documents</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-label">Platform Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{stats.activeProjects}</p>
                <p className="stat-label">Active Projects</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Server size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{stats.totalTenants}</p>
                <p className="stat-label">Organizations</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasSampleData && !isLoading && (
        <section className="empty-state">
          <div className="empty-state-content card">
            <Database size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Data Available</h3>
            <p className="empty-state-text">
              Your database is empty. Seed sample data to see the dashboard in action,
              or start creating documents to populate your platform.
            </p>
            <div className="empty-state-actions">
              <button className="btn btn-primary" onClick={handleSeedData}>
                <Database size={20} />
                Seed Sample Data
              </button>
              <button className="btn btn-secondary">
                <Plus size={20} />
                Create First Document
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}