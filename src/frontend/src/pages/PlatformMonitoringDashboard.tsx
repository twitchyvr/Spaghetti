import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SystemHealthDashboard from '../components/platform-admin/Monitoring/SystemHealthDashboard';
import PerformanceMetrics from '../components/platform-admin/Monitoring/PerformanceMetrics';
import AlertsPanel from '../components/platform-admin/Monitoring/AlertsPanel';
import { Activity, TrendingUp, Bell, Server, Settings } from 'lucide-react';

/**
 * Platform Health Monitoring & Operations Dashboard
 * 
 * Comprehensive monitoring dashboard for Platform Admins to monitor system performance,
 * identify issues proactively, and ensure optimal platform availability and performance.
 * 
 * Features:
 * - Real-time system health monitoring
 * - Performance metrics and trends
 * - Active alerts and incident management
 * - Infrastructure monitoring
 * - Operational controls
 */

const PlatformMonitoringDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'alerts' | 'incidents'>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      name: 'System Overview',
      icon: <Server className="w-4 h-4" />,
      description: 'Overall system health and status'
    },
    {
      id: 'performance' as const,
      name: 'Performance',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Metrics and performance analysis'
    },
    {
      id: 'alerts' as const,
      name: 'Alerts & Incidents',
      icon: <Bell className="w-4 h-4" />,
      description: 'Active alerts and incident management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Activity className="w-8 h-8 text-blue-600 mr-3" />
                Platform Health Monitoring
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time platform operations and system health monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Logged in as: <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Health Dashboard */}
            <SystemHealthDashboard refreshInterval={30} />
            
            {/* Quick Alerts Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AlertsPanel refreshInterval={30} maxAlerts={5} />
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Quick Performance Overview
                </h3>
                <PerformanceMetrics refreshInterval={60} timeRange={1} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            <PerformanceMetrics refreshInterval={60} timeRange={6} />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <AlertsPanel refreshInterval={15} maxAlerts={20} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Platform Status: Operational
            </span>
            <span>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-blue-600 hover:text-blue-800">
              View System Logs
            </button>
            <button className="text-blue-600 hover:text-blue-800">
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformMonitoringDashboard;