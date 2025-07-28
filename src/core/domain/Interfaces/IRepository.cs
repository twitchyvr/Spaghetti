using System.Linq.Expressions;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Generic repository interface for basic CRUD operations
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
/// <typeparam name="TKey">The primary key type</typeparam>
public interface IRepository<TEntity, TKey> where TEntity : class
{
    // Basic CRUD operations
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
    Task<TEntity?> GetByIdAsync(TKey id, params Expression<Func<TEntity, object>>[] includes);
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);
    
    Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TEntity>> GetAllAsync(params Expression<Func<TEntity, object>>[] includes);
    Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);
    
    Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes);
    Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);
    
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes);
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);
    
    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    
    // Modification operations
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<TEntity>> AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
    
    Task<TEntity> UpdateAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<TEntity>> UpdateRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
    
    Task<bool> DeleteAsync(TKey id, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task<int> DeleteRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
    Task<int> DeleteRangeAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    
    // Pagination
    Task<PagedResult<TEntity>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<TEntity>> GetPagedAsync(int page, int pageSize, Expression<Func<TEntity, bool>>? filter = null, CancellationToken cancellationToken = default);
    Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default);
    Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, bool>>? filter, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default);
    Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, bool>>? filter, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);
}

/// <summary>
/// Unit of Work pattern interface for managing transactions
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // Repository accessors
    IDocumentRepository Documents { get; }
    IUserRepository Users { get; }
    ITenantRepository Tenants { get; }
    IRoleRepository Roles { get; }
    IDocumentTagRepository DocumentTags { get; }
    IDocumentAttachmentRepository DocumentAttachments { get; }
    IDocumentPermissionRepository DocumentPermissions { get; }
    IDocumentAuditEntryRepository DocumentAuditEntries { get; }
    IUserRoleRepository UserRoles { get; }
    IRolePermissionRepository RolePermissions { get; }
    IUserAuthenticationRepository UserAuthentications { get; }
    IUserAuditEntryRepository UserAuditEntries { get; }
    ITenantModuleRepository TenantModules { get; }
    ITenantAuditEntryRepository TenantAuditEntries { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    
    // Enhanced authentication repositories
    IAuthenticationSessionRepository AuthenticationSessions { get; }
    IUserPermissionRepository UserPermissions { get; }
    IUserAuthenticationMethodRepository UserAuthenticationMethods { get; }
    
    // Transaction management
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(Guid userId, CancellationToken cancellationToken = default);
    
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    
    // Bulk operations
    Task<int> ExecuteSqlAsync(string sql, CancellationToken cancellationToken = default);
    Task<int> ExecuteSqlAsync(string sql, object[] parameters, CancellationToken cancellationToken = default);
}

/// <summary>
/// Paged result container
/// </summary>
/// <typeparam name="T">The entity type</typeparam>
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
    
    public static PagedResult<T> Create(IEnumerable<T> items, int page, int pageSize, int totalItems)
    {
        return new PagedResult<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
        };
    }
    
    public static PagedResult<T> Empty(int page, int pageSize)
    {
        return new PagedResult<T>
        {
            Items = Enumerable.Empty<T>(),
            Page = page,
            PageSize = pageSize,
            TotalItems = 0,
            TotalPages = 0
        };
    }
}