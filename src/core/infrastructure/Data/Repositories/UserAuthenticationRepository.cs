using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class UserAuthenticationRepository : BaseRepository<UserAuthentication, Guid>, IUserAuthenticationRepository
{
    public UserAuthenticationRepository(ApplicationDbContext context, ILogger<UserAuthenticationRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<UserAuthentication>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(ua => ua.UserId == userId, cancellationToken,
            ua => ua.User!);
    }

    public async Task<UserAuthentication?> GetByProviderAsync(string provider, string externalId, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(ua => ua.Provider == provider && ua.ExternalId == externalId, cancellationToken,
            ua => ua.User!);
    }

    public async Task<IEnumerable<UserAuthentication>> GetByProviderAsync(string provider, CancellationToken cancellationToken = default)
    {
        return await FindAsync(ua => ua.Provider == provider, cancellationToken,
            ua => ua.User!);
    }

    public async Task<IEnumerable<UserAuthentication>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(ua => ua.UserId == userId && ua.IsActive, cancellationToken,
            ua => ua.User!);
    }

    public async Task<bool> ExistsByProviderAsync(string provider, string externalId, CancellationToken cancellationToken = default)
    {
        return await ExistsAsync(ua => ua.Provider == provider && ua.ExternalId == externalId, cancellationToken);
    }

    public async Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var authentications = await DbSet
            .Where(ua => ua.UserId == userId)
            .ToListAsync(cancellationToken);

        var count = authentications.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(authentications);
            Logger.LogDebug("Deleted {Count} authentication methods for user {UserId}", count, userId);
        }

        return count;
    }

    public override async Task<UserAuthentication?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ua => ua.User)
            .FirstOrDefaultAsync(ua => ua.Id == id, cancellationToken);
    }
}