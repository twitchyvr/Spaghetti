using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Infrastructure.Services;
using EnterpriseDocsCore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "System Administrator")]
public class AdminController : ControllerBase
{
    private readonly DatabaseSeedingService _seedingService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        DatabaseSeedingService seedingService,
        ApplicationDbContext context,
        ILogger<AdminController> logger)
    {
        _seedingService = seedingService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with comprehensive sample data for demo purposes
    /// </summary>
    [HttpPost("seed-sample-data")]
    public async Task<IActionResult> SeedSampleData()
    {
        try
        {
            await _seedingService.SeedSampleDataAsync();
            return Ok(new { message = "Sample data seeded successfully", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed sample data");
            return StatusCode(500, new { error = "Failed to seed sample data", details = ex.Message });
        }
    }

    /// <summary>
    /// Clears all data from the database for production deployment
    /// WARNING: This will delete ALL data except system roles
    /// </summary>
    [HttpDelete("clear-all-data")]
    public async Task<IActionResult> ClearAllData([FromQuery] string confirmationToken)
    {
        // Require explicit confirmation to prevent accidental data loss
        if (confirmationToken != "CONFIRM_DELETE_ALL_DATA")
        {
            return BadRequest(new { error = "Invalid confirmation token. Use 'CONFIRM_DELETE_ALL_DATA' to confirm." });
        }

        try
        {
            await _seedingService.ClearAllDataAsync();
            return Ok(new { message = "All data cleared successfully", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear data");
            return StatusCode(500, new { error = "Failed to clear data", details = ex.Message });
        }
    }

    /// <summary>
    /// Gets database statistics and health information
    /// </summary>
    [HttpGet("database-stats")]
    [AllowAnonymous] // Allow for health checks
    public async Task<IActionResult> GetDatabaseStats()
    {
        try
        {
            var stats = new
            {
                tenants = await _context.Tenants.CountAsync(),
                users = await _context.Users.CountAsync(),
                documents = await _context.Documents.CountAsync(),
                documentTags = await _context.DocumentTags.CountAsync(),
                documentPermissions = await _context.DocumentPermissions.CountAsync(),
                roles = await _context.Roles.CountAsync(),
                userRoles = await _context.UserRoles.CountAsync(),
                tenantModules = await _context.TenantModules.CountAsync(),
                documentAudits = await _context.DocumentAuditEntries.CountAsync(),
                userAudits = await _context.UserAuditEntries.CountAsync(),
                tenantAudits = await _context.TenantAuditEntries.CountAsync(),
                databaseStatus = "healthy",
                lastChecked = DateTime.UtcNow
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get database stats");
            return StatusCode(500, new { error = "Failed to get database stats", details = ex.Message });
        }
    }

    /// <summary>
    /// Checks if sample data exists in the database
    /// </summary>
    [HttpGet("sample-data-status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSampleDataStatus()
    {
        try
        {
            var hasSampleData = await _context.Tenants.AnyAsync(t => t.Subdomain == "demo-legal");
            var hasDemoUser = await _context.Users.AnyAsync(u => u.Email == "demo@enterprise-docs.com");
            
            return Ok(new
            {
                hasSampleData,
                hasDemoUser,
                sampleTenantsCount = await _context.Tenants.CountAsync(t => t.Subdomain.StartsWith("demo-")),
                totalUsers = await _context.Users.CountAsync(),
                totalDocuments = await _context.Documents.CountAsync(),
                lastChecked = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check sample data status");
            return StatusCode(500, new { error = "Failed to check sample data status", details = ex.Message });
        }
    }

    /// <summary>
    /// Creates a new admin user for production environments
    /// </summary>
    [HttpPost("create-admin-user")]
    [AllowAnonymous] // Allow for initial setup
    public async Task<IActionResult> CreateAdminUser([FromBody] CreateAdminUserRequest request)
    {
        try
        {
            // Check if any users exist (only allow if database is empty)
            var userCount = await _context.Users.CountAsync();
            if (userCount > 0)
            {
                return BadRequest(new { error = "Admin user creation only allowed on empty database" });
            }

            // Validate request
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
            {
                return BadRequest(new { error = "Email, FirstName, and LastName are required" });
            }

            // Create admin user
            var adminUser = new EnterpriseDocsCore.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                IsActive = true,
                Profile = new EnterpriseDocsCore.Domain.Entities.UserProfile
                {
                    JobTitle = "System Administrator",
                    Department = "IT",
                    TimeZone = "UTC",
                    Language = "en"
                }
            };

            _context.Users.Add(adminUser);

            // Assign system admin role
            var systemAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var userRole = new EnterpriseDocsCore.Domain.Entities.UserRole
            {
                Id = Guid.NewGuid(),
                UserId = adminUser.Id,
                RoleId = systemAdminRoleId,
                AssignedBy = adminUser.Id
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Admin user created successfully",
                userId = adminUser.Id,
                email = adminUser.Email,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create admin user");
            return StatusCode(500, new { error = "Failed to create admin user", details = ex.Message });
        }
    }
}

public class CreateAdminUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}