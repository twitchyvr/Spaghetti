using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class UserAuditEntryRepository : BaseRepository<UserAuditEntry, Guid>, IUserAuditEntryRepository
{
    public UserAuditEntryRepository(ApplicationDbContext context, ILogger<UserAuditEntryRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<UserAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.UserId == userId)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Action == action)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Timestamp >= from && e.Timestamp <= to)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuditEntry>> GetSuccessfulLoginsAsync(Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => e.Action == "Login" && e.IsSuccess);

        if (userId.HasValue)
        {
            query = query.Where(e => e.UserId == userId);
        }

        return await query
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuditEntry>> GetFailedLoginsAsync(DateTime? since = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => e.Action == "Login" && !e.IsSuccess);

        if (since.HasValue)
        {
            query = query.Where(e => e.Timestamp >= since);
        }

        return await query
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserAuditEntry>> GetRecentActivityAsync(Guid? userId = null, int count = 50, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(e => e.UserId == userId);
        }

        return await query
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteOldEntriesAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        var oldEntries = await DbSet
            .Where(e => e.Timestamp < beforeDate)
            .ToListAsync(cancellationToken);

        var count = oldEntries.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(oldEntries);
            Logger.LogDebug("Deleted {Count} old user audit entries before {Date}", count, beforeDate);
        }

        return count;
    }

    public override async Task<UserAuditEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
}