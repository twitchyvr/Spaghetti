using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class TenantModuleRepository : BaseRepository<TenantModule, Guid>, ITenantModuleRepository
{
    public TenantModuleRepository(ApplicationDbContext context, ILogger<TenantModuleRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<TenantModule>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(tm => tm.TenantId == tenantId, cancellationToken,
            tm => tm.Tenant!);
    }

    public async Task<IEnumerable<TenantModule>> GetByModuleNameAsync(string moduleName, CancellationToken cancellationToken = default)
    {
        return await FindAsync(tm => tm.ModuleName == moduleName, cancellationToken,
            tm => tm.Tenant!);
    }

    public async Task<TenantModule?> GetTenantModuleAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(tm => tm.TenantId == tenantId && tm.ModuleName == moduleName, cancellationToken,
            tm => tm.Tenant!);
    }

    public async Task<IEnumerable<TenantModule>> GetEnabledModulesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(tm => tm.TenantId == tenantId && tm.IsEnabled, cancellationToken,
            tm => tm.Tenant!);
    }

    public async Task<IEnumerable<TenantModule>> GetExpiringModulesAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(tm => tm.ExpiresAt.HasValue && 
                        tm.ExpiresAt <= beforeDate && 
                        tm.IsEnabled)
            .Include(tm => tm.Tenant)
            .OrderBy(tm => tm.ExpiresAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsModuleEnabledAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        return await ExistsAsync(tm => tm.TenantId == tenantId && 
                                      tm.ModuleName == moduleName && 
                                      tm.IsEnabled &&
                                      (tm.ExpiresAt == null || tm.ExpiresAt > DateTime.UtcNow), 
                                cancellationToken);
    }

    public async Task<int> DeleteExpiredModulesAsync(CancellationToken cancellationToken = default)
    {
        var expiredModules = await DbSet
            .Where(tm => tm.ExpiresAt.HasValue && tm.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        var count = expiredModules.Count;
        if (count > 0)
        {
            // Disable instead of deleting for audit purposes
            foreach (var module in expiredModules)
            {
                module.IsEnabled = false;
            }
            
            DbSet.UpdateRange(expiredModules);
            Logger.LogDebug("Disabled {Count} expired tenant modules", count);
        }

        return count;
    }

    public override async Task<TenantModule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(tm => tm.Tenant)
            .FirstOrDefaultAsync(tm => tm.Id == id, cancellationToken);
    }
}