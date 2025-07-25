using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class DocumentTagRepository : BaseRepository<DocumentTag, Guid>, IDocumentTagRepository
{
    public DocumentTagRepository(ApplicationDbContext context, ILogger<DocumentTagRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<DocumentTag>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(t => t.DocumentId == documentId, cancellationToken,
            t => t.Document);
    }

    public async Task<IEnumerable<DocumentTag>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await FindAsync(t => t.Category == category, cancellationToken,
            t => t.Document);
    }

    public async Task<IEnumerable<string>> GetPopularTagsAsync(Guid? tenantId = null, int count = 50, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (tenantId.HasValue)
        {
            query = query.Where(t => t.Document!.TenantId == tenantId);
        }

        return await query
            .GroupBy(t => t.Name.ToLower())
            .OrderByDescending(g => g.Count())
            .Take(count)
            .Select(g => g.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<string>> GetTagSuggestionsAsync(string partialTag, Guid? tenantId = null, int count = 10, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (tenantId.HasValue)
        {
            query = query.Where(t => t.Document!.TenantId == tenantId);
        }

        return await query
            .Where(t => t.Name.ToLower().StartsWith(partialTag.ToLower()))
            .GroupBy(t => t.Name.ToLower())
            .OrderByDescending(g => g.Count())
            .Take(count)
            .Select(g => g.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid documentId, string tagName, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(t => t.DocumentId == documentId && t.Name.ToLower() == tagName.ToLower(), cancellationToken);
    }

    public async Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await DeleteRangeAsync(t => t.DocumentId == documentId, cancellationToken);
    }

    public override async Task<DocumentTag?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Document)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<DocumentTag>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Document)
            .OrderBy(t => t.Category)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}