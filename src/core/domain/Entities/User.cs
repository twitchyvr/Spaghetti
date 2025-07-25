using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    public string FullName => $"{FirstName} {LastName}";
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Multi-tenant support
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    // User profile
    public UserProfile Profile { get; set; } = new();
    
    // Authentication
    public List<UserAuthentication> AuthenticationMethods { get; set; } = new();
    
    // Roles and permissions
    public List<UserRole> UserRoles { get; set; } = new();
    
    // User preferences and settings
    public UserSettings Settings { get; set; } = new();
    
    // Documents created by this user
    public List<Document> CreatedDocuments { get; set; } = new();
    
    // Document permissions
    public List<DocumentPermission> DocumentPermissions { get; set; } = new();
    
    // Audit trail
    public List<UserAuditEntry> AuditEntries { get; set; } = new();
}

public class UserProfile
{
    [MaxLength(200)]
    public string? JobTitle { get; set; }
    
    [MaxLength(200)]
    public string? Department { get; set; }
    
    [MaxLength(50)]
    public string? Industry { get; set; }
    
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    
    [MaxLength(500)]
    public string? Bio { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    [MaxLength(10)]
    public string? TimeZone { get; set; }
    
    [MaxLength(10)]
    public string? Language { get; set; } = "en";
    
    public Dictionary<string, object> CustomFields { get; set; } = new();
}

public class UserAuthentication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = string.Empty; // "AzureAD", "Auth0", "Local", etc.
    
    [Required]
    [MaxLength(255)]
    public string ExternalId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public Dictionary<string, object> ProviderData { get; set; } = new();
}

public class UserSettings
{
    // AI preferences
    public bool EnableAIAssistance { get; set; } = true;
    public bool EnableAutoDocumentation { get; set; } = true;
    public bool EnableVoiceCapture { get; set; } = false;
    public bool EnableScreenCapture { get; set; } = false;
    public bool EnableFileMonitoring { get; set; } = false;
    
    // Privacy settings
    public PrivacyLevel PrivacyLevel { get; set; } = PrivacyLevel.Standard;
    public bool AllowDataRetention { get; set; } = true;
    public int DataRetentionDays { get; set; } = 365;
    
    // Notification preferences
    public bool EnableEmailNotifications { get; set; } = true;
    public bool EnablePushNotifications { get; set; } = true;
    public bool EnableSlackNotifications { get; set; } = false;
    public bool EnableTeamsNotifications { get; set; } = false;
    
    // UI preferences
    public string Theme { get; set; } = "light";
    public string DefaultDocumentType { get; set; } = "general";
    public List<string> FavoriteAgents { get; set; } = new();
    
    // Integration settings
    public Dictionary<string, ModuleSettings> ModuleSettings { get; set; } = new();
    
    public Dictionary<string, object> CustomSettings { get; set; } = new();
}

public enum PrivacyLevel
{
    Minimal,    // Only essential data collection
    Standard,   // Standard business data collection
    Enhanced    // Full feature data collection
}

public class ModuleSettings
{
    public bool Enabled { get; set; } = false;
    public Dictionary<string, object> Configuration { get; set; } = new();
    public DateTime? LastConfiguredAt { get; set; }
}

public class UserRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid AssignedBy { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public bool IsSystemRole { get; set; } = false;
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Multi-tenant support
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    // Permissions
    public List<RolePermission> RolePermissions { get; set; } = new();
    
    // Users with this role
    public List<UserRole> UserRoles { get; set; } = new();
    
    // Document permissions
    public List<DocumentPermission> DocumentPermissions { get; set; } = new();
}

public class RolePermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Permission { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Resource { get; set; }
    
    public bool IsGranted { get; set; } = true;
}

public class UserAuditEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public string? Details { get; set; }
    
    [MaxLength(50)]
    public string? IPAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
}