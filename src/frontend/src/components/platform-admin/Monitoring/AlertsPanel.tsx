import React, { useState, useEffect } from 'react';
import { HealthMonitoringService, ActiveAlert, IncidentSummary, IncidentSeverity } from '../../../services/healthMonitoringService';
import { AlertTriangle, Bell, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AlertsPanelProps {
  refreshInterval?: number;
  maxAlerts?: number;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ 
  refreshInterval = 30,
  maxAlerts = 10 
}) => {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents'>('alerts');

  const fetchAlertsAndIncidents = async () => {
    try {
      setError(null);
      const [alertsData, incidentsData] = await Promise.all([
        HealthMonitoringService.getActiveAlerts(),
        HealthMonitoringService.getActiveIncidents()
      ]);
      
      setAlerts(alertsData.slice(0, maxAlerts));
      setIncidents(incidentsData.slice(0, maxAlerts));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts and incidents');
      console.error('Failed to fetch alerts and incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndIncidents();
    
    const interval = setInterval(fetchAlertsAndIncidents, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval, maxAlerts]);

  const getSeverityIcon = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Critical:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case IncidentSeverity.High:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case IncidentSeverity.Medium:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case IncidentSeverity.Low:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (severity) {
      case IncidentSeverity.Critical:
        return `${baseClasses} bg-red-100 text-red-800`;
      case IncidentSeverity.High:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case IncidentSeverity.Medium:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case IncidentSeverity.Low:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const totalCriticalIssues = [
    ...alerts.filter(a => a.severity === IncidentSeverity.Critical),
    ...incidents.filter(i => i.severity === IncidentSeverity.Critical)
  ].length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
          </div>
          <button
            onClick={fetchAlertsAndIncidents}
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Active Alerts & Incidents</h2>
          {totalCriticalIssues > 0 && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {totalCriticalIssues} Critical
            </span>
          )}
        </div>
        <button
          onClick={fetchAlertsAndIncidents}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Bell className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'incidents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Incidents ({incidents.length})
          </button>
        </nav>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-sm text-gray-500">All systems are operating normally.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="ml-2 text-sm font-medium text-gray-900">
                        {alert.title}
                      </h4>
                      <span className={`ml-3 ${getSeverityBadge(alert.severity)}`}>
                        {HealthMonitoringService.getIncidentSeverityText(alert.severity)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Service: {alert.serviceName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeSince(alert.createdAt)}
                      </span>
                      {alert.acknowledgedAt && (
                        <span className="text-green-600">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {!alert.acknowledgedAt && (
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        Acknowledge
                      </button>
                    )}
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No Active Incidents</h3>
              <p className="text-sm text-gray-500">All incidents have been resolved.</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(incident.severity)}
                      <h4 className="ml-2 text-sm font-medium text-gray-900">
                        {incident.title}
                      </h4>
                      <span className={`ml-3 ${getSeverityBadge(incident.severity)}`}>
                        {HealthMonitoringService.getIncidentSeverityText(incident.severity)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                      <span>Status: {HealthMonitoringService.getIncidentStatusText(incident.status)}</span>
                      {incident.assignedToName && (
                        <span>Assigned to: {incident.assignedToName}</span>
                      )}
                    </div>
                    
                    {incident.affectedServices && incident.affectedServices.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Affected services: </span>
                        <span className="text-xs font-medium text-gray-700">
                          {incident.affectedServices.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Created {getTimeSince(incident.createdAt)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100">
                      View Incident
                    </button>
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100">
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {activeTab === 'alerts' ? `Showing ${alerts.length} active alerts` : `Showing ${incidents.length} active incidents`}
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;