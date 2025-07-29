using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Hubs;

/// <summary>
/// SignalR Hub for real-time document collaboration
/// </summary>
[Authorize]
public class DocumentHub : Hub
{
    private readonly ICollaborationService _collaborationService;
    private readonly ILogger<DocumentHub> _logger;

    public DocumentHub(ICollaborationService collaborationService, ILogger<DocumentHub> logger)
    {
        _collaborationService = collaborationService;
        _logger = logger;
    }

    /// <summary>
    /// Join a document collaboration session
    /// </summary>
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
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Authentication required");
                return;
            }

            // Add user to SignalR group for the document
            await Groups.AddToGroupAsync(Context.ConnectionId, documentId);
            
            // Update collaboration service
            await _collaborationService.JoinDocumentAsync(docId, userId.Value);
            
            // Get current active users
            var activeUsers = await _collaborationService.GetActiveUsersAsync(docId);
            
            // Notify all users in the document about the new user
            await Clients.Group(documentId).SendAsync("UserJoined", new
            {
                UserId = userId.Value,
                ConnectionId = Context.ConnectionId,
                ActiveUsers = activeUsers
            });

            // Get current document lock status
            var lockInfo = await _collaborationService.GetDocumentLockAsync(docId);
            await Clients.Caller.SendAsync("DocumentLockStatus", lockInfo);

            _logger.LogInformation("User {UserId} joined document {DocumentId}", userId, documentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to join document");
        }
    }

    /// <summary>
    /// Leave a document collaboration session
    /// </summary>
    public async Task LeaveDocument(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
                return;

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return;

            // Remove user from SignalR group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId);
            
            // Update collaboration service
            await _collaborationService.LeaveDocumentAsync(docId, userId.Value);
            
            // Get updated active users
            var activeUsers = await _collaborationService.GetActiveUsersAsync(docId);
            
            // Notify remaining users
            await Clients.Group(documentId).SendAsync("UserLeft", new
            {
                UserId = userId.Value,
                ConnectionId = Context.ConnectionId,
                ActiveUsers = activeUsers
            });

            _logger.LogInformation("User {UserId} left document {DocumentId}", userId, documentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Update user presence (cursor position, status)
    /// </summary>
    public async Task UpdatePresence(string documentId, int cursorPosition, string status = "active")
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
                return;

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return;

            var presence = new UserPresence
            {
                UserId = userId.Value,
                UserName = GetCurrentUserName(),
                Email = GetCurrentUserEmail(),
                Status = status,
                CursorPosition = cursorPosition,
                Color = GetUserColor(userId.Value)
            };

            await _collaborationService.UpdatePresenceAsync(docId, presence);

            // Notify other users in the document
            await Clients.OthersInGroup(documentId).SendAsync("PresenceUpdated", presence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating presence for document {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Send a content change for real-time synchronization
    /// </summary>
    public async Task SendContentChange(string documentId, string operation, int startPosition, int endPosition, string content, int version)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Authentication required");
                return;
            }

            var change = new ContentChange
            {
                DocumentId = docId,
                UserId = userId.Value,
                UserName = GetCurrentUserName(),
                Operation = operation,
                StartPosition = startPosition,
                EndPosition = endPosition,
                Content = content,
                Version = version
            };

            // Store the change
            await _collaborationService.StoreContentChangeAsync(docId, change);

            // Broadcast to other users (not the sender)
            await Clients.OthersInGroup(documentId).SendAsync("ContentChangeReceived", change);

            _logger.LogDebug("Content change sent for document {DocumentId} by user {UserId}", documentId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending content change for document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to send content change");
        }
    }

    /// <summary>
    /// Request an exclusive lock on the document for editing
    /// </summary>
    public async Task RequestDocumentLock(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Authentication required");
                return;
            }

            var lockInfo = await _collaborationService.RequestDocumentLockAsync(docId, userId.Value);
            
            if (lockInfo != null)
            {
                // Notify all users about the lock status
                await Clients.Group(documentId).SendAsync("DocumentLockStatusChanged", lockInfo);
                
                if (lockInfo.LockedBy == userId.Value)
                {
                    await Clients.Caller.SendAsync("DocumentLockGranted", lockInfo);
                }
                else
                {
                    await Clients.Caller.SendAsync("DocumentLockDenied", lockInfo);
                }
            }
            else
            {
                await Clients.Caller.SendAsync("Error", "Failed to process lock request");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting document lock for {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to request document lock");
        }
    }

    /// <summary>
    /// Release the document lock
    /// </summary>
    public async Task ReleaseDocumentLock(string documentId)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
                return;

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return;

            var success = await _collaborationService.ReleaseDocumentLockAsync(docId, userId.Value);
            
            if (success)
            {
                // Notify all users that the lock has been released
                await Clients.Group(documentId).SendAsync("DocumentLockReleased", new { DocumentId = documentId });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing document lock for {DocumentId}", documentId);
        }
    }

    /// <summary>
    /// Send a comment on the document
    /// </summary>
    public async Task SendComment(string documentId, string content, int position)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Authentication required");
                return;
            }

            var comment = new DocumentComment
            {
                DocumentId = docId,
                UserId = userId.Value,
                UserName = GetCurrentUserName(),
                Content = content,
                Position = position
            };

            await _collaborationService.StoreCommentAsync(comment);

            // Broadcast the comment to all users in the document
            await Clients.Group(documentId).SendAsync("CommentReceived", comment);

            _logger.LogDebug("Comment sent for document {DocumentId} by user {UserId}", documentId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending comment for document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to send comment");
        }
    }

    /// <summary>
    /// Get recent content changes since a specific timestamp
    /// </summary>
    public async Task GetContentChangesSince(string documentId, DateTime since)
    {
        try
        {
            if (!Guid.TryParse(documentId, out var docId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid document ID");
                return;
            }

            var changes = await _collaborationService.GetContentChangesSinceAsync(docId, since);
            await Clients.Caller.SendAsync("ContentChangesHistory", changes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content changes for document {DocumentId}", documentId);
            await Clients.Caller.SendAsync("Error", "Failed to get content changes");
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
            if (userId.HasValue)
            {
                // Note: In a production system, you would track which documents the user was in
                // and notify those groups about the disconnection
                _logger.LogInformation("User {UserId} disconnected from SignalR", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling user disconnection");
        }

        await base.OnDisconnectedAsync(exception);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }

    private string GetCurrentUserName()
    {
        return Context.User?.FindFirst("FullName")?.Value ?? 
               Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? 
               "Unknown User";
    }

    private string GetCurrentUserEmail()
    {
        return Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "unknown@example.com";
    }

    private static string GetUserColor(Guid userId)
    {
        // Generate a consistent color based on user ID
        var hash = userId.GetHashCode();
        var colors = new[]
        {
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
            "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43",
            "#FD79A8", "#FDCB6E", "#6C5CE7", "#74B9FF", "#00B894"
        };
        
        return colors[Math.Abs(hash) % colors.Length];
    }
}