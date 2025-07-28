using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Text.Json;

namespace EnterpriseDocsCore.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Entity Sets
    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentTag> DocumentTags => Set<DocumentTag>();
    public DbSet<DocumentAttachment> DocumentAttachments => Set<DocumentAttachment>();
    public DbSet<DocumentPermission> DocumentPermissions => Set<DocumentPermission>();
    public DbSet<DocumentAuditEntry> DocumentAuditEntries => Set<DocumentAuditEntry>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserAuthentication> UserAuthentications => Set<UserAuthentication>();
    public DbSet<UserAuditEntry> UserAuditEntries => Set<UserAuditEntry>();
    public DbSet<TenantModule> TenantModules => Set<TenantModule>();
    public DbSet<TenantAuditEntry> TenantAuditEntries => Set<TenantAuditEntry>();
    public DbSet<ImpersonationSession> ImpersonationSessions => Set<ImpersonationSession>();
    public DbSet<PlatformAdminAuditLog> PlatformAdminAuditLogs => Set<PlatformAdminAuditLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global query filters for soft delete and multi-tenancy
        modelBuilder.Entity<Document>()
            .HasQueryFilter(d => d.Status != DocumentStatus.Deleted);

        modelBuilder.Entity<User>()
            .HasQueryFilter(u => u.IsActive);

        modelBuilder.Entity<Tenant>()
            .HasQueryFilter(t => t.Status != TenantStatus.Archived);

        // Configure value converters for complex types
        ConfigureValueConverters(modelBuilder);

        // Configure global conventions
        ConfigureGlobalConventions(modelBuilder);

        // Seed default data
        SeedDefaultData(modelBuilder);
    }

    private static void ConfigureValueConverters(ModelBuilder modelBuilder)
    {
        // JSON converters for complex properties
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var dictionaryConverter = new ValueConverter<Dictionary<string, object>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, jsonOptions) ?? new Dictionary<string, object>()
        );

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
        );

        // Configure User owned types
        modelBuilder.Entity<User>()
            .OwnsOne(e => e.Profile, profile =>
            {
                profile.Property(p => p.CustomFields)
                    .HasConversion(dictionaryConverter);
            });

        modelBuilder.Entity<User>()
            .OwnsOne(e => e.Settings, settings =>
            {
                settings.Property(s => s.ModuleSettings)
                    .HasConversion(new ValueConverter<Dictionary<string, ModuleSettings>, string>(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<Dictionary<string, ModuleSettings>>(v, jsonOptions) ?? new Dictionary<string, ModuleSettings>()
                    ));
                settings.Property(s => s.CustomSettings)
                    .HasConversion(dictionaryConverter);
                settings.Property(s => s.FavoriteAgents)
                    .HasConversion(stringListConverter);
            });

        // Configure Tenant owned types
        modelBuilder.Entity<Tenant>()
            .OwnsOne(e => e.Billing, billing =>
            {
                billing.Property(b => b.BillingMetadata)
                    .HasConversion(dictionaryConverter);
            });

        modelBuilder.Entity<Tenant>()
            .OwnsOne(e => e.Configuration, config =>
            {
                config.Property(c => c.EnabledIntegrations)
                    .HasConversion(new ValueConverter<Dictionary<string, bool>, string>(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<Dictionary<string, bool>>(v, jsonOptions) ?? new Dictionary<string, bool>()
                    ));
                config.Property(c => c.ComplianceFrameworks)
                    .HasConversion(stringListConverter);
                config.Property(c => c.CustomSettings)
                    .HasConversion(dictionaryConverter);
            });

        modelBuilder.Entity<Tenant>()
            .OwnsOne(e => e.Quotas, quotas =>
            {
                quotas.Property(q => q.ModuleQuotas)
                    .HasConversion(new ValueConverter<Dictionary<string, int>, string>(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<Dictionary<string, int>>(v, jsonOptions) ?? new Dictionary<string, int>()
                    ));
            });

        modelBuilder.Entity<Tenant>()
            .OwnsOne(e => e.Branding, branding =>
            {
                branding.Property(b => b.CustomLabels)
                    .HasConversion(new ValueConverter<Dictionary<string, string>, string>(
                        v => JsonSerializer.Serialize(v, jsonOptions),
                        v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, jsonOptions) ?? new Dictionary<string, string>()
                    ));
            });

        // Configure Document owned types
        modelBuilder.Entity<Document>()
            .OwnsOne(e => e.Metadata, metadata =>
            {
                metadata.Property(m => m.Properties)
                    .HasConversion(dictionaryConverter);
                metadata.Property(m => m.Keywords)
                    .HasConversion(stringListConverter);
            });

        modelBuilder.Entity<Document>()
            .OwnsOne(e => e.AIMetadata, ai =>
            {
                ai.Property(e => e.ProcessingResults)
                    .HasConversion(dictionaryConverter);
                ai.Property(e => e.SuggestedTags)
                    .HasConversion(stringListConverter);
            });

        modelBuilder.Entity<UserAuthentication>()
            .Property(e => e.ProviderData)
            .HasConversion(dictionaryConverter);

        modelBuilder.Entity<TenantModule>()
            .Property(e => e.Configuration)
            .HasConversion(dictionaryConverter);
    }

    private static void ConfigureGlobalConventions(ModelBuilder modelBuilder)
    {
        // Configure string length limits
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(string))
                {
                    var maxLength = property.Name switch
                    {
                        "Email" => (int?)255,
                        "Title" => (int?)500,
                        "Name" or "DisplayName" => (int?)200,
                        "FirstName" or "LastName" => (int?)100,
                        "Description" => (int?)1000,
                        "Content" => null, // No limit for content fields
                        "PhoneNumber" => (int?)20,
                        "TimeZone" => (int?)50,
                        "Language" => (int?)10,
                        "Currency" => (int?)3,
                        "IPAddress" => (int?)45,
                        "UserAgent" => (int?)500,
                        _ when property.Name.EndsWith("Url") => (int?)2000,
                        _ when property.Name.EndsWith("Path") => (int?)500,
                        _ when property.Name.EndsWith("Color") => (int?)7,
                        _ => (int?)100
                    };

                    if (maxLength.HasValue)
                    {
                        property.SetMaxLength(maxLength.Value);
                    }
                }
            }
        }

        // Configure decimal precision for monetary fields
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                {
                    if (property.Name.Contains("Rate") || property.Name.Contains("Cost") || 
                        property.Name.Contains("Price") || property.Name.Contains("Amount"))
                    {
                        property.SetPrecision(18);
                        property.SetScale(2);
                    }
                }
            }
        }

        // Configure DateTime properties to use UTC
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                        v => v.ToUniversalTime(),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                    ));
                }
            }
        }

        // Configure indexes for performance
        ConfigureIndexes(modelBuilder);
    }

    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(e => e.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(e => new { e.TenantId, e.IsActive });

        modelBuilder.Entity<User>()
            .HasIndex(e => e.LastLoginAt);

        // Tenant indexes
        modelBuilder.Entity<Tenant>()
            .HasIndex(e => e.Subdomain)
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasIndex(e => e.Status);

        // Document indexes
        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.TenantId, e.Status, e.UpdatedAt });

        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.DocumentType, e.Industry });

        modelBuilder.Entity<Document>()
            .HasIndex(e => e.CreatedBy);

        modelBuilder.Entity<Document>()
            .HasIndex(e => e.ParentDocumentId);

        // Document tags indexes
        modelBuilder.Entity<DocumentTag>()
            .HasIndex(e => new { e.DocumentId, e.Name });

        modelBuilder.Entity<DocumentTag>()
            .HasIndex(e => new { e.Name, e.Category });

        // Document permissions indexes
        modelBuilder.Entity<DocumentPermission>()
            .HasIndex(e => new { e.DocumentId, e.UserId });

        modelBuilder.Entity<DocumentPermission>()
            .HasIndex(e => new { e.DocumentId, e.RoleId });

        // User role indexes
        modelBuilder.Entity<UserRole>()
            .HasIndex(e => new { e.UserId, e.RoleId, e.IsActive });

        // Role permission indexes
        modelBuilder.Entity<RolePermission>()
            .HasIndex(e => new { e.RoleId, e.Permission });

        // Authentication indexes
        modelBuilder.Entity<UserAuthentication>()
            .HasIndex(e => new { e.Provider, e.ExternalId })
            .IsUnique();

        // Audit indexes
        modelBuilder.Entity<DocumentAuditEntry>()
            .HasIndex(e => new { e.DocumentId, e.Timestamp });

        modelBuilder.Entity<UserAuditEntry>()
            .HasIndex(e => new { e.UserId, e.Timestamp });

        modelBuilder.Entity<TenantAuditEntry>()
            .HasIndex(e => new { e.TenantId, e.Timestamp });

        // Tenant module indexes
        modelBuilder.Entity<TenantModule>()
            .HasIndex(e => new { e.TenantId, e.ModuleName })
            .IsUnique();

        // Impersonation session indexes
        modelBuilder.Entity<ImpersonationSession>()
            .HasIndex(e => new { e.AdminUserId, e.IsActive });

        modelBuilder.Entity<ImpersonationSession>()
            .HasIndex(e => new { e.TargetUserId, e.StartedAt });

        modelBuilder.Entity<ImpersonationSession>()
            .HasIndex(e => e.ExpiresAt);

        // Platform admin audit log indexes
        modelBuilder.Entity<PlatformAdminAuditLog>()
            .HasIndex(e => new { e.AdminUserId, e.Timestamp });

        modelBuilder.Entity<PlatformAdminAuditLog>()
            .HasIndex(e => new { e.Action, e.Timestamp });

        modelBuilder.Entity<PlatformAdminAuditLog>()
            .HasIndex(e => new { e.TargetEntityType, e.TargetEntityId });
    }

    private static void SeedDefaultData(ModelBuilder modelBuilder)
    {
        // Seed system roles
        var systemAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var tenantAdminRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        modelBuilder.Entity<Role>().HasData(
            new Role
            {
                Id = systemAdminRoleId,
                Name = "System Administrator",
                Description = "Full system administration access",
                IsSystemRole = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Role
            {
                Id = tenantAdminRoleId,
                Name = "Tenant Administrator",
                Description = "Full tenant administration access",
                IsSystemRole = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Role
            {
                Id = userRoleId,
                Name = "User",
                Description = "Standard user access",
                IsSystemRole = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        // Seed system role permissions
        var systemPermissions = new[]
        {
            "System.Admin", "Tenant.Admin", "User.Admin", "Document.Admin", "Module.Admin"
        };

        var tenantPermissions = new[]
        {
            "Tenant.Admin", "User.Admin", "Document.Admin", "Module.Configure"
        };

        var userPermissions = new[]
        {
            "Document.Read", "Document.Write", "Document.Create", "User.Read"
        };

        var systemRolePermissions = systemPermissions.Select((permission, index) => new RolePermission
        {
            Id = Guid.NewGuid(),
            RoleId = systemAdminRoleId,
            Permission = permission,
            IsGranted = true
        });

        var tenantRolePermissions = tenantPermissions.Select((permission, index) => new RolePermission
        {
            Id = Guid.NewGuid(),
            RoleId = tenantAdminRoleId,
            Permission = permission,
            IsGranted = true
        });

        var userRolePermissions = userPermissions.Select((permission, index) => new RolePermission
        {
            Id = Guid.NewGuid(),
            RoleId = userRoleId,
            Permission = permission,
            IsGranted = true
        });

        modelBuilder.Entity<RolePermission>().HasData(
            systemRolePermissions.Concat(tenantRolePermissions).Concat(userRolePermissions)
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is ITrackable trackable)
            {
                var now = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    trackable.CreatedAt = now;
                }

                trackable.UpdatedAt = now;
            }
        }
    }
}

// Interface for entities that support automatic timestamp tracking
public interface ITrackable
{
    DateTime CreatedAt { get; set; }
    DateTime UpdatedAt { get; set; }
}

