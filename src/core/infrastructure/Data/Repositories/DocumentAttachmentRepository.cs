using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class DocumentAttachmentRepository : BaseRepository<DocumentAttachment, Guid>, IDocumentAttachmentRepository
{
    public DocumentAttachmentRepository(ApplicationDbContext context, ILogger<DocumentAttachmentRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<DocumentAttachment>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(a => a.DocumentId == documentId, cancellationToken,
            a => a.Document!);
    }

    public async Task<IEnumerable<DocumentAttachment>> GetByTypeAsync(AttachmentType type, CancellationToken cancellationToken = default)
    {
        return await FindAsync(a => a.Type == type, cancellationToken,
            a => a.Document!);
    }

    public async Task<IEnumerable<DocumentAttachment>> GetByUploadedByAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(a => a.UploadedBy == userId, cancellationToken,
            a => a.Document!);
    }

    public async Task<long> GetTotalSizeByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.DocumentId == documentId)
            .SumAsync(a => a.FileSize, cancellationToken);
    }

    public async Task<long> GetTotalSizeByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.Document!.TenantId == tenantId)
            .SumAsync(a => a.FileSize, cancellationToken);
    }

    public async Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var attachments = await DbSet
            .Where(a => a.DocumentId == documentId)
            .ToListAsync(cancellationToken);

        var count = attachments.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(attachments);
            Logger.LogDebug("Deleted {Count} attachments for document {DocumentId}", count, documentId);
        }

        return count;
    }

    public override async Task<DocumentAttachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Document)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }
}