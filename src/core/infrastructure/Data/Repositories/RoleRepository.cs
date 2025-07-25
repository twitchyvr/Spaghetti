using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class RoleRepository : BaseRepository<Role, Guid>, IRoleRepository
{
    public RoleRepository(ApplicationDbContext context, ILogger<RoleRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<Role>> GetByTenantIdAsync(Guid? tenantId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(r => r.TenantId == tenantId, cancellationToken,
            r => r.RolePermissions,
            r => r.UserRoles.Where(ur => ur.IsActive));
    }

    public async Task<IEnumerable<Role>> GetSystemRolesAsync(CancellationToken cancellationToken = default)
    {
        return await FindAsync(r => r.IsSystemRole, cancellationToken,
            r => r.RolePermissions);
    }

    public async Task<Role?> GetByNameAsync(string name, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.RolePermissions)
            .Include(r => r.UserRoles.Where(ur => ur.IsActive))
            .FirstOrDefaultAsync(r => r.Name == name && r.TenantId == tenantId, cancellationToken);
    }

    public async Task<IEnumerable<Role>> GetActiveRolesAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        return await FindAsync(r => r.IsActive && r.TenantId == tenantId, cancellationToken,
            r => r.RolePermissions,
            r => r.UserRoles.Where(ur => ur.IsActive));
    }

    public async Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.UserRoles.Any(ur => ur.UserId == userId && ur.IsActive))
            .Include(r => r.RolePermissions)
            .Include(r => r.Tenant)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(r => r.Name == name && r.TenantId == tenantId, cancellationToken);
    }

    public async Task<IEnumerable<string>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await Context.RolePermissions
            .Where(rp => rp.RoleId == roleId && rp.IsGranted)
            .Select(rp => rp.Permission)
            .ToListAsync(cancellationToken);
    }

    public override async Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Tenant)
            .Include(r => r.RolePermissions)
            .Include(r => r.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.User)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<Role>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Tenant)
            .Include(r => r.RolePermissions)
            .OrderBy(r => r.IsSystemRole ? 0 : 1)
            .ThenBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }
}