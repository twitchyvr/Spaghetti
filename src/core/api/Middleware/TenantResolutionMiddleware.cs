using Microsoft.Extensions.Options;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Middleware;

/// <summary>
/// Middleware for resolving tenant context from HTTP requests
/// </summary>
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;
    private readonly TenantResolutionOptions _options;

    public TenantResolutionMiddleware(
        RequestDelegate next,
        ILogger<TenantResolutionMiddleware> logger,
        IOptions<TenantResolutionOptions> options)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
    }

    public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork)
    {
        try
        {
            var tenantContext = await ResolveTenantAsync(context, unitOfWork);
            
            if (tenantContext != null)
            {
                // Add tenant information to HttpContext for downstream use
                context.Items["TenantContext"] = tenantContext;
                context.Items["TenantId"] = tenantContext.Id;
                
                _logger.LogDebug("Resolved tenant: {TenantName} ({TenantId}) for request {RequestPath}",
                    tenantContext.Name, tenantContext.Id, context.Request.Path);
            }
            
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during tenant resolution");
            await _next(context);
        }
    }

    private async Task<Tenant?> ResolveTenantAsync(HttpContext context, IUnitOfWork unitOfWork)
    {
        try
        {
            // Method 1: Resolve from JWT token if user is authenticated
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var tenantIdClaim = context.User.FindFirst("tenant_id");
                if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    var tenant = await unitOfWork.Tenants.GetByIdAsync(tenantId);
                    if (tenant != null && tenant.IsActive)
                    {
                        return tenant;
                    }
                }
            }

            // Method 2: Resolve from subdomain (for multi-tenant SaaS)
            if (_options.EnableSubdomainResolution)
            {
                var host = context.Request.Host.Host;
                var subdomain = ExtractSubdomain(host);
                
                if (!string.IsNullOrEmpty(subdomain) && !IsSystemSubdomain(subdomain))
                {
                    var tenant = await unitOfWork.Tenants.GetBySubdomainAsync(subdomain);
                    if (tenant != null && tenant.IsActive)
                    {
                        return tenant;
                    }
                }
            }

            // Method 3: Resolve from custom header
            if (_options.EnableHeaderResolution)
            {
                if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
                {
                    if (Guid.TryParse(tenantIdHeader.FirstOrDefault(), out var tenantId))
                    {
                        var tenant = await unitOfWork.Tenants.GetByIdAsync(tenantId);
                        if (tenant != null && tenant.IsActive)
                        {
                            return tenant;
                        }
                    }
                }

                if (context.Request.Headers.TryGetValue("X-Tenant-Subdomain", out var subdomainHeader))
                {
                    var subdomain = subdomainHeader.FirstOrDefault();
                    if (!string.IsNullOrEmpty(subdomain))
                    {
                        var tenant = await unitOfWork.Tenants.GetBySubdomainAsync(subdomain);
                        if (tenant != null && tenant.IsActive)
                        {
                            return tenant;
                        }
                    }
                }
            }

            // Method 4: Resolve from query parameter (for development/testing)
            if (_options.EnableQueryParameterResolution)
            {
                if (context.Request.Query.TryGetValue("tenant", out var tenantParam))
                {
                    var tenantIdentifier = tenantParam.FirstOrDefault();
                    if (!string.IsNullOrEmpty(tenantIdentifier))
                    {
                        // Try as GUID first
                        if (Guid.TryParse(tenantIdentifier, out var tenantId))
                        {
                            var tenant = await unitOfWork.Tenants.GetByIdAsync(tenantId);
                            if (tenant != null && tenant.IsActive)
                            {
                                return tenant;
                            }
                        }
                        
                        // Try as subdomain
                        var tenantBySubdomain = await unitOfWork.Tenants.GetBySubdomainAsync(tenantIdentifier);
                        if (tenantBySubdomain != null && tenantBySubdomain.IsActive)
                        {
                            return tenantBySubdomain;
                        }
                    }
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resolve tenant for request {RequestPath}", context.Request.Path);
            return null;
        }
    }

    private string? ExtractSubdomain(string host)
    {
        if (string.IsNullOrEmpty(host))
            return null;

        // Remove port if present
        var hostWithoutPort = host.Split(':')[0];
        
        // Split by dots
        var parts = hostWithoutPort.Split('.');
        
        // Need at least 3 parts for subdomain (subdomain.domain.tld)
        if (parts.Length < 3)
            return null;

        // Return the first part as subdomain
        return parts[0].ToLowerInvariant();
    }

    private bool IsSystemSubdomain(string subdomain)
    {
        var systemSubdomains = new[] { "www", "api", "admin", "app", "portal", "docs", "support", "help" };
        return systemSubdomains.Contains(subdomain.ToLowerInvariant());
    }
}

/// <summary>
/// Extension methods for tenant resolution middleware
/// </summary>
public static class TenantResolutionMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantResolution(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantResolutionMiddleware>();
    }

    public static IServiceCollection AddTenantResolution(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<TenantResolutionOptions>(configuration.GetSection("MultiTenant"));
        return services;
    }
}

/// <summary>
/// Configuration options for tenant resolution
/// </summary>
public class TenantResolutionOptions
{
    public bool EnableSubdomainResolution { get; set; } = true;
    public bool EnableHeaderResolution { get; set; } = true;
    public bool EnableQueryParameterResolution { get; set; } = false; // Only for dev/testing
    public string DefaultTenant { get; set; } = "system";
    public bool RequireHttps { get; set; } = false;
}

/// <summary>
/// Extension methods for accessing tenant context from HttpContext
/// </summary>
public static class TenantContextExtensions
{
    public static Tenant? GetTenantContext(this HttpContext context)
    {
        return context.Items["TenantContext"] as Tenant;
    }

    public static Guid? GetTenantId(this HttpContext context)
    {
        return context.Items["TenantId"] as Guid?;
    }

    public static bool HasTenantContext(this HttpContext context)
    {
        return context.Items.ContainsKey("TenantContext") && context.Items["TenantContext"] != null;
    }
}