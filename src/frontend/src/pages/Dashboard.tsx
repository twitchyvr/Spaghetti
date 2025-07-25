
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalDocuments: number;
  recentDocuments: number;
  activeProjects: number;
  teamMembers: number;
}

interface RecentActivity {
  id: string;
  type: 'created' | 'updated' | 'shared';
  title: string;
  timestamp: string;
  user: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    recentDocuments: 0,
    activeProjects: 0,
    teamMembers: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // This will be replaced with real API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          totalDocuments: 247,
          recentDocuments: 12,
          activeProjects: 8,
          teamMembers: 15
        });

        setActivities([
          {
            id: '1',
            type: 'created',
            title: 'Legal Contract Template v2.1',
            timestamp: '2 hours ago',
            user: 'Sarah Johnson'
          },
          {
            id: '2',
            type: 'updated',
            title: 'Employee Handbook - Remote Work Policy',
            timestamp: '4 hours ago',
            user: 'Mike Chen'
          },
          {
            id: '3',
            type: 'shared',
            title: 'Q4 Financial Report',
            timestamp: '1 day ago',
            user: 'Alex Rivera'
          },
          {
            id: '4',
            type: 'created',
            title: 'Client Onboarding Checklist',
            timestamp: '2 days ago',
            user: 'Emma Davis'
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'created':
        return '📄';
      case 'updated':
        return '✏️';
      case 'shared':
        return '📤';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'created':
        return 'text-green-600';
      case 'updated':
        return 'text-blue-600';
      case 'shared':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.email || 'User'}! Here's what's happening with your documents.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + New Document
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Documents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentDocuments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📄</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">Last 7 days</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-600 text-sm font-medium">3 due this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 text-sm font-medium">Across 4 departments</span>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600 text-sm mt-1">Latest updates from your team</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} by {activity.user}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    <span className="text-xs font-medium">
                      {activity.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all activity →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📝</span>
                <span className="font-medium text-gray-900">Create Document</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🤖</span>
                <span className="font-medium text-gray-900">AI Assistant</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📁</span>
                <span className="font-medium text-gray-900">Browse Templates</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📊</span>
                <span className="font-medium text-gray-900">View Analytics</span>
              </div>
              <span className="text-yellow-600">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-green-600 text-lg mr-3">✅</span>
          <div>
            <p className="text-sm font-medium text-green-800">
              Database Connected & Ready
            </p>
            <p className="text-xs text-green-600">
              PostgreSQL database configured. Backend integration pending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}