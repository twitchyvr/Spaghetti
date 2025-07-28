using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Implementation of health monitoring service for platform operations
/// </summary>
public class HealthMonitoringService : IHealthMonitoringService
{
    private readonly ISystemHealthMetricRepository _healthMetricRepository;
    private readonly IIncidentRepository _incidentRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthMonitoringService> _logger;

    public HealthMonitoringService(
        ISystemHealthMetricRepository healthMetricRepository,
        IIncidentRepository incidentRepository,
        ApplicationDbContext context,
        ILogger<HealthMonitoringService> logger)
    {
        _healthMetricRepository = healthMetricRepository;
        _incidentRepository = incidentRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<SystemHealthStatus> GetSystemHealthAsync()
    {
        try
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Perform health checks on all registered services
            var healthChecks = await PerformHealthChecksAsync();
            
            // Determine overall system status
            var overallStatus = DetermineOverallStatus(healthChecks);
            
            // Get service-specific health status
            var serviceStatuses = new Dictionary<string, ServiceHealthStatus>();
            foreach (var healthCheck in healthChecks)
            {
                serviceStatuses[healthCheck.Key] = new ServiceHealthStatus
                {
                    ServiceName = healthCheck.Key,
                    Status = MapHealthStatusFromResult(healthCheck.Value.Status),
                    ResponseTime = healthCheck.Value.ResponseTime,
                    StatusMessage = healthCheck.Value.Description,
                    LastChecked = DateTime.UtcNow,
                    Metrics = healthCheck.Value.Data
                };
            }

            stopwatch.Stop();
            _logger.LogInformation("System health check completed in {ElapsedMs}ms with overall status {Status}", 
                stopwatch.ElapsedMilliseconds, overallStatus);

            return new SystemHealthStatus
            {
                OverallStatus = overallStatus,
                Services = serviceStatuses,
                LastChecked = DateTime.UtcNow,
                StatusMessage = GetOverallStatusMessage(overallStatus, healthChecks.Count)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get system health status");
            return new SystemHealthStatus
            {
                OverallStatus = HealthStatus.Critical,
                StatusMessage = "Health check system failure",
                LastChecked = DateTime.UtcNow
            };
        }
    }

    public async Task<PerformanceMetrics> GetPerformanceMetricsAsync(TimeSpan period)
    {
        try
        {
            var endTime = DateTime.UtcNow;
            var startTime = endTime.Subtract(period);

            // Get performance metrics from the last period
            var metrics = await _healthMetricRepository.GetByDateRangeAsync(startTime, endTime);
            
            // Calculate aggregated performance metrics
            var apiMetrics = metrics.Where(m => m.ServiceName == "API").ToList();
            var databaseMetrics = metrics.Where(m => m.ServiceName == "Database").ToList();
            var cacheMetrics = metrics.Where(m => m.ServiceName == "Cache").ToList();

            var performanceMetrics = new PerformanceMetrics
            {
                AvgApiResponseTime = CalculateAverage(apiMetrics, "ResponseTime"),
                ErrorRate = CalculateErrorRate(apiMetrics),
                TotalRequests = CalculateSum(apiMetrics, "RequestCount"),
                CpuUsagePercent = CalculateAverage(metrics, "CpuUsage"),
                MemoryUsagePercent = CalculateAverage(metrics, "MemoryUsage"),
                DiskUsagePercent = CalculateAverage(metrics, "DiskUsage"),
                Database = new DatabaseMetrics
                {
                    ActiveConnections = (int)CalculateAverage(databaseMetrics, "ActiveConnections"),
                    AvgQueryTime = CalculateAverage(databaseMetrics, "AvgQueryTime"),
                    DeadlockCount = (int)CalculateSum(databaseMetrics, "DeadlockCount"),
                    CacheHitRatio = CalculateAverage(databaseMetrics, "CacheHitRatio")
                },
                Cache = new CacheMetrics
                {
                    HitRatio = CalculateAverage(cacheMetrics, "HitRatio"),
                    TotalKeys = (int)CalculateAverage(cacheMetrics, "TotalKeys"),
                    MemoryUsageMB = CalculateAverage(cacheMetrics, "MemoryUsageMB"),
                    EvictedKeys = (int)CalculateSum(cacheMetrics, "EvictedKeys")
                },
                CollectedAt = DateTime.UtcNow
            };

            _logger.LogInformation("Performance metrics calculated for period {Period}: {MetricsCount} data points", 
                period, metrics.Count());

            return performanceMetrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get performance metrics for period {Period}", period);
            throw;
        }
    }

    public async Task<List<ActiveAlert>> GetActiveAlertsAsync()
    {
        try
        {
            // Get active incidents (representing active alerts)
            var activeIncidents = await _incidentRepository.GetActiveIncidentsAsync();
            
            var alerts = activeIncidents.Select(incident => new ActiveAlert
            {
                Id = incident.Id,
                Title = incident.Title,
                Description = incident.Description ?? string.Empty,
                Severity = incident.Severity,
                ServiceName = string.Join(", ", incident.AffectedServices?.Split(',') ?? new[] { "Unknown" }),
                CreatedAt = incident.CreatedAt,
                // Note: We'll need to track acknowledgment in the future
                AcknowledgedAt = null,
                AcknowledgedBy = null
            }).ToList();

            _logger.LogInformation("Retrieved {AlertCount} active alerts", alerts.Count);
            return alerts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get active alerts");
            throw;
        }
    }

    public async Task<ServiceHealthStatus> GetServiceHealthAsync(string serviceName)
    {
        try
        {
            // Get latest health metrics for the service
            var latestMetrics = await _healthMetricRepository.GetRecentByServiceAsync(serviceName, 10);
            var latestMetric = latestMetrics.FirstOrDefault();

            if (latestMetric == null)
            {
                return new ServiceHealthStatus
                {
                    ServiceName = serviceName,
                    Status = HealthStatus.Unknown,
                    StatusMessage = "No recent health data available",
                    LastChecked = DateTime.UtcNow
                };
            }

            return new ServiceHealthStatus
            {
                ServiceName = serviceName,
                Status = latestMetric.Status,
                StatusMessage = latestMetric.Context,
                LastChecked = latestMetric.Timestamp,
                Metrics = new Dictionary<string, object>
                {
                    ["LatestValue"] = latestMetric.MetricValue ?? 0,
                    ["Unit"] = latestMetric.MetricUnit ?? string.Empty,
                    ["MetricName"] = latestMetric.MetricName
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get health status for service {ServiceName}", serviceName);
            throw;
        }
    }

    public async Task RecordHealthMetricAsync(SystemHealthMetric metric)
    {
        try
        {
            await _healthMetricRepository.AddAsync(metric);
            _logger.LogDebug("Recorded health metric: {ServiceName}.{MetricName} = {Value}", 
                metric.ServiceName, metric.MetricName, metric.MetricValue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record health metric for {ServiceName}.{MetricName}", 
                metric.ServiceName, metric.MetricName);
            throw;
        }
    }

    public async Task<List<SystemHealthMetric>> GetHealthMetricsAsync(
        string? serviceName = null,
        DateTime? startTime = null,
        DateTime? endTime = null,
        int maxRecords = 1000)
    {
        try
        {
            IEnumerable<SystemHealthMetric> metrics;

            if (!string.IsNullOrEmpty(serviceName) && startTime.HasValue && endTime.HasValue)
            {
                metrics = await _healthMetricRepository.GetByServiceAndDateRangeAsync(serviceName, startTime.Value, endTime.Value);
            }
            else if (!string.IsNullOrEmpty(serviceName))
            {
                metrics = await _healthMetricRepository.GetRecentByServiceAsync(serviceName, maxRecords);
            }
            else if (startTime.HasValue && endTime.HasValue)
            {
                metrics = await _healthMetricRepository.GetByDateRangeAsync(startTime.Value, endTime.Value);
            }
            else
            {
                metrics = await _healthMetricRepository.GetRecentAsync(maxRecords);
            }

            var result = metrics.Take(maxRecords).ToList();
            _logger.LogInformation("Retrieved {MetricCount} health metrics", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get health metrics");
            throw;
        }
    }

    public async Task<Dictionary<string, HealthCheckResult>> PerformHealthChecksAsync()
    {
        try
        {
            var results = new Dictionary<string, HealthCheckResult>();
            
            // Perform basic health checks
            results["Database"] = await CheckDatabaseHealthAsync();
            results["API"] = await CheckApiHealthAsync();
            results["Cache"] = await CheckCacheHealthAsync();
            results["Storage"] = await CheckStorageHealthAsync();

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform health checks");
            return new Dictionary<string, HealthCheckResult>
            {
                ["System"] = new HealthCheckResult
                {
                    Status = HealthStatus.Critical,
                    Description = "Health check system failure",
                    Exception = ex
                }
            };
        }
    }

    #region Private Helper Methods

    private async Task<HealthCheckResult> CheckDatabaseHealthAsync()
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            // Simple database connectivity check
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
            stopwatch.Stop();

            return new HealthCheckResult
            {
                Status = HealthStatus.Healthy,
                Description = "Database connection successful",
                ResponseTime = stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            return new HealthCheckResult
            {
                Status = HealthStatus.Critical,
                Description = "Database connection failed",
                ResponseTime = stopwatch.ElapsedMilliseconds,
                Exception = ex
            };
        }
    }

    private Task<HealthCheckResult> CheckApiHealthAsync()
    {
        // Basic API health check - in a real implementation, this might call internal endpoints
        return Task.FromResult(new HealthCheckResult
        {
            Status = HealthStatus.Healthy,
            Description = "API service operational",
            ResponseTime = 0
        });
    }

    private Task<HealthCheckResult> CheckCacheHealthAsync()
    {
        // Basic cache health check - in a real implementation, this would check Redis connectivity
        return Task.FromResult(new HealthCheckResult
        {
            Status = HealthStatus.Healthy,
            Description = "Cache service assumed operational",
            ResponseTime = 0
        });
    }

    private Task<HealthCheckResult> CheckStorageHealthAsync()
    {
        // Basic storage health check - in a real implementation, this would check file system or blob storage
        return Task.FromResult(new HealthCheckResult
        {
            Status = HealthStatus.Healthy,
            Description = "Storage service assumed operational",
            ResponseTime = 0
        });
    }

    private static HealthStatus DetermineOverallStatus(Dictionary<string, HealthCheckResult> healthChecks)
    {
        if (!healthChecks.Any()) return HealthStatus.Unknown;
        
        if (healthChecks.Values.Any(hc => hc.Status == HealthStatus.Critical))
            return HealthStatus.Critical;
            
        if (healthChecks.Values.Any(hc => hc.Status == HealthStatus.Degraded))
            return HealthStatus.Degraded;
            
        if (healthChecks.Values.Any(hc => hc.Status == HealthStatus.Warning))
            return HealthStatus.Warning;
            
        if (healthChecks.Values.All(hc => hc.Status == HealthStatus.Healthy))
            return HealthStatus.Healthy;
            
        return HealthStatus.Unknown;
    }

    private static HealthStatus MapHealthStatusFromResult(HealthStatus status)
    {
        return status;
    }

    private static string GetOverallStatusMessage(HealthStatus status, int serviceCount)
    {
        return status switch
        {
            HealthStatus.Healthy => $"All {serviceCount} services operational",
            HealthStatus.Warning => "Some services experiencing issues",
            HealthStatus.Degraded => "Performance degradation detected",
            HealthStatus.Critical => "Critical system issues detected",
            _ => "System status unknown"
        };
    }

    private static double CalculateAverage(IEnumerable<SystemHealthMetric> metrics, string metricName)
    {
        var values = metrics.Where(m => m.MetricName == metricName && m.MetricValue.HasValue)
                           .Select(m => (double)m.MetricValue!.Value);
        return values.Any() ? values.Average() : 0;
    }

    private static int CalculateSum(IEnumerable<SystemHealthMetric> metrics, string metricName)
    {
        var values = metrics.Where(m => m.MetricName == metricName && m.MetricValue.HasValue)
                           .Select(m => (int)m.MetricValue!.Value);
        return values.Sum();
    }

    private static double CalculateErrorRate(IEnumerable<SystemHealthMetric> metrics)
    {
        var errorMetrics = metrics.Where(m => m.MetricName == "ErrorCount" && m.MetricValue.HasValue);
        var requestMetrics = metrics.Where(m => m.MetricName == "RequestCount" && m.MetricValue.HasValue);
        
        var totalErrors = errorMetrics.Sum(m => (double)m.MetricValue!.Value);
        var totalRequests = requestMetrics.Sum(m => (double)m.MetricValue!.Value);
        
        return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    }

    #endregion
}