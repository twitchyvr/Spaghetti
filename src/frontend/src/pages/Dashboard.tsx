import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Download,
  Search,
  MessageCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { HelpTooltip } from '../components/ui/Tooltip';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';

interface DashboardStats {
  totalDocuments: number;
  recentDocuments: number;
  activeProjects: number;
  teamMembers: number;
  completedToday: number;
  avgProcessingTime: string;
  documentGrowth: number;
  projectCompletionRate: number;
  teamUtilization: number;
  systemHealth: number;
}

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'shared' | 'reviewed' | 'completed' | 'commented';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  status: 'success' | 'pending' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description: string;
  target?: string;
  trend: number[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    recentDocuments: 0,
    activeProjects: 0,
    teamMembers: 0,
    completedToday: 0,
    avgProcessingTime: '0s',
    documentGrowth: 0,
    projectCompletionRate: 0,
    teamUtilization: 0,
    systemHealth: 0
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate realistic loading time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          totalDocuments: 1247,
          recentDocuments: 89,
          activeProjects: 23,
          teamMembers: 34,
          completedToday: 12,
          avgProcessingTime: '1.2s',
          documentGrowth: 18.5,
          projectCompletionRate: 94.2,
          teamUtilization: 87.3,
          systemHealth: 99.1
        });

        setMetrics([
          {
            id: 'revenue',
            title: 'Monthly Revenue',
            value: '$284,590',
            change: 12.5,
            changeType: 'positive',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'from-emerald-500 to-emerald-600',
            description: 'Total revenue from client work',
            target: '$300,000',
            trend: [220000, 235000, 248000, 267000, 284590]
          },
          {
            id: 'efficiency',
            title: 'Process Efficiency',
            value: '94.2%',
            change: 8.3,
            changeType: 'positive',
            icon: <Zap className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
            description: 'Document processing efficiency',
            target: '95%',
            trend: [87, 89, 91, 93, 94.2]
          },
          {
            id: 'satisfaction',
            title: 'Client Satisfaction',
            value: '4.8/5.0',
            change: 2.1,
            changeType: 'positive',
            icon: <Target className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
            description: 'Average client satisfaction score',
            target: '4.9/5.0',
            trend: [4.6, 4.65, 4.7, 4.75, 4.8]
          },
          {
            id: 'response',
            title: 'Response Time',
            value: '1.2s',
            change: -15.2,
            changeType: 'positive',
            icon: <Activity className="w-6 h-6" />,
            color: 'from-orange-500 to-orange-600',
            description: 'Average system response time',
            target: '< 1.0s',
            trend: [1.8, 1.6, 1.4, 1.3, 1.2]
          }
        ]);

        setActivities([
          {
            id: '1',
            type: 'completed',
            title: 'Corporate Merger Agreement - Finalized',
            description: 'Acme Corp & Beta LLC merger documentation complete',
            timestamp: '2 minutes ago',
            user: {
              name: 'Sarah Johnson',
              avatar: 'SJ',
              role: 'Senior Partner'
            },
            status: 'success',
            priority: 'high'
          },
          {
            id: '2',
            type: 'reviewed',
            title: 'Employment Contract Template - Approved',
            description: 'Legal review completed for senior associate positions',
            timestamp: '15 minutes ago',
            user: {
              name: 'Michael Chen',
              avatar: 'MC',
              role: 'Legal Counsel'
            },
            status: 'success',
            priority: 'medium'
          },
          {
            id: '3',
            type: 'created',
            title: 'Digital Transformation Strategy',
            description: 'New strategic roadmap for Fortune 500 client',
            timestamp: '1 hour ago',
            user: {
              name: 'Dr. Robert Williams',
              avatar: 'RW',
              role: 'Strategy Director'
            },
            status: 'pending',
            priority: 'high'
          },
          {
            id: '4',
            type: 'commented',
            title: 'Product Requirements Document',
            description: 'Stakeholder feedback on mobile banking features',
            timestamp: '2 hours ago',
            user: {
              name: 'Alex Thompson',
              avatar: 'AT',
              role: 'Product Manager'
            },
            status: 'warning',
            priority: 'medium'
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeframe]);

  const formatChange = (change: number, type: 'positive' | 'negative' | 'neutral') => {
    const icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : null;
    const colorClass = type === 'positive' ? 'text-emerald-600' : 
                     type === 'negative' ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        {icon && <span className="w-4 h-4">{React.createElement(icon, { className: 'w-4 h-4' })}</span>}
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    );
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      created: <Plus className="w-4 h-4" />,
      updated: <FileText className="w-4 h-4" />,
      shared: <Users className="w-4 h-4" />,
      reviewed: <Search className="w-4 h-4" />,
      completed: <TrendingUp className="w-4 h-4" />,
      commented: <MessageCircle className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-8xl mx-auto px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-96"></div>
                <div className="h-6 bg-slate-200 rounded w-[500px]"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-12 bg-slate-200 rounded-lg w-32"></div>
                <div className="h-12 bg-slate-200 rounded-lg w-40"></div>
              </div>
            </div>
            
            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-8 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            
            {/* Charts Grid Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
                <div className="h-80 bg-slate-100 rounded-xl"></div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>
                <div className="h-80 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Executive Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-600">Live</span>
              </div>
            </div>
            <p className="text-xl text-slate-600 max-w-3xl">
              Welcome back, <span className="font-semibold text-slate-900">{user?.email?.split('@')[0] || 'Executive'}</span>! 
              Your enterprise operations at a glance with real-time insights and performance metrics.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1">
              {['24h', '7d', '30d', '90d'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeframe === period
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <button className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5" />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{metric.title}</p>
                      <HelpTooltip 
                        content={metric.description}
                        description={metric.description}
                        title={metric.title}
                      />
                    </div>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
                      {formatChange(metric.change, metric.changeType)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white shadow-sm`}>
                    {metric.icon}
                  </div>
                </div>
                
                {/* Mini trend chart */}
                <div className="flex items-end space-x-1 h-8">
                  {metric.trend.map((value, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-t ${metric.color} rounded-sm flex-1 opacity-60 hover:opacity-100 transition-opacity`}
                      style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                    />
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-slate-500">
                  Target: {metric.target}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Analytics Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Document Trends Chart */}
          <div className="xl:col-span-2">
            <AnalyticsChart
              data={[
                { name: 'Jan', value: 186, change: 12.5 },
                { name: 'Feb', value: 205, change: 10.2 },
                { name: 'Mar', value: 237, change: 15.6 },
                { name: 'Apr', value: 248, change: 4.6 },
                { name: 'May', value: 262, change: 5.6 },
                { name: 'Jun', value: 287, change: 9.5 },
                { name: 'Jul', value: 312, change: 8.7 }
              ]}
              type="area"
              title="Document Creation Trends"
              description="Document generation and processing over time"
              height={320}
              metricType="documents"
              helpText="This chart shows the monthly trend of document creation across all departments. Includes contracts, reports, templates, and collaborative documents."
              formatValue={(value) => `${value} docs`}
            />
          </div>
          
          {/* Project Status Distribution */}
          <div>
            <AnalyticsChart
              data={[
                { name: 'Completed', value: 45 },
                { name: 'In Progress', value: 30 },
                { name: 'Review', value: 15 },
                { name: 'Blocked', value: 10 }
              ]}
              type="pie"
              title="Project Status Distribution"
              description="Current project status breakdown"
              height={320}
              metricType="projects"
              helpText="Real-time view of project status across all active engagements. Projects are automatically categorized based on milestone completion and deadline proximity."
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
            />
          </div>
        </div>

        {/* Team Performance & Activity Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Team Performance Chart */}
          <div className="xl:col-span-2">
            <AnalyticsChart
              data={[
                { name: 'Mon', value: 24, additional: { projects: 3, collaboration: 8 } },
                { name: 'Tue', value: 31, additional: { projects: 5, collaboration: 12 } },
                { name: 'Wed', value: 28, additional: { projects: 4, collaboration: 9 } },
                { name: 'Thu', value: 35, additional: { projects: 6, collaboration: 15 } },
                { name: 'Fri', value: 29, additional: { projects: 4, collaboration: 11 } },
                { name: 'Sat', value: 12, additional: { projects: 1, collaboration: 3 } },
                { name: 'Sun', value: 8, additional: { projects: 1, collaboration: 2 } }
              ]}
              type="bar"
              title="Team Performance Analytics"
              description="Daily productivity metrics and collaboration patterns"
              height={384}
              metricType="documents"
              helpText="Tracks daily team productivity including document creation, project milestones, and collaboration activities. Data is aggregated across all departments."
              formatValue={(value) => `${value} docs`}
            />
          </div>
          
          {/* Live Activity Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">Live Activity</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-600">Real-time</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm">Latest team activities and document updates</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity, index) => (
                <div key={activity.id} className={`group p-4 rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200 ${index === 0 ? 'bg-blue-50/50 border-blue-100' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-slate-900 text-sm leading-tight">{activity.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-sm">{activity.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {activity.user.avatar}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-slate-700">{activity.user.name}</span>
                            <span className="text-slate-500 ml-1">{activity.user.role}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-100 text-center">
              <button className="text-slate-600 hover:text-slate-900 text-sm font-medium hover:underline transition-colors">
                View All Activities →
              </button>
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900">Enterprise Platform Operational</h3>
                <p className="text-emerald-700">
                  System health: {stats.systemHealth}% • Response time: {stats.avgProcessingTime} • {stats.completedToday} documents processed today
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 text-sm font-medium">All Systems Go</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}