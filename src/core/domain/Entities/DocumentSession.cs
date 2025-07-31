using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents an active collaborative editing session for a document
/// </summary>
public class DocumentSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string ConnectionId { get; set; } = string.Empty;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Current cursor position in the document (JSON serialized)
    /// </summary>
    public string? CursorPosition { get; set; }
    
    /// <summary>
    /// User's current selection range (JSON serialized)
    /// </summary>
    public string? SelectionRange { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// User's current editing mode/status
    /// </summary>
    public CollaborationStatus Status { get; set; } = CollaborationStatus.Active;
    
    /// <summary>
    /// Additional session metadata (JSON)
    /// </summary>
    public string? SessionData { get; set; }
}

public enum CollaborationStatus
{
    Active,
    Idle,
    Away,
    Disconnected,
    Typing
}