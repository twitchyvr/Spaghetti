using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class DocumentRepository : BaseRepository<Document, Guid>, IDocumentRepository
{
    public DocumentRepository(ApplicationDbContext context, ILogger<DocumentRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<Document>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(d => d.TenantId == tenantId, cancellationToken,
            d => d.CreatedByUser!,
            d => d.Tags);
    }

    public async Task<IEnumerable<Document>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(d => d.CreatedBy == userId, cancellationToken,
            d => d.Tags,
            d => d.Attachments);
    }

    public async Task<IEnumerable<Document>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default)
    {
        return await FindAsync(d => d.DocumentType == documentType, cancellationToken,
            d => d.CreatedByUser!,
            d => d.Tags);
    }

    public async Task<IEnumerable<Document>> GetByIndustryAsync(string industry, CancellationToken cancellationToken = default)
    {
        return await FindAsync(d => d.Industry == industry, cancellationToken,
            d => d.CreatedByUser!,
            d => d.Tags);
    }

    public async Task<IEnumerable<Document>> GetByStatusAsync(DocumentStatus status, CancellationToken cancellationToken = default)
    {
        return await FindAsync(d => d.Status == status, cancellationToken,
            d => d.CreatedByUser!,
            d => d.Tags);
    }

    public async Task<IEnumerable<Document>> GetRecentAsync(Guid? tenantId, int count = 10, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.UpdatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetRecentByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.CreatedBy == userId)
            .Include(d => d.Tags)
            .Include(d => d.Attachments)
            .OrderByDescending(d => d.UpdatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> SearchAsync(string searchTerm, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        // Search in title, content, and tags
        query = query.Where(d => 
            d.Title.Contains(searchTerm) ||
            d.Content.Contains(searchTerm) ||
            d.Tags.Any(t => t.Name.Contains(searchTerm)));
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.UpdatedAt)
            .Take(50) // Limit search results
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> SearchByTagsAsync(IEnumerable<string> tags, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var tagList = tags.ToList();
        var query = DbSet.AsQueryable();
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        query = query.Where(d => d.Tags.Any(t => tagList.Contains(t.Name)));
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByDateRangeAsync(DateTime from, DateTime to, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => d.CreatedAt >= from && d.CreatedAt <= to);
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetVersionsAsync(Guid parentDocumentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.ParentDocumentId == parentDocumentId || d.Id == parentDocumentId)
            .Include(d => d.CreatedByUser)
            .OrderBy(d => d.Version)
            .ToListAsync(cancellationToken);
    }

    public async Task<Document?> GetLatestVersionAsync(Guid parentDocumentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.ParentDocumentId == parentDocumentId || d.Id == parentDocumentId)
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .Include(d => d.Attachments)
            .OrderByDescending(d => d.Version)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Document?> CreateVersionAsync(Guid originalDocumentId, Document newVersion, CancellationToken cancellationToken = default)
    {
        var originalDocument = await GetByIdAsync(originalDocumentId, cancellationToken);
        if (originalDocument == null)
        {
            return null;
        }

        // Set the parent document reference
        newVersion.ParentDocumentId = originalDocument.ParentDocumentId ?? originalDocumentId;
        
        // Get the next version number
        var latestVersion = await DbSet
            .Where(d => d.ParentDocumentId == newVersion.ParentDocumentId || d.Id == newVersion.ParentDocumentId)
            .MaxAsync(d => (int?)d.Version, cancellationToken) ?? 0;
        
        newVersion.Version = latestVersion + 1;
        
        // Mark all other versions as not latest
        await UpdateLatestVersionFlagAsync(originalDocumentId, false, cancellationToken);
        
        // Mark new version as latest
        newVersion.IsLatestVersion = true;
        
        return await AddAsync(newVersion, cancellationToken);
    }

    public async Task UpdateLatestVersionFlagAsync(Guid documentId, bool isLatest, CancellationToken cancellationToken = default)
    {
        var document = await GetByIdAsync(documentId, cancellationToken);
        if (document != null)
        {
            // Update all versions of this document
            var parentId = document.ParentDocumentId ?? documentId;
            var allVersions = await DbSet
                .Where(d => d.ParentDocumentId == parentId || d.Id == parentId)
                .ToListAsync(cancellationToken);

            foreach (var version in allVersions)
            {
                version.IsLatestVersion = version.Id == documentId && isLatest;
            }

            await Context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<Document?> GetByFileHashAsync(string fileHash, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.FileHash == fileHash && d.TenantId == tenantId)
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByFileNameAsync(string fileName, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => d.FileName == fileName);
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByContentTypeAsync(string contentType, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => d.ContentType == contentType);
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }
        
        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<long> GetTotalFileSizeByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.TenantId == tenantId && d.FileSize.HasValue)
            .SumAsync(d => d.FileSize ?? 0, cancellationToken);
    }

    public async Task<bool> HasUserAccessAsync(Guid documentId, Guid userId, PermissionType permissionType, CancellationToken cancellationToken = default)
    {
        // First check if user is the owner
        var document = await GetByIdAsync(documentId, cancellationToken);
        if (document?.CreatedBy == userId)
        {
            return true;
        }

        // Check explicit document permissions
        var hasDirectPermission = await Context.DocumentPermissions
            .AnyAsync(p => p.DocumentId == documentId && 
                          p.UserId == userId && 
                          p.Permission >= permissionType &&
                          (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow), 
                     cancellationToken);

        if (hasDirectPermission)
        {
            return true;
        }

        // Check role-based permissions
        var hasRolePermission = await Context.DocumentPermissions
            .Include(p => p.Role)
                .ThenInclude(r => r!.UserRoles)
            .AnyAsync(p => p.DocumentId == documentId && 
                          p.RoleId != null &&
                          p.Role!.UserRoles.Any(ur => ur.UserId == userId && ur.IsActive) &&
                          p.Permission >= permissionType &&
                          (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow), 
                     cancellationToken);

        return hasRolePermission;
    }

    public async Task<IEnumerable<Document>> GetAccessibleDocumentsAsync(Guid userId, Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        
        if (tenantId.HasValue)
        {
            query = query.Where(d => d.TenantId == tenantId);
        }

        // Get documents where user is owner or has explicit permission
        query = query.Where(d => 
            d.CreatedBy == userId ||
            d.Permissions.Any(p => 
                (p.UserId == userId || 
                 (p.Role != null && p.Role.UserRoles.Any(ur => ur.UserId == userId && ur.IsActive))) &&
                (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow)));

        return await query
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public override async Task<Document?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tenant)
            .Include(d => d.Tags)
            .Include(d => d.Attachments)
            .Include(d => d.Permissions)
                .ThenInclude(p => p.User)
            .Include(d => d.Permissions)
                .ThenInclude(p => p.Role)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public override async Task<IEnumerable<Document>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.CreatedByUser)
            .Include(d => d.Tags)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(cancellationToken);
    }
}