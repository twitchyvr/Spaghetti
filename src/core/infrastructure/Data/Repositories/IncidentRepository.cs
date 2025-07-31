using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Repository implementation for Incident entities
/// </summary>
public class IncidentRepository : BaseRepository<Incident, Guid>, IIncidentRepository
{
    public IncidentRepository(ApplicationDbContext context, ILogger<IncidentRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<Incident>> GetActiveIncidentsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.Status != IncidentStatus.Resolved && i.Status != IncidentStatus.Closed)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetByStatusAsync(IncidentStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.Status == status)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetBySeverityAsync(IncidentSeverity severity, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.Severity == severity)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetByAssignedToAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.AssignedTo == userId)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.CreatedBy == userId)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.CreatedAt >= from && i.CreatedAt <= to)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetByAffectedServiceAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.AffectedServices != null && i.AffectedServices.Contains(serviceName))
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetUnresolvedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.Status != IncidentStatus.Resolved && i.Status != IncidentStatus.Closed)
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderBy(i => i.Severity) // Critical first
            .ThenBy(i => i.CreatedAt) // Oldest first
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Incident>> GetRecentAsync(int count = 50, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.CreatedByUser)
            .Include(i => i.AssignedToUser)
            .OrderByDescending(i => i.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveIncidentCountAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(i => i.Status != IncidentStatus.Resolved && i.Status != IncidentStatus.Closed, cancellationToken);
    }

    public async Task<int> GetIncidentCountByStatusAsync(IncidentStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(i => i.Status == status, cancellationToken);
    }

    public async Task<TimeSpan> GetAverageResolutionTimeAsync(IncidentSeverity? severity = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Where(i => i.Status == IncidentStatus.Resolved && i.ResolvedAt.HasValue);

        if (severity.HasValue)
        {
            query = query.Where(i => i.Severity == severity.Value);
        }

        var resolutionTimes = await query
            .Select(i => new { i.CreatedAt, i.ResolvedAt })
            .ToListAsync(cancellationToken);

        if (!resolutionTimes.Any())
        {
            return TimeSpan.Zero;
        }

        var totalTicks = resolutionTimes
            .Where(rt => rt.ResolvedAt.HasValue)
            .Sum(rt => (rt.ResolvedAt!.Value - rt.CreatedAt).Ticks);

        var averageTicks = totalTicks / resolutionTimes.Count;
        return new TimeSpan(averageTicks);
    }

    #region BaseRepository Implementation

    protected override System.Linq.Expressions.Expression<Func<Incident, bool>> CreateIdPredicate(Guid id)
    {
        return entity => entity.Id == id;
    }

    #endregion
}