using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString("N")[..8];
        
        // Add request ID to response headers
        context.Response.Headers.Add("X-Request-ID", requestId);
        
        // Log request start
        await LogRequestStartAsync(context, requestId);

        // Capture response
        var originalResponseBody = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            // Copy response back to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalResponseBody);
            
            // Log request completion
            await LogRequestCompletionAsync(context, requestId, stopwatch.ElapsedMilliseconds, responseBody);
        }
    }

    private async Task LogRequestStartAsync(HttpContext context, string requestId)
    {
        var request = context.Request;
        var userId = GetUserId(context);
        var tenantId = GetTenantId(context);

        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
            ["UserId"] = userId ?? "anonymous",
            ["TenantId"] = tenantId ?? "none",
            ["Method"] = request.Method,
            ["Path"] = request.Path,
            ["QueryString"] = request.QueryString.ToString(),
            ["UserAgent"] = request.Headers.UserAgent.ToString(),
            ["IPAddress"] = GetClientIPAddress(context),
            ["ContentType"] = request.ContentType ?? "none",
            ["ContentLength"] = request.ContentLength ?? 0
        });

        _logger.LogInformation("Request started: {Method} {Path}{QueryString}", 
            request.Method, request.Path, request.QueryString);

        // Log request body for non-GET requests (excluding sensitive endpoints)
        if (request.Method != "GET" && ShouldLogRequestBody(request.Path))
        {
            var requestBody = await ReadRequestBodyAsync(request);
            if (!string.IsNullOrEmpty(requestBody))
            {
                _logger.LogDebug("Request body: {RequestBody}", requestBody);
            }
        }
    }

    private async Task LogRequestCompletionAsync(HttpContext context, string requestId, long elapsedMs, MemoryStream responseBody)
    {
        var request = context.Request;
        var response = context.Response;
        var userId = GetUserId(context);
        var tenantId = GetTenantId(context);

        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
            ["UserId"] = userId ?? "anonymous",
            ["TenantId"] = tenantId ?? "none",
            ["Method"] = request.Method,
            ["Path"] = request.Path,
            ["StatusCode"] = response.StatusCode,
            ["ElapsedMs"] = elapsedMs,
            ["ResponseSize"] = responseBody.Length
        });

        var logLevel = response.StatusCode switch
        {
            >= 200 and < 300 => LogLevel.Information,
            >= 300 and < 400 => LogLevel.Information,
            >= 400 and < 500 => LogLevel.Warning,
            >= 500 => LogLevel.Error,
            _ => LogLevel.Information
        };

        _logger.Log(logLevel, "Request completed: {Method} {Path} responded {StatusCode} in {ElapsedMs}ms", 
            request.Method, request.Path, response.StatusCode, elapsedMs);

        // Log response body for errors or debug level
        if ((response.StatusCode >= 400 || _logger.IsEnabled(LogLevel.Debug)) && ShouldLogResponseBody(request.Path))
        {
            var responseBodyText = await ReadResponseBodyAsync(responseBody);
            if (!string.IsNullOrEmpty(responseBodyText))
            {
                _logger.LogDebug("Response body: {ResponseBody}", responseBodyText);
            }
        }

        // Log performance warnings
        if (elapsedMs > 5000) // 5 seconds
        {
            _logger.LogWarning("Slow request detected: {Method} {Path} took {ElapsedMs}ms", 
                request.Method, request.Path, elapsedMs);
        }
    }

    private static string? GetUserId(HttpContext context)
    {
        return context.User?.FindFirst("sub")?.Value ?? 
               context.User?.FindFirst("user_id")?.Value ??
               context.User?.FindFirst("id")?.Value;
    }

    private static string? GetTenantId(HttpContext context)
    {
        return context.User?.FindFirst("tenant_id")?.Value ??
               context.Request.Headers["X-Tenant-ID"].FirstOrDefault();
    }

    private static string GetClientIPAddress(HttpContext context)
    {
        var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(ipAddress))
        {
            // Take the first IP if multiple are present
            ipAddress = ipAddress.Split(',')[0].Trim();
        }

        return ipAddress ?? 
               context.Request.Headers["X-Real-IP"].FirstOrDefault() ?? 
               context.Connection.RemoteIpAddress?.ToString() ?? 
               "unknown";
    }

    private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
    {
        try
        {
            request.EnableBuffering();
            request.Body.Position = 0;

            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            
            request.Body.Position = 0;
            return body;
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    private static async Task<string> ReadResponseBodyAsync(MemoryStream responseBody)
    {
        try
        {
            responseBody.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(responseBody, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            responseBody.Seek(0, SeekOrigin.Begin);
            return body;
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    private static bool ShouldLogRequestBody(PathString path)
    {
        var sensitiveEndpoints = new[]
        {
            "/auth/login",
            "/auth/register", 
            "/auth/change-password",
            "/auth/reset-password",
            "/users/create",
            "/users/update"
        };

        return !sensitiveEndpoints.Any(endpoint => path.StartsWithSegments(endpoint, StringComparison.OrdinalIgnoreCase));
    }

    private static bool ShouldLogResponseBody(PathString path)
    {
        var excludedEndpoints = new[]
        {
            "/files/download",
            "/documents/export",
            "/health",
            "/metrics"
        };

        return !excludedEndpoints.Any(endpoint => path.StartsWithSegments(endpoint, StringComparison.OrdinalIgnoreCase));
    }
}