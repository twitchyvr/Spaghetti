using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;
    
    public string Content { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string DocumentType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Industry { get; set; } = string.Empty;
    
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    
    // Public publishing settings
    public PublicAccessLevel PublicAccessLevel { get; set; } = PublicAccessLevel.Private;
    public string? PublicSlug { get; set; } // URL-friendly identifier for public access
    public DateTime? PublishedAt { get; set; }
    public Guid? PublishedBy { get; set; }
    public User? PublishedByUser { get; set; }
    
    // SEO and public metadata
    public string? MetaDescription { get; set; }
    public List<string> MetaKeywords { get; set; } = new();
    public bool IndexBySearchEngines { get; set; } = true;
    
    // Access analytics
    public int PublicViewCount { get; set; } = 0;
    public DateTime? LastPublicViewAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    // Document metadata
    public DocumentMetadata Metadata { get; set; } = new();
    
    // File properties for document management
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }
    public string? FilePath { get; set; }
    public string? FileHash { get; set; } // For duplicate detection and integrity checking
    
    // Version control
    public int Version { get; set; } = 1;
    public bool IsLatestVersion { get; set; } = true;
    public Guid? ParentDocumentId { get; set; }
    public Document? ParentDocument { get; set; }
    public List<Document> ChildDocuments { get; set; } = new();
    public string? VersionNotes { get; set; }
    
    // AI processing metadata
    public AIMetadata? AIMetadata { get; set; }
    
    // Tags for categorization
    public List<DocumentTag> Tags { get; set; } = new();
    
    // Attachments and source files
    public List<DocumentAttachment> Attachments { get; set; } = new();
    
    // Sharing and permissions
    public List<DocumentPermission> Permissions { get; set; } = new();
    
    // Audit trail
    public List<DocumentAuditEntry> AuditEntries { get; set; } = new();
}

public enum DocumentStatus
{
    Draft,
    InReview,
    Approved,
    Published,
    Archived,
    Deleted
}

public enum PublicAccessLevel
{
    Private,            // Only authenticated users with permissions
    TenantUsers,        // All users within the tenant organization
    AuthenticatedUsers, // Any authenticated user across platform
    Public,             // Anyone on the internet (completely public)
    PublicWithEmail,    // Public but requires email for analytics
    IPRestricted,       // Public but restricted to specific IP ranges
    PasswordProtected   // Public but requires password
}

public class DocumentMetadata
{
    public Dictionary<string, object> Properties { get; set; } = new();
    public string? SourceModule { get; set; }
    public string? SourceAgent { get; set; }
    public DateTime? SourceCaptureTime { get; set; }
    public string? SourceLocation { get; set; }
    public List<string> Keywords { get; set; } = new();
    public string? Summary { get; set; }
    public int WordCount { get; set; }
    public string? Language { get; set; } = "en";
}

public class AIMetadata
{
    public string? ProviderId { get; set; }
    public string? ModelUsed { get; set; }
    public float ConfidenceScore { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public int TokensUsed { get; set; }
    public decimal Cost { get; set; }
    public Dictionary<string, object> ProcessingResults { get; set; } = new();
    public string? PromptUsed { get; set; }
    public List<string> SuggestedTags { get; set; } = new();
    public string? AutoGeneratedSummary { get; set; }
    public TimeSpan ProcessingTime { get; set; }
    public string? ProcessingVersion { get; set; }
}

public class DocumentTag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    public bool IsSystemGenerated { get; set; } = false;
    public float Confidence { get; set; } = 1.0f;
}

public class DocumentAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    [Required]
    public string StoragePath { get; set; } = string.Empty;
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public Guid UploadedBy { get; set; }
    
    public string? Description { get; set; }
    public AttachmentType Type { get; set; } = AttachmentType.File;
}

public enum AttachmentType
{
    File,
    Audio,
    Video,
    Image,
    Screenshot,
    SourceCode,
    Email,
    Chat
}

public class DocumentPermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    public Guid? RoleId { get; set; }
    public Role? Role { get; set; }
    
    public PermissionType Permission { get; set; } = PermissionType.Read;
    
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public Guid GrantedBy { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
}

public enum PermissionType
{
    Read,
    Write,
    Comment,
    Share,
    Delete,
    Admin
}

public class DocumentAuditEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    public string? Details { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    
    [MaxLength(50)]
    public string? IPAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
}