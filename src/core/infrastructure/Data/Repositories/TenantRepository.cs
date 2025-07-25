using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class TenantRepository : BaseRepository<Tenant, Guid>, ITenantRepository
{
    public TenantRepository(ApplicationDbContext context, ILogger<TenantRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<Tenant?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Modules.Where(m => m.IsEnabled))
            .Include(t => t.Users.Where(u => u.IsActive))
            .Include(t => t.Roles.Where(r => r.IsActive))
            .FirstOrDefaultAsync(t => t.Subdomain.ToLower() == subdomain.ToLower(), cancellationToken);
    }

    public async Task<IEnumerable<Tenant>> GetByStatusAsync(TenantStatus status, CancellationToken cancellationToken = default)
    {
        return await FindAsync(t => t.Status == status, cancellationToken,
            t => t.Users.Where(u => u.IsActive),
            t => t.Modules.Where(m => m.IsEnabled));
    }

    public async Task<IEnumerable<Tenant>> GetByTierAsync(TenantTier tier, CancellationToken cancellationToken = default)
    {
        return await FindAsync(t => t.Tier == tier, cancellationToken,
            t => t.Users.Where(u => u.IsActive));
    }

    public async Task<bool> ExistsBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.Subdomain.ToLower() == subdomain.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsBySubdomainAsync(string subdomain, Guid excludeTenantId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.Subdomain.ToLower() == subdomain.ToLower() && t.Id != excludeTenantId, cancellationToken);
    }

    public async Task<IEnumerable<Tenant>> GetExpiringTrialsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => t.Billing.IsTrialActive && 
                       t.Billing.TrialEndDate.HasValue && 
                       t.Billing.TrialEndDate <= beforeDate)
            .Include(t => t.Users.Where(u => u.IsActive))
            .OrderBy(t => t.Billing.TrialEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Tenant>> GetOverQuotaTenantsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => t.Quotas.UsedStorageBytes > t.Quotas.MaxStorageBytes ||
                       t.Quotas.DocumentsCreatedThisMonth > t.Quotas.MaxDocumentsPerMonth ||
                       t.Quotas.APICallsThisMonth > t.Quotas.MaxAPICallsPerMonth)
            .Include(t => t.Users.Where(u => u.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateUsageStatsAsync(Guid tenantId, string quotaType, int usage, CancellationToken cancellationToken = default)
    {
        var tenant = await GetByIdAsync(tenantId, cancellationToken);
        if (tenant == null)
        {
            Logger.LogWarning("Attempted to update usage stats for non-existent tenant {TenantId}", tenantId);
            return;
        }

        switch (quotaType.ToLower())
        {
            case "documents":
                tenant.Quotas.DocumentsCreatedThisMonth += usage;
                tenant.Billing.DocumentsCreatedThisMonth += usage;
                break;
            case "api":
                tenant.Quotas.APICallsThisMonth += usage;
                tenant.Billing.APICallsThisMonth += usage;
                break;
            case "storage":
                tenant.Quotas.UsedStorageBytes += usage;
                tenant.Billing.StorageUsedBytes += usage;
                break;
            case "ai":
                tenant.Quotas.AIProcessingMinutesUsedThisMonth += usage;
                break;
            default:
                Logger.LogWarning("Unknown quota type: {QuotaType}", quotaType);
                return;
        }

        await UpdateAsync(tenant, cancellationToken);
        Logger.LogDebug("Updated {QuotaType} usage for tenant {TenantId} by {Usage}", quotaType, tenantId, usage);
    }

    public async Task<Dictionary<string, int>> GetUsageStatsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var tenant = await GetByIdAsync(tenantId, cancellationToken);
        if (tenant == null)
        {
            return new Dictionary<string, int>();
        }

        return new Dictionary<string, int>
        {
            { "documents", tenant.Quotas.DocumentsCreatedThisMonth },
            { "api", tenant.Quotas.APICallsThisMonth },
            { "storage", (int)(tenant.Quotas.UsedStorageBytes / (1024 * 1024)) }, // Convert to MB
            { "ai", tenant.Quotas.AIProcessingMinutesUsedThisMonth },
            { "users", tenant.Quotas.ActiveUsers }
        };
    }

    public override async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Users.Where(u => u.IsActive))
            .Include(t => t.Roles.Where(r => r.IsActive))
            .Include(t => t.Modules.Where(m => m.IsEnabled))
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Users.Where(u => u.IsActive))
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}