using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents an active or historical user impersonation session
/// 
/// This entity tracks when platform administrators impersonate users for support purposes.
/// It provides comprehensive audit trails and session management capabilities.
/// 
/// Key Features:
/// - Complete audit trail of all impersonation activities
/// - Session expiration and automatic cleanup
/// - IP address and user agent tracking for security
/// - Reason tracking for compliance and auditing
/// - Support for emergency session termination
/// </summary>
public class ImpersonationSession
{
    /// <summary>
    /// Unique identifier for the impersonation session
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The platform administrator who initiated the impersonation
    /// </summary>
    public Guid AdminUserId { get; set; }

    /// <summary>
    /// Email of the administrator for audit trails
    /// </summary>
    [Required]
    [StringLength(100)]
    public string AdminUserEmail { get; set; } = string.Empty;

    /// <summary>
    /// The target user being impersonated
    /// </summary>
    public Guid TargetUserId { get; set; }

    /// <summary>
    /// Email of the target user for audit trails
    /// </summary>
    [Required]
    [StringLength(100)]
    public string TargetUserEmail { get; set; } = string.Empty;

    /// <summary>
    /// The tenant/organization of the target user
    /// </summary>
    public Guid TargetTenantId { get; set; }

    /// <summary>
    /// Business reason for the impersonation (required for compliance)
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// When the impersonation session was started
    /// </summary>
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the impersonation session was ended (null if still active)
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// When the impersonation session expires (automatic termination)
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Reason why the session was ended
    /// </summary>
    [StringLength(500)]
    public string? EndReason { get; set; }

    /// <summary>
    /// Whether the impersonation session is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// IP address of the administrator for security tracking
    /// </summary>
    [StringLength(50)]
    public string? AdminIPAddress { get; set; }

    /// <summary>
    /// User agent of the administrator's browser/client
    /// </summary>
    [StringLength(500)]
    public string? AdminUserAgent { get; set; }

    /// <summary>
    /// When this record was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When this record was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User AdminUser { get; set; } = null!;
    public virtual User TargetUser { get; set; } = null!;
    public virtual Tenant TargetTenant { get; set; } = null!;
}