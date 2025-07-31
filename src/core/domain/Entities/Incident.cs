using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents an incident in the platform that requires tracking and resolution
/// </summary>
public class Incident
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    public IncidentSeverity Severity { get; set; }

    [Required]
    public IncidentStatus Status { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [Required]
    public Guid CreatedBy { get; set; }

    public Guid? AssignedTo { get; set; }

    /// <summary>
    /// Comma-separated list of affected services
    /// </summary>
    [StringLength(500)]
    public string? AffectedServices { get; set; }

    [StringLength(2000)]
    public string? Resolution { get; set; }

    public bool PostMortemRequired { get; set; }

    /// <summary>
    /// External incident tracking ID (e.g., PagerDuty, ServiceNow)
    /// </summary>
    [StringLength(100)]
    public string? ExternalIncidentId { get; set; }

    /// <summary>
    /// Impact assessment: Low, Medium, High, Critical
    /// </summary>
    public IncidentImpact Impact { get; set; }

    /// <summary>
    /// Number of users affected by this incident
    /// </summary>
    public int? UsersAffected { get; set; }

    /// <summary>
    /// Estimated revenue impact in USD
    /// </summary>
    public decimal? RevenueImpact { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public User? AssignedToUser { get; set; }
    public ICollection<IncidentUpdate> Updates { get; set; } = new List<IncidentUpdate>();

    public Incident()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        Status = IncidentStatus.Open;
        Impact = IncidentImpact.Low;
    }
}

/// <summary>
/// Incident severity levels
/// </summary>
public enum IncidentSeverity
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

/// <summary>
/// Incident status during its lifecycle
/// </summary>
public enum IncidentStatus
{
    Open = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4,
    Investigating = 5,
    Monitoring = 6
}

/// <summary>
/// Impact level of the incident on business operations
/// </summary>
public enum IncidentImpact
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}