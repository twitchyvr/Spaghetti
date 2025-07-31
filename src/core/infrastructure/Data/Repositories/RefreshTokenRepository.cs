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

    public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(rt => rt.UserId == userId && !rt.IsExpired && !rt.IsRevoked)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(rt => rt.UserId == userId)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<RefreshToken?> GetActiveTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsExpired && !rt.IsRevoked, cancellationToken);
    }
    
    public async Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userTokens = await DbSet
            .Where(rt => rt.UserId == userId)
            .ToListAsync(cancellationToken);
            
        var count = userTokens.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(userTokens);
            Logger.LogInformation("Deleted {Count} refresh tokens for user {UserId}", count, userId);
        }
        
        return count;
    }
    
    public async Task<int> RevokeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await GetByTokenAsync(token, cancellationToken);
        if (refreshToken == null || refreshToken.IsRevoked)
        {
            Logger.LogWarning("Attempted to revoke non-existent or already revoked refresh token");
            return 0;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedReason = "Manual revocation";

        await UpdateAsync(refreshToken, cancellationToken);
        Logger.LogInformation("Revoked refresh token for user {UserId}", refreshToken.UserId);
        
        return 1;
    }
    
    public async Task<int> RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var activeTokens = await GetActiveByUserIdAsync(userId, cancellationToken);
        var revokedCount = 0;

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedReason = "Bulk user token revocation";
            
            await UpdateAsync(token, cancellationToken);
            revokedCount++;
        }

        Logger.LogInformation("Revoked {Count} refresh tokens for user {UserId}", revokedCount, userId);
        return revokedCount;
    }

    public async Task<bool> IsTokenValidAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await GetByTokenAsync(token, cancellationToken);
        return refreshToken?.IsActive == true;
    }

    public async Task<bool> RevokeTokenWithDetailsAsync(string token, string? revokedByIp = null, string? reason = null, CancellationToken cancellationToken = default)
    {
        var refreshToken = await GetByTokenAsync(token, cancellationToken);
        if (refreshToken == null || refreshToken.IsRevoked)
        {
            Logger.LogWarning("Attempted to revoke non-existent or already revoked refresh token");
            return false;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = revokedByIp;
        refreshToken.RevokedReason = reason ?? "Manual revocation";

        await UpdateAsync(refreshToken, cancellationToken);
        Logger.LogInformation("Revoked refresh token for user {UserId} from IP {IP}", refreshToken.UserId, revokedByIp);
        
        return true;
    }

    public async Task<int> DeleteExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        var expiredTokens = await DbSet
            .Where(rt => rt.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        var count = expiredTokens.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(expiredTokens);
            Logger.LogInformation("Deleted {Count} expired refresh tokens", count);
        }

        return count;
    }

    public async Task<int> DeleteRevokedTokensOlderThanAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        var oldRevokedTokens = await DbSet
            .Where(rt => rt.RevokedAt.HasValue && rt.RevokedAt <= cutoffDate)
            .ToListAsync(cancellationToken);

        var count = oldRevokedTokens.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(oldRevokedTokens);
            Logger.LogInformation("Deleted {Count} old revoked refresh tokens older than {CutoffDate}", count, cutoffDate);
        }

        return count;
    }

    public async Task<IEnumerable<RefreshToken>> GetTokensByIpAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rt => rt.User)
            .Where(rt => rt.CreatedByIp == ipAddress || rt.RevokedByIp == ipAddress)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rt => rt.User)
            .Where(rt => rt.ExpiresAt <= DateTime.UtcNow)
            .OrderByDescending(rt => rt.ExpiresAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetRevokedTokensAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(rt => rt.User)
            .Where(rt => rt.RevokedAt.HasValue)
            .OrderByDescending(rt => rt.RevokedAt)
            .ToListAsync(cancellationToken);
    }
}