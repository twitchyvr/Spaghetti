using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Platform Administration Audit Log
/// 
/// This entity provides comprehensive audit trails for all platform administration activities.
/// It tracks actions performed by platform administrators across the entire system.
/// 
/// Key Features:
/// - Complete audit trail of all administrative actions
/// - Target entity tracking (users, tenants, documents, etc.)
/// - IP address and user agent logging for security
/// - Detailed action descriptions and context
/// - Compliance and regulatory reporting support
/// </summary>
public class PlatformAdminAuditLog
{
    /// <summary>
    /// Unique identifier for the audit log entry
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The platform administrator who performed the action
    /// </summary>
    public Guid AdminUserId { get; set; }

    /// <summary>
    /// The specific action that was performed
    /// Examples: CREATE_CLIENT, DELETE_USER, START_IMPERSONATION, UPDATE_SUBSCRIPTION
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// The type of entity that was affected by the action
    /// Examples: User, Tenant, Document, System
    /// </summary>
    [Required]
    [StringLength(50)]
    public string TargetEntityType { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the specific entity that was affected (if applicable)
    /// </summary>
    public Guid? TargetEntityId { get; set; }

    /// <summary>
    /// Detailed description of what was performed
    /// </summary>
    [StringLength(1000)]
    public string? Details { get; set; }

    /// <summary>
    /// IP address of the administrator performing the action
    /// </summary>
    [StringLength(50)]
    public string? IPAddress { get; set; }

    /// <summary>
    /// User agent of the administrator's browser/client
    /// </summary>
    [StringLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// When the action was performed
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Additional metadata about the action (stored as JSON)
    /// </summary>
    [StringLength(2000)]
    public string? Metadata { get; set; }

    /// <summary>
    /// Severity level of the action for monitoring and alerting
    /// </summary>
    public AuditSeverity Severity { get; set; } = AuditSeverity.Information;

    /// <summary>
    /// Whether this action was successful or failed
    /// </summary>
    public bool IsSuccessful { get; set; } = true;

    /// <summary>
    /// Error message if the action failed
    /// </summary>
    [StringLength(500)]
    public string? ErrorMessage { get; set; }

    // Navigation properties
    public virtual User AdminUser { get; set; } = null!;
}

/// <summary>
/// Severity levels for audit log entries
/// </summary>
public enum AuditSeverity
{
    /// <summary>
    /// Informational actions (view data, generate reports)
    /// </summary>
    Information = 0,

    /// <summary>
    /// Low-risk actions (update settings, create users)
    /// </summary>
    Low = 1,

    /// <summary>
    /// Medium-risk actions (suspend clients, modify permissions)
    /// </summary>
    Medium = 2,

    /// <summary>
    /// High-risk actions (delete data, emergency actions)
    /// </summary>
    High = 3,

    /// <summary>
    /// Critical actions (system-wide changes, security incidents)
    /// </summary>
    Critical = 4
}