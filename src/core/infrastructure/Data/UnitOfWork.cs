using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Data.Repositories;

namespace EnterpriseDocsCore.Infrastructure.Data;

/// <summary>
/// Unit of Work implementation for managing database transactions and repository access
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly ILoggerFactory _loggerFactory;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    // Repository instances
    private IDocumentRepository? _documents;
    private IUserRepository? _users;
    private ITenantRepository? _tenants;
    private IRoleRepository? _roles;
    private IDocumentTagRepository? _documentTags;
    private IDocumentAttachmentRepository? _documentAttachments;
    private IDocumentPermissionRepository? _documentPermissions;
    private IDocumentAuditEntryRepository? _documentAuditEntries;
    private IUserRoleRepository? _userRoles;
    private IRolePermissionRepository? _rolePermissions;
    private IUserAuthenticationRepository? _userAuthentications;
    private IUserAuditEntryRepository? _userAuditEntries;
    private ITenantModuleRepository? _tenantModules;
    private ITenantAuditEntryRepository? _tenantAuditEntries;

    public UnitOfWork(ApplicationDbContext context, ILoggerFactory loggerFactory)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
    }

    #region Repository Properties

    public IDocumentRepository Documents =>
        _documents ??= new DocumentRepository(_context, _loggerFactory.CreateLogger<DocumentRepository>());

    public IUserRepository Users =>
        _users ??= new UserRepository(_context, _loggerFactory.CreateLogger<UserRepository>());

    public ITenantRepository Tenants =>
        _tenants ??= new TenantRepository(_context, _loggerFactory.CreateLogger<TenantRepository>());

    public IRoleRepository Roles =>
        _roles ??= new RoleRepository(_context, _loggerFactory.CreateLogger<RoleRepository>());

    public IDocumentTagRepository DocumentTags =>
        _documentTags ??= new DocumentTagRepository(_context, _loggerFactory.CreateLogger<DocumentTagRepository>());

    public IDocumentAttachmentRepository DocumentAttachments =>
        _documentAttachments ??= new DocumentAttachmentRepository(_context, _loggerFactory.CreateLogger<DocumentAttachmentRepository>());

    public IDocumentPermissionRepository DocumentPermissions =>
        _documentPermissions ??= new DocumentPermissionRepository(_context, _loggerFactory.CreateLogger<DocumentPermissionRepository>());

    public IDocumentAuditEntryRepository DocumentAuditEntries =>
        _documentAuditEntries ??= new DocumentAuditEntryRepository(_context, _loggerFactory.CreateLogger<DocumentAuditEntryRepository>());

    public IUserRoleRepository UserRoles =>
        _userRoles ??= new UserRoleRepository(_context, _loggerFactory.CreateLogger<UserRoleRepository>());

    public IRolePermissionRepository RolePermissions =>
        _rolePermissions ??= new RolePermissionRepository(_context, _loggerFactory.CreateLogger<RolePermissionRepository>());

    public IUserAuthenticationRepository UserAuthentications =>
        _userAuthentications ??= new UserAuthenticationRepository(_context, _loggerFactory.CreateLogger<UserAuthenticationRepository>());

    public IUserAuditEntryRepository UserAuditEntries =>
        _userAuditEntries ??= new UserAuditEntryRepository(_context, _loggerFactory.CreateLogger<UserAuditEntryRepository>());

    public ITenantModuleRepository TenantModules =>
        _tenantModules ??= new TenantModuleRepository(_context, _loggerFactory.CreateLogger<TenantModuleRepository>());

    public ITenantAuditEntryRepository TenantAuditEntries =>
        _tenantAuditEntries ??= new TenantAuditEntryRepository(_context, _loggerFactory.CreateLogger<TenantAuditEntryRepository>());

    #endregion

    #region Transaction Management

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress");
        }

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Database transaction started with ID: {TransactionId}", _transaction.TransactionId);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction in progress");
        }

        try
        {
            await _transaction.CommitAsync(cancellationToken);
            _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Database transaction committed successfully with ID: {TransactionId}", _transaction.TransactionId);
        }
        catch (Exception ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Failed to commit transaction with ID: {TransactionId}", _transaction.TransactionId);
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogWarning("Attempted to rollback transaction, but no transaction is in progress");
            return;
        }

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
            _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Database transaction rolled back successfully with ID: {TransactionId}", _transaction.TransactionId);
        }
        catch (Exception ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Failed to rollback transaction with ID: {TransactionId}", _transaction.TransactionId);
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region Save Changes

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var changes = await _context.SaveChangesAsync(cancellationToken);
            _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Saved {ChangeCount} changes to database", changes);
            return changes;
        }
        catch (DbUpdateException ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Database update failed: {Message}", ex.Message);
            
            // Log detailed information about the failed entities
            foreach (var entry in ex.Entries)
            {
                _loggerFactory.CreateLogger<UnitOfWork>().LogError("Failed to save entity of type {EntityType} with state {State}", 
                    entry.Entity.GetType().Name, entry.State);
            }
            
            throw;
        }
        catch (Exception ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Unexpected error occurred while saving changes: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<int> SaveChangesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Add user context to audit trails before saving
        AddAuditInformation(userId);
        return await SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Bulk Operations

    public async Task<int> ExecuteSqlAsync(string sql, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sql))
        {
            throw new ArgumentException("SQL command cannot be null or empty", nameof(sql));
        }

        try
        {
            var result = await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
            _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Executed SQL command affecting {RowCount} rows", result);
            return result;
        }
        catch (Exception ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Failed to execute SQL command: {SQL}", sql);
            throw;
        }
    }

    public async Task<int> ExecuteSqlAsync(string sql, object[] parameters, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sql))
        {
            throw new ArgumentException("SQL command cannot be null or empty", nameof(sql));
        }

        if (parameters == null)
        {
            throw new ArgumentNullException(nameof(parameters));
        }

        try
        {
            var result = await _context.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);
            _loggerFactory.CreateLogger<UnitOfWork>().LogDebug("Executed parameterized SQL command affecting {RowCount} rows", result);
            return result;
        }
        catch (Exception ex)
        {
            _loggerFactory.CreateLogger<UnitOfWork>().LogError(ex, "Failed to execute parameterized SQL command: {SQL}", sql);
            throw;
        }
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Adds audit information to entities that are being created or modified
    /// </summary>
    private void AddAuditInformation(Guid userId)
    {
        var entries = _context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            // Handle auditable entities
            if (entry.Entity is ITrackable trackable)
            {
                var now = DateTime.UtcNow;
                
                if (entry.State == EntityState.Added)
                {
                    trackable.CreatedAt = now;
                }
                
                trackable.UpdatedAt = now;
            }

            // Add specific audit trails for important entities
            switch (entry.Entity)
            {
                case Document document:
                    AddDocumentAuditEntry(document, entry.State, userId);
                    break;
                
                case User user:
                    AddUserAuditEntry(user, entry.State, userId);
                    break;
                
                case Tenant tenant:
                    AddTenantAuditEntry(tenant, entry.State, userId);
                    break;
            }
        }
    }

    private void AddDocumentAuditEntry(Document document, EntityState state, Guid userId)
    {
        var action = state switch
        {
            EntityState.Added => "Created",
            EntityState.Modified => "Updated",
            EntityState.Deleted => "Deleted",
            _ => "Modified"
        };

        var auditEntry = new DocumentAuditEntry
        {
            DocumentId = document.Id,
            Action = action,
            UserId = userId,
            Details = $"Document {action.ToLower()} via Unit of Work",
            Timestamp = DateTime.UtcNow
        };

        _context.DocumentAuditEntries.Add(auditEntry);
    }

    private void AddUserAuditEntry(User user, EntityState state, Guid userId)
    {
        var action = state switch
        {
            EntityState.Added => "Created",
            EntityState.Modified => "Updated",
            EntityState.Deleted => "Deleted",
            _ => "Modified"
        };

        var auditEntry = new UserAuditEntry
        {
            UserId = user.Id,
            Action = action,
            Details = $"User {action.ToLower()} via Unit of Work",
            Timestamp = DateTime.UtcNow,
            IsSuccess = true
        };

        _context.UserAuditEntries.Add(auditEntry);
    }

    private void AddTenantAuditEntry(Tenant tenant, EntityState state, Guid userId)
    {
        var action = state switch
        {
            EntityState.Added => "Created",
            EntityState.Modified => "Updated",
            EntityState.Deleted => "Deleted",
            _ => "Modified"
        };

        var auditEntry = new TenantAuditEntry
        {
            TenantId = tenant.Id,
            Action = action,
            UserId = userId,
            Details = $"Tenant {action.ToLower()} via Unit of Work",
            Timestamp = DateTime.UtcNow,
            Severity = AuditSeverity.Info
        };

        _context.TenantAuditEntries.Add(auditEntry);
    }

    #endregion

    #region Dispose

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            // Rollback any uncommitted transaction
            if (_transaction != null)
            {
                _loggerFactory.CreateLogger<UnitOfWork>().LogWarning("Disposing UnitOfWork with uncommitted transaction. Rolling back...");
                _transaction.Rollback();
                _transaction.Dispose();
            }

            _context.Dispose();
            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    #endregion
}

/// <summary>
/// Extension methods for registering Unit of Work in DI container
/// </summary>
public static class UnitOfWorkExtensions
{
    /// <summary>
    /// Registers the Unit of Work pattern in the dependency injection container
    /// </summary>
    public static IServiceCollection AddUnitOfWork(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        // Register individual repositories as well for direct injection if needed
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IDocumentTagRepository, DocumentTagRepository>();
        services.AddScoped<IDocumentAttachmentRepository, DocumentAttachmentRepository>();
        services.AddScoped<IDocumentPermissionRepository, DocumentPermissionRepository>();
        services.AddScoped<IDocumentAuditEntryRepository, DocumentAuditEntryRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
        services.AddScoped<IUserAuthenticationRepository, UserAuthenticationRepository>();
        services.AddScoped<IUserAuditEntryRepository, UserAuditEntryRepository>();
        services.AddScoped<ITenantModuleRepository, TenantModuleRepository>();
        services.AddScoped<ITenantAuditEntryRepository, TenantAuditEntryRepository>();
        
        return services;
    }
}