import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
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
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';

// Import Pantry Design System Components
import { 
  Card, 
  CardHeader, 
  CardContent, 
  StatsCard 
} from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Alert } from '../components/pantry/Alert';

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
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
            <Activity className="w-6 h-6 text-orange-600 animate-spin" />
          </div>
          <p className="text-lg font-medium text-neutral-700">Loading dashboard data...</p>
          <p className="text-sm text-neutral-500">Please wait while we fetch your latest information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Error Alert */}
        {error && (
          <Alert 
            variant="error" 
            dismissible 
            title="Connection Error"
            action={
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Welcome back, {user?.firstName || 'User'}
                </h1>
                <p className="text-neutral-600 text-lg">
                  {hasSampleData 
                    ? "Here's what's happening with your documents today."
                    : "Get started by seeding sample data or creating your first document."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {!hasSampleData && (
              <Button 
                variant="outline" 
                icon={<Database size={20} />}
                onClick={handleSeedData}
                loading={isLoading}
              >
                Seed Sample Data
              </Button>
            )}
            <Button 
              variant="secondary" 
              icon={<Download size={20} />}
            >
              Export Report
            </Button>
            <Button 
              variant="primary" 
              icon={<Plus size={20} />}
            >
              New Document
            </Button>
          </div>
        </div>

        {/* System Health Status */}
        {stats && (
          <Card className="p-6">
            <CardHeader title="System Status" className="pb-4" />
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  stats.systemHealth.database 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <Database className={`w-5 h-5 ${
                    stats.systemHealth.database ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Database</p>
                    <p className={`text-sm ${
                      stats.systemHealth.database ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.systemHealth.database ? 'Operational' : 'Offline'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    stats.systemHealth.database ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  stats.systemHealth.redis 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <Server className={`w-5 h-5 ${
                    stats.systemHealth.redis ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Cache</p>
                    <p className={`text-sm ${
                      stats.systemHealth.redis ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.systemHealth.redis ? 'Operational' : 'Offline'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    stats.systemHealth.redis ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  stats.systemHealth.elasticsearch 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    stats.systemHealth.elasticsearch ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Search</p>
                    <p className={`text-sm ${
                      stats.systemHealth.elasticsearch ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.systemHealth.elasticsearch ? 'Operational' : 'Offline'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    stats.systemHealth.elasticsearch ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <StatsCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              change={
                metric.change && metric.changeType
                  ? {
                      value: `${metric.change}%`,
                      type: metric.changeType === 'positive' 
                        ? 'increase' 
                        : metric.changeType === 'negative' 
                        ? 'decrease' 
                        : 'neutral'
                    }
                  : undefined
              }
              icon={metric.icon}
              className="hover:shadow-lg transition-shadow duration-200"
            />
          ))}
        </div>

        {/* Platform Overview */}
        {stats && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-neutral-900">Platform Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-600">Total Documents</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats.totalDocuments}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-600">Platform Users</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats.totalUsers}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-600">Active Projects</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats.activeProjects}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-600">Organizations</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats.totalTenants}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                    <Server className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSampleData && !isLoading && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-2xl">
                <Database className="w-10 h-10 text-neutral-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-neutral-900">No Data Available</h3>
                <p className="text-neutral-600">
                  Your database is empty. Seed sample data to see the dashboard in action,
                  or start creating documents to populate your platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  icon={<Database size={20} />}
                  onClick={handleSeedData}
                  loading={isLoading}
                  className="w-full sm:w-auto"
                >
                  Seed Sample Data
                </Button>
                <Button 
                  variant="secondary" 
                  icon={<Plus size={20} />}
                  className="w-full sm:w-auto"
                >
                  Create First Document
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}