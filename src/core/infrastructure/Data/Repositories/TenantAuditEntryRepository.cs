using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class TenantAuditEntryRepository : BaseRepository<TenantAuditEntry, Guid>, ITenantAuditEntryRepository
{
    public TenantAuditEntryRepository(ApplicationDbContext context, ILogger<TenantAuditEntryRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.TenantId == tenantId)
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Action == action)
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.UserId == userId)
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Timestamp >= from && e.Timestamp <= to)
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetBySeverityAsync(AuditSeverity severity, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Severity == severity)
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantAuditEntry>> GetRecentActivityAsync(Guid? tenantId = null, int count = 50, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (tenantId.HasValue)
        {
            query = query.Where(e => e.TenantId == tenantId);
        }

        return await query
            .Include(e => e.Tenant)
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
            Logger.LogDebug("Deleted {Count} old tenant audit entries before {Date}", count, beforeDate);
        }

        return count;
    }

    public override async Task<TenantAuditEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Tenant)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
}