// DTOs will be referenced as object types to avoid circular dependencies

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for real-time collaboration services
/// </summary>
public interface ICollaborationService
{
    /// <summary>
    /// Get active users for a document
    /// </summary>
    Task<List<object>> GetActiveUsersAsync(Guid documentId);
    
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
    Task<bool> UpdatePresenceAsync(Guid documentId, object presence);
    
    /// <summary>
    /// Request lock on a document for editing
    /// </summary>
    Task<object?> RequestDocumentLockAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Release lock on a document
    /// </summary>
    Task<bool> ReleaseDocumentLockAsync(Guid documentId, Guid userId);
    
    /// <summary>
    /// Get current lock status for a document
    /// </summary>
    Task<object?> GetDocumentLockAsync(Guid documentId);
    
    /// <summary>
    /// Store content change for synchronization
    /// </summary>
    Task<bool> StoreContentChangeAsync(Guid documentId, object change);
    
    /// <summary>
    /// Get content changes since a specific timestamp
    /// </summary>
    Task<List<object>> GetContentChangesSinceAsync(Guid documentId, DateTime since);
    
    /// <summary>
    /// Store document comment
    /// </summary>
    Task<bool> StoreCommentAsync(object comment);
    
    /// <summary>
    /// Get comments for a document
    /// </summary>
    Task<List<object>> GetDocumentCommentsAsync(Guid documentId);
    
    /// <summary>
    /// Apply operational transformation operation
    /// </summary>
    Task<object> ApplyOperationAsync(Guid documentId, Guid userId, object operation);
    
    /// <summary>
    /// Update cursor position for a user
    /// </summary>
    Task UpdateCursorPositionAsync(Guid documentId, Guid userId, object cursorPosition);
    
    /// <summary>
    /// Update typing status for a user
    /// </summary>
    Task UpdateTypingStatusAsync(Guid documentId, Guid userId, bool isTyping);
}

// User presence and related DTOs are defined in separate files to avoid circular dependencies

// DocumentLockInfo, ContentChange, DocumentComment, and other DTOs are defined in separate files