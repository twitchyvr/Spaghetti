using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Repository implementation for IncidentUpdate entities
/// </summary>
public class IncidentUpdateRepository : BaseRepository<IncidentUpdate, Guid>, IIncidentUpdateRepository
{
    public IncidentUpdateRepository(ApplicationDbContext context, ILogger<IncidentUpdateRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<IncidentUpdate>> GetByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.IncidentId == incidentId)
            .Include(u => u.CreatedByUser)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IncidentUpdate>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.CreatedBy == userId)
            .Include(u => u.Incident)
            .Include(u => u.CreatedByUser)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IncidentUpdate>> GetByUpdateTypeAsync(IncidentUpdateType updateType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.UpdateType == updateType)
            .Include(u => u.Incident)
            .Include(u => u.CreatedByUser)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IncidentUpdate>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.CreatedAt >= from && u.CreatedAt <= to)
            .Include(u => u.Incident)
            .Include(u => u.CreatedByUser)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IncidentUpdate?> GetLatestByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.IncidentId == incidentId)
            .Include(u => u.CreatedByUser)
            .OrderByDescending(u => u.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<IncidentUpdate>> GetRecentAsync(int count = 100, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Incident)
            .Include(u => u.CreatedByUser)
            .OrderByDescending(u => u.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default)
    {
        var updates = await DbSet
            .Where(u => u.IncidentId == incidentId)
            .ToListAsync(cancellationToken);

        DbSet.RemoveRange(updates);
        return updates.Count;
    }

    #region BaseRepository Implementation

    protected override System.Linq.Expressions.Expression<Func<IncidentUpdate, bool>> CreateIdPredicate(Guid id)
    {
        return entity => entity.Id == id;
    }

    #endregion
}