using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Authentication session repository implementation
/// </summary>
public class AuthenticationSessionRepository : BaseRepository<AuthenticationSession, Guid>, IAuthenticationSessionRepository
{
    public AuthenticationSessionRepository(ApplicationDbContext context, ILogger<AuthenticationSessionRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<AuthenticationSession?> GetBySessionTokenAsync(string sessionToken, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Include(s => s.ImpersonatingUser)
            .FirstOrDefaultAsync(s => s.SessionToken == sessionToken, cancellationToken);
    }

    public async Task<AuthenticationSession?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Include(s => s.ImpersonatingUser)
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken, cancellationToken);
    }

    public async Task<IEnumerable<AuthenticationSession>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Where(s => s.UserId == userId && s.IsActive && s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.LastAccessedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AuthenticationSession>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Include(s => s.ImpersonatingUser)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AuthenticationSession>> GetExpiredSessionsAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Where(s => s.ExpiresAt <= DateTime.UtcNow || !s.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AuthenticationSession>> GetSessionsByIPAddressAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Where(s => s.IPAddress == ipAddress)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AuthenticationSession>> GetImpersonationSessionsAsync(Guid? adminUserId = null, CancellationToken cancellationToken = default)
    {
        var query = Context.Set<AuthenticationSession>()
            .Include(s => s.User)
            .Include(s => s.ImpersonatingUser)
            .Where(s => s.ImpersonatedBy != null);

        if (adminUserId.HasValue)
        {
            query = query.Where(s => s.ImpersonatedBy == adminUserId.Value);
        }

        return await query
            .OrderByDescending(s => s.ImpersonationStartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteExpiredSessionsAsync(CancellationToken cancellationToken = default)
    {
        var expiredSessions = await Context.Set<AuthenticationSession>()
            .Where(s => s.ExpiresAt <= DateTime.UtcNow || !s.IsActive)
            .ToListAsync(cancellationToken);

        Context.Set<AuthenticationSession>().RemoveRange(expiredSessions);
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userSessions = await Context.Set<AuthenticationSession>()
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);

        Context.Set<AuthenticationSession>().RemoveRange(userSessions);
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> IsSessionActiveAsync(string sessionToken, CancellationToken cancellationToken = default)
    {
        return await Context.Set<AuthenticationSession>()
            .AnyAsync(s => s.SessionToken == sessionToken && 
                          s.IsActive && 
                          s.ExpiresAt > DateTime.UtcNow, 
                      cancellationToken);
    }
}