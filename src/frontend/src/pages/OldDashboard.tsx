
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip, HelpTooltip, StatusTooltip } from '../components/ui/Tooltip';
import { TrendingUp, Users, FileText, Briefcase, Clock } from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  recentDocuments: number;
  activeProjects: number;
  teamMembers: number;
  completedToday: number;
  avgProcessingTime: string;
}

interface RecentActivity {
  id: string;
  type: 'created' | 'updated' | 'shared' | 'reviewed' | 'completed';
  title: string;
  timestamp: string;
  user: string;
  avatar: string;
  status: 'success' | 'pending' | 'warning';
}


export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    recentDocuments: 0,
    activeProjects: 0,
    teamMembers: 0,
    completedToday: 0,
    avgProcessingTime: '0s'
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // This will be replaced with real API calls
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setStats({
          totalDocuments: 247,
          recentDocuments: 12,
          activeProjects: 8,
          teamMembers: 15,
          completedToday: 6,
          avgProcessingTime: '2.3s'
        });


        setActivities([
          {
            id: '1',
            type: 'completed',
            title: 'Corporate Merger Agreement - Acme Corp & Beta LLC',
            timestamp: '15 minutes ago',
            user: 'Sarah Johnson',
            avatar: 'SJ',
            status: 'success'
          },
          {
            id: '2',
            type: 'reviewed',
            title: 'Employment Contract Template - Senior Associates',
            timestamp: '1 hour ago',
            user: 'Michael Chen',
            avatar: 'MC',
            status: 'success'
          },
          {
            id: '3',
            type: 'created',
            title: 'Digital Transformation Roadmap - Fortune 500 Client',
            timestamp: '2 hours ago',
            user: 'Dr. Robert Williams',
            avatar: 'RW',
            status: 'pending'
          },
          {
            id: '4',
            type: 'updated',
            title: 'Product Requirements Document - Mobile Banking App',
            timestamp: '3 hours ago',
            user: 'Alex Thompson',
            avatar: 'AT',
            status: 'warning'
          },
          {
            id: '5',
            type: 'shared',
            title: 'Operations Efficiency Analysis - Manufacturing Sector',
            timestamp: '4 hours ago',
            user: 'Lisa Davis',
            avatar: 'LD',
            status: 'success'
          },
          {
            id: '6',
            type: 'created',
            title: 'Go-to-Market Strategy Q2 2024',
            timestamp: '6 hours ago',
            user: 'Jamie Park',
            avatar: 'JP',
            status: 'success'
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
      case 'completed':
        return '✅';
      case 'created':
        return '📄';
      case 'updated':
        return '✏️';
      case 'shared':
        return '📤';
      case 'reviewed':
        return '👁️';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'created':
        return 'text-blue-600 bg-blue-50';
      case 'updated':
        return 'text-orange-600 bg-orange-50';
      case 'shared':
        return 'text-purple-600 bg-purple-50';
      case 'reviewed':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-80"></div>
                <div className="h-6 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-12 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card bg-white/80 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <div className="card bg-white/80 p-6">
                  <div className="mb-6">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-56"></div>
                  </div>
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="card bg-white/80 p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                <div className="card bg-white/80 p-6">
                  <div className="h-6 bg-gray-200 rounded w-28 mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
                Enterprise Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Welcome back, <span className="font-semibold text-foreground">{user?.email || 'Professional User'}</span>! 
                Here's your comprehensive overview of document management and team activity.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip content="View comprehensive analytics and performance metrics for your documents and team activity">
                <button className="btn-outline btn-lg group">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analytics
                </button>
              </Tooltip>
              <Tooltip content="Create a new document using AI-powered templates or start from scratch">
                <button className="btn-primary btn-lg group shadow-lg shadow-primary/20">
                  <FileText className="w-5 h-5 mr-2" />
                  New Document
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Total Documents Card */}
          <Tooltip content={
            <div className="space-y-2">
              <div className="font-semibold">Total Documents</div>
              <div className="text-sm">Complete count of all documents across all projects and departments in your organization</div>
              <div className="text-xs text-gray-300 mt-2">Includes: Active, Archived, and Draft documents</div>
            </div>
          } position="top" maxWidth="280px">
            <div className="group cursor-help">
              <div className="card hover:shadow-elevation-3 transition-all duration-300 group-hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60">
                <div className="card-content p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-blue-700/80 uppercase tracking-wide">Total Documents</p>
                        <HelpTooltip 
                          content="This metric includes all document types: contracts, reports, templates, and collaborative documents. Updated in real-time as documents are created, modified, or archived."
                          title="Document Count Methodology"
                          description="This metric includes all document types: contracts, reports, templates, and collaborative documents. Updated in real-time as documents are created, modified, or archived."
                          example="Legal contracts: 89, Reports: 76, Meeting notes: 43, Templates: 39"
                        />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-blue-900">{stats.totalDocuments}</span>
                        <Tooltip content="12% increase compared to last month">
                          <span className="text-sm text-blue-600 font-medium bg-blue-200/50 px-2 py-1 rounded-full cursor-help">+12%</span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <StatusTooltip 
                      content="Document creation is trending upward this month"
                      status="success"
                      title="Growth Status"
                      description="Document creation is trending upward this month"
                      lastUpdated="2 minutes ago"
                    />
                    <span className="ml-2">Growing this month</span>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>

          {/* Recent Activity Card */}
          <Tooltip content={
            <div className="space-y-2">
              <div className="font-semibold">Recent Activity</div>
              <div className="text-sm">Documents created, edited, or shared in the last 7 days</div>
              <div className="text-xs text-gray-300 mt-2">Real-time updates • Includes all team members</div>
            </div>
          } position="top" maxWidth="280px">
            <div className="group cursor-help">
              <div className="card hover:shadow-elevation-3 transition-all duration-300 group-hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60">
                <div className="card-content p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-emerald-700/80 uppercase tracking-wide">Recent Activity</p>
                        <HelpTooltip 
                          content="Monitors all document interactions including creation, editing, sharing, and collaboration activities across your organization."
                          title="Activity Tracking"
                          description="Monitors all document interactions including creation, editing, sharing, and collaboration activities across your organization."
                          example="Today: 5 created, 8 edited, 3 shared"
                        />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-emerald-900">{stats.recentDocuments}</span>
                        <Tooltip content="Activity from the past 7 days">
                          <span className="text-sm text-emerald-600 font-medium bg-emerald-200/50 px-2 py-1 rounded-full cursor-help">7 days</span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-emerald-600">
                    <StatusTooltip 
                      content="Team collaboration is active with consistent document updates"
                      status="success"
                      title="Workflow Status"
                      description="Team collaboration is active with consistent document updates"
                      lastUpdated="Just now"
                    />
                    <span className="ml-2">Active workflow</span>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>

          {/* Active Projects Card */}
          <Tooltip content={
            <div className="space-y-2">
              <div className="font-semibold">Active Projects</div>
              <div className="text-sm">Projects currently in progress with active document collaboration</div>
              <div className="text-xs text-gray-300 mt-2">Includes: Legal cases, consulting engagements, product development</div>
            </div>
          } position="top" maxWidth="280px">
            <div className="group cursor-help">
              <div className="card hover:shadow-elevation-3 transition-all duration-300 group-hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60">
                <div className="card-content p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-amber-700/80 uppercase tracking-wide">Active Projects</p>
                        <HelpTooltip 
                          content="Tracks multi-document projects with deadlines, milestones, and team collaboration. Projects are automatically created when documents are grouped by client or matter."
                          title="Project Management"
                          description="Tracks multi-document projects with deadlines, milestones, and team collaboration. Projects are automatically created when documents are grouped by client or matter."
                          example="Acme Legal Case: 12 docs, Global Consulting: 8 docs"
                        />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-amber-900">{stats.activeProjects}</span>
                        <Tooltip content="3 projects have deadlines this week - click to view details">
                          <span className="text-sm text-amber-600 font-medium bg-amber-200/50 px-2 py-1 rounded-full cursor-help">3 due</span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                      <Briefcase className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-amber-600">
                    <StatusTooltip 
                      content="Multiple projects have deadlines approaching this week"
                      status="warning"
                      title="Deadline Alert"
                      description="Multiple projects have deadlines approaching this week"
                      lastUpdated="1 hour ago"
                    />
                    <span className="ml-2">Deadlines this week</span>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>

          {/* Team Members Card */}
          <Tooltip content={
            <div className="space-y-2">
              <div className="font-semibold">Team Members</div>
              <div className="text-sm">Active users across all departments with document access</div>
              <div className="text-xs text-gray-300 mt-2">Legal: 6, Tech: 4, Consulting: 3, Admin: 2</div>
            </div>
          } position="top" maxWidth="280px">
            <div className="group cursor-help">
              <div className="card hover:shadow-elevation-3 transition-all duration-300 group-hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/60">
                <div className="card-content p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-purple-700/80 uppercase tracking-wide">Team Members</p>
                        <HelpTooltip 
                          content="Tracks active users, collaboration patterns, and department-based access controls. Includes role-based permissions and activity monitoring."
                          title="Team Analytics"
                          description="Tracks active users, collaboration patterns, and department-based access controls. Includes role-based permissions and activity monitoring."
                          example="Partners: 3, Associates: 6, Support: 4, Admin: 2"
                        />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-purple-900">{stats.teamMembers}</span>
                        <Tooltip content="Team distributed across 4 departments: Legal, Technology, Consulting, Administration">
                          <span className="text-sm text-purple-600 font-medium bg-purple-200/50 px-2 py-1 rounded-full cursor-help">4 depts</span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-purple-600">
                    <StatusTooltip 
                      content="Multi-departmental team with cross-functional collaboration"
                      status="info"
                      title="Team Structure"
                      description="Multi-departmental team with cross-functional collaboration"
                      lastUpdated="30 minutes ago"
                    />
                    <span className="ml-2">Cross-functional</span>
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity Feed */}
          <div className="xl:col-span-2">
            <div className="card shadow-elevation-2 bg-white/80 backdrop-blur-sm">
              <div className="card-header border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <p className="card-description text-base">Latest updates and team collaboration</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-success-600 font-medium">Live</span>
                  </div>
                </div>
              </div>
              <div className="card-content p-6">
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className={`group flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50/80 ${index === 0 ? 'bg-blue-50/50 border border-blue-100' : ''}`}>
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform`}>
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                            {activity.title}
                          </h3>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ml-3">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {activity.avatar}
                            </div>
                            <span className="font-medium text-gray-700">{activity.user}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{activity.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            activity.type === 'completed' ? 'bg-success-100 text-success-700' :
                            activity.type === 'created' ? 'bg-blue-100 text-blue-700' :
                            activity.type === 'updated' ? 'bg-amber-100 text-amber-700' :
                            activity.type === 'shared' ? 'bg-purple-100 text-purple-700' :
                            activity.type === 'reviewed' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <button className="btn-outline btn-md group">
                    <span className="mr-2">📋</span>
                    View All Activity
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Insights Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card shadow-elevation-2 bg-white/80 backdrop-blur-sm">
              <div className="card-header bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <h2 className="card-title font-bold text-gray-900">Quick Actions</h2>
                <p className="card-description">Streamline your workflow</p>
              </div>
              <div className="card-content p-6">
                <div className="space-y-3">
                  <button className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 rounded-xl transition-all duration-200 border border-blue-200/50 hover:border-blue-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <span className="text-lg">📝</span>
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">Create Document</span>
                        <span className="text-xs text-blue-600">Start new project</span>
                      </div>
                    </div>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <button className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 rounded-xl transition-all duration-200 border border-emerald-200/50 hover:border-emerald-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <span className="text-lg">🤖</span>
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">AI Assistant</span>
                        <span className="text-xs text-emerald-600">Smart automation</span>
                      </div>
                    </div>
                    <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <button className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 rounded-xl transition-all duration-200 border border-purple-200/50 hover:border-purple-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <span className="text-lg">📁</span>
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">Templates</span>
                        <span className="text-xs text-purple-600">Browse library</span>
                      </div>
                    </div>
                    <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <button className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 rounded-xl transition-all duration-200 border border-amber-200/50 hover:border-amber-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <span className="text-lg">📊</span>
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">Analytics</span>
                        <span className="text-xs text-amber-600">View insights</span>
                      </div>
                    </div>
                    <span className="text-amber-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card shadow-elevation-2 bg-white/80 backdrop-blur-sm">
              <div className="card-header bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <h3 className="card-title text-lg font-bold text-gray-900">System Status</h3>
              </div>
              <div className="card-content p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-success-800">Database</span>
                    </div>
                    <span className="text-success-600 text-sm font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-success-800">API Services</span>
                    </div>
                    <span className="text-success-600 text-sm font-medium">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg border border-info-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-info-500 rounded-full"></div>
                      <span className="font-medium text-info-800">Storage</span>
                    </div>
                    <span className="text-info-600 text-sm font-medium">82% Used</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Status Banner */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-success-50 via-emerald-50 to-success-50 border border-success-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-success-800">
                    Enterprise Platform Ready
                  </h3>
                  <p className="text-success-600 text-sm">
                    PostgreSQL database connected • Multi-tenant architecture active • All systems operational
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-success-600 text-sm font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}