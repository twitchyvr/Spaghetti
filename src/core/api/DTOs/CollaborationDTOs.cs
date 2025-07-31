using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

/// <summary>
/// Request for applying an operational transformation operation
/// </summary>
public class DocumentOperationRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string OperationType { get; set; } = string.Empty; // insert, delete, retain, format
    
    public int Position { get; set; }
    
    public int? Length { get; set; }
    
    public string? Content { get; set; }
    
    public Dictionary<string, object>? Attributes { get; set; }
    
    public int Version { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Response after applying an operational transformation operation
/// </summary>
public class DocumentOperationResponse
{
    public bool Success { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public DocumentOperationRequest? TransformedOperation { get; set; }
    
    public int DocumentVersion { get; set; }
    
    public int? RequiredVersion { get; set; }
    
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// User presence information for real-time collaboration
/// </summary>
public class UserPresence
{
    public Guid UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public string Status { get; set; } = "active"; // active, idle, away, typing
    
    public CursorPosition? CursorPosition { get; set; }
    
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Cursor position information
/// </summary>
public class CursorPosition
{
    public int Position { get; set; }
    
    public int? SelectionStart { get; set; }
    
    public int? SelectionEnd { get; set; }
    
    public Dictionary<string, object>? Attributes { get; set; }
}

/// <summary>
/// Document lock information
/// </summary>
public class DocumentLockInfo
{
    public Guid DocumentId { get; set; }
    
    public bool IsLocked { get; set; }
    
    public Guid? LockedBy { get; set; }
    
    public string? LockedByUserName { get; set; }
    
    public DateTime? LockedAt { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    public string? LockType { get; set; } // exclusive, shared
}

/// <summary>
/// Document comment for real-time collaboration
/// </summary>
public class DocumentCommentDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid DocumentId { get; set; }
    
    public Guid UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public int? AnchorPosition { get; set; }
    
    public int? AnchorLength { get; set; }
    
    public string? AnchoredText { get; set; }
    
    public Guid? ParentCommentId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsResolved { get; set; } = false;
    
    public Guid? ResolvedBy { get; set; }
    
    public string? ResolvedByUserName { get; set; }
    
    public DateTime? ResolvedAt { get; set; }
    
    public string Type { get; set; } = "comment"; // comment, suggestion, issue, question
    
    public List<DocumentCommentDto> Replies { get; set; } = new();
}

/// <summary>
/// Content change for real-time collaboration
/// </summary>
public class ContentChange
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid DocumentId { get; set; }
    
    public Guid UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public string ChangeType { get; set; } = string.Empty; // insert, delete, update, format
    
    public int Position { get; set; }
    
    public int? Length { get; set; }
    
    public string? OldContent { get; set; }
    
    public string? NewContent { get; set; }
    
    public Dictionary<string, object>? Attributes { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public int Version { get; set; }
}

/// <summary>
/// Request to join a document collaboration session
/// </summary>
public class JoinDocumentRequest
{
    [Required]
    public Guid DocumentId { get; set; }
    
    public string? LastKnownVersion { get; set; }
    
    public Dictionary<string, object>? ClientInfo { get; set; }
}

/// <summary>
/// Response when joining a document collaboration session
/// </summary>
public class JoinDocumentResponse
{
    public bool Success { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public int CurrentVersion { get; set; }
    
    public List<UserPresence> ActiveUsers { get; set; } = new();
    
    public DocumentLockInfo? LockInfo { get; set; }
    
    public List<DocumentOperationRequest> PendingOperations { get; set; } = new();
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}