using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

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
[Authorize(Policy = "PlatformAdmin")]
public class PlatformAdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PlatformAdminController> _logger;
    private readonly IPlatformAnalyticsService _analyticsService;

    public PlatformAdminController(
        ApplicationDbContext context, 
        ILogger<PlatformAdminController> logger,
        IPlatformAnalyticsService analyticsService)
    {
        _context = context;
        _logger = logger;
        _analyticsService = analyticsService;
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
                .CountAsync(t => t.Status == TenantStatus.Active && t.UpdatedAt > DateTime.UtcNow.AddDays(-30));

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
                    Domain = t.Branding.CustomDomainName,
                    Tier = MapTierToString(t.Tier),
                    Status = t.Status.ToString(),
                    UserCount = t.Users.Count,
                    DocumentCount = t.Documents.Count,
                    StorageUsedMB = CalculateStorageUsage(t.Documents),
                    StorageQuotaMB = GetStorageQuota(t.Tier),
                    MonthlyRevenue = CalculateMonthlyRevenue(t.Tier),
                    AnnualContract = CalculateAnnualContract(t.Tier),
                    CreatedAt = t.CreatedAt,
                    LastActive = t.UpdatedAt,
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
                    Features = GetTierFeatures(t.Tier),
                    CustomBranding = t.Tier >= TenantTier.Professional,
                    SsoEnabled = t.Tier >= TenantTier.Enterprise,
                    ApiAccess = t.Tier >= TenantTier.Professional
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
                Domain = tenant.Branding.CustomDomainName,
                Tier = MapTierToString(tenant.Tier),
                Status = tenant.Status.ToString(),
                CreatedAt = tenant.CreatedAt,
                LastActive = tenant.UpdatedAt,
                
                // User analytics
                UserCount = tenant.Users.Count,
                ActiveUsers = tenant.Users.Count(u => u.LastLoginAt > DateTime.UtcNow.AddDays(-30)),
                AdminUsers = tenant.Users.Count(u => u.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == SystemRoles.CLIENT_ADMIN)),
                
                // Document analytics
                DocumentCount = tenant.Documents.Count,
                DocumentsThisMonth = tenant.Documents.Count(d => d.CreatedAt > DateTime.UtcNow.AddDays(-30)),
                PublicDocuments = tenant.Documents.Count(d => d.PublicAccessLevel != PublicAccessLevel.Private),
                
                // Storage and usage
                StorageUsedMB = CalculateStorageUsage(tenant.Documents),
                StorageQuotaMB = GetStorageQuota(tenant.Tier),
                
                // Financial
                MonthlyRevenue = CalculateMonthlyRevenue(tenant.Tier),
                AnnualContract = CalculateAnnualContract(tenant.Tier),
                
                // Health and support
                HealthScore = CalculateHealthScore(tenant),
                SupportTickets = 0, // TODO: Integrate with support system
                
                // Configuration
                Features = GetTierFeatures(tenant.Tier),
                CustomBranding = tenant.Tier >= TenantTier.Professional,
                SsoEnabled = tenant.Tier >= TenantTier.Enterprise,
                ApiAccess = tenant.Tier >= TenantTier.Professional
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

            var currentAdminId = GetCurrentPlatformAdminId();
            
            var tenant = new Tenant
            {
                Name = request.Name,
                Subdomain = request.Subdomain,
                Tier = ParseTenantTier(request.Tier),
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByPlatformAdmin = currentAdminId,
                LastModifiedByPlatformAdmin = currentAdminId,
                PlatformNotes = request.Notes,
                Branding = new TenantBranding
                {
                    CustomDomainName = request.Domain
                }
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var clientSummary = new ClientSummary
            {
                Id = tenant.Id.ToString(),
                Name = tenant.Name,
                Subdomain = tenant.Subdomain,
                Domain = tenant.Branding.CustomDomainName,
                Tier = MapTierToString(tenant.Tier),
                Status = "Active",
                UserCount = 0,
                DocumentCount = 0,
                StorageUsedMB = 0,
                StorageQuotaMB = GetStorageQuota(tenant.Tier),
                MonthlyRevenue = CalculateMonthlyRevenue(tenant.Tier),
                AnnualContract = CalculateAnnualContract(tenant.Tier),
                CreatedAt = tenant.CreatedAt,
                LastActive = tenant.UpdatedAt,
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
                Features = GetTierFeatures(tenant.Tier),
                CustomBranding = tenant.Tier >= TenantTier.Professional,
                SsoEnabled = tenant.Tier >= TenantTier.Enterprise,
                ApiAccess = tenant.Tier >= TenantTier.Professional
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
                tenant.Branding.CustomDomainName = request.Domain;
            
            if (!string.IsNullOrEmpty(request.Tier))
                tenant.Tier = ParseTenantTier(request.Tier);

            if (request.IsActive.HasValue)
                tenant.Status = request.IsActive.Value ? TenantStatus.Active : TenantStatus.Inactive;

            // Track platform admin changes
            tenant.UpdatedAt = DateTime.UtcNow;
            tenant.LastModifiedByPlatformAdmin = GetCurrentPlatformAdminId();
            
            if (!string.IsNullOrEmpty(request.Notes))
                tenant.PlatformNotes = request.Notes;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated client organization: {ClientName} ({ClientId})", 
                tenant.Name, tenant.Id);

            // Return updated client detail
            var detailResult = await GetClientDetail(clientId);
            if (detailResult.Result is OkObjectResult okResult && okResult.Value is ClientDetail detail)
            {
                // Convert ClientDetail to ClientSummary for return type compatibility
                var summary = new ClientSummary
                {
                    Id = detail.Id,
                    Name = detail.Name,
                    Subdomain = detail.Subdomain,
                    Domain = detail.Domain,
                    Tier = detail.Tier,
                    Status = detail.Status,
                    UserCount = detail.UserCount,
                    DocumentCount = detail.DocumentCount,
                    StorageUsedMB = detail.StorageUsedMB,
                    StorageQuotaMB = detail.StorageQuotaMB,
                    MonthlyRevenue = detail.MonthlyRevenue,
                    AnnualContract = detail.AnnualContract,
                    CreatedAt = detail.CreatedAt,
                    LastActive = detail.LastActive,
                    HealthScore = detail.HealthScore,
                    SupportTickets = detail.SupportTickets,
                    BillingContact = detail.BillingContact,
                    TechnicalContact = detail.TechnicalContact,
                    Features = detail.Features,
                    CustomBranding = detail.CustomBranding,
                    SsoEnabled = detail.SsoEnabled,
                    ApiAccess = detail.ApiAccess
                };
                return Ok(summary);
            }
            // If we can't convert the detail to summary, return a generic error
            return StatusCode(500, new { message = "Failed to retrieve updated client information" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update client {ClientId}", clientId);
            return StatusCode(500, new { message = "Failed to update client", error = ex.Message });
        }
    }

    /// <summary>
    /// Get comprehensive platform analytics
    /// Returns detailed analytics including revenue, usage, and customer metrics
    /// </summary>
    [HttpGet("analytics")]
    public async Task<ActionResult<PlatformAnalytics>> GetPlatformAnalytics([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var analytics = await _analyticsService.GetPlatformMetricsAsync(dateRange);
            
            _logger.LogInformation("Retrieved platform analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve platform analytics");
            return StatusCode(500, new { message = "Failed to retrieve platform analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get detailed revenue analytics and metrics
    /// </summary>
    [HttpGet("analytics/revenue")]
    public async Task<ActionResult<RevenueAnalytics>> GetRevenueAnalytics([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var analytics = await _analyticsService.GetRevenueMetricsAsync(dateRange);
            
            _logger.LogInformation("Retrieved revenue analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve revenue analytics");
            return StatusCode(500, new { message = "Failed to retrieve revenue analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get platform usage analytics
    /// </summary>
    [HttpGet("analytics/usage")]
    public async Task<ActionResult<UsageAnalytics>> GetUsageAnalytics([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var analytics = await _analyticsService.GetUsageMetricsAsync(dateRange);
            
            _logger.LogInformation("Retrieved usage analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve usage analytics");
            return StatusCode(500, new { message = "Failed to retrieve usage analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get customer analytics including acquisition, retention, and churn
    /// </summary>
    [HttpGet("analytics/customers")]
    public async Task<ActionResult<CustomerAnalytics>> GetCustomerAnalytics([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var analytics = await _analyticsService.GetCustomerMetricsAsync(dateRange);
            
            _logger.LogInformation("Retrieved customer analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve customer analytics");
            return StatusCode(500, new { message = "Failed to retrieve customer analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get revenue forecasting for specified months ahead
    /// </summary>
    [HttpGet("analytics/forecast")]
    public async Task<ActionResult<List<RevenueForecast>>> GetRevenueForecast([FromQuery] int monthsAhead = 12)
    {
        try
        {
            if (monthsAhead < 1 || monthsAhead > 36)
            {
                return BadRequest(new { message = "Months ahead must be between 1 and 36" });
            }

            var forecasts = await _analyticsService.GetRevenueForecastAsync(monthsAhead);
            
            _logger.LogInformation("Generated revenue forecast for {MonthsAhead} months ahead", monthsAhead);
            
            return Ok(forecasts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate revenue forecast");
            return StatusCode(500, new { message = "Failed to generate revenue forecast", error = ex.Message });
        }
    }

    /// <summary>
    /// Get cohort analysis for customer retention tracking
    /// </summary>
    [HttpGet("analytics/cohorts")]
    public async Task<ActionResult<CohortAnalysisResult>> GetCohortAnalysis([FromQuery] string? timeRange = "12m")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var analysis = await _analyticsService.GetCohortAnalysisAsync(dateRange);
            
            _logger.LogInformation("Performed cohort analysis for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform cohort analysis");
            return StatusCode(500, new { message = "Failed to perform cohort analysis", error = ex.Message });
        }
    }

    /// <summary>
    /// Get platform health and performance metrics
    /// </summary>
    [HttpGet("analytics/health")]
    public async Task<ActionResult<PlatformHealthAnalytics>> GetPlatformHealth([FromQuery] string? timeRange = "7d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var health = await _analyticsService.GetPlatformHealthAsync(dateRange);
            
            _logger.LogInformation("Retrieved platform health metrics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve platform health metrics");
            return StatusCode(500, new { message = "Failed to retrieve platform health metrics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get feature adoption analytics
    /// </summary>
    [HttpGet("analytics/features")]
    public async Task<ActionResult<FeatureAdoptionAnalytics>> GetFeatureAdoption([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var adoption = await _analyticsService.GetFeatureAdoptionAsync(dateRange);
            
            _logger.LogInformation("Retrieved feature adoption analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(adoption);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve feature adoption analytics");
            return StatusCode(500, new { message = "Failed to retrieve feature adoption analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get geographic distribution analytics
    /// </summary>
    [HttpGet("analytics/geographic")]
    public async Task<ActionResult<GeographicAnalytics>> GetGeographicAnalytics([FromQuery] string? timeRange = "30d")
    {
        try
        {
            var dateRange = ParseTimeRange(timeRange);
            var geographic = await _analyticsService.GetGeographicAnalyticsAsync(dateRange);
            
            _logger.LogInformation("Retrieved geographic analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);
            
            return Ok(geographic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve geographic analytics");
            return StatusCode(500, new { message = "Failed to retrieve geographic analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Parse time range string into DateRange object
    /// </summary>
    private static DateRange ParseTimeRange(string? timeRange)
    {
        return timeRange?.ToLower() switch
        {
            "7d" => DateRange.Last30Days(), // 7 days not implemented, using 30
            "30d" => DateRange.Last30Days(),
            "90d" => DateRange.Last90Days(),
            "12m" or "1y" => DateRange.LastYear(),
            "current" => DateRange.CurrentMonth(),
            "last" => DateRange.LastMonth(),
            _ => DateRange.Last30Days()
        };
    }

    #region Helper Methods

    private static string MapTierToString(TenantTier tier)
    {
        return tier switch
        {
            TenantTier.Trial => "Trial",
            TenantTier.Professional => "Professional",
            TenantTier.Enterprise => "Enterprise",
            TenantTier.Custom => "Custom",
            _ => "Unknown"
        };
    }

    private static TenantTier ParseTenantTier(string tier)
    {
        return tier.ToLower() switch
        {
            "trial" => TenantTier.Trial,
            "professional" => TenantTier.Professional,
            "enterprise" => TenantTier.Enterprise,
            "custom" => TenantTier.Custom,
            _ => TenantTier.Trial
        };
    }

    private static int CalculateStorageUsage(IEnumerable<Document> documents)
    {
        // Mock calculation - in reality would calculate actual file sizes
        return documents.Sum(d => d.Content?.Length ?? 0) / (1024 * 1024); // Convert to MB
    }

    private static int GetStorageQuota(TenantTier tier)
    {
        return tier switch
        {
            TenantTier.Trial => 100,
            TenantTier.Professional => 1024,
            TenantTier.Enterprise => 5120,
            TenantTier.Custom => 10240,
            _ => 100
        };
    }

    private static decimal CalculateMonthlyRevenue(TenantTier tier)
    {
        return tier switch
        {
            TenantTier.Trial => 0,
            TenantTier.Professional => 799,
            TenantTier.Enterprise => 2499,
            TenantTier.Custom => 5000, // Base custom pricing
            _ => 0
        };
    }

    private static decimal? CalculateAnnualContract(TenantTier tier)
    {
        var monthly = CalculateMonthlyRevenue(tier);
        return monthly > 0 ? monthly * 12 * 0.9m : null; // 10% annual discount
    }

    private static int CalculateHealthScore(Tenant tenant)
    {
        var score = 100;
        
        // Deduct points for inactivity
        if (tenant.UpdatedAt < DateTime.UtcNow.AddDays(-7))
            score -= 10;
        
        if (tenant.UpdatedAt < DateTime.UtcNow.AddDays(-30))
            score -= 20;
        
        // Add other health factors as needed
        return Math.Max(0, score);
    }

    private static List<string> GetTierFeatures(TenantTier tier)
    {
        var features = new List<string>();
        
        switch (tier)
        {
            case TenantTier.Trial:
                features.AddRange(new[] { "Trial Access", "Basic Support", "Limited Storage" });
                break;
            case TenantTier.Professional:
                features.AddRange(new[] { "Standard Support", "Team Collaboration", "Document Templates", "API Access" });
                break;
            case TenantTier.Enterprise:
                features.AddRange(new[] { "SSO", "API Access", "Custom Branding", "Advanced Analytics", "Priority Support" });
                break;
            case TenantTier.Custom:
                features.AddRange(new[] { "All Enterprise Features", "Custom Development", "Dedicated Support", "SLA Guarantees" });
                break;
        }
        
        return features;
    }

    private Guid? GetCurrentPlatformAdminId()
    {
        // Try to get the current user ID from claims
        var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
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
    
    [StringLength(1000)]
    public string? Notes { get; set; }
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
    
    [StringLength(1000)]
    public string? Notes { get; set; }
}

#endregion