using EnterpriseDocsCore.API.DTOs;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for real-time collaboration services
/// </summary>
public interface ICollaborationService
{
    /// <summary>
    /// Get active users for a document
    /// </summary>
    Task<List<UserPresence>> GetActiveUsersAsync(Guid documentId);
    
    /// <summary>
    /// Add user to document collaboration session
    /// </summary>
    Task<bool> JoinDocumentAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Remove user from document collaboration session
    /// </summary>
    Task<bool> LeaveDocumentAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Update user presence information
    /// </summary>
    Task<bool> UpdatePresenceAsync(Guid documentId, UserPresence presence);
    
    /// <summary>
    /// Request lock on a document for editing
    /// </summary>
    Task<DocumentLockInfo?> RequestDocumentLockAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Release lock on a document
    /// </summary>
    Task<bool> ReleaseDocumentLockAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Get current lock status for a document
    /// </summary>
    Task<DocumentLockInfo?> GetDocumentLockAsync(Guid documentId);
    
    /// <summary>
    /// Store content change for synchronization
    /// </summary>
    Task<bool> StoreContentChangeAsync(Guid documentId, ContentChange change);
    
    /// <summary>
    /// Get content changes since a specific timestamp
    /// </summary>
    Task<List<ContentChange>> GetContentChangesSinceAsync(Guid documentId, DateTime since);
    
    /// <summary>
    /// Store document comment
    /// </summary>
    Task<bool> StoreCommentAsync(DocumentComment comment);
    
    /// <summary>
    /// Get comments for a document
    /// </summary>
    Task<List<DocumentComment>> GetDocumentCommentsAsync(Guid documentId);
    
    /// <summary>
    /// Apply operational transformation operation
    /// </summary>
    Task<DocumentOperationResponse> ApplyOperationAsync(Guid documentId, Guid userId, DocumentOperationRequest operation);
    
    /// <summary>
    /// Update cursor position for a user
    /// </summary>
    Task UpdateCursorPositionAsync(Guid documentId, Guid userId, CursorPosition cursorPosition);
    
    /// <summary>
    /// Update typing status for a user
    /// </summary>
    Task UpdateTypingStatusAsync(Guid documentId, Guid userId, bool isTyping);
}

/// <summary>
/// User presence information for real-time collaboration
/// </summary>
public class UserPresence
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "active"; // active, idle, away, typing
    public CursorPosition? CursorPosition { get; set; }
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    public string Color { get; set; } = "#000000"; // User color for UI
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Document lock information
/// </summary>
public class DocumentLockInfo
{
    public Guid DocumentId { get; set; }
    public Guid LockedBy { get; set; }
    public string LockedByName { get; set; } = string.Empty;
    public DateTime LockedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsActive => DateTime.UtcNow < ExpiresAt;
}

/// <summary>
/// Content change for real-time synchronization
/// </summary>
public class ContentChange
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty; // insert, delete, replace
    public int StartPosition { get; set; }
    public int EndPosition { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public int Version { get; set; } // For conflict resolution
}

/// <summary>
/// Document comment for collaboration
/// </summary>
public class DocumentComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsResolved { get; set; } = false;
    public Guid? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
}