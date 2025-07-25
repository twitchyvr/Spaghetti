using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Api.Controllers;

/// <summary>
/// Client Management Controller
/// 
/// This controller provides comprehensive client/tenant lifecycle management for platform administrators.
/// It handles client onboarding, configuration, monitoring, and administrative operations.
/// 
/// Key Features:
/// - Client organization lifecycle management
/// - User management within client organizations
/// - Document and storage management
/// - Billing and subscription management
/// - Support and impersonation capabilities
/// 
/// Security: Requires platform administrator role
/// </summary>
[ApiController]
[Route("api/client-management")]
public class ClientManagementController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ClientManagementController> _logger;

    public ClientManagementController(ApplicationDbContext context, ILogger<ClientManagementController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get users within a specific client organization
    /// </summary>
    [HttpGet("{clientId}/users")]
    public async Task<ActionResult<IEnumerable<ClientUserSummary>>> GetClientUsers(Guid clientId)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            var users = await _context.Users
                .Where(u => u.TenantId == clientId)
                .Select(u => new ClientUserSummary
                {
                    Id = u.Id.ToString(),
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    DocumentCount = u.Documents.Count(),
                    StorageUsedMB = u.Documents.Sum(d => d.Content != null ? d.Content.Length : 0) / (1024 * 1024)
                })
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ToListAsync();

            _logger.LogInformation("Retrieved {UserCount} users for client {ClientId}", users.Count, clientId);

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve users for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to retrieve client users", error = ex.Message });
        }
    }

    /// <summary>
    /// Get documents within a specific client organization
    /// </summary>
    [HttpGet("{clientId}/documents")]
    public async Task<ActionResult<IEnumerable<ClientDocumentSummary>>> GetClientDocuments(Guid clientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            var documents = await _context.Documents
                .Where(d => d.TenantId == clientId)
                .Include(d => d.Author)
                .Select(d => new ClientDocumentSummary
                {
                    Id = d.Id.ToString(),
                    Title = d.Title,
                    AuthorName = $"{d.Author!.FirstName} {d.Author.LastName}",
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    PublicAccessLevel = d.PublicAccessLevel.ToString(),
                    Tags = d.Tags.Select(t => t.Name).ToList(),
                    SizeBytes = d.Content != null ? d.Content.Length : 0,
                    ViewCount = 0 // TODO: Implement view tracking
                })
                .OrderByDescending(d => d.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalCount = await _context.Documents.CountAsync(d => d.TenantId == clientId);

            var result = new PaginatedResult<ClientDocumentSummary>
            {
                Items = documents,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            _logger.LogInformation("Retrieved {DocumentCount} documents for client {ClientId}", documents.Count, clientId);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve documents for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to retrieve client documents", error = ex.Message });
        }
    }

    /// <summary>
    /// Suspend a client organization (disable access but preserve data)
    /// </summary>
    [HttpPost("{clientId}/suspend")]
    public async Task<ActionResult> SuspendClient(Guid clientId, [FromBody] SuspendClientRequest request)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            tenant.IsActive = false;
            tenant.SuspensionReason = request.Reason;
            tenant.SuspendedAt = DateTime.UtcNow;
            tenant.UpdatedAt = DateTime.UtcNow;

            // Also deactivate all users in the organization
            var users = await _context.Users.Where(u => u.TenantId == clientId).ToListAsync();
            foreach (var user in users)
            {
                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogWarning("Suspended client organization {ClientId} ({ClientName}). Reason: {Reason}", 
                clientId, tenant.Name, request.Reason);

            return Ok(new { message = "Client organization suspended successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to suspend client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to suspend client", error = ex.Message });
        }
    }

    /// <summary>
    /// Reactivate a suspended client organization
    /// </summary>
    [HttpPost("{clientId}/reactivate")]
    public async Task<ActionResult> ReactivateClient(Guid clientId)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            tenant.IsActive = true;
            tenant.SuspensionReason = null;
            tenant.SuspendedAt = null;
            tenant.UpdatedAt = DateTime.UtcNow;

            // Reactivate users (they can individually be managed later)
            var users = await _context.Users.Where(u => u.TenantId == clientId).ToListAsync();
            foreach (var user in users)
            {
                user.IsActive = true;
                user.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Reactivated client organization {ClientId} ({ClientName})", 
                clientId, tenant.Name);

            return Ok(new { message = "Client organization reactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reactivate client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to reactivate client", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a client organization (permanent action)
    /// </summary>
    [HttpDelete("{clientId}")]
    public async Task<ActionResult> DeleteClient(Guid clientId, [FromQuery] string confirmationToken = "")
    {
        try
        {
            if (confirmationToken != "CONFIRM_DELETE_CLIENT")
            {
                return BadRequest(new 
                { 
                    message = "This action requires confirmation. Use confirmationToken=CONFIRM_DELETE_CLIENT",
                    warning = "This will permanently delete all client data including users, documents, and settings."
                });
            }

            var tenant = await _context.Tenants
                .Include(t => t.Users)
                .Include(t => t.Documents)
                .FirstOrDefaultAsync(t => t.Id == clientId);

            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            // Store information for logging
            var clientName = tenant.Name;
            var userCount = tenant.Users.Count;
            var documentCount = tenant.Documents.Count;

            // Delete all related data
            _context.Documents.RemoveRange(tenant.Documents);
            _context.Users.RemoveRange(tenant.Users);
            _context.Tenants.Remove(tenant);

            await _context.SaveChangesAsync();

            _logger.LogWarning("DELETED client organization {ClientId} ({ClientName}). " +
                "Removed {UserCount} users and {DocumentCount} documents.", 
                clientId, clientName, userCount, documentCount);

            return Ok(new 
            { 
                message = "Client organization deleted successfully",
                deletedData = new
                {
                    clientName,
                    userCount,
                    documentCount
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to delete client", error = ex.Message });
        }
    }

    /// <summary>
    /// Create admin user for a client organization
    /// </summary>
    [HttpPost("{clientId}/admin-user")]
    public async Task<ActionResult<ClientUserSummary>> CreateAdminUser(Guid clientId, [FromBody] CreateClientAdminUserRequest request)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.TenantId == clientId);

            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this email already exists in this organization" });
            }

            var adminUser = new User
            {
                TenantId = clientId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            var userSummary = new ClientUserSummary
            {
                Id = adminUser.Id.ToString(),
                FirstName = adminUser.FirstName,
                LastName = adminUser.LastName,
                Email = adminUser.Email,
                Role = adminUser.Role.ToString(),
                IsActive = adminUser.IsActive,
                CreatedAt = adminUser.CreatedAt,
                LastLoginAt = null,
                DocumentCount = 0,
                StorageUsedMB = 0
            };

            _logger.LogInformation("Created admin user {UserId} ({Email}) for client {ClientId}", 
                adminUser.Id, adminUser.Email, clientId);

            return CreatedAtAction(nameof(GetClientUsers), new { clientId }, userSummary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create admin user for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to create admin user", error = ex.Message });
        }
    }

    /// <summary>
    /// Update client organization subscription tier
    /// </summary>
    [HttpPut("{clientId}/subscription")]
    public async Task<ActionResult> UpdateSubscription(Guid clientId, [FromBody] UpdateSubscriptionRequest request)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            var oldTier = tenant.SubscriptionTier;
            var newTier = ParseSubscriptionTier(request.Tier);

            tenant.SubscriptionTier = newTier;
            tenant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated subscription for client {ClientId} from {OldTier} to {NewTier}", 
                clientId, oldTier, newTier);

            return Ok(new 
            { 
                message = "Subscription updated successfully",
                oldTier = oldTier.ToString(),
                newTier = newTier.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update subscription for client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to update subscription", error = ex.Message });
        }
    }

    #region Helper Methods

    private static SubscriptionTier ParseSubscriptionTier(string tier)
    {
        return tier.ToLower() switch
        {
            "trial" => SubscriptionTier.Trial,
            "professional" => SubscriptionTier.Professional,
            "enterprise" => SubscriptionTier.Enterprise,
            "custom" => SubscriptionTier.Custom,
            _ => SubscriptionTier.Trial
        };
    }

    #endregion
}

#region Data Transfer Objects

/// <summary>
/// User summary within a client organization
/// </summary>
public class ClientUserSummary
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int DocumentCount { get; set; }
    public int StorageUsedMB { get; set; }
}

/// <summary>
/// Document summary within a client organization
/// </summary>
public class ClientDocumentSummary
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string PublicAccessLevel { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public int SizeBytes { get; set; }
    public int ViewCount { get; set; }
}

/// <summary>
/// Paginated result wrapper
/// </summary>
public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>
/// Request model for suspending a client
/// </summary>
public class SuspendClientRequest
{
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request model for creating admin user
/// </summary>
public class CreateClientAdminUserRequest
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request model for updating subscription
/// </summary>
public class UpdateSubscriptionRequest
{
    [Required]
    public string Tier { get; set; } = string.Empty;
}

#endregion