using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Repository implementation for SystemHealthMetric entities
/// </summary>
public class SystemHealthMetricRepository : BaseRepository<SystemHealthMetric, Guid>, ISystemHealthMetricRepository
{
    public SystemHealthMetricRepository(ApplicationDbContext context, ILogger<SystemHealthMetricRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.ServiceName == serviceName)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Timestamp >= from && m.Timestamp <= to)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetByServiceAndDateRangeAsync(string serviceName, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.ServiceName == serviceName && m.Timestamp >= from && m.Timestamp <= to)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetByStatusAsync(HealthStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Status == status)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetByMetricNameAsync(string metricName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.MetricName == metricName)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(cancellationToken);
    }

    public async Task<SystemHealthMetric?> GetLatestByServiceAsync(string serviceName, string metricName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.ServiceName == serviceName && m.MetricName == metricName)
            .OrderByDescending(m => m.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetRecentAsync(int count = 100, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .OrderByDescending(m => m.Timestamp)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SystemHealthMetric>> GetRecentByServiceAsync(string serviceName, int count = 100, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.ServiceName == serviceName)
            .OrderByDescending(m => m.Timestamp)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> DeleteOldMetricsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        var oldMetrics = await DbSet
            .Where(m => m.Timestamp < beforeDate)
            .ToListAsync(cancellationToken);

        DbSet.RemoveRange(oldMetrics);
        return oldMetrics.Count;
    }

    public async Task<IEnumerable<string>> GetDistinctServiceNamesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Select(m => m.ServiceName)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<string>> GetDistinctMetricNamesAsync(string? serviceName = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (!string.IsNullOrEmpty(serviceName))
        {
            query = query.Where(m => m.ServiceName == serviceName);
        }

        return await query
            .Select(m => m.MetricName)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync(cancellationToken);
    }

    #region BaseRepository Implementation

    protected override System.Linq.Expressions.Expression<Func<SystemHealthMetric, bool>> CreateIdPredicate(Guid id)
    {
        return entity => entity.Id == id;
    }

    #endregion
}