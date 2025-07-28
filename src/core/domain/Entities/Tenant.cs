using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Subdomain { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public TenantTier Tier { get; set; } = TenantTier.Standard;
    
    // Suspension tracking for administrative actions
    [MaxLength(500)]
    public string? SuspensionReason { get; set; }
    public DateTime? SuspendedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Platform admin tracking
    public Guid? CreatedByPlatformAdmin { get; set; }
    public Guid? LastModifiedByPlatformAdmin { get; set; }
    
    [MaxLength(1000)]
    public string? PlatformNotes { get; set; }
    
    // Billing and subscription
    public TenantBilling Billing { get; set; } = new();
    
    // Configuration and settings
    public TenantConfiguration Configuration { get; set; } = new();
    
    // Usage limits and quotas
    public TenantQuotas Quotas { get; set; } = new();
    
    // Branding and customization
    public TenantBranding Branding { get; set; } = new();
    
    // Users in this tenant
    public List<User> Users { get; set; } = new();
    
    // Documents in this tenant
    public List<Document> Documents { get; set; } = new();
    
    // Roles in this tenant
    public List<Role> Roles { get; set; } = new();
    
    // Modules enabled for this tenant
    public List<TenantModule> Modules { get; set; } = new();
    
    // Audit trail
    public List<TenantAuditEntry> AuditEntries { get; set; } = new();
}

public enum TenantStatus
{
    Active,
    Suspended,
    Inactive,
    Trial,
    PendingActivation,
    Archived
}

public enum TenantTier
{
    Trial,
    Starter,
    Standard,
    Professional,
    Enterprise,
    Custom
}

public class TenantBilling
{
    [MaxLength(100)]
    public string? SubscriptionId { get; set; }
    
    [MaxLength(50)]
    public string? PlanId { get; set; }
    
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public DateTime? NextBillingDate { get; set; }
    
    public decimal MonthlyRate { get; set; }
    public string Currency { get; set; } = "USD";
    
    public bool IsTrialActive { get; set; } = false;
    public DateTime? TrialEndDate { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Current;
    
    // Usage tracking for billing
    public int DocumentsCreatedThisMonth { get; set; }
    public int APICallsThisMonth { get; set; }
    public long StorageUsedBytes { get; set; }
    
    public Dictionary<string, object> BillingMetadata { get; set; } = new();
}

public enum PaymentStatus
{
    Current,
    PastDue,
    Canceled,
    Suspended,
    Failed
}

public class TenantConfiguration
{
    // Security settings
    public bool RequireMFA { get; set; } = false;
    public bool RequireSSO { get; set; } = false;
    public int PasswordExpiryDays { get; set; } = 90;
    public int SessionTimeoutMinutes { get; set; } = 480; // 8 hours
    
    // Data retention policies
    public int DocumentRetentionDays { get; set; } = 365;
    public int AuditLogRetentionDays { get; set; } = 90;
    public bool EnableDataExport { get; set; } = true;
    
    // AI and automation settings
    public bool EnableAIFeatures { get; set; } = true;
    public bool EnableAutoDocumentation { get; set; } = true;
    public bool EnableVoiceCapture { get; set; } = false;
    public bool EnableScreenCapture { get; set; } = false;
    
    // Integration settings
    public Dictionary<string, bool> EnabledIntegrations { get; set; } = new();
    
    // Compliance settings
    public List<string> ComplianceFrameworks { get; set; } = new();
    public bool EnableAuditLogging { get; set; } = true;
    public bool EnableDataEncryption { get; set; } = true;
    
    // Regional settings
    public string DefaultTimeZone { get; set; } = "UTC";
    public string DefaultLanguage { get; set; } = "en";
    
    public Dictionary<string, object> CustomSettings { get; set; } = new();
}

public class TenantQuotas
{
    // Storage quotas
    public long MaxStorageBytes { get; set; } = 10L * 1024 * 1024 * 1024; // 10 GB
    public long UsedStorageBytes { get; set; } = 0;
    
    // User quotas
    public int MaxUsers { get; set; } = 100;
    public int ActiveUsers { get; set; } = 0;
    
    // Document quotas
    public int MaxDocumentsPerMonth { get; set; } = 1000;
    public int DocumentsCreatedThisMonth { get; set; } = 0;
    
    // API quotas
    public int MaxAPICallsPerMonth { get; set; } = 10000;
    public int APICallsThisMonth { get; set; } = 0;
    
    // AI processing quotas
    public int MaxAIProcessingMinutesPerMonth { get; set; } = 100;
    public int AIProcessingMinutesUsedThisMonth { get; set; } = 0;
    
    // Module-specific quotas
    public Dictionary<string, int> ModuleQuotas { get; set; } = new();
    
    public DateTime QuotaResetDate { get; set; } = DateTime.UtcNow.AddMonths(1);
}

public class TenantBranding
{
    [MaxLength(200)]
    public string? CompanyName { get; set; }
    
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    
    [MaxLength(7)]
    public string? PrimaryColor { get; set; } = "#2563eb";
    
    [MaxLength(7)]
    public string? SecondaryColor { get; set; } = "#64748b";
    
    [MaxLength(7)]
    public string? AccentColor { get; set; } = "#10b981";
    
    [MaxLength(100)]
    public string? FontFamily { get; set; } = "Inter";
    
    public string? CustomCSS { get; set; }
    
    // White-label settings
    public bool HidePlatformBranding { get; set; } = false;
    public bool CustomDomain { get; set; } = false;
    public string? CustomDomainName { get; set; }
    
    public Dictionary<string, string> CustomLabels { get; set; } = new();
}

public class TenantModule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ModuleName { get; set; } = string.Empty;
    
    public bool IsEnabled { get; set; } = false;
    public DateTime EnabledAt { get; set; } = DateTime.UtcNow;
    public Guid EnabledBy { get; set; }
    
    // Module configuration
    public Dictionary<string, object> Configuration { get; set; } = new();
    
    // Module-specific billing
    public decimal? AdditionalCost { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
}

public class TenantAuditEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    public string? Details { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    
    [MaxLength(50)]
    public string? IPAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    public AuditSeverity Severity { get; set; } = AuditSeverity.Information;
}