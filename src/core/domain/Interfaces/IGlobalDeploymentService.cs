using EnterpriseDocsCore.Infrastructure.Services;

namespace EnterpriseDocsCore.Domain.Interfaces
{
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
        string GetOptimalRegion(string userLocation, string dataResidencyRequirement = null);

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
}