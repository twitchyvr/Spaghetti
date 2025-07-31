using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents a system health metric collected by the monitoring system
/// </summary>
public class SystemHealthMetric
{
    public Guid Id { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [StringLength(100)]
    public string ServiceName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]  
    public string MetricName { get; set; } = string.Empty;

    public decimal? MetricValue { get; set; }

    [StringLength(20)]
    public string? MetricUnit { get; set; }

    /// <summary>
    /// JSON key-value pairs for additional metric metadata
    /// </summary>
    [StringLength(500)]
    public string? Tags { get; set; }

    [StringLength(100)]
    public string? HostName { get; set; }

    /// <summary>
    /// Health status: Healthy, Warning, Critical, Unknown
    /// </summary>
    [Required]
    public HealthStatus Status { get; set; }

    /// <summary>
    /// Additional contextual information about the metric
    /// </summary>
    [StringLength(1000)]
    public string? Context { get; set; }

    public SystemHealthMetric()
    {
        Id = Guid.NewGuid();
        Timestamp = DateTime.UtcNow;
        Status = HealthStatus.Unknown;
    }
}

/// <summary>
/// Health status enumeration for system components
/// </summary>
public enum HealthStatus
{
    Unknown = 0,
    Healthy = 1,
    Warning = 2,
    Critical = 3,
    Degraded = 4
}