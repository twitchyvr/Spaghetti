using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.Infrastructure.Services.AI;

/// <summary>
/// Circuit breaker implementation for AI service providers
/// Prevents cascading failures and enables graceful degradation
/// </summary>
public class AICircuitBreakerService : IAICircuitBreakerService
{
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AICircuitBreakerService> _logger;
    
    private readonly int _failureThreshold;
    private readonly TimeSpan _timeout;
    private readonly TimeSpan _halfOpenRetryTimeout;
    private readonly object _lock = new();
    
    public AICircuitBreakerService(
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<AICircuitBreakerService> logger)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        // Load configuration with defaults
        _failureThreshold = _configuration.GetValue("AI:CircuitBreaker:FailureThreshold", 5);
        _timeout = TimeSpan.FromSeconds(_configuration.GetValue("AI:CircuitBreaker:TimeoutSeconds", 30));
        _halfOpenRetryTimeout = TimeSpan.FromSeconds(_configuration.GetValue("AI:CircuitBreaker:HalfOpenRetryTimeoutSeconds", 10));
        
        _logger.LogInformation("Circuit breaker initialized: FailureThreshold={FailureThreshold}, Timeout={Timeout}s, HalfOpenRetry={HalfOpenRetry}s",
            _failureThreshold, _timeout.TotalSeconds, _halfOpenRetryTimeout.TotalSeconds);
    }
    
    public async Task<T> ExecuteAsync<T>(string providerId, Func<CancellationToken, Task<T>> operation, CancellationToken cancellationToken = default)
    {
        var circuitState = GetCircuitState(providerId);
        
        switch (circuitState)
        {
            case CircuitBreakerState.Open:
                _logger.LogWarning("Circuit breaker is OPEN for provider {ProviderId}, rejecting request", providerId);
                throw new InvalidOperationException($"Circuit breaker is open for provider {providerId}");
                
            case CircuitBreakerState.HalfOpen:
                _logger.LogInformation("Circuit breaker is HALF-OPEN for provider {ProviderId}, allowing test request", providerId);
                break;
                
            case CircuitBreakerState.Closed:
                // Normal operation
                break;
        }
        
        try
        {
            var startTime = DateTime.UtcNow;
            
            // Execute the operation with timeout
            using var timeoutCts = new CancellationTokenSource(_timeout);
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);
            
            var result = await operation(combinedCts.Token);
            
            var duration = DateTime.UtcNow - startTime;
            _logger.LogDebug("Operation completed successfully for provider {ProviderId} in {Duration}ms", 
                providerId, duration.TotalMilliseconds);
            
            // Record success
            await RecordSuccessAsync(providerId);
            
            return result;
        }
        catch (OperationCanceledException ex) when (ex.CancellationToken.IsCancellationRequested)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                // User-requested cancellation, don't count as failure
                _logger.LogInformation("Operation cancelled by user for provider {ProviderId}", providerId);
                throw;
            }
            else
            {
                // Timeout - count as failure
                _logger.LogWarning("Operation timed out for provider {ProviderId} after {Timeout}s", 
                    providerId, _timeout.TotalSeconds);
                await RecordFailureAsync(providerId, new TimeoutException($"Operation timed out after {_timeout}"));
                throw new TimeoutException($"AI operation timed out after {_timeout} for provider {providerId}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Operation failed for provider {ProviderId}", providerId);
            await RecordFailureAsync(providerId, ex);
            throw;
        }
    }
    
    public async Task RecordSuccessAsync(string providerId)
    {
        lock (_lock)
        {
            var circuitInfo = GetCircuitInfo(providerId);
            
            if (circuitInfo.State == CircuitBreakerState.HalfOpen)
            {
                // Success in half-open state - close the circuit
                circuitInfo.State = CircuitBreakerState.Closed;
                circuitInfo.FailureCount = 0;
                circuitInfo.LastFailureTime = null;
                
                _logger.LogInformation("Circuit breaker CLOSED for provider {ProviderId} after successful test", providerId);
            }
            else if (circuitInfo.State == CircuitBreakerState.Closed)
            {
                // Reset failure count on success
                circuitInfo.FailureCount = 0;
            }
            
            circuitInfo.LastSuccessTime = DateTime.UtcNow;
            SetCircuitInfo(providerId, circuitInfo);
        }
        
        await Task.CompletedTask;
    }
    
    public async Task RecordFailureAsync(string providerId, Exception exception)
    {
        lock (_lock)
        {
            var circuitInfo = GetCircuitInfo(providerId);
            circuitInfo.FailureCount++;
            circuitInfo.LastFailureTime = DateTime.UtcNow;
            circuitInfo.LastException = exception.Message;
            
            if (circuitInfo.State == CircuitBreakerState.HalfOpen)
            {
                // Failure in half-open state - reopen the circuit
                circuitInfo.State = CircuitBreakerState.Open;
                _logger.LogWarning("Circuit breaker REOPENED for provider {ProviderId} after failed test", providerId);
            }
            else if (circuitInfo.State == CircuitBreakerState.Closed && circuitInfo.FailureCount >= _failureThreshold)
            {
                // Too many failures - open the circuit
                circuitInfo.State = CircuitBreakerState.Open;
                _logger.LogWarning("Circuit breaker OPENED for provider {ProviderId} after {FailureCount} failures", 
                    providerId, circuitInfo.FailureCount);
            }
            
            SetCircuitInfo(providerId, circuitInfo);
        }
        
        await Task.CompletedTask;
    }
    
    public CircuitBreakerState GetCircuitState(string providerId)
    {
        lock (_lock)
        {
            var circuitInfo = GetCircuitInfo(providerId);
            
            // Check if we should transition from Open to HalfOpen
            if (circuitInfo.State == CircuitBreakerState.Open && 
                circuitInfo.LastFailureTime.HasValue &&
                DateTime.UtcNow - circuitInfo.LastFailureTime.Value > _halfOpenRetryTimeout)
            {
                circuitInfo.State = CircuitBreakerState.HalfOpen;
                SetCircuitInfo(providerId, circuitInfo);
                
                _logger.LogInformation("Circuit breaker transitioned to HALF-OPEN for provider {ProviderId}", providerId);
            }
            
            return circuitInfo.State;
        }
    }
    
    public async Task ResetCircuitAsync(string providerId)
    {
        lock (_lock)
        {
            var circuitInfo = new CircuitBreakerInfo
            {
                State = CircuitBreakerState.Closed,
                FailureCount = 0,
                LastFailureTime = null,
                LastSuccessTime = DateTime.UtcNow,
                LastException = null
            };
            
            SetCircuitInfo(providerId, circuitInfo);
        }
        
        _logger.LogInformation("Circuit breaker manually RESET for provider {ProviderId}", providerId);
        await Task.CompletedTask;
    }
    
    private CircuitBreakerInfo GetCircuitInfo(string providerId)
    {
        var cacheKey = $"circuit_breaker_{providerId}";
        
        if (_cache.TryGetValue(cacheKey, out CircuitBreakerInfo? cachedInfo) && cachedInfo != null)
        {
            return cachedInfo;
        }
        
        // Return default circuit info for new providers
        return new CircuitBreakerInfo
        {
            State = CircuitBreakerState.Closed,
            FailureCount = 0,
            LastFailureTime = null,
            LastSuccessTime = null,
            LastException = null
        };
    }
    
    private void SetCircuitInfo(string providerId, CircuitBreakerInfo circuitInfo)
    {
        var cacheKey = $"circuit_breaker_{providerId}";
        
        // Cache for extended period to maintain circuit state
        _cache.Set(cacheKey, circuitInfo, TimeSpan.FromHours(24));
    }
    
    /// <summary>
    /// Internal class to track circuit breaker state
    /// </summary>
    private class CircuitBreakerInfo
    {
        public CircuitBreakerState State { get; set; } = CircuitBreakerState.Closed;
        public int FailureCount { get; set; } = 0;
        public DateTime? LastFailureTime { get; set; }
        public DateTime? LastSuccessTime { get; set; }
        public string? LastException { get; set; }
    }
}