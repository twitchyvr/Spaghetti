using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class UserRoleRepository : BaseRepository<UserRole, Guid>, IUserRoleRepository
{
    public UserRoleRepository(ApplicationDbContext context, ILogger<UserRoleRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<UserRole>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(ur => ur.UserId == userId, cancellationToken,
            ur => ur.User!,
            ur => ur.Role!);
    }

    public async Task<IEnumerable<UserRole>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(ur => ur.RoleId == roleId, cancellationToken,
            ur => ur.User!,
            ur => ur.Role!);
    }

    public async Task<IEnumerable<UserRole>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(ur => ur.UserId == userId && 
                        ur.IsActive && 
                        (ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow))
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserRole>> GetExpiringRolesAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(ur => ur.ExpiresAt.HasValue && ur.ExpiresAt <= beforeDate && ur.IsActive)
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .OrderBy(ur => ur.ExpiresAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserRole?> GetUserRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken,
            ur => ur.User!,
            ur => ur.Role!);
    }

    public async Task<bool> HasRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken = default)
    {
        return await ExistsAsync(ur => ur.UserId == userId && 
                                      ur.RoleId == roleId && 
                                      ur.IsActive && 
                                      (ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow), 
                                cancellationToken);
    }

    public async Task<int> DeleteExpiredRolesAsync(CancellationToken cancellationToken = default)
    {
        var expiredRoles = await DbSet
            .Where(ur => ur.ExpiresAt.HasValue && ur.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        var count = expiredRoles.Count;
        if (count > 0)
        {
            // Mark as inactive instead of deleting for audit purposes
            foreach (var role in expiredRoles)
            {
                role.IsActive = false;
            }
            
            DbSet.UpdateRange(expiredRoles);
            Logger.LogDebug("Deactivated {Count} expired user roles", count);
        }

        return count;
    }

    public override async Task<UserRole?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .FirstOrDefaultAsync(ur => ur.Id == id, cancellationToken);
    }
}