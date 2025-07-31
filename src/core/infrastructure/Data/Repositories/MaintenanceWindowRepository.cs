using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Repository implementation for MaintenanceWindow entities
/// </summary>
public class MaintenanceWindowRepository : BaseRepository<MaintenanceWindow, Guid>, IMaintenanceWindowRepository
{
    public MaintenanceWindowRepository(ApplicationDbContext context, ILogger<MaintenanceWindowRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetScheduledAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Status == MaintenanceStatus.Scheduled)
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetByStatusAsync(MaintenanceStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Status == status)
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetByTypeAsync(MaintenanceType type, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Type == type)
            .Include(m => m.CreatedByUser)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.StartTime >= from && m.EndTime <= to)
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.CreatedBy == userId)
            .Include(m => m.CreatedByUser)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetActiveMaintenanceAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(m => m.Status == MaintenanceStatus.InProgress || 
                       (m.Status == MaintenanceStatus.Scheduled && m.StartTime <= now && m.EndTime >= now))
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetUpcomingMaintenanceAsync(TimeSpan withinTimeSpan, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var maxTime = now.Add(withinTimeSpan);
        
        return await DbSet
            .Where(m => m.Status == MaintenanceStatus.Scheduled && 
                       m.StartTime >= now && 
                       m.StartTime <= maxTime)
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetByAffectedServiceAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.AffectedServices != null && m.AffectedServices.Contains(serviceName))
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceWindow>> GetConflictingMaintenanceAsync(DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(m => m.Status != MaintenanceStatus.Cancelled && 
                       m.Status != MaintenanceStatus.Completed &&
                       m.Status != MaintenanceStatus.Failed &&
                       ((m.StartTime >= startTime && m.StartTime < endTime) ||
                        (m.EndTime > startTime && m.EndTime <= endTime) ||
                        (m.StartTime <= startTime && m.EndTime >= endTime)))
            .Include(m => m.CreatedByUser)
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    #region BaseRepository Implementation

    protected override System.Linq.Expressions.Expression<Func<MaintenanceWindow, bool>> CreateIdPredicate(Guid id)
    {
        return entity => entity.Id == id;
    }

    #endregion
}