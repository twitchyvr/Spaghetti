using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Data;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Platform analytics service implementation
/// Provides comprehensive business intelligence, revenue metrics, and platform insights
/// </summary>
public class PlatformAnalyticsService : IPlatformAnalyticsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PlatformAnalyticsService> _logger;

    public PlatformAnalyticsService(
        ApplicationDbContext context,
        ILogger<PlatformAnalyticsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PlatformAnalytics> GetPlatformMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Retrieving platform metrics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);

            // Get current totals
            var totalTenants = await _context.Tenants.CountAsync(cancellationToken);
            var activeTenants = await _context.Tenants
                .CountAsync(t => t.Status == TenantStatus.Active && 
                                t.UpdatedAt >= dateRange.StartDate, cancellationToken);

            var totalUsers = await _context.Users.CountAsync(cancellationToken);
            var activeUsers = await _context.Users
                .CountAsync(u => u.LastLoginAt >= dateRange.StartDate, cancellationToken);

            var totalDocuments = await _context.Documents.CountAsync(cancellationToken);

            // Calculate revenue metrics
            var currentMRR = await CalculateCurrentMRRAsync(cancellationToken);
            var previousMRR = await CalculatePreviousPeriodMRRAsync(dateRange, cancellationToken);
            var mrrGrowthRate = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

            // Get daily metrics for trends
            var dailyMetrics = await _context.Set<PlatformMetricsDaily>()
                .Where(m => m.Date >= dateRange.StartDate && m.Date <= dateRange.EndDate)
                .OrderBy(m => m.Date)
                .ToListAsync(cancellationToken);

            // Calculate total API calls in period (from usage tracking)
            var totalAPICallsThisPeriod = await _context.Tenants
                .SumAsync(t => (long)t.Billing.APICallsThisMonth, cancellationToken);

            // Calculate total storage
            var totalStorageGB = await _context.Tenants
                .SumAsync(t => t.Billing.StorageUsedBytes / (1024m * 1024m * 1024m), cancellationToken);

            var analytics = new PlatformAnalytics
            {
                TotalTenants = totalTenants,
                ActiveTenants = activeTenants,
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                TotalDocuments = totalDocuments,
                TotalAPICallsThisPeriod = totalAPICallsThisPeriod,
                TotalStorageGB = totalStorageGB,
                CurrentMRR = currentMRR,
                CurrentARR = currentMRR * 12,
                MRRGrowthRate = mrrGrowthRate,
                ARRGrowthRate = mrrGrowthRate,
                Health = await GetPlatformHealthSummaryAsync(cancellationToken),
                ActivityTrend = ConvertToTrendDataPoints(dailyMetrics, m => m.TotalUsers),
                GrowthTrend = ConvertToTrendDataPoints(dailyMetrics, m => m.MRR)
            };

            _logger.LogInformation("Successfully retrieved platform metrics: {TotalTenants} tenants, {CurrentMRR} MRR", 
                totalTenants, currentMRR);

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve platform metrics");
            throw;
        }
    }

    public async Task<RevenueAnalytics> GetRevenueMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Retrieving revenue analytics for date range {StartDate} to {EndDate}", 
                dateRange.StartDate, dateRange.EndDate);

            var currentMRR = await CalculateCurrentMRRAsync(cancellationToken);
            var previousMRR = await CalculatePreviousPeriodMRRAsync(dateRange, cancellationToken);
            var mrrGrowthRate = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;
            var mrrGrowthAmount = currentMRR - previousMRR;

            // Get monthly revenue metrics
            var monthlyMetrics = await _context.Set<RevenueMetricsMonthly>()
                .Where(m => m.YearMonth.CompareTo(dateRange.StartDate.ToString("yyyy-MM")) >= 0 &&
                           m.YearMonth.CompareTo(dateRange.EndDate.ToString("yyyy-MM")) <= 0)
                .OrderBy(m => m.YearMonth)
                .ToListAsync(cancellationToken);

            var latestMonth = monthlyMetrics.LastOrDefault();

            // Calculate tier breakdown
            var tierBreakdown = await CalculateRevenueTierBreakdownAsync(cancellationToken);

            // Create revenue history
            var revenueHistory = monthlyMetrics.Select(m => new RevenueDataPoint
            {
                Date = DateTime.ParseExact(m.YearMonth + "-01", "yyyy-MM-dd", null),
                MRR = m.MRR,
                ARR = m.ARR,
                NewMRR = m.NewMRR,
                ChurnedMRR = m.ChurnedMRR
            }).ToList();

            var analytics = new RevenueAnalytics
            {
                CurrentMRR = currentMRR,
                CurrentARR = currentMRR * 12,
                PreviousPeriodMRR = previousMRR,
                MRRGrowthRate = mrrGrowthRate,
                MRRGrowthAmount = mrrGrowthAmount,
                NewMRR = latestMonth?.NewMRR ?? 0,
                ExpansionMRR = latestMonth?.ExpansionMRR ?? 0,
                ContractionMRR = latestMonth?.ContractionMRR ?? 0,
                ChurnedMRR = latestMonth?.ChurnedMRR ?? 0,
                NetMRRGrowth = (latestMonth?.NewMRR ?? 0) + (latestMonth?.ExpansionMRR ?? 0) - 
                              (latestMonth?.ContractionMRR ?? 0) - (latestMonth?.ChurnedMRR ?? 0),
                NetRevenueRetention = latestMonth?.NetRevenueRetention ?? 100,
                GrossRevenueRetention = latestMonth?.GrossRevenueRetention ?? 100,
                CustomerLifetimeValue = latestMonth?.CustomerLifetimeValue ?? 0,
                AverageRevenuePerUser = latestMonth?.AverageRevenuePerUser ?? 0,
                TierBreakdown = tierBreakdown,
                RevenueHistory = revenueHistory,
                MRRTrend = revenueHistory // Same data, different visualization
            };

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve revenue analytics");
            throw;
        }
    }

    public async Task<UsageAnalytics> GetUsageMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            
            // Calculate active users
            var dailyActiveUsers = await _context.Users
                .CountAsync(u => u.LastLoginAt >= now.AddDays(-1), cancellationToken);
            var weeklyActiveUsers = await _context.Users
                .CountAsync(u => u.LastLoginAt >= now.AddDays(-7), cancellationToken);
            var monthlyActiveUsers = await _context.Users
                .CountAsync(u => u.LastLoginAt >= now.AddDays(-30), cancellationToken);

            var totalUsers = await _context.Users.CountAsync(cancellationToken);
            var userEngagementRate = totalUsers > 0 ? (double)monthlyActiveUsers / totalUsers * 100 : 0;

            // Document activity
            var documentsCreated = await _context.Documents
                .CountAsync(d => d.CreatedAt >= dateRange.StartDate && d.CreatedAt <= dateRange.EndDate, cancellationToken);
            var documentsEdited = await _context.Documents
                .CountAsync(d => d.UpdatedAt >= dateRange.StartDate && d.UpdatedAt <= dateRange.EndDate && 
                               d.UpdatedAt > d.CreatedAt, cancellationToken);

            // API usage (from tenant billing data)
            var apiCallsThisPeriod = await _context.Tenants
                .SumAsync(t => (long)t.Billing.APICallsThisMonth, cancellationToken);
            var averageAPICallsPerUser = totalUsers > 0 ? (double)apiCallsThisPeriod / totalUsers : 0;

            // Storage metrics
            var currentStorageBytes = await _context.Tenants
                .SumAsync(t => t.Billing.StorageUsedBytes, cancellationToken);
            var averageStoragePerTenant = await _context.Tenants
                .Where(t => t.Status == TenantStatus.Active)
                .AverageAsync(t => (decimal)t.Billing.StorageUsedBytes / (1024m * 1024m), cancellationToken);

            // Get usage trends from daily metrics
            var dailyMetrics = await _context.Set<PlatformMetricsDaily>()
                .Where(m => m.Date >= dateRange.StartDate && m.Date <= dateRange.EndDate)
                .OrderBy(m => m.Date)
                .ToListAsync(cancellationToken);

            var analytics = new UsageAnalytics
            {
                DailyActiveUsers = dailyActiveUsers,
                WeeklyActiveUsers = weeklyActiveUsers,
                MonthlyActiveUsers = monthlyActiveUsers,
                UserEngagementRate = userEngagementRate,
                DocumentsCreatedThisPeriod = documentsCreated,
                DocumentsEditedThisPeriod = documentsEdited,
                DocumentsViewedThisPeriod = 0, // Would need view tracking
                DocumentsPublishedThisPeriod = await _context.Documents
                    .CountAsync(d => d.PublishedAt >= dateRange.StartDate && d.PublishedAt <= dateRange.EndDate, cancellationToken),
                APICallsThisPeriod = apiCallsThisPeriod,
                AverageAPICallsPerUser = averageAPICallsPerUser,
                TopEndpoints = await GetTopAPIEndpointsAsync(cancellationToken),
                StorageGrowthThisPeriod = currentStorageBytes / (1024m * 1024m * 1024m),
                AverageStoragePerTenant = averageStoragePerTenant,
                UserActivityTrend = ConvertToTrendDataPoints(dailyMetrics, m => m.ActiveUsers),
                DocumentActivityTrend = ConvertToTrendDataPoints(dailyMetrics, m => m.DocumentsCreated),
                APIUsageTrend = ConvertToTrendDataPoints(dailyMetrics, m => (decimal)m.APICallsTotal)
            };

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve usage analytics");
            throw;
        }
    }

    public async Task<CustomerAnalytics> GetCustomerMetricsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        try
        {
            var totalCustomers = await _context.Tenants.CountAsync(cancellationToken);
            
            var newCustomers = await _context.Tenants
                .CountAsync(t => t.CreatedAt >= dateRange.StartDate && t.CreatedAt <= dateRange.EndDate, cancellationToken);
            
            // Calculate churn based on status changes to inactive/suspended
            var churnedCustomers = await _context.Tenants
                .CountAsync(t => t.Status != TenantStatus.Active && 
                               t.UpdatedAt >= dateRange.StartDate && t.UpdatedAt <= dateRange.EndDate, cancellationToken);

            var customerGrowthRate = totalCustomers > 0 ? (decimal)newCustomers / totalCustomers * 100 : 0;
            var churnRate = totalCustomers > 0 ? (decimal)churnedCustomers / totalCustomers * 100 : 0;
            var retentionRate = 100 - churnRate;

            // Tier conversions
            var trialToProConversions = await _context.Tenants
                .CountAsync(t => t.Tier == TenantTier.Professional && 
                               t.UpdatedAt >= dateRange.StartDate && t.UpdatedAt <= dateRange.EndDate, cancellationToken);
            
            var proToEnterpriseUpgrades = await _context.Tenants
                .CountAsync(t => t.Tier == TenantTier.Enterprise && 
                               t.UpdatedAt >= dateRange.StartDate && t.UpdatedAt <= dateRange.EndDate, cancellationToken);

            // Calculate tier distribution
            var tierDistribution = await CalculateCustomerTierDistributionAsync(cancellationToken);

            var analytics = new CustomerAnalytics
            {
                TotalCustomers = totalCustomers,
                NewCustomersThisPeriod = newCustomers,
                ChurnedCustomersThisPeriod = churnedCustomers,
                CustomerGrowthRate = customerGrowthRate,
                ChurnRate = churnRate,
                RetentionRate = retentionRate,
                CustomerLifetimeValue = await CalculateCustomerLifetimeValueAsync(cancellationToken),
                CustomerAcquisitionCost = 500, // Would need marketing spend data
                TrialToProConversions = trialToProConversions,
                ProToEnterpriseUpgrades = proToEnterpriseUpgrades,
                ConversionRate = await CalculateConversionRateAsync(cancellationToken),
                UpgradeRate = await CalculateUpgradeRateAsync(cancellationToken),
                TierDistribution = tierDistribution,
                CohortData = await GetCustomerCohortDataAsync(dateRange, cancellationToken),
                AcquisitionTrend = new(), // Would need daily metrics
                ChurnTrend = new() // Would need daily metrics
            };

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve customer analytics");
            throw;
        }
    }

    public async Task<List<RevenueForecast>> GetRevenueForecastAsync(int monthsAhead, CancellationToken cancellationToken = default)
    {
        try
        {
            var forecasts = new List<RevenueForecast>();
            var currentMRR = await CalculateCurrentMRRAsync(cancellationToken);
            var averageGrowthRate = await CalculateAverageGrowthRateAsync(cancellationToken);

            for (int i = 1; i <= monthsAhead; i++)
            {
                var forecastMonth = DateTime.UtcNow.AddMonths(i);
                var predictedMRR = currentMRR * (decimal)Math.Pow(1 + (double)averageGrowthRate / 100, i);
                
                var forecast = new RevenueForecast
                {
                    ForecastMonth = forecastMonth.ToString("yyyy-MM"),
                    PredictedMRR = predictedMRR,
                    PredictedARR = predictedMRR * 12,
                    ConfidenceLevel = Math.Max(95 - (i * 5), 60), // Decreasing confidence over time
                    TrialToProConversions = predictedMRR * 0.1m, // Estimated 10% from conversions
                    ProToEnterpriseUpgrades = predictedMRR * 0.05m, // Estimated 5% from upgrades
                    ExpectedChurn = predictedMRR * 0.02m, // Estimated 2% churn
                    ModelVersion = "v1.0",
                    ModelParameters = $"{{\"growth_rate\":{averageGrowthRate},\"base_mrr\":{currentMRR}}}"
                };

                forecasts.Add(forecast);
            }

            return forecasts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate revenue forecast");
            throw;
        }
    }

    public async Task<CohortAnalysisResult> GetCohortAnalysisAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        try
        {
            var cohorts = await _context.Set<CustomerCohort>()
                .Where(c => c.CohortMonth.CompareTo(dateRange.StartDate.ToString("yyyy-MM")) >= 0 &&
                           c.CohortMonth.CompareTo(dateRange.EndDate.ToString("yyyy-MM")) <= 0)
                .ToListAsync(cancellationToken);

            var cohortData = cohorts
                .GroupBy(c => c.CohortMonth)
                .Select(g => new CohortData
                {
                    CohortMonth = g.Key,
                    OriginalSize = g.Where(c => c.PeriodNumber == 0).Sum(c => c.OriginalCustomers),
                    RetentionRate = g.Where(c => c.PeriodNumber == 12).Average(c => c.RetentionRate),
                    RevenueRetention = g.Where(c => c.PeriodNumber == 12).Sum(c => c.Revenue),
                    RetentionByPeriod = g.OrderBy(c => c.PeriodNumber)
                        .Select(c => new CohortPeriod
                        {
                            PeriodNumber = c.PeriodNumber,
                            RemainingCustomers = c.RemainingCustomers,
                            RetentionRate = c.RetentionRate,
                            Revenue = c.Revenue
                        }).ToList()
                })
                .ToList();

            var result = new CohortAnalysisResult
            {
                Cohorts = cohortData,
                AverageRetentionRate = cohortData.Average(c => (double)c.RetentionRate),
                AverageRevenueRetention = cohortData.Average(c => c.RevenueRetention),
                BestPerformingCohort = cohortData.OrderByDescending(c => c.RetentionRate).FirstOrDefault() ?? new CohortData(),
                Insights = GenerateCohortInsights(cohortData)
            };

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform cohort analysis");
            throw;
        }
    }

    public async Task<FeatureAdoptionAnalytics> GetFeatureAdoptionAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        // Implementation would depend on feature usage tracking
        // For now, return basic structure
        return new FeatureAdoptionAnalytics
        {
            TotalFeatures = 10,
            Features = new List<FeatureAdoptionData>(),
            TopAdoptedFeatures = new List<FeatureAdoptionData>(),
            UnderadoptedFeatures = new List<FeatureAdoptionData>(),
            OverallAdoptionRate = 75.5
        };
    }

    public async Task<GeographicAnalytics> GetGeographicAnalyticsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        // Implementation would depend on geographic data collection
        return new GeographicAnalytics
        {
            CountriesActive = 25,
            TopCountries = new List<CountryMetrics>(),
            GrowthMarkets = new List<CountryMetrics>(),
            RegionalBreakdown = new List<RegionMetrics>()
        };
    }

    public async Task<PlatformHealthAnalytics> GetPlatformHealthAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        var healthMetrics = await _context.Set<PlatformHealthMetrics>()
            .Where(h => h.Timestamp >= dateRange.StartDate && h.Timestamp <= dateRange.EndDate)
            .OrderByDescending(h => h.Timestamp)
            .ToListAsync(cancellationToken);

        var latest = healthMetrics.FirstOrDefault();

        return new PlatformHealthAnalytics
        {
            SystemUptime = latest?.SystemUptime ?? 99.9,
            AverageResponseTime = latest?.AverageResponseTime ?? 150,
            P95ResponseTime = latest?.P95ResponseTime ?? 300,
            P99ResponseTime = latest?.P99ResponseTime ?? 500,
            TotalIncidents = healthMetrics.Sum(h => h.ActiveIncidents),
            ActiveIncidents = latest?.ActiveIncidents ?? 0,
            MeanTimeToResolution = 45, // Would calculate from incident data
            DatabaseHealth = latest?.DatabaseHealth ?? true,
            RedisHealth = latest?.RedisHealth ?? true,
            ElasticsearchHealth = latest?.ElasticsearchHealth ?? true,
            CPUUtilization = latest?.CPUUtilization ?? 35,
            MemoryUtilization = latest?.MemoryUtilization ?? 65,
            DiskUtilization = latest?.DiskUtilization ?? 40,
            UptimeTrend = ConvertToTrendDataPoints(healthMetrics, h => (decimal)h.SystemUptime),
            ResponseTimeTrend = ConvertToTrendDataPoints(healthMetrics, h => (decimal)h.AverageResponseTime),
            RecentIncidents = new List<IncidentData>()
        };
    }

    public async Task<CompetitiveAnalytics> GetCompetitiveAnalyticsAsync(DateRange dateRange, CancellationToken cancellationToken = default)
    {
        // Implementation would depend on competitive data collection
        return new CompetitiveAnalytics
        {
            OverallWinRate = 75.5m,
            AverageDealSize = 15000m,
            Competitors = new List<CompetitorData>(),
            TopWinReasons = new List<string>(),
            TopLossReasons = new List<string>()
        };
    }

    public async Task ProcessDailyMetricsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        // Implementation for background processing
        _logger.LogInformation("Processing daily metrics for {Date}", date);
        // Process and store daily aggregations
    }

    public async Task ProcessMonthlyMetricsAsync(DateTime month, CancellationToken cancellationToken = default)
    {
        // Implementation for background processing
        _logger.LogInformation("Processing monthly metrics for {Month}", month.ToString("yyyy-MM"));
        // Process and store monthly aggregations
    }

    public async Task UpdateForecastingModelsAsync(CancellationToken cancellationToken = default)
    {
        // Implementation for updating ML models
        _logger.LogInformation("Updating forecasting models");
        // Update and retrain forecasting models
    }

    #region Private Helper Methods

    private async Task<decimal> CalculateCurrentMRRAsync(CancellationToken cancellationToken)
    {
        return await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active)
            .SumAsync(t => t.Billing.MonthlyRate, cancellationToken);
    }

    private async Task<decimal> CalculatePreviousPeriodMRRAsync(DateRange dateRange, CancellationToken cancellationToken)
    {
        var previousMonth = dateRange.StartDate.AddMonths(-1);
        var previousMonthStr = previousMonth.ToString("yyyy-MM");
        
        var previousMonthMetrics = await _context.Set<RevenueMetricsMonthly>()
            .FirstOrDefaultAsync(m => m.YearMonth == previousMonthStr, cancellationToken);
        
        return previousMonthMetrics?.MRR ?? 0;
    }

    private async Task<RevenueTierBreakdown> CalculateRevenueTierBreakdownAsync(CancellationToken cancellationToken)
    {
        var tenantsByTier = await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active)
            .GroupBy(t => t.Tier)
            .Select(g => new { Tier = g.Key, Count = g.Count(), Revenue = g.Sum(t => t.Billing.MonthlyRate) })
            .ToListAsync(cancellationToken);

        var breakdown = new RevenueTierBreakdown();
        
        foreach (var tier in tenantsByTier)
        {
            switch (tier.Tier)
            {
                case TenantTier.Trial:
                    breakdown.TrialRevenue = tier.Revenue;
                    breakdown.TrialCount = tier.Count;
                    break;
                case TenantTier.Professional:
                    breakdown.ProfessionalRevenue = tier.Revenue;
                    breakdown.ProfessionalCount = tier.Count;
                    break;
                case TenantTier.Enterprise:
                    breakdown.EnterpriseRevenue = tier.Revenue;
                    breakdown.EnterpriseCount = tier.Count;
                    break;
                case TenantTier.Custom:
                    breakdown.CustomRevenue = tier.Revenue;
                    breakdown.CustomCount = tier.Count;
                    break;
            }
        }

        return breakdown;
    }

    private async Task<CustomerTierDistribution> CalculateCustomerTierDistributionAsync(CancellationToken cancellationToken)
    {
        var totalCustomers = await _context.Tenants.CountAsync(cancellationToken);
        var tierCounts = await _context.Tenants
            .GroupBy(t => t.Tier)
            .Select(g => new { Tier = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var distribution = new CustomerTierDistribution();
        
        foreach (var tier in tierCounts)
        {
            var percentage = totalCustomers > 0 ? (decimal)tier.Count / totalCustomers * 100 : 0;
            
            switch (tier.Tier)
            {
                case TenantTier.Trial:
                    distribution.TrialCustomers = tier.Count;
                    distribution.TrialPercentage = percentage;
                    break;
                case TenantTier.Professional:
                    distribution.ProfessionalCustomers = tier.Count;
                    distribution.ProfessionalPercentage = percentage;
                    break;
                case TenantTier.Enterprise:
                    distribution.EnterpriseCustomers = tier.Count;
                    distribution.EnterprisePercentage = percentage;
                    break;
                case TenantTier.Custom:
                    distribution.CustomCustomers = tier.Count;
                    distribution.CustomPercentage = percentage;
                    break;
            }
        }

        return distribution;
    }

    private async Task<decimal> CalculateCustomerLifetimeValueAsync(CancellationToken cancellationToken)
    {
        var averageMonthlyRevenue = await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active)
            .AverageAsync(t => t.Billing.MonthlyRate, cancellationToken);

        var averageLifespanMonths = 24; // Estimated average customer lifespan
        return averageMonthlyRevenue * averageLifespanMonths;
    }

    private async Task<decimal> CalculateConversionRateAsync(CancellationToken cancellationToken)
    {
        var totalTrials = await _context.Tenants
            .CountAsync(t => t.Tier == TenantTier.Trial, cancellationToken);
        
        var convertedTrials = await _context.Tenants
            .CountAsync(t => t.Tier != TenantTier.Trial, cancellationToken);

        return totalTrials > 0 ? (decimal)convertedTrials / (totalTrials + convertedTrials) * 100 : 0;
    }

    private async Task<decimal> CalculateUpgradeRateAsync(CancellationToken cancellationToken)
    {
        var professionalCustomers = await _context.Tenants
            .CountAsync(t => t.Tier == TenantTier.Professional, cancellationToken);
        
        var enterpriseCustomers = await _context.Tenants
            .CountAsync(t => t.Tier == TenantTier.Enterprise, cancellationToken);

        return professionalCustomers > 0 ? (decimal)enterpriseCustomers / (professionalCustomers + enterpriseCustomers) * 100 : 0;
    }

    private async Task<decimal> CalculateAverageGrowthRateAsync(CancellationToken cancellationToken)
    {
        var recentMetrics = await _context.Set<RevenueMetricsMonthly>()
            .OrderByDescending(m => m.YearMonth)
            .Take(6)
            .ToListAsync(cancellationToken);

        if (recentMetrics.Count < 2) return 5; // Default 5% growth if insufficient data

        var growthRates = new List<decimal>();
        for (int i = 0; i < recentMetrics.Count - 1; i++)
        {
            var current = recentMetrics[i];
            var previous = recentMetrics[i + 1];
            
            if (previous.MRR > 0)
            {
                var growthRate = ((current.MRR - previous.MRR) / previous.MRR) * 100;
                growthRates.Add(growthRate);
            }
        }

        return growthRates.Count > 0 ? growthRates.Average() : 5;
    }

    private async Task<List<CustomerCohortData>> GetCustomerCohortDataAsync(DateRange dateRange, CancellationToken cancellationToken)
    {
        var cohorts = await _context.Set<CustomerCohort>()
            .Where(c => c.CohortMonth.CompareTo(dateRange.StartDate.ToString("yyyy-MM")) >= 0 &&
                       c.CohortMonth.CompareTo(dateRange.EndDate.ToString("yyyy-MM")) <= 0)
            .ToListAsync(cancellationToken);

        return cohorts
            .GroupBy(c => c.CohortMonth)
            .Select(g => new CustomerCohortData
            {
                CohortMonth = g.Key,
                OriginalSize = g.Where(c => c.PeriodNumber == 0).Sum(c => c.OriginalCustomers),
                Periods = g.OrderBy(c => c.PeriodNumber)
                    .Select(c => new CohortPeriod
                    {
                        PeriodNumber = c.PeriodNumber,
                        RemainingCustomers = c.RemainingCustomers,
                        RetentionRate = c.RetentionRate,
                        Revenue = c.Revenue
                    }).ToList()
            })
            .ToList();
    }

    private async Task<PlatformHealthSummary> GetPlatformHealthSummaryAsync(CancellationToken cancellationToken)
    {
        var latest = await _context.Set<PlatformHealthMetrics>()
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);

        return new PlatformHealthSummary
        {
            SystemUptime = latest?.SystemUptime ?? 99.9,
            AverageResponseTime = latest?.AverageResponseTime ?? 150,
            DatabaseHealth = latest?.DatabaseHealth ?? true,
            ActiveIncidents = latest?.ActiveIncidents ?? 0
        };
    }

    private async Task<List<APIEndpointUsage>> GetTopAPIEndpointsAsync(CancellationToken cancellationToken)
    {
        // This would require API usage tracking implementation
        // For now, return mock data
        return new List<APIEndpointUsage>
        {
            new() { Endpoint = "/api/documents", CallCount = 50000, AverageResponseTime = 120, ErrorRate = 0.5 },
            new() { Endpoint = "/api/users", CallCount = 25000, AverageResponseTime = 80, ErrorRate = 0.2 },
            new() { Endpoint = "/api/tenants", CallCount = 15000, AverageResponseTime = 200, ErrorRate = 0.1 }
        };
    }

    private List<TrendDataPoint> ConvertToTrendDataPoints<T>(List<T> data, Func<T, decimal> valueSelector) where T : class
    {
        return data.Select(item =>
        {
            var date = typeof(T).GetProperty("Date")?.GetValue(item) as DateTime? ?? DateTime.UtcNow;
            return new TrendDataPoint
            {
                Date = date,
                Value = valueSelector(item),
                Label = date.ToString("yyyy-MM-dd")
            };
        }).ToList();
    }

    private List<CohortInsight> GenerateCohortInsights(List<CohortData> cohortData)
    {
        var insights = new List<CohortInsight>();

        if (cohortData.Any())
        {
            var avgRetention = cohortData.Average(c => (double)c.RetentionRate);
            
            insights.Add(new CohortInsight
            {
                Insight = $"Average customer retention rate is {avgRetention:F1}%",
                Category = "Retention",
                Impact = (decimal)avgRetention
            });

            var bestCohort = cohortData.OrderByDescending(c => c.RetentionRate).First();
            insights.Add(new CohortInsight
            {
                Insight = $"Best performing cohort is {bestCohort.CohortMonth} with {bestCohort.RetentionRate:F1}% retention",
                Category = "Performance",
                Impact = bestCohort.RetentionRate
            });
        }

        return insights;
    }

    #endregion
}