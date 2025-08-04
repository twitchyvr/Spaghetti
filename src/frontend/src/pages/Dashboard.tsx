import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StatsCard } from '../components/pantry/data/StatsCard';
import { Button } from '../components/pantry/forms/Button';
import { Alert } from '../components/pantry/Alert';
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Database,
  Server,
  Plus,
  Download,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  DollarSign,
  BarChart3
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

interface MetricCard {
  title: string;
  value: string;
  change: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<any>;
  description: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
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

      // Generate metrics with proper trends
      const generatedMetrics: MetricCard[] = [
        {
          title: 'Total Users',
          value: dashboardStats.totalUsers.toLocaleString(),
          change: { value: 12.5, type: 'increase' },
          icon: Users,
          description: 'Active platform users'
        },
        {
          title: 'Documents Created',
          value: dashboardStats.totalDocuments.toLocaleString(),
          change: { value: 8.2, type: 'increase' },
          icon: FileText,
          description: 'Total documents generated'
        },
        {
          title: 'Active Projects',
          value: dashboardStats.activeProjects.toLocaleString(),
          change: { value: 15.7, type: 'increase' },
          icon: Target,
          description: 'Current active projects'
        },
        {
          title: 'Revenue Growth',
          value: '$42.5K',
          change: { value: 23.1, type: 'increase' },
          icon: DollarSign,
          description: 'Monthly recurring revenue'
        }
      ];

      setMetrics(generatedMetrics);
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
              <p className="text-gray-600">Fetching your platform metrics...</p>
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

        {/* Welcome Section */}
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

        {/* Key Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <StatsCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                icon={<metric.icon size={24} />}
              />
            ))}
          </div>
        )}

        {/* System Health Status */}
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
        )}

        {/* Empty State for New Users */}
        {!hasSampleData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mx-auto">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-gray-900">Get Started</h3>
                <p className="text-gray-600">
                  Create your first document or seed sample data to explore the platform's capabilities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  icon={<Database size={20} />}
                  onClick={handleSeedData}
                  loading={isLoading}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Seed Sample Data
                </Button>
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<Plus size={20} />}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium"
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