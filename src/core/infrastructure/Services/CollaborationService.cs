using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Redis-backed implementation of ICollaborationService for real-time collaboration
/// </summary>
public class CollaborationService : ICollaborationService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CollaborationService> _logger;
    private readonly TimeSpan _lockTimeout = TimeSpan.FromMinutes(30);
    private readonly TimeSpan _presenceTimeout = TimeSpan.FromMinutes(5);

    public CollaborationService(IDistributedCache cache, ILogger<CollaborationService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<UserPresence>> GetActiveUsersAsync(Guid documentId)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            
            if (string.IsNullOrEmpty(cachedData))
                return new List<UserPresence>();

            var presenceMap = JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData);
            if (presenceMap == null)
                return new List<UserPresence>();

            // Filter out stale presence data
            var cutoffTime = DateTime.UtcNow.Subtract(_presenceTimeout);
            var activeUsers = presenceMap.Values
                .Where(p => p.LastSeen > cutoffTime)
                .ToList();

            // Clean up stale entries
            var staleUserIds = presenceMap.Values
                .Where(p => p.LastSeen <= cutoffTime)
                .Select(p => p.UserId.ToString())
                .ToList();

            if (staleUserIds.Any())
            {
                foreach (var userId in staleUserIds)
                {
                    presenceMap.Remove(userId);
                }
                await UpdatePresenceMapAsync(documentId, presenceMap);
            }

            return activeUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active users for document {DocumentId}", documentId);
            return new List<UserPresence>();
        }
    }

    public async Task<bool> JoinDocumentAsync(Guid documentId, Guid userId)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            var presenceMap = string.IsNullOrEmpty(cachedData) 
                ? new Dictionary<string, UserPresence>() 
                : JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData) ?? new Dictionary<string, UserPresence>();

            // Note: In a real implementation, you would fetch user details from the database
            var presence = new UserPresence
            {
                UserId = userId,
                UserName = $"User_{userId:N}"[..8], // Simplified for demo
                Email = $"user{userId:N}"[..8] + "@example.com",
                Status = "active",
                CursorPosition = 0,
                LastSeen = DateTime.UtcNow,
                Color = GenerateUserColor(userId)
            };

            presenceMap[userId.ToString()] = presence;
            await UpdatePresenceMapAsync(documentId, presenceMap);

            _logger.LogDebug("User {UserId} joined document {DocumentId}", userId, documentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user {UserId} to document {DocumentId}", userId, documentId);
            return false;
        }
    }

    public async Task<bool> LeaveDocumentAsync(Guid documentId, Guid userId)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            
            if (string.IsNullOrEmpty(cachedData))
                return true; // User wasn't in the document anyway

            var presenceMap = JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData);
            if (presenceMap == null)
                return true;

            presenceMap.Remove(userId.ToString());
            await UpdatePresenceMapAsync(documentId, presenceMap);

            _logger.LogDebug("User {UserId} left document {DocumentId}", userId, documentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from document {DocumentId}", userId, documentId);
            return false;
        }
    }

    public async Task<bool> UpdatePresenceAsync(Guid documentId, UserPresence presence)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            var presenceMap = string.IsNullOrEmpty(cachedData) 
                ? new Dictionary<string, UserPresence>() 
                : JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData) ?? new Dictionary<string, UserPresence>();

            presence.LastSeen = DateTime.UtcNow;
            presenceMap[presence.UserId.ToString()] = presence;
            await UpdatePresenceMapAsync(documentId, presenceMap);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating presence for user {UserId} in document {DocumentId}", 
                presence.UserId, documentId);
            return false;
        }
    }

    public async Task<DocumentLockInfo?> RequestDocumentLockAsync(Guid documentId, Guid userId)
    {
        try
        {
            var lockKey = GetLockCacheKey(documentId);
            var existingLockData = await _cache.GetStringAsync(lockKey);
            
            if (!string.IsNullOrEmpty(existingLockData))
            {
                var existingLock = JsonSerializer.Deserialize<DocumentLockInfo>(existingLockData);
                if (existingLock != null && existingLock.IsActive)
                {
                    // Lock is already held by someone else
                    if (existingLock.LockedBy != userId)
                    {
                        _logger.LogWarning("Document {DocumentId} is already locked by user {LockedBy}", 
                            documentId, existingLock.LockedBy);
                        return existingLock;
                    }
                    
                    // Extend the lock for the same user
                    existingLock.ExpiresAt = DateTime.UtcNow.Add(_lockTimeout);
                    await UpdateDocumentLockAsync(documentId, existingLock);
                    return existingLock;
                }
            }

            // Create new lock
            var newLock = new DocumentLockInfo
            {
                DocumentId = documentId,
                LockedBy = userId,
                LockedByName = $"User_{userId:N}"[..8], // Simplified for demo
                LockedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(_lockTimeout)
            };

            await UpdateDocumentLockAsync(documentId, newLock);
            
            _logger.LogInformation("Document {DocumentId} locked by user {UserId}", documentId, userId);
            return newLock;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting lock for document {DocumentId} by user {UserId}", 
                documentId, userId);
            return null;
        }
    }

    public async Task<bool> ReleaseDocumentLockAsync(Guid documentId, Guid userId)
    {
        try
        {
            var lockKey = GetLockCacheKey(documentId);
            var existingLockData = await _cache.GetStringAsync(lockKey);
            
            if (string.IsNullOrEmpty(existingLockData))
                return true; // No lock to release

            var existingLock = JsonSerializer.Deserialize<DocumentLockInfo>(existingLockData);
            if (existingLock == null || existingLock.LockedBy != userId)
            {
                _logger.LogWarning("User {UserId} attempted to release lock on document {DocumentId} but doesn't own it", 
                    userId, documentId);
                return false;
            }

            await _cache.RemoveAsync(lockKey);
            
            _logger.LogInformation("Document {DocumentId} lock released by user {UserId}", documentId, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing lock for document {DocumentId} by user {UserId}", 
                documentId, userId);
            return false;
        }
    }

    public async Task<DocumentLockInfo?> GetDocumentLockAsync(Guid documentId)
    {
        try
        {
            var lockKey = GetLockCacheKey(documentId);
            var lockData = await _cache.GetStringAsync(lockKey);
            
            if (string.IsNullOrEmpty(lockData))
                return null;

            var lockInfo = JsonSerializer.Deserialize<DocumentLockInfo>(lockData);
            
            // Clean up expired locks
            if (lockInfo != null && !lockInfo.IsActive)
            {
                await _cache.RemoveAsync(lockKey);
                return null;
            }

            return lockInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lock info for document {DocumentId}", documentId);
            return null;
        }
    }

    public async Task<bool> StoreContentChangeAsync(Guid documentId, ContentChange change)
    {
        try
        {
            var changesKey = GetContentChangesCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(changesKey);
            var changes = string.IsNullOrEmpty(cachedData) 
                ? new List<ContentChange>() 
                : JsonSerializer.Deserialize<List<ContentChange>>(cachedData) ?? new List<ContentChange>();

            changes.Add(change);
            
            // Keep only recent changes (last 1000 or last hour)
            var cutoffTime = DateTime.UtcNow.Subtract(TimeSpan.FromHours(1));
            changes = changes
                .Where(c => c.Timestamp > cutoffTime)
                .OrderBy(c => c.Timestamp)
                .TakeLast(1000)
                .ToList();

            var serializedChanges = JsonSerializer.Serialize(changes);
            var options = new DistributedCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromHours(1)
            };
            
            await _cache.SetStringAsync(changesKey, serializedChanges, options);
            
            _logger.LogDebug("Stored content change for document {DocumentId} by user {UserId}", 
                documentId, change.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error storing content change for document {DocumentId}", documentId);
            return false;
        }
    }

    public async Task<List<ContentChange>> GetContentChangesSinceAsync(Guid documentId, DateTime since)
    {
        try
        {
            var changesKey = GetContentChangesCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(changesKey);
            
            if (string.IsNullOrEmpty(cachedData))
                return new List<ContentChange>();

            var changes = JsonSerializer.Deserialize<List<ContentChange>>(cachedData);
            if (changes == null)
                return new List<ContentChange>();

            return changes
                .Where(c => c.Timestamp > since)
                .OrderBy(c => c.Timestamp)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content changes for document {DocumentId} since {Since}", 
                documentId, since);
            return new List<ContentChange>();
        }
    }

    public async Task<bool> StoreCommentAsync(DocumentComment comment)
    {
        try
        {
            var commentsKey = GetCommentsCacheKey(comment.DocumentId);
            var cachedData = await _cache.GetStringAsync(commentsKey);
            var comments = string.IsNullOrEmpty(cachedData) 
                ? new List<DocumentComment>() 
                : JsonSerializer.Deserialize<List<DocumentComment>>(cachedData) ?? new List<DocumentComment>();

            comments.Add(comment);
            
            // Keep comments sorted by creation time
            comments = comments.OrderBy(c => c.CreatedAt).ToList();

            var serializedComments = JsonSerializer.Serialize(comments);
            var options = new DistributedCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromDays(7) // Comments persist longer
            };
            
            await _cache.SetStringAsync(commentsKey, serializedComments, options);
            
            _logger.LogDebug("Stored comment for document {DocumentId} by user {UserId}", 
                comment.DocumentId, comment.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error storing comment for document {DocumentId}", comment.DocumentId);
            return false;
        }
    }

    public async Task<List<DocumentComment>> GetDocumentCommentsAsync(Guid documentId)
    {
        try
        {
            var commentsKey = GetCommentsCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(commentsKey);
            
            if (string.IsNullOrEmpty(cachedData))
                return new List<DocumentComment>();

            var comments = JsonSerializer.Deserialize<List<DocumentComment>>(cachedData);
            return comments ?? new List<DocumentComment>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting comments for document {DocumentId}", documentId);
            return new List<DocumentComment>();
        }
    }

    private async Task UpdatePresenceMapAsync(Guid documentId, Dictionary<string, UserPresence> presenceMap)
    {
        var cacheKey = GetPresenceCacheKey(documentId);
        var serializedData = JsonSerializer.Serialize(presenceMap);
        var options = new DistributedCacheEntryOptions
        {
            SlidingExpiration = _presenceTimeout
        };
        
        await _cache.SetStringAsync(cacheKey, serializedData, options);
    }

    private async Task UpdateDocumentLockAsync(Guid documentId, DocumentLockInfo lockInfo)
    {
        var lockKey = GetLockCacheKey(documentId);
        var serializedLock = JsonSerializer.Serialize(lockInfo);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpiration = lockInfo.ExpiresAt
        };
        
        await _cache.SetStringAsync(lockKey, serializedLock, options);
    }

    private static string GetPresenceCacheKey(Guid documentId) => $"presence:doc:{documentId}";
    private static string GetLockCacheKey(Guid documentId) => $"lock:doc:{documentId}";
    private static string GetContentChangesCacheKey(Guid documentId) => $"changes:doc:{documentId}";
    private static string GetCommentsCacheKey(Guid documentId) => $"comments:doc:{documentId}";

    private static string GenerateUserColor(Guid userId)
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

    /// <summary>
    /// Apply operational transformation operation to document
    /// </summary>
    public async Task<DocumentOperationResponse> ApplyOperationAsync(Guid documentId, Guid userId, DocumentOperationRequest operation)
    {
        try
        {
            // Get current document version and operations
            var operationsKey = GetOperationsCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(operationsKey);
            var operations = string.IsNullOrEmpty(cachedData) 
                ? new List<DocumentOperationRequest>() 
                : JsonSerializer.Deserialize<List<DocumentOperationRequest>>(cachedData) ?? new List<DocumentOperationRequest>();

            // Get current document version
            var versionKey = GetVersionCacheKey(documentId);
            var versionData = await _cache.GetStringAsync(versionKey);
            var currentVersion = string.IsNullOrEmpty(versionData) ? 0 : int.Parse(versionData);

            // Check if operation version matches current version for concurrent editing
            if (operation.Version < currentVersion)
            {
                // Need to transform the operation against newer operations
                var transformedOperation = TransformOperation(operation, operations, operation.Version, currentVersion);
                if (transformedOperation == null)
                {
                    return new DocumentOperationResponse
                    {
                        Success = false,
                        ErrorMessage = "Operation could not be transformed",
                        RequiredVersion = currentVersion
                    };
                }
                operation = transformedOperation;
            }

            // Apply the operation
            var newVersion = currentVersion + 1;
            operation.Version = newVersion;

            // Store the operation
            operations.Add(operation);
            
            // Keep only recent operations (last 1000 or last day)
            var cutoffTime = DateTime.UtcNow.Subtract(TimeSpan.FromDays(1));
            operations = operations
                .Where(op => op.Timestamp > cutoffTime)
                .OrderBy(op => op.Timestamp)
                .TakeLast(1000)
                .ToList();

            // Update cache
            var serializedOperations = JsonSerializer.Serialize(operations);
            var options = new DistributedCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromDays(1)
            };
            
            await _cache.SetStringAsync(operationsKey, serializedOperations, options);
            await _cache.SetStringAsync(versionKey, newVersion.ToString(), options);

            _logger.LogDebug("Applied operation {OperationType} for document {DocumentId} by user {UserId}, new version: {Version}", 
                operation.OperationType, documentId, userId, newVersion);

            return new DocumentOperationResponse
            {
                Success = true,
                TransformedOperation = operation,
                DocumentVersion = newVersion,
                AppliedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying operation for document {DocumentId} by user {UserId}", documentId, userId);
            return new DocumentOperationResponse
            {
                Success = false,
                ErrorMessage = "Failed to apply operation"
            };
        }
    }

    /// <summary>
    /// Update cursor position for a user
    /// </summary>
    public async Task UpdateCursorPositionAsync(Guid documentId, Guid userId, CursorPosition cursorPosition)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            var presenceMap = string.IsNullOrEmpty(cachedData) 
                ? new Dictionary<string, UserPresence>() 
                : JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData) ?? new Dictionary<string, UserPresence>();

            if (presenceMap.ContainsKey(userId.ToString()))
            {
                presenceMap[userId.ToString()].CursorPosition = cursorPosition;
                presenceMap[userId.ToString()].LastSeen = DateTime.UtcNow;
                await UpdatePresenceMapAsync(documentId, presenceMap);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cursor position for user {UserId} in document {DocumentId}", userId, documentId);
        }
    }

    /// <summary>
    /// Update typing status for a user
    /// </summary>
    public async Task UpdateTypingStatusAsync(Guid documentId, Guid userId, bool isTyping)
    {
        try
        {
            var cacheKey = GetPresenceCacheKey(documentId);
            var cachedData = await _cache.GetStringAsync(cacheKey);
            var presenceMap = string.IsNullOrEmpty(cachedData) 
                ? new Dictionary<string, UserPresence>() 
                : JsonSerializer.Deserialize<Dictionary<string, UserPresence>>(cachedData) ?? new Dictionary<string, UserPresence>();

            if (presenceMap.ContainsKey(userId.ToString()))
            {
                presenceMap[userId.ToString()].Status = isTyping ? "typing" : "active";
                presenceMap[userId.ToString()].LastSeen = DateTime.UtcNow;
                await UpdatePresenceMapAsync(documentId, presenceMap);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating typing status for user {UserId} in document {DocumentId}", userId, documentId);
        }
    }

    /// <summary>
    /// Transform an operation against a list of newer operations using operational transformation
    /// </summary>
    private DocumentOperationRequest? TransformOperation(DocumentOperationRequest operation, List<DocumentOperationRequest> newerOperations, int fromVersion, int toVersion)
    {
        try
        {
            var transformedOp = operation;
            
            // Get operations that happened after this operation's version
            var conflictingOps = newerOperations
                .Where(op => op.Version > fromVersion && op.Version <= toVersion)
                .OrderBy(op => op.Version)
                .ToList();

            foreach (var conflictingOp in conflictingOps)
            {
                transformedOp = TransformTwoOperations(transformedOp, conflictingOp);
                if (transformedOp == null)
                    return null; // Transformation failed
            }

            return transformedOp;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error transforming operation");
            return null;
        }
    }

    /// <summary>
    /// Transform two operations using operational transformation rules
    /// </summary>
    private DocumentOperationRequest? TransformTwoOperations(DocumentOperationRequest op1, DocumentOperationRequest op2)
    {
        // Simplified OT implementation - in production, use a library like ShareJS or Yjs
        try
        {
            var transformed = new DocumentOperationRequest
            {
                Id = op1.Id,
                OperationType = op1.OperationType,
                Position = op1.Position,
                Length = op1.Length,
                Content = op1.Content,
                Attributes = op1.Attributes,
                Timestamp = op1.Timestamp,
                Version = op1.Version
            };

            // Basic transformation rules
            if (op1.OperationType == "insert" && op2.OperationType == "insert")
            {
                if (op2.Position <= op1.Position)
                {
                    transformed.Position += op2.Content?.Length ?? 0;
                }
            }
            else if (op1.OperationType == "insert" && op2.OperationType == "delete")
            {
                if (op2.Position < op1.Position)
                {
                    transformed.Position -= Math.Min(op2.Length ?? 0, op1.Position - op2.Position);
                }
            }
            else if (op1.OperationType == "delete" && op2.OperationType == "insert")
            {
                if (op2.Position <= op1.Position)
                {
                    transformed.Position += op2.Content?.Length ?? 0;
                }
            }
            else if (op1.OperationType == "delete" && op2.OperationType == "delete")
            {
                if (op2.Position < op1.Position)
                {
                    transformed.Position -= Math.Min(op2.Length ?? 0, op1.Position - op2.Position);
                }
                else if (op2.Position < op1.Position + (op1.Length ?? 0))
                {
                    // Overlapping deletes - adjust length
                    var overlap = Math.Min((op1.Length ?? 0) - (op2.Position - op1.Position), op2.Length ?? 0);
                    transformed.Length = Math.Max(0, (transformed.Length ?? 0) - overlap);
                }
            }

            return transformed;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error transforming two operations");
            return null;
        }
    }

    private static string GetOperationsCacheKey(Guid documentId) => $"operations:doc:{documentId}";
    private static string GetVersionCacheKey(Guid documentId) => $"version:doc:{documentId}";
}