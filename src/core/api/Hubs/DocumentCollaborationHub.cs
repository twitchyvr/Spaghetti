using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Hubs;

/// <summary>
/// SignalR hub for real-time document collaboration
/// </summary>
[Authorize]
public class DocumentCollaborationHub : Hub
{
    private readonly ICollaborationService _collaborationService;
    private readonly ILogger<DocumentCollaborationHub> _logger;

    public DocumentCollaborationHub(
        ICollaborationService collaborationService,
        ILogger<DocumentCollaborationHub> logger)
    {
        _collaborationService = collaborationService;
        _logger = logger;
    }

    /// <summary>
    /// Join a document editing session
    /// </summary>
    /// <param name="documentId">Document ID to join</param>
    public async Task JoinDocument(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            _logger.LogInformation("User {UserId} ({UserName}) joining document {DocumentId}", 
                userId, userName, docId);

            // Add user to document group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"document_{documentId}");

            // Register user in collaboration service
            var success = await _collaborationService.JoinDocumentAsync(docId, userId);
            
            if (success)
            {
                // Notify other users in the document
                await Clients.OthersInGroup($"document_{documentId}")
                    .SendAsync("UserJoined", new
                    {
                        UserId = userId,
                        UserName = userName,
                        ConnectionId = Context.ConnectionId,
                        JoinedAt = DateTime.UtcNow
                    });

                // Send current active users to the joining user
                var activeUsers = await _collaborationService.GetActiveUsersAsync(docId);
                await Clients.Caller.SendAsync("ActiveUsers", activeUsers);

                // Send current lock status
                var lockInfo = await _collaborationService.GetDocumentLockAsync(docId);
                await Clients.Caller.SendAsync("LockStatus", lockInfo);

                _logger.LogInformation("User {UserId} successfully joined document {DocumentId}", 
                    userId, docId);
            }
            else
            {
                await Clients.Caller.SendAsync("Error", "Failed to join document session");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to join document");
        }
    }

    /// <summary>
    /// Leave a document editing session
    /// </summary>
    /// <param name="documentId">Document ID to leave</param>
    public async Task LeaveDocument(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            _logger.LogInformation("User {UserId} ({UserName}) leaving document {DocumentId}", 
                userId, userName, docId);

            // Remove user from document group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"document_{documentId}");

            // Unregister user from collaboration service
            await _collaborationService.LeaveDocumentAsync(docId, userId);

            // Release any locks held by this user
            await _collaborationService.ReleaseDocumentLockAsync(docId, userId);

            // Notify other users
            await Clients.OthersInGroup($"document_{documentId}")
                .SendAsync("UserLeft", new
                {
                    UserId = userId,
                    UserName = userName,
                    LeftAt = DateTime.UtcNow
                });

            _logger.LogInformation("User {UserId} successfully left document {DocumentId}", 
                userId, docId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Request exclusive lock on a document for editing
    /// </summary>
    /// <param name="documentId">Document ID to lock</param>
    public async Task RequestLock(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            _logger.LogInformation("User {UserId} requesting lock on document {DocumentId}", 
                userId, docId);

            var lockInfo = await _collaborationService.RequestDocumentLockAsync(docId, userId);
            
            if (lockInfo != null)
            {
                // Notify all users about the lock
                await Clients.Group($"document_{documentId}")
                    .SendAsync("DocumentLocked", lockInfo);

                _logger.LogInformation("Lock granted to user {UserId} on document {DocumentId}", 
                    userId, docId);
            }
            else
            {
                // Lock request failed - document might already be locked
                var currentLock = await _collaborationService.GetDocumentLockAsync(docId);
                await Clients.Caller.SendAsync("LockRequestFailed", new
                {
                    Error = "Document is already locked by another user",
                    CurrentLock = currentLock
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting lock on document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to request document lock");
        }
    }

    /// <summary>
    /// Release lock on a document
    /// </summary>
    /// <param name="documentId">Document ID to unlock</param>
    public async Task ReleaseLock(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            
            _logger.LogInformation("User {UserId} releasing lock on document {DocumentId}", 
                userId, docId);

            var success = await _collaborationService.ReleaseDocumentLockAsync(docId, userId);
            
            if (success)
            {
                // Notify all users about the lock release
                await Clients.Group($"document_{documentId}")
                    .SendAsync("DocumentUnlocked", new
                    {
                        DocumentId = docId,
                        ReleasedBy = userId,
                        ReleasedAt = DateTime.UtcNow
                    });

                _logger.LogInformation("Lock released by user {UserId} on document {DocumentId}", 
                    userId, docId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock on document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Update user presence information
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="presence">Presence information</param>
    public async Task UpdatePresence(string documentId, UserPresence presence)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            presence.UserId = userId;
            presence.LastSeen = DateTime.UtcNow;
            
            // Update presence in collaboration service
            await _collaborationService.UpdatePresenceAsync(docId, presence);

            // Notify other users about presence update
            await Clients.OthersInGroup($"document_{documentId}")
                .SendAsync("PresenceUpdate", presence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating presence for document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Apply operational transformation operation to document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="operation">OT operation to apply</param>
    public async Task ApplyOperation(string documentId, DocumentOperationRequest operation)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            _logger.LogDebug("User {UserId} applying operation to document {DocumentId}: {OperationType} at position {Position}", 
                userId, docId, operation.OperationType, operation.Position);

            // Apply operation through collaboration service (handles OT)
            var result = await _collaborationService.ApplyOperationAsync(docId, userId, operation);
            
            if (result.Success)
            {
                // Broadcast the transformed operation to other users
                await Clients.OthersInGroup($"document_{documentId}")
                    .SendAsync("OperationApplied", new
                    {
                        UserId = userId,
                        UserName = userName,
                        Operation = result.TransformedOperation,
                        Version = result.DocumentVersion,
                        Timestamp = DateTime.UtcNow
                    });

                // Send acknowledgment to the sender
                await Clients.Caller.SendAsync("OperationAcknowledged", new
                {
                    OperationId = operation.Id,
                    Version = result.DocumentVersion,
                    Success = true
                });

                _logger.LogDebug("Operation successfully applied and broadcasted for document {DocumentId}", docId);
            }
            else
            {
                // Operation failed - send error to sender
                await Clients.Caller.SendAsync("OperationRejected", new
                {
                    OperationId = operation.Id,
                    Error = result.ErrorMessage,
                    RequiredVersion = result.RequiredVersion
                });

                _logger.LogWarning("Operation rejected for document {DocumentId}: {Error}", docId, result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying operation to document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to apply operation");
        }
    }

    /// <summary>
    /// Update cursor position for real-time collaboration
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="cursorPosition">Cursor position data</param>
    public async Task UpdateCursor(string documentId, CursorPosition cursorPosition)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            // Update cursor position in collaboration service
            await _collaborationService.UpdateCursorPositionAsync(docId, userId, cursorPosition);

            // Broadcast cursor position to other users
            await Clients.OthersInGroup($"document_{documentId}")
                .SendAsync("CursorUpdate", new
                {
                    UserId = userId,
                    UserName = userName,
                    Position = cursorPosition.Position,
                    SelectionStart = cursorPosition.SelectionStart,
                    SelectionEnd = cursorPosition.SelectionEnd,
                    Timestamp = DateTime.UtcNow
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cursor position for document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Send typing indicator to other users
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="isTyping">Whether user is currently typing</param>
    public async Task UpdateTypingStatus(string documentId, bool isTyping)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            // Update typing status in collaboration service
            await _collaborationService.UpdateTypingStatusAsync(docId, userId, isTyping);

            // Broadcast typing status to other users
            await Clients.OthersInGroup($"document_{documentId}")
                .SendAsync("TypingStatusUpdate", new
                {
                    UserId = userId,
                    UserName = userName,
                    IsTyping = isTyping,
                    Timestamp = DateTime.UtcNow
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating typing status for document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Send a comment on the document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="comment">Comment details</param>
    public async Task SendComment(string documentId, DocumentComment comment)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                return;
            }

            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            // Set comment metadata
            comment.DocumentId = docId;
            comment.UserId = userId;
            comment.UserName = userName;
            comment.CreatedAt = DateTime.UtcNow;

            // Store the comment
            await _collaborationService.StoreCommentAsync(comment);

            // Broadcast comment to all users in the document
            await Clients.Group($"document_{documentId}")
                .SendAsync("NewComment", comment);

            _logger.LogInformation("Comment added to document {DocumentId} by user {UserId}", 
                docId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment to document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Handle user disconnection
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            
            _logger.LogInformation("User {UserId} ({UserName}) disconnected from collaboration hub", 
                userId, userName);

            // The user might be in multiple document groups, but we don't have a way to track which ones
            // In a production system, you would maintain a mapping of ConnectionId to DocumentIds
            
            // For now, we'll rely on the collaboration service to handle cleanup
            // based on user inactivity timeouts
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling user disconnection");
        }

        await base.OnDisconnectedAsync(exception);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    private string GetCurrentUserName()
    {
        return Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";
    }
}