using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// User authentication method repository implementation
/// </summary>
public class UserAuthenticationMethodRepository : BaseRepository<UserAuthenticationMethod, Guid>, IUserAuthenticationMethodRepository
{
    public UserAuthenticationMethodRepository(ApplicationDbContext context, ILogger<UserAuthenticationMethodRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.IsPrimary ? 0 : 1)
            .ThenBy(m => m.Provider)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.UserId == userId && 
                       m.IsActive && 
                       (!m.ExpiresAt.HasValue || m.ExpiresAt.Value > DateTime.UtcNow) &&
                       (!m.LockedUntil.HasValue || m.LockedUntil.Value <= DateTime.UtcNow))
            .OrderBy(m => m.IsPrimary ? 0 : 1)
            .ThenBy(m => m.Provider)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserAuthenticationMethod?> GetByProviderAsync(string provider, string? externalId, CancellationToken cancellationToken = default)
    {
        var query = Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.Provider == provider);

        if (externalId != null)
        {
            query = query.Where(m => m.ExternalId == externalId);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetByProviderAsync(string provider, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.Provider == provider)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetByAuthenticationTypeAsync(string authenticationType, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.AuthenticationType == authenticationType)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetMFAMethodsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.UserId == userId && m.IsMFA && m.IsActive)
            .OrderBy(m => m.Provider)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserAuthenticationMethod?> GetPrimaryMethodAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.UserId == userId && m.IsPrimary && m.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetExpiredMethodsAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.ExpiresAt.HasValue && m.ExpiresAt.Value <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuthenticationMethod>> GetLockedMethodsAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .Include(m => m.User)
            .Where(m => m.LockedUntil.HasValue && m.LockedUntil.Value > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasProviderAsync(Guid userId, string provider, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .AnyAsync(m => m.UserId == userId && m.Provider == provider && m.IsActive, cancellationToken);
    }

    public async Task<bool> HasMFAEnabledAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<UserAuthenticationMethod>()
            .AnyAsync(m => m.UserId == userId && m.IsMFA && m.IsActive, cancellationToken);
    }

    public async Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userMethods = await Context.Set<UserAuthenticationMethod>()
            .Where(m => m.UserId == userId)
            .ToListAsync(cancellationToken);

        Context.Set<UserAuthenticationMethod>().RemoveRange(userMethods);
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteExpiredMethodsAsync(CancellationToken cancellationToken = default)
    {
        var expiredMethods = await Context.Set<UserAuthenticationMethod>()
            .Where(m => m.ExpiresAt.HasValue && m.ExpiresAt.Value <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        Context.Set<UserAuthenticationMethod>().RemoveRange(expiredMethods);
        return await Context.SaveChangesAsync(cancellationToken);
    }
}