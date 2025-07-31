import React, { useState, useEffect } from 'react';
import { HealthMonitoringService, PerformanceMetrics as IPerformanceMetrics } from '../../../services/healthMonitoringService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Cpu, Database, HardDrive, Zap, Clock, Activity } from 'lucide-react';

interface PerformanceMetricsProps {
  refreshInterval?: number;
  timeRange?: number; // hours
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  refreshInterval = 60,
  timeRange = 1 
}) => {
  const [metrics, setMetrics] = useState<IPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const data = await HealthMonitoringService.getPerformanceMetrics(selectedTimeRange);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance metrics');
      console.error('Failed to fetch performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval, selectedTimeRange]);

  const timeRangeOptions = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 24, label: '24 Hours' },
    { value: 168, label: '7 Days' }
  ];

  const formatValue = (value: number, unit?: string): string => {
    if (unit === 'percentage' || unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'ms') {
      return `${value.toFixed(0)}ms`;
    }
    if (unit === 'MB') {
      return `${value.toFixed(0)} MB`;
    }
    return value.toFixed(2);
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value <= thresholds.warning) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const resourceUsageData = metrics ? [
    { name: 'CPU', value: metrics.cpuUsagePercent, color: '#3B82F6' },
    { name: 'Memory', value: metrics.memoryUsagePercent, color: '#10B981' },
    { name: 'Disk', value: metrics.diskUsagePercent, color: '#F59E0B' }
  ] : [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
          </div>
        </div>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
          </div>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Response Time</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(metrics.avgApiResponseTime, { good: 200, warning: 500 })}`}>
                {formatValue(metrics.avgApiResponseTime, 'ms')}
              </p>
            </div>
            <div className="flex flex-col items-end">
              {getPerformanceIcon(metrics.avgApiResponseTime, { good: 200, warning: 500 })}
              <Clock className="w-8 h-8 text-gray-400 mt-2" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(metrics.errorRate, { good: 1, warning: 5 })}`}>
                {formatValue(metrics.errorRate, '%')}
              </p>
            </div>
            <div className="flex flex-col items-end">
              {getPerformanceIcon(metrics.errorRate, { good: 1, warning: 5 })}
              <Zap className="w-8 h-8 text-gray-400 mt-2" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalRequests.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <Activity className="w-8 h-8 text-gray-400 mt-2" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Hit Ratio</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(100 - metrics.cache.hitRatio, { good: 10, warning: 30 })}`}>
                {formatValue(metrics.cache.hitRatio, '%')}
              </p>
            </div>
            <div className="flex flex-col items-end">
              {getPerformanceIcon(100 - metrics.cache.hitRatio, { good: 10, warning: 30 })}
              <Database className="w-8 h-8 text-gray-400 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            Resource Usage
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resourceUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Database Metrics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Database Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="font-semibold">{metrics.database.activeConnections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Query Time</span>
              <span className="font-semibold">{metrics.database.avgQueryTime.toFixed(2)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deadlock Count</span>
              <span className="font-semibold">{metrics.database.deadlockCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cache Hit Ratio</span>
              <span className="font-semibold">{metrics.database.cacheHitRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Cache Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hit Ratio</span>
              <span className="font-semibold">{metrics.cache.hitRatio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Keys</span>
              <span className="font-semibold">{metrics.cache.totalKeys.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="font-semibold">{metrics.cache.memoryUsageMB.toFixed(0)} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Evicted Keys</span>
              <span className="font-semibold">{metrics.cache.evictedKeys}</span>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data collected at:</span>
              <span className="text-sm font-medium">
                {new Date(metrics.collectedAt).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.cpuUsagePercent.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CPU</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.memoryUsagePercent.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Memory</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{metrics.diskUsagePercent.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Disk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;