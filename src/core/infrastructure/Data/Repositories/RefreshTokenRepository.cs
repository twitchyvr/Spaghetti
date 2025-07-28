using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class RefreshTokenRepository : BaseRepository<RefreshToken, Guid>, IRefreshTokenRepository
{
    public RefreshTokenRepository(ApplicationDbContext context, ILogger<RefreshTokenRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(rt => rt.UserId == userId)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(rt => rt.UserId == userId && !rt.IsExpired && !rt.IsRevoked)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(rt => rt.ExpiresAt <= now && !rt.IsRevoked)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsTokenValidAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await GetByTokenAsync(token, cancellationToken);
        return refreshToken != null && refreshToken.IsActive;
    }

    public async Task<bool> RevokeTokenAsync(string token, string? revokedByIp = null, string? reason = null, CancellationToken cancellationToken = default)
    {
        var refreshToken = await GetByTokenAsync(token, cancellationToken);
        if (refreshToken == null || refreshToken.IsRevoked)
        {
            return false;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = revokedByIp;
        refreshToken.RevokedReason = reason ?? "Manual revocation";

        await UpdateAsync(refreshToken, cancellationToken);
        return true;
    }

    public async Task<int> RevokeAllUserTokensAsync(Guid userId, string? revokedByIp = null, string? reason = null, CancellationToken cancellationToken = default)
    {
        var activeTokens = await GetActiveByUserIdAsync(userId, cancellationToken);
        var count = 0;

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = revokedByIp;
            token.RevokedReason = reason ?? "Revoke all user tokens";
            count++;
        }

        if (count > 0)
        {
            await UpdateRangeAsync(activeTokens, cancellationToken);
        }

        return count;
    }

    public async Task<int> DeleteExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        var expiredTokens = await GetExpiredTokensAsync(cancellationToken);
        return await DeleteRangeAsync(expiredTokens, cancellationToken);
    }
}