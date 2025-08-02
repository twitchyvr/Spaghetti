using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Sprint 9: Global Deployment Service Interface
/// Defines contract for multi-region deployment and data sovereignty management
/// </summary>
public interface IGlobalDeploymentService
{
    /// <summary>
    /// Check health status of a specific region
    /// </summary>
    Task<RegionHealthStatus> GetRegionHealthAsync(string region);

    /// <summary>
    /// Get comprehensive health status across all regions
    /// </summary>
    Task<GlobalHealthStatus> GetGlobalHealthAsync();

    /// <summary>
    /// Determine optimal region for user based on location and data residency requirements
    /// </summary>
    string GetOptimalRegion(string userLocation, string? dataResidencyRequirement = null);

    /// <summary>
    /// Validate data sovereignty compliance for specific region and data type
    /// </summary>
    Task<bool> ValidateDataSovereigntyAsync(string region, string dataType);

    /// <summary>
    /// Optimize CDN delivery for content type and user region
    /// </summary>
    Task<CDNOptimizationResult> OptimizeCDNDeliveryAsync(string contentType, string userRegion);

    /// <summary>
    /// Execute failover from failed region to target region
    /// </summary>
    Task<FailoverResult> ExecuteFailoverAsync(string failedRegion, string targetRegion);
}

#region Data Transfer Objects

/// <summary>
/// Health status for a specific region
/// </summary>
public class RegionHealthStatus
{
    public string Region { get; set; } = string.Empty;
    public HealthStatus Status { get; set; }
    public double ResponseTime { get; set; }
    public DateTime LastChecked { get; set; }
    public List<string> Services { get; set; } = new();
    public Dictionary<string, object> Metrics { get; set; } = new();
}

/// <summary>
/// Global health status across all regions
/// </summary>
public class GlobalHealthStatus
{
    public HealthStatus OverallStatus { get; set; }
    public Dictionary<string, RegionHealthStatus> Regions { get; set; } = new();
    public int HealthyRegions { get; set; }
    public int TotalRegions { get; set; }
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// CDN optimization result
/// </summary>
public class CDNOptimizationResult
{
    public string OptimalEndpoint { get; set; } = string.Empty;
    public string RecommendedCacheStrategy { get; set; } = string.Empty;
    public TimeSpan RecommendedTTL { get; set; }
    public List<string> EdgeLocations { get; set; } = new();
    public double EstimatedLatency { get; set; }
}

/// <summary>
/// Failover execution result
/// </summary>
public class FailoverResult
{
    public bool Success { get; set; }
    public string FailedRegion { get; set; } = string.Empty;
    public string TargetRegion { get; set; } = string.Empty;
    public DateTime ExecutedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public List<string> AffectedServices { get; set; } = new();
    public string? ErrorMessage { get; set; }
}


#endregion