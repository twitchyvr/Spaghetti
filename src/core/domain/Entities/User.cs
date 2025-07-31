using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; } // Nullable for guest users
    
    public string FullName => string.IsNullOrEmpty(FirstName) && string.IsNullOrEmpty(LastName) 
        ? "Guest User" : $"{FirstName} {LastName}".Trim();
    
    // User type classification
    public UserType UserType { get; set; } = UserType.RegisteredUser;
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // For guest users - track session and analytics
    public string? SessionId { get; set; }
    public DateTime? SessionExpiresAt { get; set; }
    
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

// UserRole, Role, and RolePermission classes are defined in separate files to avoid duplication

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

public enum UserType
{
    PlatformAdmin,      // Spaghetti platform team member
    ClientAdmin,        // Organization admin (tenant admin)
    RegisteredUser,     // Authenticated user within a tenant
    GuestUser,          // Anonymous/public viewer (temporary session)
    APIUser,            // Service account for integrations
    ImpersonatedUser    // Platform admin impersonating other user
}

public static class SystemRoles
{
    // Platform-level roles (cross-tenant)
    public const string PLATFORM_ADMIN = "Platform.Admin";
    public const string PLATFORM_SUPPORT = "Platform.Support";
    public const string PLATFORM_DEVELOPER = "Platform.Developer";
    public const string PLATFORM_VIEWER = "Platform.Viewer";
    
    // Tenant-level roles
    public const string CLIENT_ADMIN = "Client.Admin";
    public const string CLIENT_MANAGER = "Client.Manager";
    public const string CLIENT_USER = "Client.User";
    public const string CLIENT_GUEST = "Client.Guest";
    
    // Document-level roles
    public const string DOCUMENT_OWNER = "Document.Owner";
    public const string DOCUMENT_EDITOR = "Document.Editor";
    public const string DOCUMENT_REVIEWER = "Document.Reviewer";
    public const string DOCUMENT_VIEWER = "Document.Viewer";
    public const string DOCUMENT_PUBLIC_VIEWER = "Document.PublicViewer";
    
    // Specialized roles
    public const string BILLING_ADMIN = "Billing.Admin";
    public const string COMPLIANCE_OFFICER = "Compliance.Officer";
    public const string INTEGRATION_USER = "Integration.User";
}

public static class SystemPermissions
{
    // Platform management
    public const string MANAGE_TENANTS = "platform.manage_tenants";
    public const string MANAGE_USERS = "platform.manage_users";
    public const string VIEW_PLATFORM_ANALYTICS = "platform.view_analytics";
    public const string IMPERSONATE_USERS = "platform.impersonate";
    
    // Client management
    public const string MANAGE_CLIENT_USERS = "client.manage_users";
    public const string MANAGE_CLIENT_SETTINGS = "client.manage_settings";
    public const string VIEW_CLIENT_ANALYTICS = "client.view_analytics";
    public const string MANAGE_CLIENT_BILLING = "client.manage_billing";
    
    // Document management
    public const string CREATE_DOCUMENTS = "document.create";
    public const string READ_DOCUMENTS = "document.read";
    public const string UPDATE_DOCUMENTS = "document.update";
    public const string DELETE_DOCUMENTS = "document.delete";
    public const string PUBLISH_DOCUMENTS = "document.publish";
    public const string SHARE_DOCUMENTS = "document.share";
    
    // Public access
    public const string VIEW_PUBLIC_DOCUMENTS = "document.view_public";
    public const string ACCESS_PUBLIC_PORTAL = "portal.access_public";
}