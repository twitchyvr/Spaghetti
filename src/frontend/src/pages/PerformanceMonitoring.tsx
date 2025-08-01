import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Database, 
  Server, 
  Globe, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  component: string;
}

const PerformanceMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 23,
    uptime: '99.97%',
    responseTime: 187,
    throughput: 1247,
    errorRate: 0.03
  });

  const [alerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected on API server cluster',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      component: 'API Gateway'
    },
    {
      id: '2',
      type: 'info',
      message: 'Auto-scaling triggered: Added 2 additional instances',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      component: 'Auto-Scaler'
    },
    {
      id: '3',
      type: 'error',
      message: 'Database connection timeout in us-east-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      component: 'Database'
    }
  ]);

  const [isRealTime, setIsRealTime] = useState(true);

  // Simulate real-time metrics updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(10, Math.min(80, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(5, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        throughput: Math.max(800, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 200))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Utility function for uptime formatting
  // const formatUptime = (seconds: number) => {
  //   const days = Math.floor(seconds / 86400);
  //   const hours = Math.floor((seconds % 86400) / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   return `${days}d ${hours}h ${minutes}m`;
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time system performance metrics and auto-scaling monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isRealTime ? 'Real-time' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRealTime 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRealTime ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cpu className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">CPU Usage</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.cpu, { warning: 70, danger: 85 })}`}>
              {metrics.cpu.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HardDrive className="h-6 w-6 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Memory</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.memory, { warning: 80, danger: 90 })}`}>
              {metrics.memory.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Disk Usage</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.disk, { warning: 70, danger: 85 })}`}>
              {metrics.disk.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.disk}%` }}
            ></div>
          </div>
        </div>

        {/* Network Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wifi className="h-6 w-6 text-orange-600 mr-2" />
              <span className="font-medium text-gray-900">Network</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.network, { warning: 80, danger: 95 })}`}>
              {metrics.network.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.network}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">Response Time</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.responseTime}ms
          </div>
          <p className="text-sm text-gray-600">Average API response time</p>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">12% improvement this week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Throughput</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.throughput.toLocaleString()}/min
          </div>
          <p className="text-sm text-gray-600">Requests per minute</p>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">Peak: 2,847/min</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Uptime</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.uptime}
          </div>
          <p className="text-sm text-gray-600">System availability</p>
          <div className="mt-3 flex items-center text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">Target: 99.9%</span>
          </div>
        </div>
      </div>

      {/* Auto-scaling Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Zap className="h-6 w-6 text-indigo-600 mr-2" />
            Auto-scaling Status
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Active Instances</div>
            <div className="text-xs text-green-600 mt-1">+2 since last hour</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">847</div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-xs text-blue-600 mt-1">Peak: 1,234 users</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-600">Regions</div>
            <div className="text-xs text-gray-500 mt-1">US, EU, APAC, AU</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Auto-scaling Event</h3>
              <p className="text-sm text-blue-800 mt-1">
                System automatically scaled up by 2 instances due to increased CPU usage (85% threshold exceeded). 
                New instances are healthy and serving traffic.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Triggered at 14:32 UTC • Duration: 3m 45s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
          Recent Alerts
        </h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="mr-3 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{alert.component}</h3>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
            View All Alerts
          </button>
        </div>
      </div>

      {/* Performance Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Auto-scaling Thresholds</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Scale-up</span>
                <span className="text-sm font-medium text-gray-900">70%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Scale-down</span>
                <span className="text-sm font-medium text-gray-900">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Scale-up</span>
                <span className="text-sm font-medium text-gray-900">80%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Instances</span>
                <span className="text-sm font-medium text-gray-900">20</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Alert Thresholds</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time Warning</span>
                <span className="text-sm font-medium text-gray-900">300ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time Critical</span>
                <span className="text-sm font-medium text-gray-900">500ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error Rate Warning</span>
                <span className="text-sm font-medium text-gray-900">1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime Threshold</span>
                <span className="text-sm font-medium text-gray-900">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;