using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IDocumentService
{
    // Document CRUD operations
    Task<Document> CreateDocumentAsync(CreateDocumentRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Document?> GetDocumentByIdAsync(Guid id, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<Document> UpdateDocumentAsync(Guid id, UpdateDocumentRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteDocumentAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    
    // Document querying
    Task<PagedResult<Document>> GetDocumentsAsync(DocumentFilter filter, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<List<Document>> GetRecentDocumentsAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default);
    Task<List<Document>> SearchDocumentsAsync(string query, DocumentFilter? filter = null, Guid? userId = null, CancellationToken cancellationToken = default);
    
    // Document versions
    Task<List<Document>> GetDocumentVersionsAsync(Guid documentId, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<Document> CreateDocumentVersionAsync(Guid documentId, string content, Guid userId, CancellationToken cancellationToken = default);
    Task<Document> RestoreDocumentVersionAsync(Guid documentId, int version, Guid userId, CancellationToken cancellationToken = default);
    
    // Document permissions
    Task<List<DocumentPermission>> GetDocumentPermissionsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<DocumentPermission> GrantPermissionAsync(Guid documentId, GrantPermissionRequest request, Guid grantedBy, CancellationToken cancellationToken = default);
    Task<bool> RevokePermissionAsync(Guid documentId, Guid permissionId, Guid revokedBy, CancellationToken cancellationToken = default);
    Task<bool> HasPermissionAsync(Guid documentId, Guid userId, PermissionType permission, CancellationToken cancellationToken = default);
    
    // Document sharing
    Task<ShareLink> CreateShareLinkAsync(Guid documentId, ShareLinkRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<Document?> GetDocumentByShareLinkAsync(string shareToken, CancellationToken cancellationToken = default);
    Task<bool> RevokeShareLinkAsync(Guid documentId, string shareToken, Guid userId, CancellationToken cancellationToken = default);
    
    // Document tags
    Task<List<DocumentTag>> GetDocumentTagsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<DocumentTag> AddTagAsync(Guid documentId, string tagName, string? category = null, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<bool> RemoveTagAsync(Guid documentId, Guid tagId, CancellationToken cancellationToken = default);
    Task<List<string>> GetPopularTagsAsync(Guid? tenantId = null, int count = 50, CancellationToken cancellationToken = default);
    
    // Document attachments
    Task<List<DocumentAttachment>> GetDocumentAttachmentsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<DocumentAttachment> AddAttachmentAsync(Guid documentId, AttachmentRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> RemoveAttachmentAsync(Guid documentId, Guid attachmentId, CancellationToken cancellationToken = default);
    Task<Stream> GetAttachmentStreamAsync(Guid attachmentId, CancellationToken cancellationToken = default);
    
    // Document export
    Task<Stream> ExportDocumentAsync(Guid documentId, ExportFormat format, CancellationToken cancellationToken = default);
    Task<Stream> ExportDocumentsAsync(List<Guid> documentIds, ExportFormat format, CancellationToken cancellationToken = default);
    
    // Document analytics
    Task<DocumentAnalytics> GetDocumentAnalyticsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<List<DocumentActivity>> GetDocumentActivityAsync(Guid documentId, int count = 50, CancellationToken cancellationToken = default);
    Task RecordDocumentViewAsync(Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    
    // Document templates
    Task<List<DocumentTemplate>> GetDocumentTemplatesAsync(string? industry = null, string? documentType = null, CancellationToken cancellationToken = default);
    Task<Document> CreateFromTemplateAsync(Guid templateId, CreateFromTemplateRequest request, Guid userId, CancellationToken cancellationToken = default);
    
    // Bulk operations
    Task<BulkOperationResult> BulkUpdateStatusAsync(List<Guid> documentIds, DocumentStatus status, Guid userId, CancellationToken cancellationToken = default);
    Task<BulkOperationResult> BulkDeleteAsync(List<Guid> documentIds, Guid userId, CancellationToken cancellationToken = default);
    Task<BulkOperationResult> BulkAddTagAsync(List<Guid> documentIds, string tagName, Guid userId, CancellationToken cancellationToken = default);
}

// Request/Response DTOs
public class CreateDocumentRequest
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required string DocumentType { get; set; }
    public required string Industry { get; set; }
    public List<string> Tags { get; set; } = new();
    public DocumentMetadata? Metadata { get; set; }
    public Guid? ParentDocumentId { get; set; }
    public List<AttachmentRequest> Attachments { get; set; } = new();
}

public class UpdateDocumentRequest
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? DocumentType { get; set; }
    public DocumentStatus? Status { get; set; }
    public List<string>? Tags { get; set; }
    public DocumentMetadata? Metadata { get; set; }
}

public class DocumentFilter
{
    public string? Search { get; set; }
    public string? DocumentType { get; set; }
    public string? Industry { get; set; }
    public DocumentStatus? Status { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public List<string> Tags { get; set; } = new();
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "UpdatedAt";
    public SortOrder SortOrder { get; set; } = SortOrder.Descending;
    public Guid? TenantId { get; set; }
}

public enum SortOrder
{
    Ascending,
    Descending
}

public class GrantPermissionRequest
{
    public Guid? UserId { get; set; }
    public Guid? RoleId { get; set; }
    public required PermissionType Permission { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class ShareLinkRequest
{
    public DateTime? ExpiresAt { get; set; }
    public string? Password { get; set; }
    public bool AllowDownload { get; set; } = false;
    public bool AllowPrint { get; set; } = false;
    public int? MaxViews { get; set; }
    public List<string> AllowedEmails { get; set; } = new();
}

public class ShareLink
{
    public required string Token { get; set; }
    public required string Url { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int ViewCount { get; set; }
    public int? MaxViews { get; set; }
    public bool IsActive { get; set; }
}

public class AttachmentRequest
{
    public required Stream FileStream { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public string? Description { get; set; }
    public AttachmentType Type { get; set; } = AttachmentType.File;
}

public enum ExportFormat
{
    Pdf,
    Word,
    Html,
    Markdown,
    Json,
    Zip
}

public class DocumentAnalytics
{
    public int ViewCount { get; set; }
    public int ShareCount { get; set; }
    public int DownloadCount { get; set; }
    public int CommentCount { get; set; }
    public int EditCount { get; set; }
    public DateTime? LastViewedAt { get; set; }
    public DateTime? LastEditedAt { get; set; }
    public List<UserActivity> TopViewers { get; set; } = new();
    public List<UserActivity> TopEditors { get; set; } = new();
    public Dictionary<string, int> ViewsByDay { get; set; } = new();
}

public class DocumentActivity
{
    public Guid Id { get; set; }
    public required string Action { get; set; }
    public DateTime Timestamp { get; set; }
    public required User User { get; set; }
    public string? Details { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class DocumentTemplate
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Content { get; set; }
    public required string DocumentType { get; set; }
    public required string Industry { get; set; }
    public List<TemplateVariable> Variables { get; set; } = new();
    public bool IsSystemTemplate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}


public class CreateFromTemplateRequest
{
    public required string Title { get; set; }
    public Dictionary<string, object> Variables { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}

public class BulkOperationResult
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public int TotalCount { get; set; }
    public List<BulkOperationError> Errors { get; set; } = new();
    public bool IsCompleted => SuccessCount + FailureCount == TotalCount;
    public double SuccessRate => TotalCount == 0 ? 0 : (double)SuccessCount / TotalCount;
}

public class BulkOperationError
{
    public Guid ItemId { get; set; }
    public required string Error { get; set; }
    public string? Details { get; set; }
}

