using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Authentication session tracking for enhanced security and session management
/// </summary>
public class AuthenticationSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string SessionToken { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string RefreshToken { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime LastAccessedAt { get; set; } = DateTime.UtcNow;
    
    [MaxLength(50)]
    public string? IPAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Session metadata
    [MaxLength(50)]
    public string? DeviceType { get; set; }
    
    [MaxLength(100)]
    public string? Location { get; set; }
    
    // Security tracking
    public DateTime? LastPasswordChangeAt { get; set; }
    public bool RequiresMFA { get; set; }
    public DateTime? MFAVerifiedAt { get; set; }
    
    // Impersonation context
    public Guid? ImpersonatedBy { get; set; }
    public User? ImpersonatingUser { get; set; }
    public DateTime? ImpersonationStartedAt { get; set; }
    public DateTime? ImpersonationExpiresAt { get; set; }
    
    // Computed properties
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsImpersonated => ImpersonatedBy.HasValue;
    public bool IsMFARequired => RequiresMFA && (!MFAVerifiedAt.HasValue || MFAVerifiedAt < DateTime.UtcNow.AddHours(-24));
    
    /// <summary>
    /// Extend session expiration time
    /// </summary>
    public void ExtendSession(TimeSpan extension)
    {
        ExpiresAt = DateTime.UtcNow.Add(extension);
        LastAccessedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Mark session as accessed
    /// </summary>
    public void UpdateLastAccessed()
    {
        LastAccessedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Start impersonation
    /// </summary>
    public void StartImpersonation(Guid adminUserId, TimeSpan duration)
    {
        ImpersonatedBy = adminUserId;
        ImpersonationStartedAt = DateTime.UtcNow;
        ImpersonationExpiresAt = DateTime.UtcNow.Add(duration);
    }
    
    /// <summary>
    /// End impersonation
    /// </summary>
    public void EndImpersonation()
    {
        ImpersonatedBy = null;
        ImpersonationStartedAt = null;
        ImpersonationExpiresAt = null;
    }
}

/// <summary>
/// User-specific permission assignments
/// </summary>
public class UserPermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Permission { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Resource { get; set; }
    
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid GrantedBy { get; set; }
    public User? GrantedByUser { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    // Computed properties
    public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow >= ExpiresAt.Value;
    public bool IsValid => IsActive && !IsExpired;
    
    /// <summary>
    /// Get the full permission string
    /// </summary>
    public string FullPermission => string.IsNullOrEmpty(Resource) ? Permission : $"{Permission}.{Resource}";
}

/// <summary>
/// Enhanced user authentication methods with MFA support
/// </summary>
public class UserAuthenticationMethod
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = string.Empty; // "Local", "AzureAD", "Google", "Okta", etc.
    
    [Required]
    [MaxLength(50)]
    public string AuthenticationType { get; set; } = string.Empty; // "Password", "TOTP", "SMS", "Email", etc.
    
    [MaxLength(255)]
    public string? ExternalId { get; set; }
    
    [MaxLength(500)]
    public string? CredentialData { get; set; } // Hashed password, MFA secret, etc.
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsPrimary { get; set; } = false;
    
    // MFA specific properties
    public bool IsMFA { get; set; } = false;
    public DateTime? LastMFAUsedAt { get; set; }
    public int FailedAttempts { get; set; } = 0;
    public DateTime? LockedUntil { get; set; }
    
    // Provider specific data
    public Dictionary<string, object> ProviderData { get; set; } = new();
    
    // Computed properties
    public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow >= ExpiresAt.Value;
    public bool IsLocked => LockedUntil.HasValue && DateTime.UtcNow < LockedUntil.Value;
    public bool IsUsable => IsActive && !IsExpired && !IsLocked;
}