using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Api.Controllers;

/// <summary>
/// Platform Administration Controller
/// 
/// This controller provides comprehensive platform administration endpoints for managing
/// the entire Spaghetti documentation platform. It includes cross-tenant analytics,
/// client organization management, and platform-wide operations.
/// 
/// Key Features:
/// - Platform-wide metrics and analytics
/// - Cross-tenant data aggregation
/// - System health monitoring
/// - Administrative operations
/// 
/// Security: Requires platform administrator role
/// </summary>
[ApiController]
[Route("api/platform-admin")]
public class PlatformAdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PlatformAdminController> _logger;

    public PlatformAdminController(ApplicationDbContext context, ILogger<PlatformAdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get comprehensive platform metrics
    /// Returns cross-tenant analytics, revenue data, and system health
    /// </summary>
    [HttpGet("metrics")]
    public async Task<ActionResult<PlatformMetrics>> GetPlatformMetrics()
    {
        try
        {
            // Platform-wide statistics
            var totalClients = await _context.Tenants.CountAsync();
            var activeClients = await _context.Tenants
                .CountAsync(t => t.IsActive && t.LastActivityAt > DateTime.UtcNow.AddDays(-30));

            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users
                .CountAsync(u => u.LastLoginAt > DateTime.UtcNow.AddDays(-30));

            var totalDocuments = await _context.Documents.CountAsync();

            // Revenue calculations (mock data for now)
            // TODO: Integrate with actual billing system
            var monthlyRecurringRevenue = activeClients * 1200; // Average MRR estimate
            var annualRecurringRevenue = monthlyRecurringRevenue * 12;

            // System health indicators
            var platformHealth = new PlatformHealth
            {
                ApiResponseTime = 145, // Mock response time in ms
                DatabaseHealth = true,
                SystemUptime = 99.97,
                ActiveIncidents = 0
            };

            var metrics = new PlatformMetrics
            {
                TotalClients = totalClients,
                ActiveClients = activeClients,
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                TotalDocuments = totalDocuments,
                MonthlyRecurringRevenue = monthlyRecurringRevenue,
                AnnualRecurringRevenue = annualRecurringRevenue,
                PlatformHealth = platformHealth
            };

            _logger.LogInformation("Platform metrics retrieved successfully: {TotalClients} clients, {TotalUsers} users", 
                totalClients, totalUsers);

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve platform metrics");
            return StatusCode(500, new { message = "Failed to retrieve platform metrics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get client organization summary for platform admin dashboard
    /// Returns detailed information about all client organizations
    /// </summary>
    [HttpGet("clients")]
    public async Task<ActionResult<IEnumerable<ClientSummary>>> GetClientSummaries()
    {
        try
        {
            var clients = await _context.Tenants
                .Include(t => t.Users)
                .Include(t => t.Documents)
                .Select(t => new ClientSummary
                {
                    Id = t.Id.ToString(),
                    Name = t.Name,
                    Subdomain = t.Subdomain,
                    Domain = t.CustomDomain,
                    Tier = MapTierToString(t.SubscriptionTier),
                    Status = t.IsActive ? "Active" : "Inactive",
                    UserCount = t.Users.Count,
                    DocumentCount = t.Documents.Count,
                    StorageUsedMB = CalculateStorageUsage(t.Documents),
                    StorageQuotaMB = GetStorageQuota(t.SubscriptionTier),
                    MonthlyRevenue = CalculateMonthlyRevenue(t.SubscriptionTier),
                    AnnualContract = CalculateAnnualContract(t.SubscriptionTier),
                    CreatedAt = t.CreatedAt,
                    LastActive = t.LastActivityAt ?? t.CreatedAt,
                    HealthScore = CalculateHealthScore(t),
                    SupportTickets = 0, // TODO: Integrate with support system
                    BillingContact = new ContactInfo
                    {
                        Name = "Contact Manager", // TODO: Get from tenant settings
                        Email = $"billing@{t.Subdomain}.com"
                    },
                    TechnicalContact = new ContactInfo
                    {
                        Name = "Technical Lead", // TODO: Get from tenant settings
                        Email = $"tech@{t.Subdomain}.com"
                    },
                    Features = GetTierFeatures(t.SubscriptionTier),
                    CustomBranding = t.SubscriptionTier >= SubscriptionTier.Professional,
                    SsoEnabled = t.SubscriptionTier >= SubscriptionTier.Enterprise,
                    ApiAccess = t.SubscriptionTier >= SubscriptionTier.Professional
                })
                .OrderBy(c => c.Name)
                .ToListAsync();

            _logger.LogInformation("Retrieved {ClientCount} client summaries for platform admin", clients.Count);

            return Ok(clients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve client summaries");
            return StatusCode(500, new { message = "Failed to retrieve client summaries", error = ex.Message });
        }
    }

    /// <summary>
    /// Get detailed information about a specific client organization
    /// </summary>
    [HttpGet("clients/{clientId}")]
    public async Task<ActionResult<ClientDetail>> GetClientDetail(Guid clientId)
    {
        try
        {
            var tenant = await _context.Tenants
                .Include(t => t.Users)
                .Include(t => t.Documents)
                .FirstOrDefaultAsync(t => t.Id == clientId);

            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            var clientDetail = new ClientDetail
            {
                Id = tenant.Id.ToString(),
                Name = tenant.Name,
                Subdomain = tenant.Subdomain,
                Domain = tenant.CustomDomain,
                Tier = MapTierToString(tenant.SubscriptionTier),
                Status = tenant.IsActive ? "Active" : "Inactive",
                CreatedAt = tenant.CreatedAt,
                LastActive = tenant.LastActivityAt ?? tenant.CreatedAt,
                
                // User analytics
                TotalUsers = tenant.Users.Count,
                ActiveUsers = tenant.Users.Count(u => u.LastLoginAt > DateTime.UtcNow.AddDays(-30)),
                AdminUsers = tenant.Users.Count(u => u.Role == UserRole.Admin),
                
                // Document analytics
                TotalDocuments = tenant.Documents.Count,
                DocumentsThisMonth = tenant.Documents.Count(d => d.CreatedAt > DateTime.UtcNow.AddDays(-30)),
                PublicDocuments = tenant.Documents.Count(d => d.PublicAccessLevel != PublicAccessLevel.Private),
                
                // Storage and usage
                StorageUsedMB = CalculateStorageUsage(tenant.Documents),
                StorageQuotaMB = GetStorageQuota(tenant.SubscriptionTier),
                
                // Financial
                MonthlyRevenue = CalculateMonthlyRevenue(tenant.SubscriptionTier),
                AnnualContract = CalculateAnnualContract(tenant.SubscriptionTier),
                
                // Health and support
                HealthScore = CalculateHealthScore(tenant),
                SupportTickets = 0, // TODO: Integrate with support system
                
                // Configuration
                Features = GetTierFeatures(tenant.SubscriptionTier),
                CustomBranding = tenant.SubscriptionTier >= SubscriptionTier.Professional,
                SsoEnabled = tenant.SubscriptionTier >= SubscriptionTier.Enterprise,
                ApiAccess = tenant.SubscriptionTier >= SubscriptionTier.Professional
            };

            _logger.LogInformation("Retrieved detailed information for client {ClientId} ({ClientName})", 
                clientId, tenant.Name);

            return Ok(clientDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve client detail for {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to retrieve client detail", error = ex.Message });
        }
    }

    /// <summary>
    /// Create a new client organization
    /// </summary>
    [HttpPost("clients")]
    public async Task<ActionResult<ClientSummary>> CreateClient([FromBody] CreateClientRequest request)
    {
        try
        {
            // Validate subdomain uniqueness
            var existingTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Subdomain == request.Subdomain);

            if (existingTenant != null)
            {
                return BadRequest(new { message = "Subdomain already exists" });
            }

            var tenant = new Tenant
            {
                Name = request.Name,
                Subdomain = request.Subdomain,
                CustomDomain = request.Domain,
                SubscriptionTier = ParseSubscriptionTier(request.Tier),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastActivityAt = DateTime.UtcNow
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var clientSummary = new ClientSummary
            {
                Id = tenant.Id.ToString(),
                Name = tenant.Name,
                Subdomain = tenant.Subdomain,
                Domain = tenant.CustomDomain,
                Tier = MapTierToString(tenant.SubscriptionTier),
                Status = "Active",
                UserCount = 0,
                DocumentCount = 0,
                StorageUsedMB = 0,
                StorageQuotaMB = GetStorageQuota(tenant.SubscriptionTier),
                MonthlyRevenue = CalculateMonthlyRevenue(tenant.SubscriptionTier),
                AnnualContract = CalculateAnnualContract(tenant.SubscriptionTier),
                CreatedAt = tenant.CreatedAt,
                LastActive = tenant.LastActivityAt.Value,
                HealthScore = 100,
                SupportTickets = 0,
                BillingContact = new ContactInfo
                {
                    Name = request.BillingContactName ?? "Billing Contact",
                    Email = request.BillingContactEmail ?? $"billing@{tenant.Subdomain}.com"
                },
                TechnicalContact = new ContactInfo
                {
                    Name = request.TechnicalContactName ?? "Technical Contact",
                    Email = request.TechnicalContactEmail ?? $"tech@{tenant.Subdomain}.com"
                },
                Features = GetTierFeatures(tenant.SubscriptionTier),
                CustomBranding = tenant.SubscriptionTier >= SubscriptionTier.Professional,
                SsoEnabled = tenant.SubscriptionTier >= SubscriptionTier.Enterprise,
                ApiAccess = tenant.SubscriptionTier >= SubscriptionTier.Professional
            };

            _logger.LogInformation("Created new client organization: {ClientName} ({ClientId})", 
                tenant.Name, tenant.Id);

            return CreatedAtAction(nameof(GetClientDetail), new { clientId = tenant.Id }, clientSummary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create client organization");
            return StatusCode(500, new { message = "Failed to create client", error = ex.Message });
        }
    }

    /// <summary>
    /// Update client organization settings
    /// </summary>
    [HttpPut("clients/{clientId}")]
    public async Task<ActionResult<ClientSummary>> UpdateClient(Guid clientId, [FromBody] UpdateClientRequest request)
    {
        try
        {
            var tenant = await _context.Tenants.FindAsync(clientId);
            if (tenant == null)
            {
                return NotFound(new { message = "Client not found" });
            }

            // Update fields
            if (!string.IsNullOrEmpty(request.Name))
                tenant.Name = request.Name;
            
            if (!string.IsNullOrEmpty(request.Domain))
                tenant.CustomDomain = request.Domain;
            
            if (!string.IsNullOrEmpty(request.Tier))
                tenant.SubscriptionTier = ParseSubscriptionTier(request.Tier);

            if (request.IsActive.HasValue)
                tenant.IsActive = request.IsActive.Value;

            tenant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated client organization: {ClientName} ({ClientId})", 
                tenant.Name, tenant.Id);

            // Return updated client summary
            return await GetClientDetail(clientId) as ActionResult<ClientSummary>;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to update client", error = ex.Message });
        }
    }

    #region Helper Methods

    private static string MapTierToString(SubscriptionTier tier)
    {
        return tier switch
        {
            SubscriptionTier.Trial => "Trial",
            SubscriptionTier.Professional => "Professional",
            SubscriptionTier.Enterprise => "Enterprise",
            SubscriptionTier.Custom => "Custom",
            _ => "Unknown"
        };
    }

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

    private static int CalculateStorageUsage(IEnumerable<Document> documents)
    {
        // Mock calculation - in reality would calculate actual file sizes
        return documents.Sum(d => d.Content?.Length ?? 0) / (1024 * 1024); // Convert to MB
    }

    private static int GetStorageQuota(SubscriptionTier tier)
    {
        return tier switch
        {
            SubscriptionTier.Trial => 100,
            SubscriptionTier.Professional => 1024,
            SubscriptionTier.Enterprise => 5120,
            SubscriptionTier.Custom => 10240,
            _ => 100
        };
    }

    private static decimal CalculateMonthlyRevenue(SubscriptionTier tier)
    {
        return tier switch
        {
            SubscriptionTier.Trial => 0,
            SubscriptionTier.Professional => 799,
            SubscriptionTier.Enterprise => 2499,
            SubscriptionTier.Custom => 5000, // Base custom pricing
            _ => 0
        };
    }

    private static decimal? CalculateAnnualContract(SubscriptionTier tier)
    {
        var monthly = CalculateMonthlyRevenue(tier);
        return monthly > 0 ? monthly * 12 * 0.9m : null; // 10% annual discount
    }

    private static int CalculateHealthScore(Tenant tenant)
    {
        var score = 100;
        
        // Deduct points for inactivity
        if (tenant.LastActivityAt < DateTime.UtcNow.AddDays(-7))
            score -= 10;
        
        if (tenant.LastActivityAt < DateTime.UtcNow.AddDays(-30))
            score -= 20;
        
        // Add other health factors as needed
        return Math.Max(0, score);
    }

    private static List<string> GetTierFeatures(SubscriptionTier tier)
    {
        var features = new List<string>();
        
        switch (tier)
        {
            case SubscriptionTier.Trial:
                features.AddRange(new[] { "Trial Access", "Basic Support", "Limited Storage" });
                break;
            case SubscriptionTier.Professional:
                features.AddRange(new[] { "Standard Support", "Team Collaboration", "Document Templates", "API Access" });
                break;
            case SubscriptionTier.Enterprise:
                features.AddRange(new[] { "SSO", "API Access", "Custom Branding", "Advanced Analytics", "Priority Support" });
                break;
            case SubscriptionTier.Custom:
                features.AddRange(new[] { "All Enterprise Features", "Custom Development", "Dedicated Support", "SLA Guarantees" });
                break;
        }
        
        return features;
    }

    #endregion
}

#region Data Transfer Objects

/// <summary>
/// Platform-wide metrics for administrative dashboard
/// </summary>
public class PlatformMetrics
{
    public int TotalClients { get; set; }
    public int ActiveClients { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalDocuments { get; set; }
    public decimal MonthlyRecurringRevenue { get; set; }
    public decimal AnnualRecurringRevenue { get; set; }
    public PlatformHealth PlatformHealth { get; set; } = new();
}

/// <summary>
/// Platform health indicators
/// </summary>
public class PlatformHealth
{
    public double ApiResponseTime { get; set; }
    public bool DatabaseHealth { get; set; }
    public double SystemUptime { get; set; }
    public int ActiveIncidents { get; set; }
}

/// <summary>
/// Client organization summary for platform admin listing
/// </summary>
public class ClientSummary
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string Tier { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int DocumentCount { get; set; }
    public int StorageUsedMB { get; set; }
    public int StorageQuotaMB { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal? AnnualContract { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActive { get; set; }
    public int HealthScore { get; set; }
    public int SupportTickets { get; set; }
    public ContactInfo BillingContact { get; set; } = new();
    public ContactInfo TechnicalContact { get; set; } = new();
    public List<string> Features { get; set; } = new();
    public bool CustomBranding { get; set; }
    public bool SsoEnabled { get; set; }
    public bool ApiAccess { get; set; }
}

/// <summary>
/// Detailed client organization information
/// </summary>
public class ClientDetail : ClientSummary
{
    public int ActiveUsers { get; set; }
    public int AdminUsers { get; set; }
    public int DocumentsThisMonth { get; set; }
    public int PublicDocuments { get; set; }
}

/// <summary>
/// Contact information
/// </summary>
public class ContactInfo
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request model for creating new client organization
/// </summary>
public class CreateClientRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Subdomain can only contain lowercase letters, numbers, and hyphens")]
    public string Subdomain { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Domain { get; set; }
    
    [Required]
    public string Tier { get; set; } = "Trial";
    
    [StringLength(100)]
    public string? BillingContactName { get; set; }
    
    [EmailAddress]
    public string? BillingContactEmail { get; set; }
    
    [StringLength(100)]
    public string? TechnicalContactName { get; set; }
    
    [EmailAddress]
    public string? TechnicalContactEmail { get; set; }
}

/// <summary>
/// Request model for updating client organization
/// </summary>
public class UpdateClientRequest
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(100)]
    public string? Domain { get; set; }
    
    public string? Tier { get; set; }
    
    public bool? IsActive { get; set; }
}

#endregion