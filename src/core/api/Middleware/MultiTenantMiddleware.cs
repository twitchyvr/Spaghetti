using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.Services;

namespace EnterpriseDocsCore.API.Middleware;

public class MultiTenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<MultiTenantMiddleware> _logger;

    public MultiTenantMiddleware(RequestDelegate next, ILogger<MultiTenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContextService tenantContext)
    {
        var tenantId = ResolveTenantId(context);
        tenantContext.SetCurrentTenant(tenantId);
        
        _logger.LogDebug("Tenant context set to {TenantId} for request {RequestPath}", 
            tenantId, context.Request.Path);

        await _next(context);
    }

    private Guid ResolveTenantId(HttpContext context)
    {
        // Try to get tenant from header first
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue) &&
            Guid.TryParse(headerValue.FirstOrDefault(), out var headerTenantId))
        {
            return headerTenantId;
        }

        // Try to get from subdomain (for future implementation)
        var host = context.Request.Host.Host;
        if (host.Contains('.') && !host.StartsWith("www"))
        {
            var subdomain = host.Split('.')[0];
            // TODO: Look up tenant by subdomain in database
            _logger.LogDebug("Subdomain detected: {Subdomain}", subdomain);
        }

        // Default to first tenant for development
        var defaultTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        _logger.LogDebug("Using default tenant ID {TenantId}", defaultTenantId);
        return defaultTenantId;
    }
}
