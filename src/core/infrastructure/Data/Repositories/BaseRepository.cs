using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Linq.Expressions;

namespace EnterpriseDocsCore.Infrastructure.Data.Repositories;

/// <summary>
/// Base repository implementation with common CRUD operations
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
/// <typeparam name="TKey">The primary key type</typeparam>
public abstract class BaseRepository<TEntity, TKey> : IRepository<TEntity, TKey> 
    where TEntity : class
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<TEntity> DbSet;
    protected readonly ILogger Logger;

    protected BaseRepository(ApplicationDbContext context, ILogger logger)
    {
        Context = context ?? throw new ArgumentNullException(nameof(context));
        DbSet = context.Set<TEntity>();
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    #region Basic CRUD Operations

    public virtual async Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FindAsync(new object?[] { id }, cancellationToken);
    }

    public virtual async Task<TEntity?> GetByIdAsync(TKey id, params Expression<Func<TEntity, object>>[] includes)
    {
        return await GetByIdAsync(id, CancellationToken.None, includes);
    }

    public virtual async Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.AsQueryable();
        
        if (includes.Length > 0)
        {
            query = includes.Aggregate(query, (current, include) => current.Include(include));
        }
        
        return await query.FirstOrDefaultAsync(CreateIdPredicate(id), cancellationToken);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(params Expression<Func<TEntity, object>>[] includes)
    {
        return await GetAllAsync(CancellationToken.None, includes);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.AsQueryable();
        
        if (includes.Length > 0)
        {
            query = includes.Aggregate(query, (current, include) => current.Include(include));
        }
        
        return await query.ToListAsync(cancellationToken);
    }

    #endregion

    #region Querying

    public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await DbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
    {
        return await FindAsync(predicate, CancellationToken.None, includes);
    }

    public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.Where(predicate);
        
        if (includes.Length > 0)
        {
            query = includes.Aggregate(query, (current, include) => current.Include(include));
        }
        
        return await query.ToListAsync(cancellationToken);
    }

    public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
    {
        return await FirstOrDefaultAsync(predicate, CancellationToken.None, includes);
    }

    public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.Where(predicate);
        
        if (includes.Length > 0)
        {
            query = includes.Aggregate(query, (current, include) => current.Include(include));
        }
        
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(predicate, cancellationToken);
    }

    public virtual async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.CountAsync(cancellationToken);
    }

    public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await DbSet.CountAsync(predicate, cancellationToken);
    }

    #endregion

    #region Modification Operations

    public virtual async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        
        var entry = await DbSet.AddAsync(entity, cancellationToken);
        Logger.LogDebug("Added entity of type {EntityType} with ID {EntityId}", typeof(TEntity).Name, GetEntityId(entity));
        
        return entry.Entity;
    }

    public virtual async Task<IEnumerable<TEntity>> AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        if (entities == null) throw new ArgumentNullException(nameof(entities));
        
        var entityList = entities.ToList();
        await DbSet.AddRangeAsync(entityList, cancellationToken);
        Logger.LogDebug("Added {Count} entities of type {EntityType}", entityList.Count, typeof(TEntity).Name);
        
        return entityList;
    }

    public virtual Task<TEntity> UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        
        var entry = DbSet.Update(entity);
        Logger.LogDebug("Updated entity of type {EntityType} with ID {EntityId}", typeof(TEntity).Name, GetEntityId(entity));
        
        return Task.FromResult(entry.Entity);
    }

    public virtual Task<IEnumerable<TEntity>> UpdateRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        if (entities == null) throw new ArgumentNullException(nameof(entities));
        
        var entityList = entities.ToList();
        DbSet.UpdateRange(entityList);
        Logger.LogDebug("Updated {Count} entities of type {EntityType}", entityList.Count, typeof(TEntity).Name);
        
        return Task.FromResult<IEnumerable<TEntity>>(entityList);
    }

    public virtual async Task<bool> DeleteAsync(TKey id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            Logger.LogWarning("Attempted to delete non-existent entity of type {EntityType} with ID {EntityId}", typeof(TEntity).Name, id);
            return false;
        }

        return await DeleteAsync(entity, cancellationToken);
    }

    public virtual Task<bool> DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));
        
        DbSet.Remove(entity);
        Logger.LogDebug("Deleted entity of type {EntityType} with ID {EntityId}", typeof(TEntity).Name, GetEntityId(entity));
        
        return Task.FromResult(true);
    }

    public virtual Task<int> DeleteRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        if (entities == null) throw new ArgumentNullException(nameof(entities));
        
        var entityList = entities.ToList();
        DbSet.RemoveRange(entityList);
        Logger.LogDebug("Deleted {Count} entities of type {EntityType}", entityList.Count, typeof(TEntity).Name);
        
        return Task.FromResult(entityList.Count);
    }

    public virtual async Task<int> DeleteRangeAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        var entities = await DbSet.Where(predicate).ToListAsync(cancellationToken);
        var count = entities.Count;
        
        if (count > 0)
        {
            DbSet.RemoveRange(entities);
            Logger.LogDebug("Deleted {Count} entities of type {EntityType} matching predicate", count, typeof(TEntity).Name);
        }
        
        return count;
    }

    #endregion

    #region Pagination

    public virtual async Task<PagedResult<TEntity>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await GetPagedAsync(page, pageSize, null, cancellationToken);
    }

    public virtual async Task<PagedResult<TEntity>> GetPagedAsync(int page, int pageSize, Expression<Func<TEntity, bool>>? filter = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        
        if (filter != null)
        {
            query = query.Where(filter);
        }
        
        var totalItems = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        
        return PagedResult<TEntity>.Create(items, page, pageSize, totalItems);
    }

    public virtual async Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default)
    {
        return await GetPagedAsync(page, pageSize, null, orderBy, ascending, cancellationToken);
    }

    public virtual async Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, bool>>? filter, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default)
    {
        return await GetPagedAsync(page, pageSize, filter, orderBy, ascending, cancellationToken);
    }

    public virtual async Task<PagedResult<TEntity>> GetPagedAsync<TOrderKey>(int page, int pageSize, Expression<Func<TEntity, bool>>? filter, Expression<Func<TEntity, TOrderKey>> orderBy, bool ascending, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.AsQueryable();
        
        if (filter != null)
        {
            query = query.Where(filter);
        }
        
        if (includes.Length > 0)
        {
            query = includes.Aggregate(query, (current, include) => current.Include(include));
        }
        
        query = ascending ? query.OrderBy(orderBy) : query.OrderByDescending(orderBy);
        
        var totalItems = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        
        return PagedResult<TEntity>.Create(items, page, pageSize, totalItems);
    }

    #endregion

    #region Protected Helpers

    /// <summary>
    /// Creates a predicate expression for finding entity by ID
    /// Override in derived classes for custom ID handling
    /// </summary>
    protected virtual Expression<Func<TEntity, bool>> CreateIdPredicate(TKey id)
    {
        // Default implementation assumes property named "Id"
        var parameter = Expression.Parameter(typeof(TEntity), "x");
        var property = Expression.Property(parameter, "Id");
        var constant = Expression.Constant(id);
        var equal = Expression.Equal(property, constant);
        
        return Expression.Lambda<Func<TEntity, bool>>(equal, parameter);
    }

    /// <summary>
    /// Gets the ID value from an entity for logging purposes
    /// Override in derived classes for custom ID handling
    /// </summary>
    protected virtual object? GetEntityId(TEntity entity)
    {
        var idProperty = typeof(TEntity).GetProperty("Id");
        return idProperty?.GetValue(entity);
    }

    /// <summary>
    /// Validates pagination parameters
    /// </summary>
    protected static void ValidatePaginationParameters(int page, int pageSize)
    {
        if (page < 1)
            throw new ArgumentException("Page must be greater than 0", nameof(page));
        
        if (pageSize < 1)
            throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));
        
        if (pageSize > 1000)
            throw new ArgumentException("Page size cannot exceed 1000", nameof(pageSize));
    }

    #endregion
}