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


#endregion