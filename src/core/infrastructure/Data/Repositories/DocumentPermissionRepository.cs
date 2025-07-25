using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

public class DocumentPermissionRepository : BaseRepository<DocumentPermission, Guid>, IDocumentPermissionRepository
{
    public DocumentPermissionRepository(ApplicationDbContext context, ILogger<DocumentPermissionRepository> logger) 
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<DocumentPermission>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(p => p.DocumentId == documentId, cancellationToken,
            p => p.User!,
            p => p.Role!,
            p => p.Document!);
    }

    public async Task<IEnumerable<DocumentPermission>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(p => p.UserId == userId, cancellationToken,
            p => p.Document!,
            p => p.Role!);
    }

    public async Task<IEnumerable<DocumentPermission>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await FindAsync(p => p.RoleId == roleId, cancellationToken,
            p => p.Document!,
            p => p.User!);
    }

    public async Task<DocumentPermission?> GetUserPermissionAsync(Guid documentId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(p => p.DocumentId == documentId && p.UserId == userId, cancellationToken,
            p => p.Document!,
            p => p.User!);
    }

    public async Task<IEnumerable<DocumentPermission>> GetActivePermissionsAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => p.DocumentId == documentId && 
                       (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow))
            .Include(p => p.User)
            .Include(p => p.Role)
            .Include(p => p.Document)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocumentPermission>> GetExpiringPermissionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => p.ExpiresAt.HasValue && p.ExpiresAt <= beforeDate)
            .Include(p => p.User)
            .Include(p => p.Role)
            .Include(p => p.Document)
            .OrderBy(p => p.ExpiresAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasPermissionAsync(Guid documentId, Guid userId, PermissionType permissionType, CancellationToken cancellationToken = default)
    {
        // Check direct user permission
        var hasDirectPermission = await DbSet
            .AnyAsync(p => p.DocumentId == documentId && 
                          p.UserId == userId && 
                          p.Permission >= permissionType &&
                          (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow), 
                     cancellationToken);

        if (hasDirectPermission)
            return true;

        // Check role-based permission
        var hasRolePermission = await DbSet
            .Include(p => p.Role)
                .ThenInclude(r => r!.UserRoles)
            .AnyAsync(p => p.DocumentId == documentId && 
                          p.RoleId.HasValue &&
                          p.Role!.UserRoles.Any(ur => ur.UserId == userId && ur.IsActive) &&
                          p.Permission >= permissionType &&
                          (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow), 
                     cancellationToken);

        return hasRolePermission;
    }

    public async Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var permissions = await DbSet
            .Where(p => p.DocumentId == documentId)
            .ToListAsync(cancellationToken);

        var count = permissions.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(permissions);
            Logger.LogDebug("Deleted {Count} permissions for document {DocumentId}", count, documentId);
        }

        return count;
    }

    public async Task<int> DeleteExpiredPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var expiredPermissions = await DbSet
            .Where(p => p.ExpiresAt.HasValue && p.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        var count = expiredPermissions.Count;
        if (count > 0)
        {
            DbSet.RemoveRange(expiredPermissions);
            Logger.LogDebug("Deleted {Count} expired document permissions", count);
        }

        return count;
    }

    public override async Task<DocumentPermission?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Document)
            .Include(p => p.User)
            .Include(p => p.Role)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
}