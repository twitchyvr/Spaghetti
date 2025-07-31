using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service interface for platform health monitoring and operations
/// </summary>
public interface IHealthMonitoringService
{
    /// <summary>
    /// Gets the current system health status across all components
    /// </summary>
    Task<SystemHealthStatus> GetSystemHealthAsync();

    /// <summary>
    /// Gets performance metrics for the specified time period
    /// </summary>
    Task<PerformanceMetrics> GetPerformanceMetricsAsync(TimeSpan period);

    /// <summary>
    /// Gets all currently active alerts
    /// </summary>
    Task<List<ActiveAlert>> GetActiveAlertsAsync();

    /// <summary>
    /// Gets health metrics for a specific service
    /// </summary>
    Task<ServiceHealthStatus> GetServiceHealthAsync(string serviceName);

    /// <summary>
    /// Records a new health metric
    /// </summary>
    Task RecordHealthMetricAsync(SystemHealthMetric metric);

    /// <summary>
    /// Gets historical health metrics for analysis
    /// </summary>
    Task<List<SystemHealthMetric>> GetHealthMetricsAsync(
        string? serviceName = null,
        DateTime? startTime = null,
        DateTime? endTime = null,
        int maxRecords = 1000);

    /// <summary>
    /// Performs health checks on all registered services
    /// </summary>
    Task<Dictionary<string, HealthCheckResult>> PerformHealthChecksAsync();
}

/// <summary>
/// Service interface for incident management
/// </summary>
public interface IIncidentManagementService
{
    /// <summary>
    /// Creates a new incident
    /// </summary>
    Task<IncidentReport> CreateIncidentAsync(IncidentDetails details);

    /// <summary>
    /// Updates an existing incident status
    /// </summary>
    Task<bool> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus status);

    /// <summary>
    /// Adds an update to an incident
    /// </summary>
    Task<bool> AddIncidentUpdateAsync(Guid incidentId, string message, Guid userId, IncidentUpdateType updateType = IncidentUpdateType.Comment);

    /// <summary>
    /// Gets all active incidents
    /// </summary>
    Task<List<IncidentSummary>> GetActiveIncidentsAsync();

    /// <summary>
    /// Gets incident details by ID
    /// </summary>
    Task<IncidentReport?> GetIncidentAsync(Guid incidentId);

    /// <summary>
    /// Assigns an incident to a user
    /// </summary>
    Task<bool> AssignIncidentAsync(Guid incidentId, Guid userId);

    /// <summary>
    /// Resolves an incident with resolution details
    /// </summary>
    Task<bool> ResolveIncidentAsync(Guid incidentId, string resolution, Guid resolvedBy);
}

/// <summary>
/// Service interface for maintenance window management
/// </summary>
public interface IMaintenanceService
{
    /// <summary>
    /// Schedules a new maintenance window
    /// </summary>
    Task<MaintenanceWindow> ScheduleMaintenanceAsync(MaintenanceRequest request);

    /// <summary>
    /// Gets all scheduled maintenance windows
    /// </summary>
    Task<List<MaintenanceWindow>> GetScheduledMaintenanceAsync();

    /// <summary>
    /// Updates maintenance window status
    /// </summary>
    Task<bool> UpdateMaintenanceStatusAsync(Guid maintenanceId, MaintenanceStatus status);

    /// <summary>
    /// Cancels a scheduled maintenance window
    /// </summary>
    Task<bool> CancelMaintenanceAsync(Guid maintenanceId);

    /// <summary>
    /// Gets current and upcoming maintenance affecting specified services
    /// </summary>
    Task<List<MaintenanceWindow>> GetMaintenanceForServicesAsync(string[] serviceNames);
}

#region Data Transfer Objects

/// <summary>
/// Overall system health status
/// </summary>
public class SystemHealthStatus
{
    public HealthStatus OverallStatus { get; set; }
    public Dictionary<string, ServiceHealthStatus> Services { get; set; } = new();
    public DateTime LastChecked { get; set; }
    public string? StatusMessage { get; set; }
}

/// <summary>
/// Health status for a specific service
/// </summary>
public class ServiceHealthStatus
{
    public string ServiceName { get; set; } = string.Empty;
    public HealthStatus Status { get; set; }
    public double? ResponseTime { get; set; }
    public string? StatusMessage { get; set; }
    public DateTime LastChecked { get; set; }
    public Dictionary<string, object> Metrics { get; set; } = new();
}

/// <summary>
/// Performance metrics for system monitoring
/// </summary>
public class PerformanceMetrics
{
    public double AvgApiResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public int TotalRequests { get; set; }
    public double CpuUsagePercent { get; set; }
    public double MemoryUsagePercent { get; set; }
    public double DiskUsagePercent { get; set; }
    public DatabaseMetrics Database { get; set; } = new();
    public CacheMetrics Cache { get; set; } = new();
    public DateTime CollectedAt { get; set; }
}

/// <summary>
/// Database-specific performance metrics
/// </summary>
public class DatabaseMetrics
{
    public int ActiveConnections { get; set; }
    public double AvgQueryTime { get; set; }
    public int DeadlockCount { get; set; }
    public double CacheHitRatio { get; set; }
}

/// <summary>
/// Cache-specific performance metrics  
/// </summary>
public class CacheMetrics
{
    public double HitRatio { get; set; }
    public int TotalKeys { get; set; }
    public double MemoryUsageMB { get; set; }
    public int EvictedKeys { get; set; }
}

/// <summary>
/// Active alert information
/// </summary>
public class ActiveAlert
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentSeverity Severity { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public Guid? AcknowledgedBy { get; set; }
}

/// <summary>
/// Health check result for a specific component
/// </summary>
public class HealthCheckResult
{
    public HealthStatus Status { get; set; }
    public string? Description { get; set; }
    public double? ResponseTime { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public Exception? Exception { get; set; }
}

/// <summary>
/// Details for creating a new incident
/// </summary>
public class IncidentDetails
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IncidentSeverity Severity { get; set; }
    public string[]? AffectedServices { get; set; }
    public Guid CreatedBy { get; set; }
    public IncidentImpact Impact { get; set; }
    public int? UsersAffected { get; set; }
}

/// <summary>
/// Complete incident information
/// </summary>
public class IncidentReport
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IncidentSeverity Severity { get; set; }
    public IncidentStatus Status { get; set; }
    public IncidentImpact Impact { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? Resolution { get; set; }
    public string[]? AffectedServices { get; set; }
    public int? UsersAffected { get; set; }
    public List<IncidentUpdateSummary> Updates { get; set; } = new();
}

/// <summary>
/// Summary of incident for listing views
/// </summary>
public class IncidentSummary
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public IncidentSeverity Severity { get; set; }
    public IncidentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string[]? AffectedServices { get; set; }
    public string? AssignedToName { get; set; }
}

/// <summary>
/// Summary of incident update
/// </summary>
public class IncidentUpdateSummary
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public IncidentUpdateType UpdateType { get; set; }
    public IncidentStatus? StatusChange { get; set; }
}

/// <summary>
/// Request for scheduling maintenance
/// </summary>
public class MaintenanceRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public MaintenanceType Type { get; set; }
    public string[]? AffectedServices { get; set; }
    public MaintenanceImpact ExpectedImpact { get; set; }
    public bool NotifyUsers { get; set; } = true;
    public Guid CreatedBy { get; set; }
}

#endregion