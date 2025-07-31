using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents an operational transformation operation for real-time collaborative editing
/// </summary>
public class DocumentOperation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    /// <summary>
    /// Document version when this operation was created
    /// </summary>
    public int Version { get; set; }
    
    /// <summary>
    /// Operation type (insert, delete, retain, format)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string OperationType { get; set; } = string.Empty;
    
    /// <summary>
    /// Position in the document where the operation applies
    /// </summary>
    public int Position { get; set; }
    
    /// <summary>
    /// Length of the operation (for delete/retain operations)
    /// </summary>
    public int? Length { get; set; }
    
    /// <summary>
    /// Content being inserted (for insert operations)
    /// </summary>
    public string? Content { get; set; }
    
    /// <summary>
    /// Formatting attributes (JSON serialized)
    /// </summary>
    public string? Attributes { get; set; }
    
    /// <summary>
    /// Complete operation data (JSON serialized for complex operations)
    /// </summary>
    public string? OperationData { get; set; }
    
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Whether this operation has been successfully applied to the document
    /// </summary>
    public bool IsApplied { get; set; } = false;
    
    /// <summary>
    /// Whether this operation was the result of conflict resolution
    /// </summary>
    public bool IsTransformed { get; set; } = false;
    
    /// <summary>
    /// Original operation ID if this was transformed
    /// </summary>
    public Guid? OriginalOperationId { get; set; }
    
    /// <summary>
    /// Sequence number for ordering operations
    /// </summary>
    public long SequenceNumber { get; set; }
}

/// <summary>
/// Represents a comment or annotation on a document
/// </summary>
public class DocumentComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// Position in the document where the comment is anchored
    /// </summary>
    public int? AnchorPosition { get; set; }
    
    /// <summary>
    /// Length of text the comment refers to
    /// </summary>
    public int? AnchorLength { get; set; }
    
    /// <summary>
    /// Selected text that the comment refers to
    /// </summary>
    public string? AnchoredText { get; set; }
    
    /// <summary>
    /// Parent comment ID for threaded discussions
    /// </summary>
    public Guid? ParentCommentId { get; set; }
    public DocumentComment? ParentComment { get; set; }
    
    /// <summary>
    /// Child comments (replies)
    /// </summary>
    public List<DocumentComment> Replies { get; set; } = new();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Whether the comment has been resolved
    /// </summary>
    public bool IsResolved { get; set; } = false;
    
    /// <summary>
    /// User who resolved the comment
    /// </summary>
    public Guid? ResolvedBy { get; set; }
    public User? ResolvedByUser { get; set; }
    
    public DateTime? ResolvedAt { get; set; }
    
    /// <summary>
    /// Comment type (comment, suggestion, issue, etc.)
    /// </summary>
    public CommentType Type { get; set; } = CommentType.Comment;
}

public enum CommentType
{
    Comment,
    Suggestion,
    Issue,
    Question,
    Approval,
    Rejection
}