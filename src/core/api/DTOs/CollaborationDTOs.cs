using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

// User presence and collaboration DTOs
public record UserPresence
{
    public string UserId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty; // Online, Away, Idle
    public DateTime LastSeen { get; init; }
    public string? Avatar { get; init; }
    public CursorPosition? CursorPosition { get; init; }
}

public record CursorPosition
{
    public int Line { get; init; }
    public int Column { get; init; }
    public string Color { get; init; } = string.Empty;
}

public record DocumentLockInfo
{
    public string DocumentId { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public DateTime LockedAt { get; init; }
    public DateTime ExpiresAt { get; init; }
    public string LockType { get; init; } = string.Empty; // Exclusive, Shared
}

public record ContentChange
{
    public string Id { get; init; } = string.Empty;
    public string DocumentId { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string OperationType { get; init; } = string.Empty; // Insert, Delete, Replace
    public int Position { get; init; }
    public string Content { get; init; } = string.Empty;
    public string? PreviousContent { get; init; }
}

public record DocumentComment
{
    public string Id { get; init; } = string.Empty;
    public string DocumentId { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public int? LineNumber { get; init; }
    public bool IsResolved { get; init; }
}

public record DocumentOperationRequest
{
    public string DocumentId { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public string Operation { get; init; } = string.Empty; // insert, delete, replace
    public int Position { get; init; }
    public string Content { get; init; } = string.Empty;
    public int Length { get; init; }
    public string? Metadata { get; init; }
}

public record DocumentOperationResponse
{
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }
    public ContentChange? AppliedChange { get; init; }
    public List<ContentChange> ConflictingChanges { get; init; } = new();
}

// Request DTOs for API endpoints
public record UpdatePresenceRequest
{
    [Required]
    public string Status { get; init; } = string.Empty;
    public CursorPosition? CursorPosition { get; init; }
}

public record RequestLockRequest
{
    [Required]
    public string DocumentId { get; init; } = string.Empty;
    public string LockType { get; init; } = "Exclusive";
}

public record ApplyOperationRequest : DocumentOperationRequest
{
    [Required]
    public override string Operation { get; init; } = string.Empty;
}

public record AddCommentRequest
{
    [Required]
    public string DocumentId { get; init; } = string.Empty;
    [Required]
    public string Content { get; init; } = string.Empty;
    public int? LineNumber { get; init; }
}