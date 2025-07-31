using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.Controllers;

/// <summary>
/// Health monitoring and operations controller
/// Provides comprehensive platform health monitoring, performance metrics, and incident management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IHealthMonitoringService _healthMonitoringService;
    private readonly IIncidentManagementService _incidentManagementService;
    private readonly IMaintenanceService _maintenanceService;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        IHealthMonitoringService healthMonitoringService,
        IIncidentManagementService incidentManagementService,
        IMaintenanceService maintenanceService,
        ILogger<HealthController> logger)
    {
        _healthMonitoringService = healthMonitoringService;
        _incidentManagementService = incidentManagementService;
        _maintenanceService = maintenanceService;
        _logger = logger;
    }

    /// <summary>
    /// Basic health check endpoint for load balancers and monitoring systems
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetHealthCheck()
    {
        try
        {
            var healthStatus = await _healthMonitoringService.GetSystemHealthAsync();
            
            var statusCode = healthStatus.OverallStatus switch
            {
                HealthStatus.Healthy => 200,
                HealthStatus.Warning => 200,
                HealthStatus.Degraded => 503,
                HealthStatus.Critical => 503,
                _ => 503
            };

            return StatusCode(statusCode, new
            {
                status = healthStatus.OverallStatus.ToString().ToLower(),
                timestamp = healthStatus.LastChecked,
                message = healthStatus.StatusMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new
            {
                status = "critical",
                timestamp = DateTime.UtcNow,
                message = "Health check system failure"
            });
        }
    }

    /// <summary>
    /// Comprehensive health status with detailed service information
    /// </summary>
    [HttpGet("detailed")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<SystemHealthStatus>> GetDetailedHealth()
    {
        try
        {
            var healthStatus = await _healthMonitoringService.GetSystemHealthAsync();
            _logger.LogInformation("Detailed health check requested, overall status: {Status}", healthStatus.OverallStatus);
            return Ok(healthStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get detailed health status");
            return StatusCode(500, new { error = "Failed to retrieve health status", details = ex.Message });
        }
    }

    /// <summary>
    /// Database connectivity and performance health check
    /// </summary>
    [HttpGet("database")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<ServiceHealthStatus>> GetDatabaseHealth()
    {
        try
        {
            var dbHealth = await _healthMonitoringService.GetServiceHealthAsync("Database");
            return Ok(dbHealth);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get database health");
            return StatusCode(500, new { error = "Failed to check database health", details = ex.Message });
        }
    }

    /// <summary>
    /// Cache service health and performance
    /// </summary>
    [HttpGet("cache")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<ServiceHealthStatus>> GetCacheHealth()
    {
        try
        {
            var cacheHealth = await _healthMonitoringService.GetServiceHealthAsync("Cache");
            return Ok(cacheHealth);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cache health");
            return StatusCode(500, new { error = "Failed to check cache health", details = ex.Message });
        }
    }

    /// <summary>
    /// Search service (Elasticsearch) health check
    /// </summary>
    [HttpGet("search")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<ServiceHealthStatus>> GetSearchHealth()
    {
        try
        {
            var searchHealth = await _healthMonitoringService.GetServiceHealthAsync("Search");
            return Ok(searchHealth);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get search health");
            return StatusCode(500, new { error = "Failed to check search health", details = ex.Message });
        }
    }

    /// <summary>
    /// External dependencies health check
    /// </summary>
    [HttpGet("dependencies")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<Dictionary<string, HealthCheckResult>>> GetDependenciesHealth()
    {
        try
        {
            var dependencies = await _healthMonitoringService.PerformHealthChecksAsync();
            return Ok(dependencies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get dependencies health");
            return StatusCode(500, new { error = "Failed to check dependencies health", details = ex.Message });
        }
    }

    /// <summary>
    /// Performance metrics for the specified time period
    /// </summary>
    [HttpGet("metrics")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<PerformanceMetrics>> GetPerformanceMetrics([FromQuery] int hours = 1)
    {
        try
        {

            if (hours <= 0 || hours > 24 * 7) // Max 1 week
            {
                return BadRequest(new { error = "Hours must be between 1 and 168 (1 week)" });
            }

            var period = TimeSpan.FromHours(hours);
            var metrics = await _healthMonitoringService.GetPerformanceMetricsAsync(period);
            
            _logger.LogInformation("Performance metrics retrieved for {Hours} hours", hours);
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get performance metrics for {Hours} hours", hours);
            return StatusCode(500, new { error = "Failed to retrieve performance metrics", details = ex.Message });
        }
    }

    /// <summary>
    /// Get all active alerts
    /// </summary>
    [HttpGet("alerts")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<List<ActiveAlert>>> GetActiveAlerts()
    {
        try
        {
            var alerts = await _healthMonitoringService.GetActiveAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get active alerts");
            return StatusCode(500, new { error = "Failed to retrieve active alerts", details = ex.Message });
        }
    }

    /// <summary>
    /// Record a health metric
    /// </summary>
    [HttpPost("metrics")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<IActionResult> RecordHealthMetric([FromBody] RecordHealthMetricRequest request)
    {
        try
        {
            var metric = new SystemHealthMetric
            {
                ServiceName = request.ServiceName,
                MetricName = request.MetricName,
                MetricValue = request.MetricValue,
                MetricUnit = request.MetricUnit,
                Status = request.Status,
                Context = request.Context,
                Tags = request.Tags,
                HostName = request.HostName ?? Environment.MachineName
            };

            await _healthMonitoringService.RecordHealthMetricAsync(metric);
            
            _logger.LogDebug("Recorded health metric: {ServiceName}.{MetricName} = {Value}", 
                request.ServiceName, request.MetricName, request.MetricValue);

            return Ok(new { message = "Health metric recorded successfully", metricId = metric.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record health metric");
            return StatusCode(500, new { error = "Failed to record health metric", details = ex.Message });
        }
    }

    /// <summary>
    /// Get historical health metrics
    /// </summary>
    [HttpGet("metrics/history")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<List<SystemHealthMetric>>> GetHealthMetricsHistory(
        [FromQuery] string? serviceName = null,
        [FromQuery] DateTime? startTime = null,
        [FromQuery] DateTime? endTime = null,
        [FromQuery] int maxRecords = 1000)
    {
        try
        {
            if (maxRecords <= 0 || maxRecords > 10000)
            {
                return BadRequest(new { error = "MaxRecords must be between 1 and 10000" });
            }

            var metrics = await _healthMonitoringService.GetHealthMetricsAsync(serviceName, startTime, endTime, maxRecords);
            
            _logger.LogInformation("Retrieved {MetricCount} health metrics for service {ServiceName}", 
                metrics.Count, serviceName ?? "All");
            
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get health metrics history");
            return StatusCode(500, new { error = "Failed to retrieve health metrics", details = ex.Message });
        }
    }

    #region Incident Management Endpoints

    /// <summary>
    /// Get all active incidents
    /// </summary>
    [HttpGet("incidents")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<List<IncidentSummary>>> GetActiveIncidents()
    {
        try
        {
            var incidents = await _incidentManagementService.GetActiveIncidentsAsync();
            return Ok(incidents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get active incidents");
            return StatusCode(500, new { error = "Failed to retrieve active incidents", details = ex.Message });
        }
    }

    /// <summary>
    /// Get incident details by ID
    /// </summary>
    [HttpGet("incidents/{incidentId}")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<IncidentReport>> GetIncident(Guid incidentId)
    {
        try
        {
            var incident = await _incidentManagementService.GetIncidentAsync(incidentId);
            if (incident == null)
            {
                return NotFound(new { error = "Incident not found" });
            }

            return Ok(incident);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get incident {IncidentId}", incidentId);
            return StatusCode(500, new { error = "Failed to retrieve incident", details = ex.Message });
        }
    }

    /// <summary>
    /// Create a new incident
    /// </summary>
    [HttpPost("incidents")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<IncidentReport>> CreateIncident([FromBody] CreateIncidentRequest request)
    {
        try
        {
            var details = new IncidentDetails
            {
                Title = request.Title,
                Description = request.Description,
                Severity = request.Severity,
                Impact = request.Impact,
                AffectedServices = request.AffectedServices,
                UsersAffected = request.UsersAffected,
                CreatedBy = GetCurrentUserId() // You'll need to implement this method
            };

            var incident = await _incidentManagementService.CreateIncidentAsync(details);
            
            _logger.LogInformation("Created incident {IncidentId}: {Title}", incident.Id, incident.Title);
            
            return CreatedAtAction(nameof(GetIncident), new { incidentId = incident.Id }, incident);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create incident");
            return StatusCode(500, new { error = "Failed to create incident", details = ex.Message });
        }
    }

    /// <summary>
    /// Update incident status
    /// </summary>
    [HttpPut("incidents/{incidentId}/status")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<IActionResult> UpdateIncidentStatus(Guid incidentId, [FromBody] UpdateIncidentStatusRequest request)
    {
        try
        {
            var success = await _incidentManagementService.UpdateIncidentStatusAsync(incidentId, request.Status);
            if (!success)
            {
                return NotFound(new { error = "Incident not found" });
            }

            return Ok(new { message = "Incident status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update incident {IncidentId} status", incidentId);
            return StatusCode(500, new { error = "Failed to update incident status", details = ex.Message });
        }
    }

    /// <summary>
    /// Add update to incident
    /// </summary>
    [HttpPost("incidents/{incidentId}/updates")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<IActionResult> AddIncidentUpdate(Guid incidentId, [FromBody] AddIncidentUpdateRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _incidentManagementService.AddIncidentUpdateAsync(
                incidentId, request.Message, userId, request.UpdateType);

            if (!success)
            {
                return NotFound(new { error = "Incident not found" });
            }

            return Ok(new { message = "Incident update added successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add update to incident {IncidentId}", incidentId);
            return StatusCode(500, new { error = "Failed to add incident update", details = ex.Message });
        }
    }

    #endregion

    #region Maintenance Management Endpoints

    /// <summary>
    /// Get scheduled maintenance windows
    /// </summary>
    [HttpGet("maintenance")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<List<MaintenanceWindow>>> GetScheduledMaintenance()
    {
        try
        {
            var maintenance = await _maintenanceService.GetScheduledMaintenanceAsync();
            return Ok(maintenance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get scheduled maintenance");
            return StatusCode(500, new { error = "Failed to retrieve scheduled maintenance", details = ex.Message });
        }
    }

    /// <summary>
    /// Schedule a new maintenance window
    /// </summary>
    [HttpPost("maintenance")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<MaintenanceWindow>> ScheduleMaintenance([FromBody] ScheduleMaintenanceRequest request)
    {
        try
        {
            var maintenanceRequest = new MaintenanceRequest
            {
                Title = request.Title,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Type = request.Type,
                AffectedServices = request.AffectedServices,
                ExpectedImpact = request.ExpectedImpact,
                NotifyUsers = request.NotifyUsers,
                CreatedBy = GetCurrentUserId()
            };

            var maintenance = await _maintenanceService.ScheduleMaintenanceAsync(maintenanceRequest);
            
            _logger.LogInformation("Scheduled maintenance {MaintenanceId}: {Title}", maintenance.Id, maintenance.Title);
            
            return CreatedAtAction(nameof(GetScheduledMaintenance), new { maintenanceId = maintenance.Id }, maintenance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to schedule maintenance");
            return StatusCode(500, new { error = "Failed to schedule maintenance", details = ex.Message });
        }
    }

    #endregion

    #region Private Helper Methods

    private Guid GetCurrentUserId()
    {
        // In a real implementation, this would extract the user ID from the JWT token
        // For now, return a placeholder admin user ID
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    #endregion
}

#region Request/Response Models

public class RecordHealthMetricRequest
{
    [Required]
    public string ServiceName { get; set; } = string.Empty;

    [Required]
    public string MetricName { get; set; } = string.Empty;

    public decimal? MetricValue { get; set; }

    public string? MetricUnit { get; set; }

    [Required]
    public HealthStatus Status { get; set; }

    public string? Context { get; set; }

    public string? Tags { get; set; }

    public string? HostName { get; set; }
}

public class CreateIncidentRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public IncidentSeverity Severity { get; set; }

    [Required]
    public IncidentImpact Impact { get; set; }

    public string[]? AffectedServices { get; set; }

    public int? UsersAffected { get; set; }
}

public class UpdateIncidentStatusRequest
{
    [Required]
    public IncidentStatus Status { get; set; }
}

public class AddIncidentUpdateRequest
{
    [Required]
    public string Message { get; set; } = string.Empty;

    public IncidentUpdateType UpdateType { get; set; } = IncidentUpdateType.Comment;
}

public class ScheduleMaintenanceRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    public MaintenanceType Type { get; set; }

    public string[]? AffectedServices { get; set; }

    public MaintenanceImpact ExpectedImpact { get; set; } = MaintenanceImpact.Low;

    public bool NotifyUsers { get; set; } = true;
}

#endregion
