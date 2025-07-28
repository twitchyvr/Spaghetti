using System.ComponentModel.DataAnnotations;
using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.API.DTOs;

/// <summary>
/// Document creation request DTO
/// </summary>
public class CreateDocumentRequest
{
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

    public PublicAccessLevel PublicAccessLevel { get; set; } = PublicAccessLevel.Private;

    public string? PublicSlug { get; set; }

    public string? MetaDescription { get; set; }

    public List<string> MetaKeywords { get; set; } = new();

    public bool IndexBySearchEngines { get; set; } = true;

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public long? FileSize { get; set; }

    public string? VersionNotes { get; set; }

    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// Document update request DTO
/// </summary>
public class UpdateDocumentRequest
{
    [MaxLength(500)]
    public string? Title { get; set; }

    public string? Content { get; set; }

    [MaxLength(100)]
    public string? DocumentType { get; set; }

    [MaxLength(50)]
    public string? Industry { get; set; }

    public DocumentStatus? Status { get; set; }

    public PublicAccessLevel? PublicAccessLevel { get; set; }

    public string? PublicSlug { get; set; }

    public string? MetaDescription { get; set; }

    public List<string>? MetaKeywords { get; set; }

    public bool? IndexBySearchEngines { get; set; }

    public string? VersionNotes { get; set; }

    public List<string>? Tags { get; set; }
}

/// <summary>
/// Document response DTO
/// </summary>
public class DocumentResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; }
    public PublicAccessLevel PublicAccessLevel { get; set; }
    public string? PublicSlug { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string? MetaDescription { get; set; }
    public List<string> MetaKeywords { get; set; } = new();
    public bool IndexBySearchEngines { get; set; }
    public int PublicViewCount { get; set; }
    public DateTime? LastPublicViewAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }
    public string? FileHash { get; set; }
    public int Version { get; set; }
    public bool IsLatestVersion { get; set; }
    public Guid? ParentDocumentId { get; set; }
    public string? VersionNotes { get; set; }
    public List<DocumentTagResponse> Tags { get; set; } = new();
    public List<DocumentAttachmentResponse> Attachments { get; set; } = new();
    public DocumentMetadataResponse Metadata { get; set; } = new();
    public AIMetadataResponse? AIMetadata { get; set; }
}

/// <summary>
/// Document list item response DTO (lighter version for lists)
/// </summary>
public class DocumentListResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }
    public int Version { get; set; }
    public bool IsLatestVersion { get; set; }
    public List<string> TagNames { get; set; } = new();
}

/// <summary>
/// Document tag response DTO
/// </summary>
public class DocumentTagResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsSystemGenerated { get; set; }
    public float Confidence { get; set; }
}

/// <summary>
/// Document attachment response DTO
/// </summary>
public class DocumentAttachmentResponse
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? Description { get; set; }
    public AttachmentType Type { get; set; }
}

/// <summary>
/// Document metadata response DTO
/// </summary>
public class DocumentMetadataResponse
{
    public Dictionary<string, object> Properties { get; set; } = new();
    public string? SourceModule { get; set; }
    public string? SourceAgent { get; set; }
    public DateTime? SourceCaptureTime { get; set; }
    public string? SourceLocation { get; set; }
    public List<string> Keywords { get; set; } = new();
    public string? Summary { get; set; }
    public int WordCount { get; set; }
    public string? Language { get; set; }
}

/// <summary>
/// AI metadata response DTO
/// </summary>
public class AIMetadataResponse
{
    public string? ModelUsed { get; set; }
    public float ConfidenceScore { get; set; }
    public DateTime ProcessedAt { get; set; }
    public Dictionary<string, object> ProcessingResults { get; set; } = new();
    public string? PromptUsed { get; set; }
    public List<string> SuggestedTags { get; set; } = new();
    public string? AutoGeneratedSummary { get; set; }
}

/// <summary>
/// Document search request DTO
/// </summary>
public class DocumentSearchRequest
{
    public string? SearchTerm { get; set; }
    public List<string>? Tags { get; set; }
    public string? DocumentType { get; set; }
    public string? Industry { get; set; }
    public DocumentStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? ContentType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Paginated response DTO
/// </summary>
public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// File upload request DTO
/// </summary>
public class DocumentUploadRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;

    [MaxLength(500)]
    public string? Title { get; set; }

    [MaxLength(100)]
    public string? DocumentType { get; set; }

    [MaxLength(50)]
    public string? Industry { get; set; }

    public string? Description { get; set; }

    public List<string> Tags { get; set; } = new();

    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public PublicAccessLevel PublicAccessLevel { get; set; } = PublicAccessLevel.Private;
}

/// <summary>
/// Create document version request DTO
/// </summary>
public class CreateDocumentVersionRequest
{
    public string? Content { get; set; }
    public string? VersionNotes { get; set; }
    public DocumentStatus? Status { get; set; }
    public List<string>? Tags { get; set; }
    public IFormFile? File { get; set; }
}