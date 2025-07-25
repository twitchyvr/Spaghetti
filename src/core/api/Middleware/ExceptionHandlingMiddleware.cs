using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, details) = exception switch
        {
            ArgumentNullException => (HttpStatusCode.BadRequest, "Required parameter is missing", exception.Message),
            ArgumentException argEx => (HttpStatusCode.BadRequest, "Invalid request", argEx.Message),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden, "Access denied", "You do not have permission to perform this action"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found", exception.Message),
            InvalidOperationException => (HttpStatusCode.Conflict, "Invalid operation", exception.Message),
            TimeoutException => (HttpStatusCode.RequestTimeout, "Request timeout", "The request took too long to process"),
            NotImplementedException => (HttpStatusCode.NotImplemented, "Feature not implemented", "This feature is not yet implemented"),
            ValidationException validationEx => (HttpStatusCode.BadRequest, "Validation failed", validationEx.Message),
            DuplicateException => (HttpStatusCode.Conflict, "Resource already exists", exception.Message),
            QuotaExceededException quotaEx => (HttpStatusCode.TooManyRequests, "Quota exceeded", quotaEx.Message),
            _ => (HttpStatusCode.InternalServerError, "An error occurred", "An unexpected error occurred while processing your request")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResponse
        {
            Message = message,
            Details = details,
            Timestamp = DateTime.UtcNow,
            Path = context.Request.Path,
            Method = context.Request.Method,
            TraceId = context.TraceIdentifier
        };

        // Add validation errors if applicable
        if (exception is ValidationException validationException && validationException.Errors.Any())
        {
            response.ValidationErrors = validationException.Errors;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string TraceId { get; set; } = string.Empty;
    public Dictionary<string, string[]>? ValidationErrors { get; set; }
}

// Custom exception types
public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(string message, Dictionary<string, string[]> errors) : base(message)
    {
        Errors = errors;
    }

    public ValidationException(string field, string error) : base($"Validation failed for field '{field}'")
    {
        Errors = new Dictionary<string, string[]>
        {
            [field] = new[] { error }
        };
    }
}

public class DuplicateException : Exception
{
    public DuplicateException(string message) : base(message) { }
    public DuplicateException(string message, Exception innerException) : base(message, innerException) { }
}

public class QuotaExceededException : Exception
{
    public string QuotaType { get; }
    public long CurrentUsage { get; }
    public long Limit { get; }

    public QuotaExceededException(string quotaType, long currentUsage, long limit) 
        : base($"{quotaType} quota exceeded. Current: {currentUsage}, Limit: {limit}")
    {
        QuotaType = quotaType;
        CurrentUsage = currentUsage;
        Limit = limit;
    }
}