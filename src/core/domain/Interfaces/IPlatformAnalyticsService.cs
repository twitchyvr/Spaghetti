using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service interface for platform analytics and business intelligence
/// Provides comprehensive metrics, forecasting, and cohort analysis
/// </summary>
public interface IPlatformAnalyticsService
{
    /// <summary>
    /// Get comprehensive platform metrics for a date range
    /// </summary>
    Task<PlatformAnalytics> GetPlatformMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get detailed revenue metrics and trends
    /// </summary>
    Task<RevenueAnalytics> GetRevenueMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get platform usage analytics and user behavior insights
    /// </summary>
    Task<UsageAnalytics> GetUsageMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get customer metrics including acquisition, retention, and churn
    /// </summary>
    Task<CustomerAnalytics> GetCustomerMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Generate revenue forecasts for specified months ahead
    /// </summary>
    Task<List<RevenueForecast>> GetRevenueForecastAsync(int monthsAhead, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Perform cohort analysis for customer retention tracking
    /// </summary>
    Task<CohortAnalysisResult> GetCohortAnalysisAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get feature adoption metrics across the platform
    /// </summary>
    Task<FeatureAdoptionAnalytics> GetFeatureAdoptionAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get geographic distribution and market analysis
    /// </summary>
    Task<GeographicAnalytics> GetGeographicAnalyticsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get platform health and performance metrics
    /// </summary>
    Task<PlatformHealthAnalytics> GetPlatformHealthAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get competitive analysis and market positioning
    /// </summary>
    Task<CompetitiveAnalytics> GetCompetitiveAnalyticsAsync(DateRange dateRange, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Process and aggregate daily metrics (background service)
    /// </summary>
    Task ProcessDailyMetricsAsync(DateTime date, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Process and aggregate monthly metrics (background service)
    /// </summary>
    Task ProcessMonthlyMetricsAsync(DateTime month, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Update revenue forecasting models
    /// </summary>
    Task UpdateForecastingModelsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Date range helper for analytics queries
/// </summary>
public class DateRange
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public DateRange(DateTime startDate, DateTime endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }
    
    public static DateRange Last30Days() => new(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);
    public static DateRange Last90Days() => new(DateTime.UtcNow.AddDays(-90), DateTime.UtcNow);
    public static DateRange LastYear() => new(DateTime.UtcNow.AddYears(-1), DateTime.UtcNow);
    public static DateRange CurrentMonth() => new(new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1), DateTime.UtcNow);
    public static DateRange LastMonth()
    {
        var lastMonth = DateTime.UtcNow.AddMonths(-1);
        return new(new DateTime(lastMonth.Year, lastMonth.Month, 1), 
                  new DateTime(lastMonth.Year, lastMonth.Month, DateTime.DaysInMonth(lastMonth.Year, lastMonth.Month)));
    }
}

/// <summary>
/// Comprehensive platform analytics result
/// </summary>
public class PlatformAnalytics
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalDocuments { get; set; }
    public long TotalAPICallsThisPeriod { get; set; }
    public decimal TotalStorageGB { get; set; }
    
    public decimal CurrentMRR { get; set; }
    public decimal CurrentARR { get; set; }
    public decimal MRRGrowthRate { get; set; }
    public decimal ARRGrowthRate { get; set; }
    
    public PlatformHealthSummary Health { get; set; } = new();
    public List<TrendDataPoint> ActivityTrend { get; set; } = new();
    public List<TrendDataPoint> GrowthTrend { get; set; } = new();
}

/// <summary>
/// Revenue analytics with detailed breakdown
/// </summary>
public class RevenueAnalytics
{
    public decimal CurrentMRR { get; set; }
    public decimal CurrentARR { get; set; }
    public decimal PreviousPeriodMRR { get; set; }
    public decimal MRRGrowthRate { get; set; }
    public decimal MRRGrowthAmount { get; set; }
    
    public decimal NewMRR { get; set; }
    public decimal ExpansionMRR { get; set; }
    public decimal ContractionMRR { get; set; }
    public decimal ChurnedMRR { get; set; }
    public decimal NetMRRGrowth { get; set; }
    
    public decimal NetRevenueRetention { get; set; }
    public decimal GrossRevenueRetention { get; set; }
    public decimal CustomerLifetimeValue { get; set; }
    public decimal AverageRevenuePerUser { get; set; }
    
    public RevenueTierBreakdown TierBreakdown { get; set; } = new();
    public List<RevenueDataPoint> RevenueHistory { get; set; } = new();
    public List<RevenueDataPoint> MRRTrend { get; set; } = new();
}

/// <summary>
/// Usage analytics for platform utilization
/// </summary>
public class UsageAnalytics
{
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public double UserEngagementRate { get; set; }
    
    public int DocumentsCreatedThisPeriod { get; set; }
    public int DocumentsEditedThisPeriod { get; set; }
    public int DocumentsViewedThisPeriod { get; set; }
    public int DocumentsPublishedThisPeriod { get; set; }
    
    public long APICallsThisPeriod { get; set; }
    public double AverageAPICallsPerUser { get; set; }
    public List<APIEndpointUsage> TopEndpoints { get; set; } = new();
    
    public decimal StorageGrowthThisPeriod { get; set; }
    public decimal AverageStoragePerTenant { get; set; }
    
    public List<TrendDataPoint> UserActivityTrend { get; set; } = new();
    public List<TrendDataPoint> DocumentActivityTrend { get; set; } = new();
    public List<TrendDataPoint> APIUsageTrend { get; set; } = new();
}

/// <summary>
/// Customer analytics for business intelligence
/// </summary>
public class CustomerAnalytics
{
    public int TotalCustomers { get; set; }
    public int NewCustomersThisPeriod { get; set; }
    public int ChurnedCustomersThisPeriod { get; set; }
    public decimal CustomerGrowthRate { get; set; }
    
    public decimal ChurnRate { get; set; }
    public decimal RetentionRate { get; set; }
    public decimal CustomerLifetimeValue { get; set; }
    public decimal CustomerAcquisitionCost { get; set; }
    
    public int TrialToProConversions { get; set; }
    public int ProToEnterpriseUpgrades { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal UpgradeRate { get; set; }
    
    public CustomerTierDistribution TierDistribution { get; set; } = new();
    public List<CustomerCohortData> CohortData { get; set; } = new();
    public List<TrendDataPoint> AcquisitionTrend { get; set; } = new();
    public List<TrendDataPoint> ChurnTrend { get; set; } = new();
}

/// <summary>
/// Feature adoption analytics
/// </summary>
public class FeatureAdoptionAnalytics
{
    public int TotalFeatures { get; set; }
    public List<FeatureAdoptionData> Features { get; set; } = new();
    public List<FeatureAdoptionData> TopAdoptedFeatures { get; set; } = new();
    public List<FeatureAdoptionData> UnderadoptedFeatures { get; set; } = new();
    public double OverallAdoptionRate { get; set; }
}

/// <summary>
/// Geographic distribution analytics
/// </summary>
public class GeographicAnalytics
{
    public int CountriesActive { get; set; }
    public List<CountryMetrics> TopCountries { get; set; } = new();
    public List<CountryMetrics> GrowthMarkets { get; set; } = new();
    public List<RegionMetrics> RegionalBreakdown { get; set; } = new();
}

/// <summary>
/// Platform health analytics
/// </summary>
public class PlatformHealthAnalytics
{
    public double SystemUptime { get; set; }
    public double AverageResponseTime { get; set; }
    public double P95ResponseTime { get; set; }
    public double P99ResponseTime { get; set; }
    
    public int TotalIncidents { get; set; }
    public int ActiveIncidents { get; set; }
    public double MeanTimeToResolution { get; set; }
    
    public bool DatabaseHealth { get; set; }
    public bool RedisHealth { get; set; }
    public bool ElasticsearchHealth { get; set; }
    
    public double CPUUtilization { get; set; }
    public double MemoryUtilization { get; set; }
    public double DiskUtilization { get; set; }
    
    public List<TrendDataPoint> UptimeTrend { get; set; } = new();
    public List<TrendDataPoint> ResponseTimeTrend { get; set; } = new();
    public List<IncidentData> RecentIncidents { get; set; } = new();
}

/// <summary>
/// Competitive analysis results
/// </summary>
public class CompetitiveAnalytics
{
    public decimal OverallWinRate { get; set; }
    public decimal AverageDealSize { get; set; }
    public List<CompetitorData> Competitors { get; set; } = new();
    public List<string> TopWinReasons { get; set; } = new();
    public List<string> TopLossReasons { get; set; } = new();
}

/// <summary>
/// Cohort analysis result
/// </summary>
public class CohortAnalysisResult
{
    public List<CohortData> Cohorts { get; set; } = new();
    public double AverageRetentionRate { get; set; }
    public decimal AverageRevenueRetention { get; set; }
    public CohortData BestPerformingCohort { get; set; } = new();
    public List<CohortInsight> Insights { get; set; } = new();
}

#region Supporting Data Classes

public class PlatformHealthSummary
{
    public double SystemUptime { get; set; }
    public double AverageResponseTime { get; set; }
    public bool DatabaseHealth { get; set; }
    public int ActiveIncidents { get; set; }
}

public class TrendDataPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class RevenueDataPoint
{
    public DateTime Date { get; set; }
    public decimal MRR { get; set; }
    public decimal ARR { get; set; }
    public decimal NewMRR { get; set; }
    public decimal ChurnedMRR { get; set; }
}

public class RevenueTierBreakdown
{
    public decimal TrialRevenue { get; set; }
    public decimal ProfessionalRevenue { get; set; }
    public decimal EnterpriseRevenue { get; set; }
    public decimal CustomRevenue { get; set; }
    public int TrialCount { get; set; }
    public int ProfessionalCount { get; set; }
    public int EnterpriseCount { get; set; }
    public int CustomCount { get; set; }
}

public class APIEndpointUsage
{
    public string Endpoint { get; set; } = string.Empty;
    public long CallCount { get; set; }
    public double AverageResponseTime { get; set; }
    public double ErrorRate { get; set; }
}

public class CustomerTierDistribution
{
    public int TrialCustomers { get; set; }
    public int ProfessionalCustomers { get; set; }
    public int EnterpriseCustomers { get; set; }
    public int CustomCustomers { get; set; }
    public decimal TrialPercentage { get; set; }
    public decimal ProfessionalPercentage { get; set; }
    public decimal EnterprisePercentage { get; set; }
    public decimal CustomPercentage { get; set; }
}

public class CustomerCohortData
{
    public string CohortMonth { get; set; } = string.Empty;
    public int OriginalSize { get; set; }
    public List<CohortPeriod> Periods { get; set; } = new();
}

public class CohortPeriod
{
    public int PeriodNumber { get; set; }
    public int RemainingCustomers { get; set; }
    public decimal RetentionRate { get; set; }
    public decimal Revenue { get; set; }
}

public class FeatureAdoptionData
{
    public string FeatureName { get; set; } = string.Empty;
    public int TotalTenants { get; set; }
    public int AdoptedTenants { get; set; }
    public decimal AdoptionRate { get; set; }
    public int ActiveUsers { get; set; }
    public double AverageUsagePerSession { get; set; }
}

public class CountryMetrics
{
    public string CountryCode { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public int TenantCount { get; set; }
    public int UserCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal GrowthRate { get; set; }
}

public class RegionMetrics
{
    public string RegionName { get; set; } = string.Empty;
    public int TenantCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal MarketShare { get; set; }
}

public class IncidentData
{
    public DateTime Timestamp { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public TimeSpan? ResolutionTime { get; set; }
    public bool IsResolved { get; set; }
}

public class CompetitorData
{
    public string CompetitorName { get; set; } = string.Empty;
    public int WonDeals { get; set; }
    public int LostDeals { get; set; }
    public decimal WinRate { get; set; }
    public decimal AverageDealSize { get; set; }
}

public class CohortData
{
    public string CohortMonth { get; set; } = string.Empty;
    public int OriginalSize { get; set; }
    public decimal RetentionRate { get; set; }
    public decimal RevenueRetention { get; set; }
    public List<CohortPeriod> RetentionByPeriod { get; set; } = new();
}

public class CohortInsight
{
    public string Insight { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Impact { get; set; }
}

#endregion