using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace EnterpriseDocsCore.Api.Controllers;

/// <summary>
/// User Impersonation Controller
/// 
/// This controller provides secure user and client impersonation capabilities for platform administrators.
/// It enables support staff to temporarily assume the identity of users or access client organizations
/// for troubleshooting, support, and testing purposes.
/// 
/// Key Features:
/// - Secure user impersonation with audit trails
/// - Client organization impersonation
/// - Session management and automatic termination
/// - Comprehensive logging and monitoring
/// - Permission validation and access control
/// 
/// Security:
/// - Requires platform administrator or support role
/// - All impersonation actions are logged with full audit trails
/// - Sessions have automatic expiration and manual termination
/// - Original administrator identity is preserved
/// </summary>
[ApiController]
[Route("api/impersonation")]
[Authorize(Policy = "Platform.Impersonate")]
public class ImpersonationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ImpersonationController> _logger;

    public ImpersonationController(ApplicationDbContext context, ILogger<ImpersonationController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get available users for impersonation within a client organization
    /// </summary>
    [HttpGet("clients/{clientId}/users")]
    public async Task<ActionResult<IEnumerable<ImpersonationTarget>>> GetImpersonationTargets(Guid clientId)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client organization not found" });
            }

            var users = await _context.Users
                .Where(u => u.TenantId == clientId && u.IsActive)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Tenant)
                .Include(u => u.CreatedDocuments)
                .ToListAsync();

            var targets = users.Select(u => new ImpersonationTarget
            {
                UserId = u.Id.ToString(),
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? "",
                Role = u.UserRoles.FirstOrDefault()?.Role?.Name ?? "User",
                LastLoginAt = u.LastLoginAt,
                DocumentCount = u.CreatedDocuments.Count(),
                TenantId = u.TenantId?.ToString() ?? "",
                TenantName = u.Tenant?.Name ?? "",
                TenantSubdomain = u.Tenant?.Subdomain ?? "",
                IsImpersonationActive = false // TODO: Check for active impersonation sessions
            })
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToList();

            _logger.LogInformation("Retrieved {UserCount} impersonation targets for client {ClientId} ({TenantName})", 
                targets.Count, clientId, tenant.Name);

            return Ok(targets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve impersonation targets for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to retrieve impersonation targets", error = ex.Message });
        }
    }

    /// <summary>
    /// Start user impersonation session
    /// </summary>
    [HttpPost("start")]
    public async Task<ActionResult<ImpersonationSessionDto>> StartImpersonation([FromBody] StartImpersonationRequest request)
    {
        try
        {
            // Get the current admin user from claims
            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "Invalid administrator session" });
            }

            // Validate target user exists and is active
            var targetUser = await _context.Users
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(request.TargetUserId) && u.IsActive);

            if (targetUser == null)
            {
                return NotFound(new { message = "Target user not found or inactive" });
            }

            // Get admin user information
            var adminUser = await _context.Users.FindAsync(adminUserId);
            if (adminUser == null)
            {
                return Unauthorized(new { message = "Administrator user not found" });
            }

            // Check for existing active impersonation session
            var existingSession = await _context.ImpersonationSessions
                .FirstOrDefaultAsync(s => s.AdminUserId == adminUserId && s.IsActive);

            if (existingSession != null)
            {
                return BadRequest(new 
                { 
                    message = "An active impersonation session already exists. End the current session before starting a new one.",
                    existingSession = new
                    {
                        sessionId = existingSession.Id,
                        targetUser = existingSession.TargetUserEmail,
                        startedAt = existingSession.StartedAt
                    }
                });
            }

            // Create new impersonation session
            var session = new Domain.Entities.ImpersonationSession
            {
                AdminUserId = adminUserId.Value,
                AdminUserEmail = adminUser.Email,
                TargetUserId = targetUser.Id,
                TargetUserEmail = targetUser.Email,
                TargetTenantId = targetUser.TenantId ?? Guid.Empty,
                Reason = request.Reason,
                StartedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(request.DurationHours ?? 4), // Default 4 hours
                IsActive = true,
                AdminIPAddress = GetClientIPAddress(),
                AdminUserAgent = Request.Headers.UserAgent.ToString()
            };

            _context.ImpersonationSessions.Add(session);
            await _context.SaveChangesAsync();

            // Create audit log entry
            var auditEntry = new PlatformAdminAuditLog
            {
                AdminUserId = adminUserId.Value,
                Action = "START_IMPERSONATION",
                TargetEntityType = "User",
                TargetEntityId = targetUser.Id,
                Details = $"Started impersonation of {targetUser.Email} in organization {targetUser.Tenant.Name}. Reason: {request.Reason}",
                IPAddress = GetClientIPAddress(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                Timestamp = DateTime.UtcNow
            };

            _context.PlatformAdminAuditLogs.Add(auditEntry);
            await _context.SaveChangesAsync();

            var sessionResponse = new ImpersonationSessionDto
            {
                Id = session.Id,
                AdminUserId = session.AdminUserId,
                AdminUserEmail = session.AdminUserEmail,
                TargetUserId = session.TargetUserId,
                TargetUserEmail = session.TargetUserEmail,
                TargetTenantId = session.TargetTenantId,
                Reason = session.Reason,
                StartedAt = session.StartedAt,
                ExpiresAt = session.ExpiresAt,
                IsActive = session.IsActive
            };

            _logger.LogWarning("IMPERSONATION STARTED: Admin {AdminEmail} ({AdminId}) is now impersonating {TargetEmail} ({TargetId}) in tenant {TenantId}. Reason: {Reason}", 
                adminUser.Email, adminUserId, targetUser.Email, targetUser.Id, targetUser.TenantId, request.Reason);

            return Ok(sessionResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start impersonation session");
            return StatusCode(500, new { message = "Failed to start impersonation session", error = ex.Message });
        }
    }

    /// <summary>
    /// Get current impersonation session status
    /// </summary>
    [HttpGet("session")]
    public async Task<ActionResult<ImpersonationSessionDto>> GetCurrentSession()
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "Invalid administrator session" });
            }

            var session = await _context.ImpersonationSessions
                .FirstOrDefaultAsync(s => s.AdminUserId == adminUserId && s.IsActive);

            if (session == null)
            {
                return NotFound(new { message = "No active impersonation session found" });
            }

            // Check if session has expired
            if (session.ExpiresAt <= DateTime.UtcNow)
            {
                session.IsActive = false;
                session.EndedAt = DateTime.UtcNow;
                session.EndReason = "Expired";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Impersonation session {SessionId} expired automatically", session.Id);

                return NotFound(new { message = "Impersonation session has expired" });
            }

            return Ok(session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve current impersonation session");
            return StatusCode(500, new { message = "Failed to retrieve session", error = ex.Message });
        }
    }

    /// <summary>
    /// End current impersonation session
    /// </summary>
    [HttpPost("end")]
    public async Task<ActionResult> EndImpersonation([FromBody] EndImpersonationRequest? request = null)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "Invalid administrator session" });
            }

            var session = await _context.ImpersonationSessions
                .FirstOrDefaultAsync(s => s.AdminUserId == adminUserId && s.IsActive);

            if (session == null)
            {
                return NotFound(new { message = "No active impersonation session found" });
            }

            // End the session
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            session.EndReason = request?.Reason ?? "Manual termination";

            // Create audit log entry
            var auditEntry = new PlatformAdminAuditLog
            {
                AdminUserId = adminUserId.Value,
                Action = "END_IMPERSONATION",
                TargetEntityType = "User",
                TargetEntityId = session.TargetUserId,
                Details = $"Ended impersonation of {session.TargetUserEmail}. Duration: {(DateTime.UtcNow - session.StartedAt).TotalMinutes:F1} minutes. Reason: {session.EndReason}",
                IPAddress = GetClientIPAddress(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                Timestamp = DateTime.UtcNow
            };

            _context.PlatformAdminAuditLogs.Add(auditEntry);
            await _context.SaveChangesAsync();

            _logger.LogWarning("IMPERSONATION ENDED: Admin {AdminEmail} ended impersonation of {TargetEmail}. Duration: {DurationMinutes:F1} minutes", 
                session.AdminUserEmail, session.TargetUserEmail, (DateTime.UtcNow - session.StartedAt).TotalMinutes);

            return Ok(new 
            { 
                message = "Impersonation session ended successfully",
                duration = DateTime.UtcNow - session.StartedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to end impersonation session");
            return StatusCode(500, new { message = "Failed to end impersonation session", error = ex.Message });
        }
    }

    /// <summary>
    /// Get impersonation session history for audit purposes
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<ImpersonationSessionHistory>>> GetImpersonationHistory(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50,
        [FromQuery] string? adminUserId = null,
        [FromQuery] string? targetUserId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.ImpersonationSessions.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(adminUserId) && Guid.TryParse(adminUserId, out var adminGuid))
            {
                query = query.Where(s => s.AdminUserId == adminGuid);
            }

            if (!string.IsNullOrEmpty(targetUserId) && Guid.TryParse(targetUserId, out var targetGuid))
            {
                query = query.Where(s => s.TargetUserId == targetGuid);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(s => s.StartedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(s => s.StartedAt <= toDate.Value);
            }

            var history = await query
                .Select(s => new ImpersonationSessionHistory
                {
                    Id = s.Id,
                    AdminUserEmail = s.AdminUserEmail,
                    TargetUserEmail = s.TargetUserEmail,
                    TenantId = s.TargetTenantId.ToString(),
                    Reason = s.Reason,
                    StartedAt = s.StartedAt,
                    EndedAt = s.EndedAt,
                    ExpiresAt = s.ExpiresAt,
                    EndReason = s.EndReason,
                    DurationMinutes = s.EndedAt.HasValue 
                        ? (s.EndedAt.Value - s.StartedAt).TotalMinutes 
                        : (DateTime.UtcNow - s.StartedAt).TotalMinutes,
                    IsActive = s.IsActive,
                    AdminIPAddress = s.AdminIPAddress
                })
                .OrderByDescending(s => s.StartedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();

            var result = new PaginatedResult<ImpersonationSessionHistory>
            {
                Items = history,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,  
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            _logger.LogInformation("Retrieved {HistoryCount} impersonation history records", history.Count);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve impersonation history");
            return StatusCode(500, new { message = "Failed to retrieve impersonation history", error = ex.Message });
        }
    }

    /// <summary>
    /// Force end all active impersonation sessions (emergency use)
    /// </summary>
    [HttpPost("emergency-end-all")]
    public async Task<ActionResult> EmergencyEndAllSessions([FromBody] EmergencyEndRequest request)
    {
        try
        {
            if (request.ConfirmationToken != "EMERGENCY_END_ALL_SESSIONS")
            {
                return BadRequest(new 
                { 
                    message = "This action requires confirmation. Use confirmationToken=EMERGENCY_END_ALL_SESSIONS",
                    warning = "This will immediately terminate all active impersonation sessions across the platform."
                });
            }

            var adminUserId = GetCurrentUserId();
            if (adminUserId == null)
            {
                return Unauthorized(new { message = "Invalid administrator session" });
            }

            var activeSessions = await _context.ImpersonationSessions
                .Where(s => s.IsActive)
                .ToListAsync();

            foreach (var session in activeSessions)
            {
                session.IsActive = false;
                session.EndedAt = DateTime.UtcNow;
                session.EndReason = $"Emergency termination by admin {adminUserId}. Reason: {request.Reason}";
            }

            // Create audit log entry
            var auditEntry = new PlatformAdminAuditLog
            {
                AdminUserId = adminUserId.Value,
                Action = "EMERGENCY_END_ALL_IMPERSONATIONS",
                TargetEntityType = "System",
                TargetEntityId = null,
                Details = $"Emergency termination of {activeSessions.Count} active impersonation sessions. Reason: {request.Reason}",
                IPAddress = GetClientIPAddress(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                Timestamp = DateTime.UtcNow
            };

            _context.PlatformAdminAuditLogs.Add(auditEntry);
            await _context.SaveChangesAsync();

            _logger.LogCritical("EMERGENCY ACTION: Admin {AdminId} terminated {SessionCount} active impersonation sessions. Reason: {Reason}", 
                adminUserId, activeSessions.Count, request.Reason);

            return Ok(new 
            { 
                message = "All impersonation sessions terminated successfully",
                terminatedSessions = activeSessions.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform emergency session termination");
            return StatusCode(500, new { message = "Failed to terminate sessions", error = ex.Message });
        }
    }

    #region Helper Methods

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    private string GetClientIPAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    #endregion
}

#region Data Transfer Objects

/// <summary>
/// Available user target for impersonation
/// </summary>
public class ImpersonationTarget
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime? LastLoginAt { get; set; }
    public int DocumentCount { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string TenantSubdomain { get; set; } = string.Empty;
    public bool IsImpersonationActive { get; set; }
}

/// <summary>
/// Active impersonation session information DTO
/// </summary>
public class ImpersonationSessionDto
{
    public Guid Id { get; set; }
    public Guid AdminUserId { get; set; }
    public string AdminUserEmail { get; set; } = string.Empty;
    public Guid TargetUserId { get; set; }
    public string TargetUserEmail { get; set; } = string.Empty;
    public Guid TargetTenantId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? EndReason { get; set; }
    public bool IsActive { get; set; }
    public string? AdminIPAddress { get; set; }
    public string? AdminUserAgent { get; set; }
}

/// <summary>
/// Impersonation session history for audit trails
/// </summary>
public class ImpersonationSessionHistory
{
    public Guid Id { get; set; }
    public string AdminUserEmail { get; set; } = string.Empty;
    public string TargetUserEmail { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? EndReason { get; set; }
    public double DurationMinutes { get; set; }
    public bool IsActive { get; set; }
    public string? AdminIPAddress { get; set; }
}

/// <summary>
/// Request model for starting impersonation
/// </summary>
public class StartImpersonationRequest
{
    [Required]
    public string TargetUserId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
    
    [Range(1, 24)]
    public int? DurationHours { get; set; } = 4;
}

/// <summary>
/// Request model for ending impersonation
/// </summary>
public class EndImpersonationRequest
{
    [StringLength(500)]
    public string? Reason { get; set; }
}

/// <summary>
/// Request model for emergency session termination
/// </summary>
public class EmergencyEndRequest
{
    [Required]
    public string ConfirmationToken { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
}

#endregion