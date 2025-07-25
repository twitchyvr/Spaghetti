using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class DocumentAuditEntryRepository : BaseRepository<DocumentAuditEntry, Guid>, IDocumentAuditEntryRepository
{
    public DocumentAuditEntryRepository(ApplicationDbContext context, ILogger<DocumentAuditEntryRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<DocumentAuditEntry>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.DocumentId == documentId)
            .Include(e => e.User)
            .Include(e => e.Document)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocumentAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.UserId == userId)
            .Include(e => e.User)
            .Include(e => e.Document)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocumentAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Action == action)
            .Include(e => e.User)
            .Include(e => e.Document)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocumentAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.Timestamp >= from && e.Timestamp <= to)
            .Include(e => e.User)
            .Include(e => e.Document)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocumentAuditEntry>> GetRecentActivityAsync(Guid? documentId = null, Guid? userId = null, int count = 50, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (documentId.HasValue)
        {
            query = query.Where(e => e.DocumentId == documentId);
        }

        if (userId.HasValue)
        {
            query = query.Where(e => e.UserId == userId);
        }

        return await query
            .Include(e => e.User)
            .Include(e => e.Document)
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
            Logger.LogDebug("Deleted {Count} old document audit entries before {Date}", count, beforeDate);
        }

        return count;
    }

    public override async Task<DocumentAuditEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Document)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
}