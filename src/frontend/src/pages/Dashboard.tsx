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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center max-w-md">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full">
                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-gray-900">Loading Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Fetching your latest platform metrics and system information
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
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

        {/* Welcome Section - Microsoft Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-semibold text-gray-900 mb-2">
                    Welcome back, {user?.firstName || 'User'}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                    {hasSampleData 
                      ? "Here's an overview of your document management platform. Track your progress, manage your content, and collaborate with your team."
                      : "Get started by seeding sample data to explore the platform, or create your first document to begin your journey."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {!hasSampleData && (
                <Button 
                  variant="outline" 
                  size="lg"
                  icon={<Database size={20} />}
                  onClick={handleSeedData}
                  loading={isLoading}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Seed Sample Data
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="lg"
                icon={<Download size={20} />}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
              >
                Export Report
              </Button>
              <Button 
                variant="primary" 
                size="lg"
                icon={<Plus size={20} />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                New Document
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Status - Redesigned */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Status</h2>
              <p className="text-gray-600">Monitor the health and performance of your platform services</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  stats.systemHealth.database 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-red-200 bg-red-50/50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      stats.systemHealth.database ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Database className={`w-6 h-6 ${
                        stats.systemHealth.database ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Database</h3>
                      <p className={`text-sm font-medium ${
                        stats.systemHealth.database ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.systemHealth.database ? 'Operational' : 'Offline'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      stats.systemHealth.database ? 'bg-green-500' : 'bg-red-500'
                    } ${stats.systemHealth.database ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  stats.systemHealth.redis 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-red-200 bg-red-50/50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      stats.systemHealth.redis ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Server className={`w-6 h-6 ${
                        stats.systemHealth.redis ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Cache</h3>
                      <p className={`text-sm font-medium ${
                        stats.systemHealth.redis ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.systemHealth.redis ? 'Operational' : 'Offline'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      stats.systemHealth.redis ? 'bg-green-500' : 'bg-red-500'
                    } ${stats.systemHealth.redis ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  stats.systemHealth.elasticsearch 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-red-200 bg-red-50/50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      stats.systemHealth.elasticsearch ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Activity className={`w-6 h-6 ${
                        stats.systemHealth.elasticsearch ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Search</h3>
                      <p className={`text-sm font-medium ${
                        stats.systemHealth.elasticsearch ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.systemHealth.elasticsearch ? 'Operational' : 'Offline'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      stats.systemHealth.elasticsearch ? 'bg-green-500' : 'bg-red-500'
                    } ${stats.systemHealth.elasticsearch ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics - Redesigned */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">Platform Metrics</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Track your platform's key performance indicators and growth metrics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
                      {metric.title}
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      {metric.value}
                    </p>
                    {metric.change && metric.changeType && (
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          metric.changeType === 'positive' 
                            ? 'bg-green-100 text-green-700' 
                            : metric.changeType === 'negative' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {metric.changeType === 'positive' && <ArrowUpRight className="w-4 h-4" />}
                          {metric.changeType === 'negative' && <ArrowDownRight className="w-4 h-4" />}
                          {metric.change}%
                        </div>
                      </div>
                    )}
                    {metric.description && (
                      <p className="text-sm text-gray-500 mt-2">{metric.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="text-blue-600">
                        {metric.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Overview - Redesigned */}
        {stats && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border border-blue-100">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Platform Overview</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Comprehensive insights into your document management ecosystem</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/90 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Documents</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.totalDocuments}</p>
                    <p className="text-sm text-gray-500">Across all organizations</p>
                  </div>
                  <div className="p-4 bg-orange-100 rounded-2xl">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/90 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Platform Users</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-500">Active collaborators</p>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/90 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Active Projects</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.activeProjects}</p>
                    <p className="text-sm text-gray-500">In development</p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-2xl">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/90 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Organizations</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.totalTenants}</p>
                    <p className="text-sm text-gray-500">Multi-tenant setup</p>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-2xl">
                    <Server className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Redesigned */}
        {!hasSampleData && !isLoading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="flex flex-col items-center space-y-8 max-w-lg mx-auto">
              <div className="relative">
                <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl border border-blue-200">
                  <Database className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your platform is ready for content. Seed sample data to explore all features,
                  or jump right in and create your first document to begin your journey.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<Database size={20} />}
                  onClick={handleSeedData}
                  loading={isLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  Seed Sample Data
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  icon={<Plus size={20} />}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Create First Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}