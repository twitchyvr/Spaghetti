using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Controllers;

/// <summary>
/// Controller for real-time document collaboration features
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CollaborationController : ControllerBase
{
    private readonly ICollaborationService _collaborationService;
    private readonly ILogger<CollaborationController> _logger;

    public CollaborationController(
        ICollaborationService collaborationService,
        ILogger<CollaborationController> logger)
    {
        _collaborationService = collaborationService;
        _logger = logger;
    }

    /// <summary>
    /// Get active users currently editing a document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <returns>List of active users with presence information</returns>
    /// <response code="200">Active users retrieved successfully</response>
    /// <response code="404">Document not found</response>
    [HttpGet("document/{documentId}/users")]
    [ProducesResponseType(typeof(List<UserPresence>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<UserPresence>>> GetActiveUsers(Guid documentId)
    {
        try
        {
            _logger.LogDebug("Getting active users for document {DocumentId}", documentId);

            var activeUsers = await _collaborationService.GetActiveUsersAsync(documentId);
            return Ok(activeUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active users for document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to get active users", details = ex.Message });
        }
    }

    /// <summary>
    /// Get current lock status for a document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <returns>Document lock information</returns>
    /// <response code="200">Lock status retrieved successfully</response>
    /// <response code="404">Document not found</response>
    [HttpGet("document/{documentId}/lock")]
    [ProducesResponseType(typeof(DocumentLockInfo), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DocumentLockInfo?>> GetLockStatus(Guid documentId)
    {
        try
        {
            _logger.LogDebug("Getting lock status for document {DocumentId}", documentId);

            var lockInfo = await _collaborationService.GetDocumentLockAsync(documentId);
            
            if (lockInfo == null)
            {
                return Ok(null); // Document is not locked
            }

            return Ok(lockInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lock status for document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to get lock status", details = ex.Message });
        }
    }

    /// <summary>
    /// Request exclusive lock on a document for editing
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <returns>Lock information if successful</returns>
    /// <response code="200">Lock acquired successfully</response>
    /// <response code="409">Document is already locked by another user</response>
    /// <response code="403">User doesn't have permission to lock document</response>
    [HttpPost("document/{documentId}/lock")]
    [ProducesResponseType(typeof(DocumentLockInfo), 200)]
    [ProducesResponseType(409)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<DocumentLockInfo>> RequestLock(Guid documentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            
            _logger.LogInformation("User {UserId} requesting lock on document {DocumentId}", 
                userId, documentId);

            var lockInfo = await _collaborationService.RequestDocumentLockAsync(documentId, userId);
            
            if (lockInfo == null)
            {
                return Conflict(new { error = "Document is already locked by another user" });
            }

            _logger.LogInformation("Lock acquired by user {UserId} on document {DocumentId}", 
                userId, documentId);

            return Ok(lockInfo);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("User {UserId} doesn't have permission to lock document {DocumentId}: {Error}", 
                GetCurrentUserId(), documentId, ex.Message);
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting lock on document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to acquire document lock", details = ex.Message });
        }
    }

    /// <summary>
    /// Release lock on a document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <returns>Success status</returns>
    /// <response code="200">Lock released successfully</response>
    /// <response code="404">Document not found or not locked</response>
    /// <response code="403">User doesn't own the lock</response>
    [HttpDelete("document/{documentId}/lock")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> ReleaseLock(Guid documentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            
            _logger.LogInformation("User {UserId} releasing lock on document {DocumentId}", 
                userId, documentId);

            var success = await _collaborationService.ReleaseDocumentLockAsync(documentId, userId);
            
            if (!success)
            {
                return NotFound(new { error = "Document is not locked or lock not found" });
            }

            _logger.LogInformation("Lock released by user {UserId} on document {DocumentId}", 
                userId, documentId);

            return Ok(new { message = "Document lock released successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("User {UserId} attempted to release lock they don't own on document {DocumentId}: {Error}", 
                GetCurrentUserId(), documentId, ex.Message);
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock on document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to release document lock", details = ex.Message });
        }
    }

    /// <summary>
    /// Get content changes since a specific timestamp for synchronization
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="since">Timestamp to get changes since</param>
    /// <returns>List of content changes</returns>
    /// <response code="200">Changes retrieved successfully</response>
    /// <response code="400">Invalid timestamp parameter</response>
    [HttpGet("document/{documentId}/changes")]
    [ProducesResponseType(typeof(List<ContentChange>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<ContentChange>>> GetContentChangesSince(
        Guid documentId,
        [FromQuery] DateTime since)
    {
        try
        {
            if (since == default)
            {
                return BadRequest(new { error = "Valid 'since' timestamp is required" });
            }

            _logger.LogDebug("Getting content changes for document {DocumentId} since {Since}", 
                documentId, since);

            var changes = await _collaborationService.GetContentChangesSinceAsync(documentId, since);
            return Ok(changes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content changes for document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to get content changes", details = ex.Message });
        }
    }

    /// <summary>
    /// Store a content change for real-time synchronization
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="change">Content change details</param>
    /// <returns>Success status</returns>
    /// <response code="200">Change stored successfully</response>
    /// <response code="400">Invalid change data</response>
    [HttpPost("document/{documentId}/changes")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> StoreContentChange(
        Guid documentId,
        [FromBody] ContentChange change)
    {
        try
        {
            if (change == null)
            {
                return BadRequest(new { error = "Content change data is required" });
            }

            // Ensure the change is for the correct document
            change.DocumentId = documentId;
            change.UserId = GetCurrentUserId();
            change.Timestamp = DateTime.UtcNow;

            _logger.LogDebug("Storing content change for document {DocumentId} by user {UserId}", 
                documentId, change.UserId);

            var success = await _collaborationService.StoreContentChangeAsync(documentId, change);
            
            if (!success)
            {
                return StatusCode(500, new { error = "Failed to store content change" });
            }

            return Ok(new { message = "Content change stored successfully", changeId = change.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error storing content change for document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to store content change", details = ex.Message });
        }
    }

    /// <summary>
    /// Get comments for a document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <returns>List of document comments</returns>
    /// <response code="200">Comments retrieved successfully</response>
    [HttpGet("document/{documentId}/comments")]
    [ProducesResponseType(typeof(List<DocumentComment>), 200)]
    public async Task<ActionResult<List<DocumentComment>>> GetDocumentComments(Guid documentId)
    {
        try
        {
            _logger.LogDebug("Getting comments for document {DocumentId}", documentId);

            var comments = await _collaborationService.GetDocumentCommentsAsync(documentId);
            return Ok(comments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting comments for document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to get document comments", details = ex.Message });
        }
    }

    /// <summary>
    /// Add a comment to a document
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="comment">Comment content and position</param>
    /// <returns>Success status</returns>
    /// <response code="201">Comment added successfully</response>
    /// <response code="400">Invalid comment data</response>
    [HttpPost("document/{documentId}/comments")]
    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddComment(
        Guid documentId,
        [FromBody] DocumentComment comment)
    {
        try
        {
            if (comment == null || string.IsNullOrWhiteSpace(comment.Content))
            {
                return BadRequest(new { error = "Comment content is required" });
            }

            // Set comment metadata
            comment.DocumentId = documentId;
            comment.UserId = GetCurrentUserId();
            comment.CreatedAt = DateTime.UtcNow;

            _logger.LogInformation("Adding comment to document {DocumentId} by user {UserId}", 
                documentId, comment.UserId);

            var success = await _collaborationService.StoreCommentAsync(comment);
            
            if (!success)
            {
                return StatusCode(500, new { error = "Failed to add comment" });
            }

            return Created($"api/collaboration/document/{documentId}/comments", 
                new { message = "Comment added successfully", commentId = comment.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment to document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to add comment", details = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}