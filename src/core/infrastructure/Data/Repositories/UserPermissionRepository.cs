using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// User permission repository implementation
/// </summary>
public class UserPermissionRepository : BaseRepository<UserPermission, Guid>, IUserPermissionRepository
{
    public UserPermissionRepository(ApplicationDbContext context, ILogger<UserPermissionRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<UserPermission>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.GrantedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserPermission>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.UserId == userId && 
                       p.IsActive && 
                       (!p.ExpiresAt.HasValue || p.ExpiresAt.Value > DateTime.UtcNow))
            .OrderByDescending(p => p.GrantedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserPermission>> GetByPermissionAsync(string permission, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.Permission == permission)
            .OrderByDescending(p => p.GrantedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserPermission>> GetByResourceAsync(string resource, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.Resource == resource)
            .OrderByDescending(p => p.GrantedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserPermission>> GetExpiringPermissionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.ExpiresAt.HasValue && p.ExpiresAt.Value <= beforeDate && p.IsActive)
            .OrderBy(p => p.ExpiresAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserPermission?> GetUserPermissionAsync(Guid userId, string permission, string? resource = null, CancellationToken cancellationToken = default)
    {
        var query = Context.Set<UserPermission>()
            .Include(p => p.User)
            .Include(p => p.GrantedByUser)
            .Where(p => p.UserId == userId && p.Permission == permission);

        if (resource != null)
        {
            query = query.Where(p => p.Resource == resource);
        }
        else
        {
            query = query.Where(p => p.Resource == null);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permission, string? resource = null, CancellationToken cancellationToken = default)
    {
        var query = Context.Set<UserPermission>()
            .Where(p => p.UserId == userId && 
                       p.Permission == permission && 
                       p.IsActive && 
                       (!p.ExpiresAt.HasValue || p.ExpiresAt.Value > DateTime.UtcNow));

        if (resource != null)
        {
            query = query.Where(p => p.Resource == resource);
        }
        else
        {
            query = query.Where(p => p.Resource == null);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserPermission>()
            .Where(p => p.UserId == userId && 
                       p.IsActive && 
                       (!p.ExpiresAt.HasValue || p.ExpiresAt.Value > DateTime.UtcNow))
            .Select(p => string.IsNullOrEmpty(p.Resource) ? p.Permission : $"{p.Permission}.{p.Resource}")
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteExpiredPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var expiredPermissions = await Context.Set<UserPermission>()
            .Where(p => p.ExpiresAt.HasValue && p.ExpiresAt.Value <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        Context.Set<UserPermission>().RemoveRange(expiredPermissions);
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userPermissions = await Context.Set<UserPermission>()
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        Context.Set<UserPermission>().RemoveRange(userPermissions);
        return await Context.SaveChangesAsync(cancellationToken);
    }
}