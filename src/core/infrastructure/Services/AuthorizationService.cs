using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Authorization service implementation for role and permission management
/// </summary>
public class AuthorizationService : IAuthorizationService
{
    private readonly ILogger<AuthorizationService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public AuthorizationService(
        ILogger<AuthorizationService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permission, string? resource = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var userPermissions = await GetUserPermissionsAsync(userId, cancellationToken);
            var fullPermission = string.IsNullOrEmpty(resource) ? permission : $"{permission}.{resource}";
            
            return userPermissions.Contains(fullPermission) || userPermissions.Contains(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission {Permission} for user {UserId}: {Message}", permission, userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> HasAnyPermissionAsync(Guid userId, IEnumerable<string> permissions, string? resource = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var userPermissions = await GetUserPermissionsAsync(userId, cancellationToken);
            
            foreach (var permission in permissions)
            {
                var fullPermission = string.IsNullOrEmpty(resource) ? permission : $"{permission}.{resource}";
                if (userPermissions.Contains(fullPermission) || userPermissions.Contains(permission))
                {
                    return true;
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking any permissions for user {UserId}: {Message}", userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> HasAllPermissionsAsync(Guid userId, IEnumerable<string> permissions, string? resource = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var userPermissions = await GetUserPermissionsAsync(userId, cancellationToken);
            
            foreach (var permission in permissions)
            {
                var fullPermission = string.IsNullOrEmpty(resource) ? permission : $"{permission}.{resource}";
                if (!userPermissions.Contains(fullPermission) && !userPermissions.Contains(permission))
                {
                    return false;
                }
            }
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking all permissions for user {UserId}: {Message}", userId, ex.Message);
            return false;
        }
    }

    public async Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var permissions = new HashSet<string>();
            
            // Get permissions from roles
            var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
            foreach (var userRole in userRoles.Where(ur => ur.IsActive && (!ur.ExpiresAt.HasValue || ur.ExpiresAt > DateTime.UtcNow)))
            {
                var rolePermissions = await _unitOfWork.RolePermissions.GetByRoleIdAsync(userRole.RoleId, cancellationToken);
                foreach (var rolePermission in rolePermissions.Where(rp => rp.IsGranted))
                {
                    var permissionName = string.IsNullOrEmpty(rolePermission.ResourceFilter)
                        ? rolePermission.Permission
                        : $"{rolePermission.Permission}.{rolePermission.ResourceFilter}";
                    permissions.Add(permissionName);
                }
            }

            // Get direct user permissions
            var userPermissions = await _unitOfWork.UserPermissions.GetActiveByUserIdAsync(userId, cancellationToken);
            foreach (var userPermission in userPermissions.Where(up => up.IsValid))
            {
                permissions.Add(userPermission.FullPermission);
            }

            return permissions.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permissions for user {UserId}: {Message}", userId, ex.Message);
            return new List<string>();
        }
    }

    public async Task<List<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
            var roles = new List<Role>();

            foreach (var userRole in userRoles.Where(ur => ur.IsActive && (!ur.ExpiresAt.HasValue || ur.ExpiresAt > DateTime.UtcNow)))
            {
                var role = await _unitOfWork.Roles.GetByIdAsync(userRole.RoleId, cancellationToken);
                if (role != null && role.IsActive)
                {
                    roles.Add(role);
                }
            }

            return roles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles for user {UserId}: {Message}", userId, ex.Message);
            return new List<Role>();
        }
    }

    public async Task<bool> AssignRoleAsync(Guid userId, Guid roleId, Guid assignedBy, DateTime? expiresAt = null, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if user already has this role
            var existingUserRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
            if (existingUserRoles.Any(ur => ur.RoleId == roleId && ur.IsActive))
            {
                _logger.LogInformation("User {UserId} already has role {RoleId}", userId, roleId);
                return true;
            }

            // Verify role exists and is active
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId, cancellationToken);
            if (role == null || !role.IsActive)
            {
                _logger.LogWarning("Cannot assign inactive or non-existent role {RoleId} to user {UserId}", roleId, userId);
                return false;
            }

            // Verify user exists and is active
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Cannot assign role to inactive or non-existent user {UserId}", userId);
                return false;
            }

            // Create role assignment
            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = roleId,
                AssignedBy = assignedBy,
                ExpiresAt = expiresAt,
                IsActive = true
            };

            await _unitOfWork.UserRoles.AddAsync(userRole, cancellationToken);
            await _unitOfWork.SaveChangesAsync(assignedBy, cancellationToken);

            _logger.LogInformation("Role {RoleId} assigned to user {UserId} by {AssignedBy}", roleId, userId, assignedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}: {Message}", roleId, userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> RemoveRoleAsync(Guid userId, Guid roleId, Guid removedBy, CancellationToken cancellationToken = default)
    {
        try
        {
            var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
            var userRole = userRoles.FirstOrDefault(ur => ur.RoleId == roleId && ur.IsActive);

            if (userRole == null)
            {
                _logger.LogInformation("User {UserId} does not have role {RoleId} to remove", userId, roleId);
                return true;
            }

            userRole.IsActive = false;
            await _unitOfWork.UserRoles.UpdateAsync(userRole, cancellationToken);
            await _unitOfWork.SaveChangesAsync(removedBy, cancellationToken);

            _logger.LogInformation("Role {RoleId} removed from user {UserId} by {RemovedBy}", roleId, userId, removedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}: {Message}", roleId, userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> AssignPermissionAsync(Guid userId, string permission, string? resource, Guid grantedBy, DateTime? expiresAt = null, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if user already has this permission
            var existingPermissions = await _unitOfWork.UserPermissions.GetActiveByUserIdAsync(userId, cancellationToken);
            if (existingPermissions.Any(up => up.Permission == permission && up.Resource == resource && up.IsValid))
            {
                _logger.LogInformation("User {UserId} already has permission {Permission} on resource {Resource}", userId, permission, resource);
                return true;
            }

            // Verify user exists and is active
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Cannot assign permission to inactive or non-existent user {UserId}", userId);
                return false;
            }

            // Create permission assignment
            var userPermission = new UserPermission
            {
                UserId = userId,
                Permission = permission,
                Resource = resource,
                GrantedBy = grantedBy,
                ExpiresAt = expiresAt,
                IsActive = true
            };

            await _unitOfWork.UserPermissions.AddAsync(userPermission, cancellationToken);
            await _unitOfWork.SaveChangesAsync(grantedBy, cancellationToken);

            _logger.LogInformation("Permission {Permission} on resource {Resource} assigned to user {UserId} by {GrantedBy}", permission, resource, userId, grantedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning permission {Permission} to user {UserId}: {Message}", permission, userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> RemovePermissionAsync(Guid userId, string permission, string? resource, Guid removedBy, CancellationToken cancellationToken = default)
    {
        try
        {
            var userPermissions = await _unitOfWork.UserPermissions.GetActiveByUserIdAsync(userId, cancellationToken);
            var userPermission = userPermissions.FirstOrDefault(up => up.Permission == permission && up.Resource == resource && up.IsActive);

            if (userPermission == null)
            {
                _logger.LogInformation("User {UserId} does not have permission {Permission} on resource {Resource} to remove", userId, permission, resource);
                return true;
            }

            userPermission.IsActive = false;
            await _unitOfWork.UserPermissions.UpdateAsync(userPermission, cancellationToken);
            await _unitOfWork.SaveChangesAsync(removedBy, cancellationToken);

            _logger.LogInformation("Permission {Permission} on resource {Resource} removed from user {UserId} by {RemovedBy}", permission, resource, userId, removedBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing permission {Permission} from user {UserId}: {Message}", permission, userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> CanAccessTenantAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null || !user.IsActive)
            {
                return false;
            }

            // Platform admins can access any tenant
            if (user.UserType == UserType.PlatformAdmin)
            {
                return true;
            }

            // Check if user belongs to the tenant
            if (user.TenantId == tenantId)
            {
                return true;
            }

            // Check for specific tenant access permissions
            return await HasPermissionAsync(userId, SystemPermissions.VIEW_CLIENT_ANALYTICS, tenantId.ToString(), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking tenant access for user {UserId} and tenant {TenantId}: {Message}", userId, tenantId, ex.Message);
            return false;
        }
    }

    public async Task<bool> CanImpersonateUserAsync(Guid adminUserId, Guid targetUserId, CancellationToken cancellationToken = default)
    {
        try
        {
            var admin = await _unitOfWork.Users.GetByIdAsync(adminUserId, cancellationToken);
            var target = await _unitOfWork.Users.GetByIdAsync(targetUserId, cancellationToken);

            if (admin == null || target == null || !admin.IsActive || !target.IsActive)
            {
                return false;
            }

            // Only platform admins can impersonate
            if (admin.UserType != UserType.PlatformAdmin)
            {
                return false;
            }

            // Check for impersonation permission
            if (!await HasPermissionAsync(adminUserId, SystemPermissions.IMPERSONATE_USERS, cancellationToken: cancellationToken))
            {
                return false;
            }

            // Cannot impersonate other platform admins (unless explicitly allowed)
            if (target.UserType == UserType.PlatformAdmin)
            {
                return await HasPermissionAsync(adminUserId, "platform.impersonate_admins", cancellationToken: cancellationToken);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking impersonation permission for admin {AdminUserId} and target {TargetUserId}: {Message}", adminUserId, targetUserId, ex.Message);
            return false;
        }
    }

    public async Task<PermissionMatrix> GetPermissionMatrixAsync(Guid userId, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return new PermissionMatrix { UserId = userId };
            }

            var roles = await GetUserRolesAsync(userId, cancellationToken);
            var permissions = await GetUserPermissionsAsync(userId, cancellationToken);

            var permissionMatrix = new PermissionMatrix
            {
                UserId = userId,
                TenantId = tenantId ?? user.TenantId,
                Roles = roles.Select(r => r.Name).ToList(),
                GlobalPermissions = permissions.Where(p => !p.Contains('.')).ToList(),
                ResourcePermissions = new Dictionary<string, List<string>>()
            };

            // Group resource-specific permissions
            foreach (var permission in permissions.Where(p => p.Contains('.')))
            {
                var parts = permission.Split('.', 2);
                if (parts.Length == 2)
                {
                    var resourceType = parts[0];
                    var action = parts[1];

                    if (!permissionMatrix.ResourcePermissions.ContainsKey(resourceType))
                    {
                        permissionMatrix.ResourcePermissions[resourceType] = new List<string>();
                    }
                    permissionMatrix.ResourcePermissions[resourceType].Add(action);
                }
            }

            return permissionMatrix;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating permission matrix for user {UserId}: {Message}", userId, ex.Message);
            return new PermissionMatrix { UserId = userId };
        }
    }
}