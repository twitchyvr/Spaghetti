using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Analytics entities for platform revenue and business intelligence
/// These entities support aggregated metrics, forecasting, and cohort analysis
/// </summary>

/// <summary>
/// Daily platform metrics aggregation for performance and reporting
/// </summary>
public class PlatformMetricsDaily
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public DateTime Date { get; set; }
    
    // Platform-wide metrics
    public int ActiveTenants { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int DocumentsCreated { get; set; }
    public long APICallsTotal { get; set; }
    public decimal StorageUsedGB { get; set; }
    
    // Revenue metrics
    public decimal MRR { get; set; }
    public decimal ARR { get; set; }
    public int NewTrials { get; set; }
    public int Conversions { get; set; }
    public int ChurnedTenants { get; set; }
    
    // System health
    public double AverageResponseTime { get; set; }
    public double SystemUptime { get; set; }
    public int ActiveIncidents { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Monthly revenue metrics aggregation for financial reporting
/// </summary>
public class RevenueMetricsMonthly
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(7)] // YYYY-MM format
    public string YearMonth { get; set; } = string.Empty;
    
    // Core revenue metrics
    public decimal MRR { get; set; }
    public decimal ARR { get; set; }
    
    // Revenue breakdown
    public decimal NewMRR { get; set; }
    public decimal ExpansionMRR { get; set; }
    public decimal ContractionMRR { get; set; }
    public decimal ChurnedMRR { get; set; }
    
    // Key ratios
    public decimal NetRevenueRetention { get; set; }
    public decimal GrossRevenueRetention { get; set; }
    
    // Customer metrics
    public int CustomerCount { get; set; }
    public int NewCustomers { get; set; }
    public int ChurnedCustomers { get; set; }
    public decimal AverageRevenuePerUser { get; set; }
    public decimal CustomerLifetimeValue { get; set; }
    
    // Tier breakdown
    public int TrialCustomers { get; set; }
    public int ProfessionalCustomers { get; set; }
    public int EnterpriseCustomers { get; set; }
    public int CustomCustomers { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Customer cohort analysis for retention and expansion tracking
/// </summary>
public class CustomerCohort
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(7)] // YYYY-MM format
    public string CohortMonth { get; set; } = string.Empty;
    
    [Required]
    public int PeriodNumber { get; set; } // 0, 1, 2, 3... months after acquisition
    
    // Cohort metrics
    public int OriginalCustomers { get; set; }
    public int RemainingCustomers { get; set; }
    public decimal RetentionRate { get; set; }
    public decimal Revenue { get; set; }
    public decimal RevenuePerCustomer { get; set; }
    
    // Expansion metrics
    public int UpgradedCustomers { get; set; }
    public int DowngradedCustomers { get; set; }
    public decimal ExpansionRevenue { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Usage analytics per tenant for platform insights
/// </summary>
public class TenantUsageMetrics
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    // User activity
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    
    // Document activity
    public int DocumentsCreated { get; set; }
    public int DocumentsEdited { get; set; }
    public int DocumentsViewed { get; set; }
    public int DocumentsPublished { get; set; }
    
    // API usage
    public int APICallsRead { get; set; }
    public int APICallsWrite { get; set; }
    public int APICallsTotal { get; set; }
    
    // Storage and performance
    public long StorageUsedBytes { get; set; }
    public double AverageLoadTime { get; set; }
    public int ErrorCount { get; set; }
    
    // Feature adoption
    public int AIProcessingMinutes { get; set; }
    public int CollaborationSessions { get; set; }
    public int IntegrationUsage { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Revenue forecasting model for business planning
/// </summary>
public class RevenueForecast
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(7)] // YYYY-MM format
    public string ForecastMonth { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Forecast metrics
    public decimal PredictedMRR { get; set; }
    public decimal PredictedARR { get; set; }
    public decimal ConfidenceLevel { get; set; }
    
    // Breakdown by tier
    public decimal TrialToProConversions { get; set; }
    public decimal ProToEnterpriseUpgrades { get; set; }
    public decimal ExpectedChurn { get; set; }
    
    // Model parameters
    [MaxLength(50)]
    public string ModelVersion { get; set; } = string.Empty;
    public string ModelParameters { get; set; } = "{}"; // JSON
    
    // Accuracy tracking (populated after actual results)
    public decimal? ActualMRR { get; set; }
    public decimal? ForecastAccuracy { get; set; }
}

/// <summary>
/// Platform health monitoring for operational excellence
/// </summary>
public class PlatformHealthMetrics
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // API performance
    public double AverageResponseTime { get; set; }
    public double P95ResponseTime { get; set; }
    public double P99ResponseTime { get; set; }
    
    // System health
    public bool DatabaseHealth { get; set; }
    public bool RedisHealth { get; set; }
    public bool ElasticsearchHealth { get; set; }
    
    // Uptime tracking
    public double SystemUptime { get; set; }
    public int ActiveIncidents { get; set; }
    
    // Resource utilization
    public double CPUUtilization { get; set; }
    public double MemoryUtilization { get; set; }
    public double DiskUtilization { get; set; }
    
    // Error tracking
    public int TotalErrors { get; set; }
    public int CriticalErrors { get; set; }
    public int UserImpactingErrors { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Feature adoption tracking across the platform
/// </summary>
public class FeatureAdoptionMetrics
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string FeatureName { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    // Adoption metrics
    public int TotalTenants { get; set; }
    public int AdoptedTenants { get; set; }
    public decimal AdoptionRate { get; set; }
    
    // Usage metrics
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int UsageSessions { get; set; }
    public double AverageSessionDuration { get; set; }
    
    // Breakdown by tier
    public int TrialAdoption { get; set; }
    public int ProfessionalAdoption { get; set; }
    public int EnterpriseAdoption { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Geographic distribution metrics for market analysis
/// </summary>
public class GeographicMetrics
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(2)] // ISO 3166-1 alpha-2
    public string CountryCode { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string CountryName { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    // Customer metrics
    public int TenantCount { get; set; }
    public int UserCount { get; set; }
    public decimal Revenue { get; set; }
    
    // Usage metrics
    public int DocumentsCreated { get; set; }
    public long APICallsTotal { get; set; }
    public long StorageUsedBytes { get; set; }
    
    // Growth metrics
    public decimal MonthOverMonthGrowth { get; set; }
    public decimal YearOverYearGrowth { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Competitive analysis and win/loss tracking
/// </summary>
public class CompetitiveMetrics
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string CompetitorName { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    // Win/Loss tracking
    public int WonDeals { get; set; }
    public int LostDeals { get; set; }
    public decimal WinRate { get; set; }
    
    // Deal values
    public decimal WonRevenue { get; set; }
    public decimal LostRevenue { get; set; }
    public decimal AverageDealSize { get; set; }
    
    // Competitive positioning
    [MaxLength(500)]
    public string? KeyDifferentiators { get; set; }
    [MaxLength(500)]
    public string? LossReasons { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}