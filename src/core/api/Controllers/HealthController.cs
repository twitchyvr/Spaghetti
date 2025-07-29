using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Allow anonymous access for health checks
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        ApplicationDbContext context,
        ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Health check endpoint for Docker container monitoring and load balancers
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            // Basic health check - verify database connectivity
            var canConnect = _context.Database.CanConnect();
            if (canConnect)
            {
                return Ok(new { 
                    status = "healthy", 
                    timestamp = DateTime.UtcNow, 
                    database = "connected",
                    service = "enterprise-docs-api"
                });
            }
            else
            {
                return StatusCode(503, new { 
                    status = "unhealthy", 
                    timestamp = DateTime.UtcNow, 
                    database = "disconnected",
                    service = "enterprise-docs-api"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new { 
                status = "unhealthy", 
                timestamp = DateTime.UtcNow, 
                error = ex.Message,
                service = "enterprise-docs-api"
            });
        }
    }

    /// <summary>
    /// Detailed health check with component status
    /// </summary>
    [HttpGet("detailed")]
    public IActionResult GetDetailed()
    {
        try
        {
            var databaseHealth = CheckDatabaseHealth();
            var memoryHealth = CheckMemoryHealth();
            var uptimeHealth = GetUptime();
            
            var healthStatus = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "enterprise-docs-api",
                version = "1.0.0",
                components = new
                {
                    database = databaseHealth,
                    memory = memoryHealth,
                    uptime = uptimeHealth
                }
            };

            var overallHealthy = (bool)((dynamic)databaseHealth).healthy;
            
            if (overallHealthy)
            {
                return Ok(healthStatus);
            }
            else
            {
                return StatusCode(503, healthStatus);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Detailed health check failed");
            return StatusCode(503, new { 
                status = "unhealthy", 
                timestamp = DateTime.UtcNow, 
                error = ex.Message,
                service = "enterprise-docs-api"
            });
        }
    }

    private object CheckDatabaseHealth()
    {
        try
        {
            var canConnect = _context.Database.CanConnect();
            var connectionTime = DateTime.UtcNow;
            
            // Quick query to test actual functionality
            var start = DateTime.UtcNow;
            var roleCount = _context.Set<EnterpriseDocsCore.Domain.Entities.User>().Count();
            var queryTime = (DateTime.UtcNow - start).TotalMilliseconds;

            return new
            {
                healthy = canConnect,
                connectionTime = connectionTime,
                queryTimeMs = queryTime,
                status = canConnect ? "connected" : "disconnected"
            };
        }
        catch (Exception ex)
        {
            return new
            {
                healthy = false,
                error = ex.Message,
                status = "error"
            };
        }
    }

    private object CheckMemoryHealth()
    {
        try
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            var workingSetMB = process.WorkingSet64 / 1024 / 1024;
            
            return new
            {
                healthy = workingSetMB < 1024, // Flag if over 1GB
                workingSetMB = workingSetMB,
                status = workingSetMB < 1024 ? "normal" : "high"
            };
        }
        catch (Exception ex)
        {
            return new
            {
                healthy = true, // Don't fail health check for memory monitoring issues
                error = ex.Message,
                status = "unknown"
            };
        }
    }

    private object GetUptime()
    {
        try
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            var uptime = DateTime.UtcNow - process.StartTime;
            
            return new
            {
                totalSeconds = uptime.TotalSeconds,
                formatted = $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m",
                startTime = process.StartTime
            };
        }
        catch (Exception ex)
        {
            return new
            {
                error = ex.Message,
                status = "unknown"
            };
        }
    }
}