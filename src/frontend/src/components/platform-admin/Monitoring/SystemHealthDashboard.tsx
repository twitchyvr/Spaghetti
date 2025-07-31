import React, { useState, useEffect } from 'react';
import { HealthMonitoringService, SystemHealthStatus, HealthStatus } from '../../../services/healthMonitoringService';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Server } from 'lucide-react';

interface SystemHealthDashboardProps {
  refreshInterval?: number; // in seconds
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ 
  refreshInterval = 30 
}) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealthStatus = async () => {
    try {
      setError(null);
      const status = await HealthMonitoringService.getDetailedHealth();
      setHealthStatus(status);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    // Set up auto-refresh
    const interval = setInterval(fetchHealthStatus, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getHealthStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.Healthy:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case HealthStatus.Warning:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case HealthStatus.Degraded:
        return <Clock className="w-5 h-5 text-orange-500" />;
      case HealthStatus.Critical:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status: HealthStatus) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case HealthStatus.Healthy:
        return `${baseClasses} bg-green-100 text-green-800`;
      case HealthStatus.Warning:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case HealthStatus.Degraded:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case HealthStatus.Critical:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getOverallStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.Healthy:
        return 'border-green-200 bg-green-50';
      case HealthStatus.Warning:
        return 'border-yellow-200 bg-yellow-50';
      case HealthStatus.Degraded:
        return 'border-orange-200 bg-orange-50';
      case HealthStatus.Critical:
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Server className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Server className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          </div>
          <button
            onClick={fetchHealthStatus}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Health Check Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Server className="w-6 h-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchHealthStatus}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`rounded-lg border-2 p-4 mb-6 ${getOverallStatusColor(healthStatus.overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getHealthStatusIcon(healthStatus.overallStatus)}
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Overall System Status
              </h3>
              <p className="text-sm text-gray-600">
                {healthStatus.statusMessage || HealthMonitoringService.getHealthStatusText(healthStatus.overallStatus)}
              </p>
            </div>
          </div>
          <span className={getHealthStatusBadge(healthStatus.overallStatus)}>
            {HealthMonitoringService.getHealthStatusText(healthStatus.overallStatus)}
          </span>
        </div>
      </div>

      {/* Service Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(healthStatus.services).map(([serviceName, service]) => (
          <div
            key={serviceName}
            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 capitalize">
                {serviceName}
              </h4>
              {getHealthStatusIcon(service.status)}
            </div>
            
            <div className="space-y-2">
              <span className={getHealthStatusBadge(service.status)}>
                {HealthMonitoringService.getHealthStatusText(service.status)}
              </span>
              
              {service.responseTime && (
                <p className="text-xs text-gray-600">
                  Response time: {service.responseTime.toFixed(0)}ms
                </p>
              )}
              
              {service.statusMessage && (
                <p className="text-xs text-gray-600">
                  {service.statusMessage}
                </p>
              )}
              
              <p className="text-xs text-gray-500">
                Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
              </p>
            </div>

            {/* Additional Metrics */}
            {Object.keys(service.metrics).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {Object.entries(service.metrics).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span className="font-mono">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Status Legend:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
            <span>Warning</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-orange-500 mr-1" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-1" />
            <span>Critical</span>
          </div>
          <div className="flex items-center">
            <Activity className="w-4 h-4 text-gray-500 mr-1" />
            <span>Unknown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;