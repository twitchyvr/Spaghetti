// Health Monitoring Service for Platform Operations Dashboard

import { fetchApi } from './api';

// Types for health monitoring
export interface SystemHealthStatus {
  overallStatus: HealthStatus;
  services: Record<string, ServiceHealthStatus>;
  lastChecked: string;
  statusMessage?: string;
}

export interface ServiceHealthStatus {
  serviceName: string;
  status: HealthStatus;
  responseTime?: number;
  statusMessage?: string;
  lastChecked: string;
  metrics: Record<string, any>;
}

export interface PerformanceMetrics {
  avgApiResponseTime: number;
  errorRate: number;
  totalRequests: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  database: DatabaseMetrics;
  cache: CacheMetrics;
  collectedAt: string;
}

export interface DatabaseMetrics {
  activeConnections: number;
  avgQueryTime: number;
  deadlockCount: number;
  cacheHitRatio: number;
}

export interface CacheMetrics {
  hitRatio: number;
  totalKeys: number;
  memoryUsageMB: number;
  evictedKeys: number;
}

export interface ActiveAlert {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  serviceName: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  affectedServices?: string[];
  assignedToName?: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  impact: IncidentImpact;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  affectedServices?: string[];
  usersAffected?: number;
  updates: IncidentUpdateSummary[];
}

export interface IncidentUpdateSummary {
  id: string;
  message: string;
  createdAt: string;
  createdByName: string;
  updateType: IncidentUpdateType;
  statusChange?: IncidentStatus;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  affectedServices?: string;
  expectedImpact: MaintenanceImpact;
  notifyUsers: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SystemHealthMetric {
  id: string;
  timestamp: string;
  serviceName: string;
  metricName: string;
  metricValue?: number;
  metricUnit?: string;
  status: HealthStatus;
  context?: string;
  tags?: string;
  hostName?: string;
}

// Enums
export enum HealthStatus {
  Unknown = 0,
  Healthy = 1,
  Warning = 2,
  Critical = 3,
  Degraded = 4
}

export enum IncidentSeverity {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum IncidentStatus {
  Open = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4,
  Investigating = 5,
  Monitoring = 6
}

export enum IncidentImpact {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum IncidentUpdateType {
  Comment = 1,
  StatusChange = 2,
  Assignment = 3,
  Resolution = 4,
  Escalation = 5
}

export enum MaintenanceType {
  Security = 1,
  Performance = 2,
  Feature = 3,
  Infrastructure = 4,
  Emergency = 5
}

export enum MaintenanceStatus {
  Scheduled = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  Failed = 5
}

export enum MaintenanceImpact {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  ServiceDown = 4
}

// Request types
export interface CreateIncidentRequest {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  impact: IncidentImpact;
  affectedServices?: string[];
  usersAffected?: number;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}

export interface AddIncidentUpdateRequest {
  message: string;
  updateType?: IncidentUpdateType;
}

export interface ScheduleMaintenanceRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: MaintenanceType;
  affectedServices?: string[];
  expectedImpact?: MaintenanceImpact;
  notifyUsers?: boolean;
}

export interface RecordHealthMetricRequest {
  serviceName: string;
  metricName: string;
  metricValue?: number;
  metricUnit?: string;
  status: HealthStatus;
  context?: string;
  tags?: string;
  hostName?: string;
}

/**
 * Health Monitoring Service
 * Provides API functions for platform health monitoring and operations
 */
export class HealthMonitoringService {
  
  // Basic health checks
  static async getBasicHealth(): Promise<{ status: string; timestamp: string; message?: string }> {
    return fetchApi('/health');
  }

  static async getDetailedHealth(): Promise<SystemHealthStatus> {
    return fetchApi('/health/detailed');
  }

  static async getDatabaseHealth(): Promise<ServiceHealthStatus> {
    return fetchApi('/health/database');
  }

  static async getCacheHealth(): Promise<ServiceHealthStatus> {
    return fetchApi('/health/cache');
  }

  static async getSearchHealth(): Promise<ServiceHealthStatus> {
    return fetchApi('/health/search');
  }

  static async getDependenciesHealth(): Promise<Record<string, any>> {
    return fetchApi('/health/dependencies');
  }

  // Performance metrics
  static async getPerformanceMetrics(hours = 1): Promise<PerformanceMetrics> {
    return fetchApi(`/health/metrics?hours=${hours}`);
  }

  static async recordHealthMetric(metric: RecordHealthMetricRequest): Promise<{ message: string; metricId: string }> {
    return fetchApi('/health/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }

  static async getHealthMetricsHistory(
    serviceName?: string,
    startTime?: string,
    endTime?: string,
    maxRecords = 1000
  ): Promise<SystemHealthMetric[]> {
    const params = new URLSearchParams();
    if (serviceName) params.append('serviceName', serviceName);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    if (maxRecords !== 1000) params.append('maxRecords', maxRecords.toString());

    const query = params.toString();
    return fetchApi(`/health/metrics/history${query ? `?${query}` : ''}`);
  }

  // Alerts
  static async getActiveAlerts(): Promise<ActiveAlert[]> {
    return fetchApi('/health/alerts');
  }

  // Incident management
  static async getActiveIncidents(): Promise<IncidentSummary[]> {
    return fetchApi('/health/incidents');
  }

  static async getIncident(incidentId: string): Promise<IncidentReport> {
    return fetchApi(`/health/incidents/${incidentId}`);
  }

  static async createIncident(incident: CreateIncidentRequest): Promise<IncidentReport> {
    return fetchApi('/health/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  static async updateIncidentStatus(incidentId: string, request: UpdateIncidentStatusRequest): Promise<{ message: string }> {
    return fetchApi(`/health/incidents/${incidentId}/status`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  static async addIncidentUpdate(incidentId: string, update: AddIncidentUpdateRequest): Promise<{ message: string }> {
    return fetchApi(`/health/incidents/${incidentId}/updates`, {
      method: 'POST',
      body: JSON.stringify(update),
    });
  }

  // Maintenance management
  static async getScheduledMaintenance(): Promise<MaintenanceWindow[]> {
    return fetchApi('/health/maintenance');
  }

  static async scheduleMaintenance(maintenance: ScheduleMaintenanceRequest): Promise<MaintenanceWindow> {
    return fetchApi('/health/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenance),
    });
  }

  // Utility methods
  static getHealthStatusText(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.Healthy: return 'Healthy';
      case HealthStatus.Warning: return 'Warning';
      case HealthStatus.Degraded: return 'Degraded';
      case HealthStatus.Critical: return 'Critical';
      default: return 'Unknown';
    }
  }

  static getHealthStatusColor(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.Healthy: return 'text-green-600';
      case HealthStatus.Warning: return 'text-yellow-600';
      case HealthStatus.Degraded: return 'text-orange-600';
      case HealthStatus.Critical: return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  static getIncidentSeverityText(severity: IncidentSeverity): string {
    switch (severity) {
      case IncidentSeverity.Low: return 'Low';
      case IncidentSeverity.Medium: return 'Medium';
      case IncidentSeverity.High: return 'High';
      case IncidentSeverity.Critical: return 'Critical';
      default: return 'Unknown';
    }
  }

  static getIncidentSeverityColor(severity: IncidentSeverity): string {
    switch (severity) {
      case IncidentSeverity.Low: return 'text-blue-600';
      case IncidentSeverity.Medium: return 'text-yellow-600';
      case IncidentSeverity.High: return 'text-orange-600';
      case IncidentSeverity.Critical: return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  static getIncidentStatusText(status: IncidentStatus): string {
    switch (status) {
      case IncidentStatus.Open: return 'Open';
      case IncidentStatus.InProgress: return 'In Progress';
      case IncidentStatus.Resolved: return 'Resolved';
      case IncidentStatus.Closed: return 'Closed';
      case IncidentStatus.Investigating: return 'Investigating';
      case IncidentStatus.Monitoring: return 'Monitoring';
      default: return 'Unknown';
    }
  }

  static getMaintenanceTypeText(type: MaintenanceType): string {
    switch (type) {
      case MaintenanceType.Security: return 'Security';
      case MaintenanceType.Performance: return 'Performance';
      case MaintenanceType.Feature: return 'Feature';
      case MaintenanceType.Infrastructure: return 'Infrastructure';
      case MaintenanceType.Emergency: return 'Emergency';
      default: return 'Unknown';
    }
  }

  static getMaintenanceStatusText(status: MaintenanceStatus): string {
    switch (status) {
      case MaintenanceStatus.Scheduled: return 'Scheduled';
      case MaintenanceStatus.InProgress: return 'In Progress';
      case MaintenanceStatus.Completed: return 'Completed';
      case MaintenanceStatus.Cancelled: return 'Cancelled';
      case MaintenanceStatus.Failed: return 'Failed';
      default: return 'Unknown';
    }
  }
}