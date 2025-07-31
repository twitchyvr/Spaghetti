using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents an update to an incident during its lifecycle
/// </summary>
public class IncidentUpdate
{
    public Guid Id { get; set; }

    [Required]
    public Guid IncidentId { get; set; }

    [Required]
    [StringLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public Guid CreatedBy { get; set; }

    public IncidentStatus? StatusChange { get; set; }

    /// <summary>
    /// Type of update: StatusChange, Comment, Resolution, Assignment
    /// </summary>
    [Required]
    public IncidentUpdateType UpdateType { get; set; }

    // Navigation properties
    public Incident Incident { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;

    public IncidentUpdate()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdateType = IncidentUpdateType.Comment;
    }
}

/// <summary>
/// Types of incident updates
/// </summary>
public enum IncidentUpdateType
{
    Comment = 1,
    StatusChange = 2,
    Assignment = 3,
    Resolution = 4,
    Escalation = 5
}

/// <summary>
/// Represents a maintenance window scheduled for the platform
/// </summary>
public class MaintenanceWindow
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    public MaintenanceType Type { get; set; }

    [Required]
    public MaintenanceStatus Status { get; set; }

    /// <summary>
    /// Comma-separated list of affected services
    /// </summary>
    [StringLength(500)]
    public string? AffectedServices { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public Guid CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    /// <summary>
    /// Whether users should be notified about this maintenance
    /// </summary>
    public bool NotifyUsers { get; set; }

    /// <summary>
    /// Expected impact during maintenance
    /// </summary>
    public MaintenanceImpact ExpectedImpact { get; set; }

    // Navigation properties
    public User CreatedByUser { get; set; } = null!;
    public User? UpdatedByUser { get; set; }

    public MaintenanceWindow()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        Status = MaintenanceStatus.Scheduled;
        ExpectedImpact = MaintenanceImpact.Low;
        NotifyUsers = true;
    }
}

/// <summary>
/// Types of maintenance activities
/// </summary>
public enum MaintenanceType
{
    Security = 1,
    Performance = 2,
    Feature = 3,
    Infrastructure = 4,
    Emergency = 5
}

/// <summary>
/// Status of maintenance windows
/// </summary>
public enum MaintenanceStatus
{
    Scheduled = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4,
    Failed = 5
}

/// <summary>
/// Expected impact of maintenance on users
/// </summary>
public enum MaintenanceImpact
{
    None = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    ServiceDown = 4
}