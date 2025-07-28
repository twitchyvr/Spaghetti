using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.API.Authorization;

/// <summary>
/// Authorization handler for tenant-aware access control
/// </summary>
public class TenantAuthorizationHandler : AuthorizationHandler<TenantRequirement>
{
    private readonly ILogger<TenantAuthorizationHandler> _logger;

    public TenantAuthorizationHandler(ILogger<TenantAuthorizationHandler> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TenantRequirement requirement)
    {
        try
        {
            var user = context.User;
            
            // Platform admins can access any tenant
            if (user.IsInRole("Platform.Admin"))
            {
                _logger.LogDebug("Platform admin access granted");
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Get user's tenant ID from claims
            var userTenantIdClaim = user.FindFirst("tenant_id");
            if (userTenantIdClaim == null || !Guid.TryParse(userTenantIdClaim.Value, out var userTenantId))
            {
                _logger.LogWarning("User has no valid tenant ID claim");
                context.Fail();
                return Task.CompletedTask;
            }

            // Get requested tenant ID from HTTP context
            if (context.Resource is HttpContext httpContext)
            {
                var requestedTenantId = httpContext.GetTenantId();
                
                if (requestedTenantId == null)
                {
                    // No specific tenant requested, allow if user has any tenant
                    if (userTenantId != Guid.Empty)
                    {
                        context.Succeed(requirement);
                    }
                    else
                    {
                        context.Fail();
                    }
                    return Task.CompletedTask;
                }

                // Check if user belongs to the requested tenant
                if (userTenantId == requestedTenantId)
                {
                    _logger.LogDebug("Tenant access granted: User {UserId} accessing tenant {TenantId}", 
                        user.FindFirst(ClaimTypes.NameIdentifier)?.Value, requestedTenantId);
                    context.Succeed(requirement);
                }
                else
                {
                    _logger.LogWarning("Tenant access denied: User {UserId} attempted to access tenant {RequestedTenantId} but belongs to {UserTenantId}",
                        user.FindFirst(ClaimTypes.NameIdentifier)?.Value, requestedTenantId, userTenantId);
                    context.Fail();
                }
            }
            else
            {
                _logger.LogWarning("No HTTP context available for tenant authorization");
                context.Fail();
            }

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during tenant authorization");
            context.Fail();
            return Task.CompletedTask;
        }
    }
}

/// <summary>
/// Authorization requirement for tenant access
/// </summary>
public class TenantRequirement : IAuthorizationRequirement
{
    public TenantRequirement()
    {
    }
}

/// <summary>
/// Authorization handler for document ownership
/// </summary>
public class DocumentOwnershipHandler : AuthorizationHandler<DocumentOwnershipRequirement>
{
    private readonly ILogger<DocumentOwnershipHandler> _logger;

    public DocumentOwnershipHandler(ILogger<DocumentOwnershipHandler> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DocumentOwnershipRequirement requirement)
    {
        try
        {
            var user = context.User;
            
            // Platform admins can access any document
            if (user.IsInRole("Platform.Admin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Client admins can access documents in their tenant
            if (user.IsInRole("Client.Admin"))
            {
                // Additional logic would check if document belongs to user's tenant
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Check document-specific permissions
            if (user.HasClaim("permission", "document.delete") || 
                user.HasClaim("permission", "document.update"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Check if user is the document owner
            // This would require additional context about the specific document
            // For now, we'll allow if user has basic document permissions
            if (user.HasClaim("permission", "document.read"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            context.Fail();
            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during document ownership authorization");
            context.Fail();
            return Task.CompletedTask;
        }
    }
}

/// <summary>
/// Authorization requirement for document ownership
/// </summary>
public class DocumentOwnershipRequirement : IAuthorizationRequirement
{
    public Guid? DocumentId { get; }

    public DocumentOwnershipRequirement(Guid? documentId = null)
    {
        DocumentId = documentId;
    }
}

/// <summary>
/// Extension methods for adding custom authorization handlers
/// </summary>
public static class AuthorizationExtensions
{
    public static IServiceCollection AddCustomAuthorization(this IServiceCollection services)
    {
        services.AddScoped<IAuthorizationHandler, TenantAuthorizationHandler>();
        services.AddScoped<IAuthorizationHandler, DocumentOwnershipHandler>();
        
        return services;
    }
}