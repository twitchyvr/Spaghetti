using EnterpriseDocsCore.Domain.Entities;
using System.Linq.Expressions;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Specific repository interfaces with entity-specific operations
/// </summary>

public interface IDocumentRepository : IRepository<Document, Guid>
{
    // Document-specific queries
    Task<IEnumerable<Document>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByIndustryAsync(string industry, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByStatusAsync(DocumentStatus status, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Document>> GetRecentAsync(Guid? tenantId, int count = 10, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetRecentByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Document>> SearchAsync(string searchTerm, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> SearchByTagsAsync(IEnumerable<string> tags, Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Document>> GetByDateRangeAsync(DateTime from, DateTime to, Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    // Version management
    Task<IEnumerable<Document>> GetVersionsAsync(Guid parentDocumentId, CancellationToken cancellationToken = default);
    Task<Document?> GetLatestVersionAsync(Guid parentDocumentId, CancellationToken cancellationToken = default);
    
    // Permission checking
    Task<bool> HasUserAccessAsync(Guid documentId, Guid userId, PermissionType permissionType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetAccessibleDocumentsAsync(Guid userId, Guid? tenantId = null, CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<User, Guid>
{
    // User-specific queries
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetActiveUsersAsync(Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, Guid excludeUserId, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<User>> SearchAsync(string searchTerm, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetByDepartmentAsync(string department, Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    // Authentication related
    Task<User?> GetByExternalIdAsync(string provider, string externalId, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface ITenantRepository : IRepository<Tenant, Guid>
{
    // Tenant-specific queries
    Task<Tenant?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tenant>> GetByStatusAsync(TenantStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tenant>> GetByTierAsync(TenantTier tier, CancellationToken cancellationToken = default);
    
    Task<bool> ExistsBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySubdomainAsync(string subdomain, Guid excludeTenantId, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Tenant>> GetExpiringTrialsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tenant>> GetOverQuotaTenantsAsync(CancellationToken cancellationToken = default);
    
    // Usage and billing
    Task UpdateUsageStatsAsync(Guid tenantId, string quotaType, int usage, CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> GetUsageStatsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public interface IRoleRepository : IRepository<Role, Guid>
{
    // Role-specific queries
    Task<IEnumerable<Role>> GetByTenantIdAsync(Guid? tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Role>> GetSystemRolesAsync(CancellationToken cancellationToken = default);
    Task<Role?> GetByNameAsync(string name, Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Role>> GetActiveRolesAsync(Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default);
    
    Task<bool> ExistsByNameAsync(string name, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default);
}

public interface IDocumentTagRepository : IRepository<DocumentTag, Guid>
{
    // Tag-specific queries
    Task<IEnumerable<DocumentTag>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentTag>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetPopularTagsAsync(Guid? tenantId = null, int count = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetTagSuggestionsAsync(string partialTag, Guid? tenantId = null, int count = 10, CancellationToken cancellationToken = default);
    
    Task<bool> ExistsAsync(Guid documentId, string tagName, CancellationToken cancellationToken = default);
    Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
}

public interface IDocumentAttachmentRepository : IRepository<DocumentAttachment, Guid>
{
    // Attachment-specific queries
    Task<IEnumerable<DocumentAttachment>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentAttachment>> GetByTypeAsync(AttachmentType type, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentAttachment>> GetByUploadedByAsync(Guid userId, CancellationToken cancellationToken = default);
    
    Task<long> GetTotalSizeByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<long> GetTotalSizeByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    
    Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
}

public interface IDocumentPermissionRepository : IRepository<DocumentPermission, Guid>
{
    // Permission-specific queries
    Task<IEnumerable<DocumentPermission>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentPermission>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentPermission>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default);
    
    Task<DocumentPermission?> GetUserPermissionAsync(Guid documentId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentPermission>> GetActivePermissionsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentPermission>> GetExpiringPermissionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    
    Task<bool> HasPermissionAsync(Guid documentId, Guid userId, PermissionType permissionType, CancellationToken cancellationToken = default);
    Task<int> DeleteByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<int> DeleteExpiredPermissionsAsync(CancellationToken cancellationToken = default);
}

public interface IDocumentAuditEntryRepository : IRepository<DocumentAuditEntry, Guid>
{
    // Audit-specific queries
    Task<IEnumerable<DocumentAuditEntry>> GetByDocumentIdAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<DocumentAuditEntry>> GetRecentActivityAsync(Guid? documentId = null, Guid? userId = null, int count = 50, CancellationToken cancellationToken = default);
    Task<int> DeleteOldEntriesAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
}

public interface IUserRoleRepository : IRepository<UserRole, Guid>
{
    // UserRole-specific queries
    Task<IEnumerable<UserRole>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRole>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRole>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRole>> GetExpiringRolesAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    
    Task<UserRole?> GetUserRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken = default);
    Task<bool> HasRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken = default);
    Task<int> DeleteExpiredRolesAsync(CancellationToken cancellationToken = default);
}

public interface IRolePermissionRepository : IRepository<RolePermission, Guid>
{
    // RolePermission-specific queries
    Task<IEnumerable<RolePermission>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RolePermission>> GetByPermissionAsync(string permission, CancellationToken cancellationToken = default);
    Task<RolePermission?> GetRolePermissionAsync(Guid roleId, string permission, string? resource = null, CancellationToken cancellationToken = default);
    
    Task<bool> HasPermissionAsync(Guid roleId, string permission, string? resource = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetRolePermissionsAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<int> DeleteByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default);
}

public interface IUserAuthenticationRepository : IRepository<UserAuthentication, Guid>
{
    // UserAuthentication-specific queries
    Task<IEnumerable<UserAuthentication>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserAuthentication?> GetByProviderAsync(string provider, string externalId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuthentication>> GetByProviderAsync(string provider, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuthentication>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    
    Task<bool> ExistsByProviderAsync(string provider, string externalId, CancellationToken cancellationToken = default);
    Task<int> DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IUserAuditEntryRepository : IRepository<UserAuditEntry, Guid>
{
    // UserAudit-specific queries
    Task<IEnumerable<UserAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuditEntry>> GetSuccessfulLoginsAsync(Guid? userId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserAuditEntry>> GetFailedLoginsAsync(DateTime? since = null, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<UserAuditEntry>> GetRecentActivityAsync(Guid? userId = null, int count = 50, CancellationToken cancellationToken = default);
    Task<int> DeleteOldEntriesAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
}

public interface ITenantModuleRepository : IRepository<TenantModule, Guid>
{
    // TenantModule-specific queries
    Task<IEnumerable<TenantModule>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantModule>> GetByModuleNameAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<TenantModule?> GetTenantModuleAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<TenantModule>> GetEnabledModulesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantModule>> GetExpiringModulesAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    
    Task<bool> IsModuleEnabledAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default);
    Task<int> DeleteExpiredModulesAsync(CancellationToken cancellationToken = default);
}

public interface ITenantAuditEntryRepository : IRepository<TenantAuditEntry, Guid>
{
    // TenantAudit-specific queries
    Task<IEnumerable<TenantAuditEntry>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantAuditEntry>> GetByActionAsync(string action, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantAuditEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantAuditEntry>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<TenantAuditEntry>> GetBySeverityAsync(AuditSeverity severity, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<TenantAuditEntry>> GetRecentActivityAsync(Guid? tenantId = null, int count = 50, CancellationToken cancellationToken = default);
    Task<int> DeleteOldEntriesAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
}

// Health Monitoring Repository Interfaces

public interface ISystemHealthMetricRepository : IRepository<SystemHealthMetric, Guid>
{
    // Health metric specific queries
    Task<IEnumerable<SystemHealthMetric>> GetByServiceNameAsync(string serviceName, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetByServiceAndDateRangeAsync(string serviceName, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetByStatusAsync(HealthStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetByMetricNameAsync(string metricName, CancellationToken cancellationToken = default);
    
    Task<SystemHealthMetric?> GetLatestByServiceAsync(string serviceName, string metricName, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetRecentAsync(int count = 100, CancellationToken cancellationToken = default);
    Task<IEnumerable<SystemHealthMetric>> GetRecentByServiceAsync(string serviceName, int count = 100, CancellationToken cancellationToken = default);
    
    Task<int> DeleteOldMetricsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDistinctServiceNamesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDistinctMetricNamesAsync(string? serviceName = null, CancellationToken cancellationToken = default);
}

public interface IIncidentRepository : IRepository<Incident, Guid>
{
    // Incident specific queries
    Task<IEnumerable<Incident>> GetActiveIncidentsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetByStatusAsync(IncidentStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetBySeverityAsync(IncidentSeverity severity, CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetByAssignedToAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<Incident>> GetByAffectedServiceAsync(string serviceName, CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetUnresolvedAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Incident>> GetRecentAsync(int count = 50, CancellationToken cancellationToken = default);
    
    Task<int> GetActiveIncidentCountAsync(CancellationToken cancellationToken = default);
    Task<int> GetIncidentCountByStatusAsync(IncidentStatus status, CancellationToken cancellationToken = default);
    Task<TimeSpan> GetAverageResolutionTimeAsync(IncidentSeverity? severity = null, CancellationToken cancellationToken = default);
}

public interface IIncidentUpdateRepository : IRepository<IncidentUpdate, Guid>
{
    // Incident update specific queries
    Task<IEnumerable<IncidentUpdate>> GetByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<IncidentUpdate>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<IncidentUpdate>> GetByUpdateTypeAsync(IncidentUpdateType updateType, CancellationToken cancellationToken = default);
    Task<IEnumerable<IncidentUpdate>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    
    Task<IncidentUpdate?> GetLatestByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<IncidentUpdate>> GetRecentAsync(int count = 100, CancellationToken cancellationToken = default);
    Task<int> DeleteByIncidentIdAsync(Guid incidentId, CancellationToken cancellationToken = default);
}

public interface IMaintenanceWindowRepository : IRepository<MaintenanceWindow, Guid>
{
    // Maintenance window specific queries
    Task<IEnumerable<MaintenanceWindow>> GetScheduledAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetByStatusAsync(MaintenanceStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetByTypeAsync(MaintenanceType type, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetByCreatedByAsync(Guid userId, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<MaintenanceWindow>> GetActiveMaintenanceAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetUpcomingMaintenanceAsync(TimeSpan withinTimeSpan, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetByAffectedServiceAsync(string serviceName, CancellationToken cancellationToken = default);
    Task<IEnumerable<MaintenanceWindow>> GetConflictingMaintenanceAsync(DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default);
}