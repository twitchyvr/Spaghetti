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
// MaintenanceWindow class is defined in MaintenanceWindow.cs to avoid duplication