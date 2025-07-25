using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class UserRepository : BaseRepository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AuthenticationMethods)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(u => u.TenantId == tenantId, cancellationToken,
            u => u.UserRoles.Where(ur => ur.IsActive),
            u => u.UserRoles.Select(ur => ur.Role!));
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.UserRoles.Any(ur => ur.RoleId == roleId && ur.IsActive))
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => u.IsActive);
        
        if (tenantId.HasValue)
        {
            query = query.Where(u => u.TenantId == tenantId);
        }
        
        return await query
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, Guid excludeUserId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(u => u.Email.ToLower() == email.ToLower() && u.Id != excludeUserId, cancellationToken);
    }

    public async Task<IEnumerable<User>> SearchAsync(string searchTerm, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        
        if (tenantId.HasValue)
        {
            query = query.Where(u => u.TenantId == tenantId);
        }
        
        // Search in name, email, and profile fields
        query = query.Where(u => 
            u.FirstName.Contains(searchTerm) ||
            u.LastName.Contains(searchTerm) ||
            u.Email.Contains(searchTerm) ||
            (u.Profile.JobTitle != null && u.Profile.JobTitle.Contains(searchTerm)) ||
            (u.Profile.Department != null && u.Profile.Department.Contains(searchTerm)));
        
        return await query
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Take(50) // Limit search results
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByDepartmentAsync(string department, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => u.Profile.Department == department);
        
        if (tenantId.HasValue)
        {
            query = query.Where(u => u.TenantId == tenantId);
        }
        
        return await query
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByExternalIdAsync(string provider, string externalId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AuthenticationMethods)
            .FirstOrDefaultAsync(u => u.AuthenticationMethods
                .Any(auth => auth.Provider == provider && auth.ExternalId == externalId && auth.IsActive), 
                cancellationToken);
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var permissions = await Context.RolePermissions
            .Where(rp => rp.Role!.UserRoles.Any(ur => ur.UserId == userId && ur.IsActive) && 
                        rp.IsGranted && 
                        rp.Role.IsActive)
            .Select(rp => rp.Permission)
            .Distinct()
            .ToListAsync(cancellationToken);

        return permissions;
    }

    public override async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r!.RolePermissions)
            .Include(u => u.AuthenticationMethods.Where(auth => auth.IsActive))
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public override async Task<PagedResult<User>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        ValidatePaginationParameters(page, pageSize);
        
        var query = DbSet
            .Include(u => u.Tenant)
            .Include(u => u.UserRoles.Where(ur => ur.IsActive))
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName);
        
        var totalItems = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        
        return PagedResult<User>.Create(items, page, pageSize, totalItems);
    }
}