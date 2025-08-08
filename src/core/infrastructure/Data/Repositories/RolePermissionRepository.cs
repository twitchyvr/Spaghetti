using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class RolePermissionRepository : BaseRepository<RolePermission, Guid>, IRolePermissionRepository
{
    public RolePermissionRepository(ApplicationDbContext context, ILogger<RolePermissionRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<RolePermission>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(rp => rp.RoleId == roleId, cancellationToken,
            rp => rp.Role!);
    }

    public async Task<IEnumerable<RolePermission>> GetByPermissionAsync(string permission, CancellationToken cancellationToken = default)
    {
        return await FindAsync(rp => rp.Permission == permission, cancellationToken,
            rp => rp.Role!);
    }

    public async Task<RolePermission?> GetRolePermissionAsync(Guid roleId, string permission, string? resource = null, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(rp => rp.RoleId == roleId && 
                                              rp.Permission == permission && 
                                              rp.ResourceFilter == resource, 
                                        cancellationToken,
                                        rp => rp.Role!);
    }

    public async Task<bool> HasPermissionAsync(Guid roleId, string permission, string? resource = null, CancellationToken cancellationToken = default)
    {
        return await ExistsAsync(rp => rp.RoleId == roleId && 
                                      rp.Permission == permission && 
                                      rp.ResourceFilter == resource && 
                                      rp.IsGranted, 
                                cancellationToken);
    }

    public async Task<IEnumerable<string>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(rp => rp.RoleId == roleId && rp.IsGranted)
            .Select(rp => rp.Permission)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var permissions = await DbSet
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync(cancellationToken);

        var count = permissions.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(permissions);
            Logger.LogDebug("Deleted {Count} permissions for role {RoleId}", count, roleId);
        }

        return count;
    }

    public override async Task<RolePermission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rp => rp.Role)
            .FirstOrDefaultAsync(rp => rp.Id == id, cancellationToken);
    }
}