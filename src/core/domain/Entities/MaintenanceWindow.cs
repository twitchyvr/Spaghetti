using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents a scheduled maintenance window for the platform
/// </summary>
public class MaintenanceWindow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// When the maintenance window is scheduled to start
    /// </summary>
    public DateTime ScheduledStart { get; set; }
    
    /// <summary>
    /// When the maintenance window is scheduled to end
    /// </summary>
    public DateTime ScheduledEnd { get; set; }
    
    /// <summary>
    /// Alias for ScheduledStart for compatibility
    /// </summary>
    public DateTime StartTime => ScheduledStart;
    
    /// <summary>
    /// Alias for ScheduledEnd for compatibility  
    /// </summary>
    public DateTime EndTime => ScheduledEnd;
    
    /// <summary>
    /// When the maintenance actually started
    /// </summary>
    public DateTime? ActualStart { get; set; }
    
    /// <summary>
    /// When the maintenance actually ended
    /// </summary>
    public DateTime? ActualEnd { get; set; }
    
    /// <summary>
    /// Current status of the maintenance window
    /// </summary>
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Scheduled;
    
    /// <summary>
    /// Type of maintenance being performed
    /// </summary>
    public MaintenanceType Type { get; set; } = MaintenanceType.Planned;
    
    /// <summary>
    /// Impact level of the maintenance
    /// </summary>
    public MaintenanceImpact Impact { get; set; } = MaintenanceImpact.Low;
    
    /// <summary>
    /// Services affected by this maintenance
    /// </summary>
    public List<string> AffectedServices { get; set; } = new();
    
    /// <summary>
    /// Whether to notify users about this maintenance
    /// </summary>
    public bool NotifyUsers { get; set; } = true;
    
    /// <summary>
    /// How far in advance to notify users (in hours)
    /// </summary>
    public int NotificationHours { get; set; } = 24;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    public Guid? UpdatedBy { get; set; }
    public User? UpdatedByUser { get; set; }
    
    /// <summary>
    /// Additional notes or updates about the maintenance
    /// </summary>
    public string? Notes { get; set; }
}

public enum MaintenanceStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    Delayed,
    Failed
}

public enum MaintenanceType
{
    Planned,
    Emergency,
    Security,
    Update,
    Infrastructure
}

public enum MaintenanceImpact
{
    None,
    Low,
    Medium,
    High,
    Critical
}