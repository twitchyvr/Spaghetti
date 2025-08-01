import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Download,
  Filter,
  Calendar,
  Eye,
  Share,
  Settings,
  Activity,
  Zap,
  Target,
  DollarSign,
  Plus
} from 'lucide-react';
import { AnalyticsChart } from '../components/charts/AnalyticsChart';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  schedule: string;
  lastRun: string;
  recipients: number;
  format: 'pdf' | 'excel' | 'csv';
}

interface AnalyticsData {
  documentActivity: Array<{ name: string; created: number; viewed: number; edited: number }>;
  userEngagement: Array<{ name: string; activeUsers: number; sessions: number }>;
  performanceMetrics: Array<{ name: string; responseTime: number; uptime: number }>;
  revenueData: Array<{ month: string; revenue: number; growth: number }>;
}

const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('executive');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);
  
  const [metrics] = useState<DashboardMetric[]>([
    {
      id: '1',
      title: 'Total Revenue',
      value: '$2.45M',
      change: 15.3,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      id: '2',
      title: 'Active Users',
      value: '12,450',
      change: 8.2,
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      id: '3',
      title: 'Documents Processed',
      value: '289K',
      change: 12.7,
      trend: 'up',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      id: '4',
      title: 'Avg Response Time',
      value: '0.89s',
      change: -5.4,
      trend: 'up',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-orange-600'
    },
    {
      id: '5',
      title: 'System Uptime',
      value: '99.97%',
      change: 0.1,
      trend: 'stable',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      id: '6',
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: 3.2,
      trend: 'up',
      icon: <Target className="w-5 h-5" />,
      color: 'text-indigo-600'
    }
  ]);

  const [reports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'Executive Monthly Report',
      description: 'Comprehensive monthly performance and financial metrics',
      metrics: ['Revenue', 'User Growth', 'Document Volume', 'System Performance'],
      schedule: 'Monthly',
      lastRun: '2025-08-01T09:00:00Z',
      recipients: 8,
      format: 'pdf'
    },
    {
      id: '2',
      name: 'User Engagement Analysis',
      description: 'Detailed user behavior and engagement patterns',
      metrics: ['Active Users', 'Session Duration', 'Feature Usage', 'Retention Rate'],
      schedule: 'Weekly',
      lastRun: '2025-07-31T10:00:00Z',
      recipients: 5,
      format: 'excel'
    },
    {
      id: '3',
      name: 'Performance Metrics Dashboard',
      description: 'Real-time system performance and reliability metrics',
      metrics: ['Response Time', 'Uptime', 'Error Rate', 'Throughput'],
      schedule: 'Daily',
      lastRun: '2025-08-01T08:00:00Z',
      recipients: 12,
      format: 'csv'
    }
  ]);

  const [analyticsData] = useState<AnalyticsData>({
    documentActivity: [
      { name: 'Jan', created: 2400, viewed: 12500, edited: 4800 },
      { name: 'Feb', created: 2890, viewed: 13200, edited: 5200 },
      { name: 'Mar', created: 3200, viewed: 14800, edited: 5800 },
      { name: 'Apr', created: 2980, viewed: 13900, edited: 5400 },
      { name: 'May', created: 3400, viewed: 15600, edited: 6200 },
      { name: 'Jun', created: 3800, viewed: 16800, edited: 6800 },
      { name: 'Jul', created: 4200, viewed: 18200, edited: 7400 }
    ],
    userEngagement: [
      { name: 'Week 1', activeUsers: 8500, sessions: 24500 },
      { name: 'Week 2', activeUsers: 9200, sessions: 26800 },
      { name: 'Week 3', activeUsers: 8900, sessions: 25600 },
      { name: 'Week 4', activeUsers: 9800, sessions: 28200 }
    ],
    performanceMetrics: [
      { name: 'Mon', responseTime: 0.85, uptime: 99.98 },
      { name: 'Tue', responseTime: 0.82, uptime: 99.99 },
      { name: 'Wed', responseTime: 0.89, uptime: 99.97 },
      { name: 'Thu', responseTime: 0.91, uptime: 99.96 },
      { name: 'Fri', responseTime: 0.87, uptime: 99.98 },
      { name: 'Sat', responseTime: 0.83, uptime: 99.99 },
      { name: 'Sun', responseTime: 0.86, uptime: 99.98 }
    ],
    revenueData: [
      { month: 'Jan', revenue: 180000, growth: 12 },
      { month: 'Feb', revenue: 195000, growth: 8 },
      { month: 'Mar', revenue: 220000, growth: 13 },
      { month: 'Apr', revenue: 205000, growth: -7 },
      { month: 'May', revenue: 240000, growth: 17 },
      { month: 'Jun', revenue: 265000, growth: 10 },
      { month: 'Jul', revenue: 290000, growth: 9 }
    ]
  });

  const exportReport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In real implementation, trigger download
    }, 2000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive business intelligence and reporting platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
              >
                7 Days
              </Button>
              <Button 
                variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
              >
                30 Days
              </Button>
              <Button 
                variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('90d')}
              >
                90 Days
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={() => exportReport()}
              disabled={isExporting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isExporting ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                    <div className="flex items-center">
                      <span 
                        className={`text-xs font-medium ${
                          metric.change > 0 ? 'text-green-600' : 
                          metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="executive">Executive Dashboard</TabsTrigger>
            <TabsTrigger value="user-analytics">User Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue and growth trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={analyticsData.revenueData.map(item => ({
                      name: item.month,
                      value: item.revenue / 1000 // Convert to K
                    }))}
                    type="area"
                    title="Revenue ($K)"
                    colors={['#10B981']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Activity</CardTitle>
                  <CardDescription>Document creation, viewing, and editing trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={analyticsData.documentActivity.map(item => ({
                      name: item.name,
                      value: item.created
                    }))}
                    type="bar"
                    title="Document Operations"
                    colors={['#3B82F6']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Tenants</CardTitle>
                  <CardDescription>Highest revenue generating tenants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Global Consulting Group', revenue: 25000, growth: 18 },
                      { name: 'Acme Legal Partners', revenue: 12500, growth: 12 },
                      { name: 'Enterprise Corp', revenue: 8900, growth: 15 },
                      { name: 'TechStart Innovations', revenue: 2400, growth: 25 }
                    ].map((tenant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-600">${tenant.revenue.toLocaleString()}/month</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            +{tenant.growth}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health Overview</CardTitle>
                  <CardDescription>Real-time system status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response Time</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">0.89s (Good)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database Performance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Optimal</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CDN Performance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Good</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Uptime</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">99.97%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="user-analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={analyticsData.userEngagement.map(item => ({
                      name: item.name,
                      value: item.activeUsers
                    }))}
                    type="line"
                    title="Active Users & Sessions"
                    colors={['#8B5CF6']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { feature: 'Document Creation', usage: 89, users: 8450 },
                      { feature: 'Collaborative Editing', usage: 76, users: 7200 },
                      { feature: 'AI Analysis', usage: 64, users: 6100 },
                      { feature: 'Workflow Automation', usage: 52, users: 4950 },
                      { feature: 'Advanced Search', usage: 43, users: 4100 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.feature}</span>
                          <span className="text-sm text-gray-600">
                            {item.users.toLocaleString()} users ({item.usage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${item.usage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={analyticsData.performanceMetrics.map(item => ({
                      name: item.name,
                      value: item.responseTime
                    }))}
                    type="line"
                    title="Response Time (seconds)"
                    colors={['#F59E0B']}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart
                    data={analyticsData.performanceMetrics.map(item => ({
                      name: item.name,
                      value: item.uptime
                    }))}
                    type="area"
                    title="Uptime (%)"
                    colors={['#10B981']}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {report.schedule}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Last run: {new Date(report.lastRun).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {report.recipients} recipients
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {report.metrics.map((metric, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={
                            report.format === 'pdf' ? 'bg-red-100 text-red-800' :
                            report.format === 'excel' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {report.format.toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => exportReport()}
                            disabled={isExporting}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create Custom Report</CardTitle>
                <CardDescription>Build your own analytics report with custom metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Custom Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;