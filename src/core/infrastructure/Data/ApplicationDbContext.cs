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
    
    // Health Monitoring Entity Sets
    public DbSet<SystemHealthMetric> SystemHealthMetrics => Set<SystemHealthMetric>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<IncidentUpdate> IncidentUpdates => Set<IncidentUpdate>();
    public DbSet<MaintenanceWindow> MaintenanceWindows => Set<MaintenanceWindow>();

    // Analytics Entity Sets
    public DbSet<PlatformMetricsDaily> PlatformMetricsDaily => Set<PlatformMetricsDaily>();
    public DbSet<RevenueMetricsMonthly> RevenueMetricsMonthly => Set<RevenueMetricsMonthly>();
    public DbSet<CustomerCohort> CustomerCohorts => Set<CustomerCohort>();
    public DbSet<TenantUsageMetrics> TenantUsageMetrics => Set<TenantUsageMetrics>();
    public DbSet<RevenueForecast> RevenueForecasts => Set<RevenueForecast>();
    public DbSet<PlatformHealthMetrics> PlatformHealthMetrics => Set<PlatformHealthMetrics>();
    public DbSet<FeatureAdoptionMetrics> FeatureAdoptionMetrics => Set<FeatureAdoptionMetrics>();
    public DbSet<GeographicMetrics> GeographicMetrics => Set<GeographicMetrics>();
    public DbSet<CompetitiveMetrics> CompetitiveMetrics => Set<CompetitiveMetrics>();

    // Sprint 6 Collaboration Entity Sets
    public DbSet<DocumentSession> DocumentSessions => Set<DocumentSession>();
    public DbSet<DocumentOperation> DocumentOperations => Set<DocumentOperation>();
    public DbSet<DocumentComment> DocumentComments => Set<DocumentComment>();
    
    // Sprint 6 Workflow Entity Sets
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<WorkflowTask> WorkflowTasks => Set<WorkflowTask>();
    public DbSet<WorkflowHistoryEntry> WorkflowHistoryEntries => Set<WorkflowHistoryEntry>();
    public DbSet<WorkflowPermission> WorkflowPermissions => Set<WorkflowPermission>();
    
    // Sprint 6 Digital Signature Entity Sets
    public DbSet<DocumentSignatureRequest> DocumentSignatureRequests => Set<DocumentSignatureRequest>();
    public DbSet<DocumentSignature> DocumentSignatures => Set<DocumentSignature>();
    public DbSet<SignedDocument> SignedDocuments => Set<SignedDocument>();

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

        // Configure Document MetaKeywords property
        modelBuilder.Entity<Document>()
            .Property(e => e.MetaKeywords)
            .HasConversion(stringListConverter);

        modelBuilder.Entity<UserAuthentication>()
            .Property(e => e.ProviderData)
            .HasConversion(dictionaryConverter);

        modelBuilder.Entity<TenantModule>()
            .Property(e => e.Configuration)
            .HasConversion(dictionaryConverter);

        // Configure RefreshToken entity
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.Token)
                .IsRequired()
                .HasMaxLength(500);
            entity.HasIndex(rt => rt.Token)
                .IsUnique();
            entity.HasIndex(rt => rt.UserId);
            entity.HasIndex(rt => rt.ExpiresAt);
            entity.HasIndex(rt => rt.RevokedAt);
            
            // Configure relationship with User
            entity.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
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

        // Configure entity relationships
        ConfigureEntityRelationships(modelBuilder);
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

        // File-related indexes for document management
        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.TenantId, e.FileHash })
            .HasFilter("FileHash IS NOT NULL");

        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.TenantId, e.FileName })
            .HasFilter("FileName IS NOT NULL");

        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.ContentType, e.TenantId })
            .HasFilter("ContentType IS NOT NULL");

        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.TenantId, e.IsLatestVersion, e.ParentDocumentId })
            .HasFilter("ParentDocumentId IS NOT NULL");

        modelBuilder.Entity<Document>()
            .HasIndex(e => new { e.TenantId, e.Version, e.ParentDocumentId })
            .HasFilter("ParentDocumentId IS NOT NULL");

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

        // Refresh token indexes
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(e => e.Token)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(e => new { e.UserId, e.CreatedAt });

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(e => e.ExpiresAt);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(e => new { e.RevokedAt, e.RevokedByIp });

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(e => e.CreatedByIp);

        // Sprint 6 Collaboration indexes
        modelBuilder.Entity<DocumentSession>()
            .HasIndex(e => new { e.DocumentId, e.IsActive });

        modelBuilder.Entity<DocumentSession>()
            .HasIndex(e => new { e.UserId, e.IsActive });

        modelBuilder.Entity<DocumentSession>()
            .HasIndex(e => e.ConnectionId)
            .IsUnique();

        modelBuilder.Entity<DocumentSession>()
            .HasIndex(e => e.LastActivity);

        modelBuilder.Entity<DocumentOperation>()
            .HasIndex(e => new { e.DocumentId, e.Version });

        modelBuilder.Entity<DocumentOperation>()
            .HasIndex(e => new { e.DocumentId, e.SequenceNumber });

        modelBuilder.Entity<DocumentOperation>()
            .HasIndex(e => new { e.UserId, e.AppliedAt });

        modelBuilder.Entity<DocumentComment>()
            .HasIndex(e => new { e.DocumentId, e.CreatedAt });

        modelBuilder.Entity<DocumentComment>()
            .HasIndex(e => new { e.UserId, e.CreatedAt });

        modelBuilder.Entity<DocumentComment>()
            .HasIndex(e => e.ParentCommentId);

        // Sprint 6 Workflow indexes
        modelBuilder.Entity<WorkflowDefinition>()
            .HasIndex(e => new { e.TenantId, e.IsActive });

        modelBuilder.Entity<WorkflowDefinition>()
            .HasIndex(e => new { e.Category, e.TenantId });

        modelBuilder.Entity<WorkflowInstance>()
            .HasIndex(e => new { e.DocumentId, e.Status });

        modelBuilder.Entity<WorkflowInstance>()
            .HasIndex(e => new { e.AssignedTo, e.Status });

        modelBuilder.Entity<WorkflowInstance>()
            .HasIndex(e => new { e.StartedBy, e.StartedAt });

        modelBuilder.Entity<WorkflowTask>()
            .HasIndex(e => new { e.AssignedTo, e.Status });

        modelBuilder.Entity<WorkflowTask>()
            .HasIndex(e => new { e.WorkflowInstanceId, e.Status });

        modelBuilder.Entity<WorkflowTask>()
            .HasIndex(e => e.DueDate);

        modelBuilder.Entity<WorkflowHistoryEntry>()
            .HasIndex(e => new { e.WorkflowInstanceId, e.Timestamp });

        // Sprint 6 Digital Signature indexes
        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasIndex(e => new { e.DocumentId, e.Status });

        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasIndex(e => new { e.TenantId, e.CreatedAt });

        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasIndex(e => e.ExternalRequestId);

        modelBuilder.Entity<DocumentSignature>()
            .HasIndex(e => new { e.SignatureRequestId, e.SigningOrder });

        modelBuilder.Entity<DocumentSignature>()
            .HasIndex(e => new { e.SignerEmail, e.Status });

        modelBuilder.Entity<SignedDocument>()
            .HasIndex(e => e.DocumentId);

        modelBuilder.Entity<SignedDocument>()
            .HasIndex(e => e.SignatureRequestId);
    }

    private static void ConfigureEntityRelationships(ModelBuilder modelBuilder)
    {
        // Configure Document relationships
        modelBuilder.Entity<Document>()
            .HasOne(d => d.CreatedByUser)
            .WithMany()
            .HasForeignKey(d => d.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Document>()
            .HasOne(d => d.PublishedByUser)
            .WithMany()
            .HasForeignKey(d => d.PublishedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Document>()
            .HasOne(d => d.Tenant)
            .WithMany()
            .HasForeignKey(d => d.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Document versioning relationship
        modelBuilder.Entity<Document>()
            .HasOne<Document>()
            .WithMany()
            .HasForeignKey(d => d.ParentDocumentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure DocumentTag relationships
        modelBuilder.Entity<DocumentTag>()
            .HasOne(dt => dt.Document)
            .WithMany(d => d.Tags)
            .HasForeignKey(dt => dt.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure DocumentAttachment relationships
        modelBuilder.Entity<DocumentAttachment>()
            .HasOne(da => da.Document)
            .WithMany(d => d.Attachments)
            .HasForeignKey(da => da.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure DocumentPermission relationships
        modelBuilder.Entity<DocumentPermission>()
            .HasOne(dp => dp.Document)
            .WithMany()
            .HasForeignKey(dp => dp.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentPermission>()
            .HasOne(dp => dp.User)
            .WithMany()
            .HasForeignKey(dp => dp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentPermission>()
            .HasOne(dp => dp.Role)
            .WithMany()
            .HasForeignKey(dp => dp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure DocumentAuditEntry relationships
        modelBuilder.Entity<DocumentAuditEntry>()
            .HasOne(dae => dae.Document)
            .WithMany()
            .HasForeignKey(dae => dae.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentAuditEntry>()
            .HasOne(dae => dae.User)
            .WithMany()
            .HasForeignKey(dae => dae.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Sprint 6 Collaboration relationships
        modelBuilder.Entity<DocumentSession>()
            .HasOne(ds => ds.Document)
            .WithMany()
            .HasForeignKey(ds => ds.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentSession>()
            .HasOne(ds => ds.User)
            .WithMany()
            .HasForeignKey(ds => ds.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentOperation>()
            .HasOne(do => do.Document)
            .WithMany()
            .HasForeignKey(do => do.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentOperation>()
            .HasOne(do => do.User)
            .WithMany()
            .HasForeignKey(do => do.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentComment>()
            .HasOne(dc => dc.Document)
            .WithMany()
            .HasForeignKey(dc => dc.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentComment>()
            .HasOne(dc => dc.User)
            .WithMany()
            .HasForeignKey(dc => dc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentComment>()
            .HasOne(dc => dc.ParentComment)
            .WithMany(dc => dc.Replies)
            .HasForeignKey(dc => dc.ParentCommentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentComment>()
            .HasOne(dc => dc.ResolvedByUser)
            .WithMany()
            .HasForeignKey(dc => dc.ResolvedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Sprint 6 Workflow relationships
        modelBuilder.Entity<WorkflowDefinition>()
            .HasOne(wd => wd.Tenant)
            .WithMany()
            .HasForeignKey(wd => wd.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowDefinition>()
            .HasOne(wd => wd.CreatedByUser)
            .WithMany()
            .HasForeignKey(wd => wd.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowDefinition>()
            .HasOne(wd => wd.UpdatedByUser)
            .WithMany()
            .HasForeignKey(wd => wd.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.WorkflowDefinition)
            .WithMany(wd => wd.Instances)
            .HasForeignKey(wi => wi.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.Document)
            .WithMany()
            .HasForeignKey(wi => wi.DocumentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.StartedByUser)
            .WithMany()
            .HasForeignKey(wi => wi.StartedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.AssignedToUser)
            .WithMany()
            .HasForeignKey(wi => wi.AssignedTo)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkflowTask>()
            .HasOne(wt => wt.WorkflowInstance)
            .WithMany(wi => wi.Tasks)
            .HasForeignKey(wt => wt.WorkflowInstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowTask>()
            .HasOne(wt => wt.AssignedToUser)
            .WithMany()
            .HasForeignKey(wt => wt.AssignedTo)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkflowTask>()
            .HasOne(wt => wt.AssignedToRoleEntity)
            .WithMany()
            .HasForeignKey(wt => wt.AssignedToRole)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkflowTask>()
            .HasOne(wt => wt.CompletedByUser)
            .WithMany()
            .HasForeignKey(wt => wt.CompletedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowHistoryEntry>()
            .HasOne(whe => whe.WorkflowInstance)
            .WithMany(wi => wi.History)
            .HasForeignKey(whe => whe.WorkflowInstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowHistoryEntry>()
            .HasOne(whe => whe.User)
            .WithMany()
            .HasForeignKey(whe => whe.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Sprint 6 Digital Signature relationships
        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasOne(dsr => dsr.Document)
            .WithMany()
            .HasForeignKey(dsr => dsr.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasOne(dsr => dsr.Tenant)
            .WithMany()
            .HasForeignKey(dsr => dsr.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentSignatureRequest>()
            .HasOne(dsr => dsr.CreatedByUser)
            .WithMany()
            .HasForeignKey(dsr => dsr.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentSignature>()
            .HasOne(ds => ds.SignatureRequest)
            .WithMany(dsr => dsr.Signatures)
            .HasForeignKey(ds => ds.SignatureRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentSignature>()
            .HasOne(ds => ds.User)
            .WithMany()
            .HasForeignKey(ds => ds.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<SignedDocument>()
            .HasOne(sd => sd.Document)
            .WithMany()
            .HasForeignKey(sd => sd.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SignedDocument>()
            .HasOne(sd => sd.SignatureRequest)
            .WithMany()
            .HasForeignKey(sd => sd.SignatureRequestId)
            .OnDelete(DeleteBehavior.Cascade);
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

