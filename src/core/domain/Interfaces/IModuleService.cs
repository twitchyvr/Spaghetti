using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IModuleService
{
    // Module management
    Task<List<PlatformModule>> GetAvailableModulesAsync(CancellationToken cancellationToken = default);
    Task<List<PlatformModule>> GetEnabledModulesAsync(Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<PlatformModule?> GetModuleAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<PlatformModule> EnableModuleAsync(string moduleName, Guid tenantId, Guid enabledBy, CancellationToken cancellationToken = default);
    Task<bool> DisableModuleAsync(string moduleName, Guid tenantId, Guid disabledBy, CancellationToken cancellationToken = default);
    
    // Module configuration
    Task<ModuleConfiguration> GetModuleConfigurationAsync(string moduleName, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<ModuleConfiguration> UpdateModuleConfigurationAsync(string moduleName, UpdateModuleConfigurationRequest request, Guid tenantId, Guid updatedBy, CancellationToken cancellationToken = default);
    Task<bool> ResetModuleConfigurationAsync(string moduleName, Guid tenantId, Guid resetBy, CancellationToken cancellationToken = default);
    
    // Module initialization and lifecycle
    Task InitializeModuleAsync(string moduleName, Guid tenantId, CancellationToken cancellationToken = default);
    Task DisposeModuleAsync(string moduleName, Guid tenantId, CancellationToken cancellationToken = default);
    Task RestartModuleAsync(string moduleName, Guid tenantId, CancellationToken cancellationToken = default);
    Task<ModuleStatus> GetModuleStatusAsync(string moduleName, Guid? tenantId = null, CancellationToken cancellationToken = default);
    
    // Module dependencies
    Task<List<string>> GetModuleDependenciesAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<List<string>> GetModuleDependentsAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<DependencyValidationResult> ValidateDependenciesAsync(string moduleName, Guid tenantId, CancellationToken cancellationToken = default);
    
    // Module installation and updates
    Task<ModuleInstallationResult> InstallModuleAsync(InstallModuleRequest request, CancellationToken cancellationToken = default);
    Task<ModuleUpdateResult> UpdateModuleAsync(string moduleName, string version, CancellationToken cancellationToken = default);
    Task<bool> UninstallModuleAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<List<ModuleUpdate>> CheckForUpdatesAsync(CancellationToken cancellationToken = default);
    
    // Module marketplace and discovery
    Task<List<ModuleInfo>> SearchModulesAsync(ModuleSearchRequest request, CancellationToken cancellationToken = default);
    Task<ModuleInfo?> GetModuleInfoAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<List<ModuleCategory>> GetModuleCategoriesAsync(CancellationToken cancellationToken = default);
    Task<List<ModuleInfo>> GetFeaturedModulesAsync(CancellationToken cancellationToken = default);
    
    // Module permissions and security
    Task<List<ModulePermission>> GetModulePermissionsAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<bool> HasModulePermissionAsync(string moduleName, Guid userId, string permission, CancellationToken cancellationToken = default);
    Task<ModuleSecurityScan> ScanModuleSecurityAsync(string moduleName, CancellationToken cancellationToken = default);
    
    // Module analytics and monitoring
    Task<ModuleUsageStats> GetModuleUsageStatsAsync(string moduleName, Guid? tenantId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<List<ModulePerformanceMetric>> GetModulePerformanceAsync(string moduleName, CancellationToken cancellationToken = default);
    Task RecordModuleUsageAsync(string moduleName, Guid userId, string action, Dictionary<string, object>? metadata = null, CancellationToken cancellationToken = default);
    
    // Module integration and communication
    Task<T?> CallModuleMethodAsync<T>(string moduleName, string methodName, object?[] parameters, CancellationToken cancellationToken = default);
    Task<bool> SendModuleMessageAsync(string moduleName, ModuleMessage message, CancellationToken cancellationToken = default);
    Task<List<ModuleMessage>> GetModuleMessagesAsync(string moduleName, CancellationToken cancellationToken = default);
    
    // Module data and storage
    Task<T?> GetModuleDataAsync<T>(string moduleName, string key, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<bool> SetModuleDataAsync<T>(string moduleName, string key, T value, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteModuleDataAsync(string moduleName, string key, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<Dictionary<string, object>> GetAllModuleDataAsync(string moduleName, Guid? tenantId = null, CancellationToken cancellationToken = default);
}

// Platform Module Entity
public class PlatformModule
{
    public required string Name { get; set; }
    public required string Version { get; set; }
    public required string DisplayName { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public string? Icon { get; set; }
    public required string Category { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<string> Dependencies { get; set; } = new();
    public bool IsSystemModule { get; set; } = false;
    public bool IsEnabled { get; set; } = false;
    public ModuleType Type { get; set; } = ModuleType.Integration;
    public ModuleConfiguration Configuration { get; set; } = new() { ModuleName = "" };
    public ModuleManifest Manifest { get; set; } = new() { Name = "", Version = "1.0.0" };
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EnabledAt { get; set; }
    public Guid? EnabledBy { get; set; }
}

public enum ModuleType
{
    Integration,
    Agent,
    Connector,
    Plugin,
    Extension,
    Service,
    Utility,
    Analytics,
    Security,
    Compliance
}

public class ModuleConfiguration
{
    public required string ModuleName { get; set; }
    public Guid? TenantId { get; set; }
    public Dictionary<string, object> Settings { get; set; } = new();
    public Dictionary<string, object> Secrets { get; set; } = new();
    public List<ModuleEndpoint> Endpoints { get; set; } = new();
    public ModuleSecurityConfig Security { get; set; } = new();
    public ModuleResourceConfig Resources { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedBy { get; set; }
}

public class ModuleEndpoint
{
    public required string Name { get; set; }
    public required string Url { get; set; }
    public string Method { get; set; } = "GET";
    public Dictionary<string, string> Headers { get; set; } = new();
    public Dictionary<string, object> Parameters { get; set; } = new();
    public bool RequiresAuth { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 30;
}

public class ModuleSecurityConfig
{
    public bool RequireEncryption { get; set; } = true;
    public bool RequireAuthentication { get; set; } = true;
    public List<string> AllowedOrigins { get; set; } = new();
    public List<string> RequiredPermissions { get; set; } = new();
    public Dictionary<string, object> CustomSecuritySettings { get; set; } = new();
}

public class ModuleResourceConfig
{
    public int MaxMemoryMB { get; set; } = 256;
    public int MaxCpuPercent { get; set; } = 50;
    public int MaxDiskMB { get; set; } = 1024;
    public int MaxNetworkMbps { get; set; } = 100;
    public TimeSpan MaxExecutionTime { get; set; } = TimeSpan.FromMinutes(5);
}

public class ModuleManifest
{
    public required string Name { get; set; }
    public required string Version { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public string? License { get; set; }
    public string? Homepage { get; set; }
    public string? Repository { get; set; }
    public List<string> Keywords { get; set; } = new();
    public List<ModuleDependency> Dependencies { get; set; } = new();
    public List<ModuleCapability> Capabilities { get; set; } = new();
    public ModuleCompatibility Compatibility { get; set; } = new() { MinPlatformVersion = "1.0.0" };
    public Dictionary<string, object> CustomMetadata { get; set; } = new();
}

public class ModuleDependency
{
    public required string Name { get; set; }
    public required string Version { get; set; }
    public bool IsOptional { get; set; } = false;
    public string? Reason { get; set; }
}

public class ModuleCapability
{
    public required string Name { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class ModuleCompatibility
{
    public required string MinPlatformVersion { get; set; }
    public string? MaxPlatformVersion { get; set; }
    public List<string> SupportedDeployments { get; set; } = new();
    public List<string> SupportedDatabases { get; set; } = new();
    public List<string> SupportedOperatingSystems { get; set; } = new();
}

// Request/Response DTOs
public class UpdateModuleConfigurationRequest
{
    public Dictionary<string, object>? Settings { get; set; }
    public Dictionary<string, object>? Secrets { get; set; }
    public List<ModuleEndpoint>? Endpoints { get; set; }
    public ModuleSecurityConfig? Security { get; set; }
    public ModuleResourceConfig? Resources { get; set; }
}

public class ModuleStatus
{
    public required string ModuleName { get; set; }
    public ModuleState State { get; set; }
    public bool IsHealthy { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime LastCheck { get; set; }
    public ModuleMetrics Metrics { get; set; } = new();
    public List<ModuleHealthCheck> HealthChecks { get; set; } = new();
}

public enum ModuleState
{
    Stopped,
    Starting,
    Running,
    Stopping,
    Error,
    Unknown
}

public class ModuleMetrics
{
    public int MemoryUsageMB { get; set; }
    public float CpuUsagePercent { get; set; }
    public int DiskUsageMB { get; set; }
    public int NetworkUsageKbps { get; set; }
    public int RequestCount { get; set; }
    public int ErrorCount { get; set; }
    public TimeSpan Uptime { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class ModuleHealthCheck
{
    public required string Name { get; set; }
    public HealthStatus Status { get; set; }
    public string? Message { get; set; }
    public TimeSpan Duration { get; set; }
    public DateTime CheckedAt { get; set; }
}

public enum HealthStatus
{
    Healthy,
    Degraded,
    Unhealthy,
    Unknown
}

public class DependencyValidationResult
{
    public bool IsValid { get; set; }
    public List<DependencyIssue> Issues { get; set; } = new();
    public List<string> MissingDependencies { get; set; } = new();
    public List<string> ConflictingDependencies { get; set; } = new();
}

public class DependencyIssue
{
    public required string DependencyName { get; set; }
    public required string Issue { get; set; }
    public IssueSeverity Severity { get; set; }
    public string? Suggestion { get; set; }
}

public enum IssueSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public class InstallModuleRequest
{
    public required string ModuleName { get; set; }
    public string? Version { get; set; }
    public string? Source { get; set; }
    public Dictionary<string, object> Configuration { get; set; } = new();
    public bool AutoEnable { get; set; } = true;
    public List<Guid> TenantIds { get; set; } = new();
}

public class ModuleInstallationResult
{
    public bool IsSuccess { get; set; }
    public required string ModuleName { get; set; }
    public string? InstalledVersion { get; set; }
    public List<string> Warnings { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public TimeSpan InstallationTime { get; set; }
    public DateTime InstalledAt { get; set; }
}

public class ModuleUpdateResult
{
    public bool IsSuccess { get; set; }
    public required string ModuleName { get; set; }
    public string? OldVersion { get; set; }
    public string? NewVersion { get; set; }
    public List<string> Changes { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public TimeSpan UpdateTime { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ModuleUpdate
{
    public required string ModuleName { get; set; }
    public required string CurrentVersion { get; set; }
    public required string LatestVersion { get; set; }
    public string? Description { get; set; }
    public List<string> Changes { get; set; } = new();
    public UpdateType Type { get; set; }
    public DateTime ReleasedAt { get; set; }
    public bool IsSecurityUpdate { get; set; }
    public bool IsBreakingChange { get; set; }
}

public enum UpdateType
{
    Patch,
    Minor,
    Major,
    Security,
    Hotfix
}

public class ModuleSearchRequest
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Author { get; set; }
    public bool? IsOfficial { get; set; }
    public bool? IsFree { get; set; }
    public string? SortBy { get; set; } = "popularity";
    public SortOrder SortOrder { get; set; } = SortOrder.Descending;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ModuleInfo
{
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public required string Version { get; set; }
    public required string Category { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Icon { get; set; }
    public List<string> Screenshots { get; set; } = new();
    public ModuleRating Rating { get; set; } = new();
    public ModulePricing Pricing { get; set; } = new();
    public bool IsOfficial { get; set; }
    public bool IsVerified { get; set; }
    public DateTime PublishedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int DownloadCount { get; set; }
    public ModuleManifest Manifest { get; set; } = new() { Name = "", Version = "1.0.0" };
}

public class ModuleRating
{
    public float AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
}

public class ModulePricing
{
    public bool IsFree { get; set; } = true;
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public PricingModel Model { get; set; } = PricingModel.OneTime;
    public string? TrialPeriod { get; set; }
}

public enum PricingModel
{
    Free,
    OneTime,
    Monthly,
    Annual,
    Usage,
    Custom
}

public class ModuleCategory
{
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int ModuleCount { get; set; }
    public bool IsPopular { get; set; }
}

public class ModulePermission
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public PermissionScope Scope { get; set; }
    public bool IsRequired { get; set; }
    public bool IsDangerous { get; set; }
}

public enum PermissionScope
{
    Read,
    Write,
    Execute,
    Admin,
    System
}

public class ModuleSecurityScan
{
    public required string ModuleName { get; set; }
    public SecurityScanStatus Status { get; set; }
    public float SecurityScore { get; set; }
    public List<SecurityVulnerability> Vulnerabilities { get; set; } = new();
    public List<SecurityRecommendation> Recommendations { get; set; } = new();
    public DateTime ScanDate { get; set; }
    public string? ScanVersion { get; set; }
}

public enum SecurityScanStatus
{
    Passed,
    Warning,
    Failed,
    Unknown
}

public class SecurityVulnerability
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public SecuritySeverity Severity { get; set; }
    public string? CvssScore { get; set; }
    public List<string> AffectedVersions { get; set; } = new();
    public string? FixedVersion { get; set; }
}

public enum SecuritySeverity
{
    Low,
    Medium,
    High,
    Critical
}

public class SecurityRecommendation
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public RecommendationPriority Priority { get; set; }
    public string? Action { get; set; }
}

public enum RecommendationPriority
{
    Low,
    Medium,
    High,
    Critical
}

public class ModuleUsageStats
{
    public required string ModuleName { get; set; }
    public Guid? TenantId { get; set; }
    public int TotalUsageCount { get; set; }
    public int UniqueUserCount { get; set; }
    public TimeSpan TotalUsageTime { get; set; }
    public Dictionary<DateTime, int> UsageByDay { get; set; } = new();
    public Dictionary<string, int> UsageByAction { get; set; } = new();
    public Dictionary<Guid, int> UsageByUser { get; set; } = new();
    public DateTime FirstUsed { get; set; }
    public DateTime LastUsed { get; set; }
}

public class ModulePerformanceMetric
{
    public required string MetricName { get; set; }
    public float Value { get; set; }
    public string? Unit { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object> Tags { get; set; } = new();
}

public class ModuleMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FromModule { get; set; }
    public required string ToModule { get; set; }
    public required string Type { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public bool IsProcessed { get; set; }
}