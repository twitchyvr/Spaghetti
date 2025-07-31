using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Abstraction layer for different AI service providers (OpenAI, Claude, etc.)
/// Implements circuit breaker pattern and health monitoring for enterprise reliability
/// </summary>
public interface IAIServiceProvider
{
    /// <summary>
    /// Unique identifier for this provider (e.g., "openai", "claude")
    /// </summary>
    string ProviderId { get; }
    
    /// <summary>
    /// Human-readable name for this provider
    /// </summary>
    string ProviderName { get; }
    
    /// <summary>
    /// Current health status of the provider
    /// </summary>
    ProviderHealthStatus HealthStatus { get; }
    
    /// <summary>
    /// Provider-specific capabilities and limitations
    /// </summary>
    ProviderCapabilities Capabilities { get; }
    
    /// <summary>
    /// Current cost per token for this provider
    /// </summary>
    decimal CostPerToken { get; }
    
    /// <summary>
    /// Check if provider is currently available and healthy
    /// </summary>
    Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Perform comprehensive health check including API connectivity
    /// </summary>
    Task<ProviderHealthResult> PerformHealthCheckAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Process a document generation request
    /// </summary>
    Task<DocumentOutput> GenerateDocumentAsync(GenerateDocumentRequest request, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Process content analysis request
    /// </summary>
    Task<ContentAnalysis> AnalyzeContentAsync(string content, AnalysisOptions? options = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Generate text completion/improvement suggestions
    /// </summary>
    Task<string> GenerateTextAsync(string prompt, TextGenerationOptions? options = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Extract keywords from content
    /// </summary>
    Task<List<string>> ExtractKeywordsAsync(string content, int maxKeywords = 10, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Generate document summary
    /// </summary>
    Task<string> SummarizeAsync(string content, SummaryOptions? options = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get usage statistics for this provider
    /// </summary>
    Task<ProviderUsageStats> GetUsageStatsAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Record usage for cost tracking and analytics
    /// </summary>
    Task RecordUsageAsync(ProviderUsageRecord record, CancellationToken cancellationToken = default);
}

/// <summary>
/// Factory for creating and managing AI service providers
/// Implements circuit breaker pattern and automatic failover
/// </summary>
public interface IAIServiceProviderFactory
{
    /// <summary>
    /// Get the primary provider for a specific capability
    /// </summary>
    Task<IAIServiceProvider> GetPrimaryProviderAsync(AICapabilityType capability, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get a fallback provider when primary fails
    /// </summary>
    Task<IAIServiceProvider?> GetFallbackProviderAsync(AICapabilityType capability, string excludeProviderId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get all available providers for a capability
    /// </summary>
    Task<List<IAIServiceProvider>> GetAvailableProvidersAsync(AICapabilityType capability, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get provider by specific ID
    /// </summary>
    Task<IAIServiceProvider?> GetProviderAsync(string providerId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Update provider health status (used by circuit breaker)
    /// </summary>
    Task UpdateProviderHealthAsync(string providerId, ProviderHealthStatus status, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get overall system health across all providers
    /// </summary>
    Task<SystemHealthResult> GetSystemHealthAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Circuit breaker service for managing provider failures and recovery
/// </summary>
public interface IAICircuitBreakerService
{
    /// <summary>
    /// Execute operation with circuit breaker protection
    /// </summary>
    Task<T> ExecuteAsync<T>(string providerId, Func<CancellationToken, Task<T>> operation, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Record success for circuit breaker state management
    /// </summary>
    Task RecordSuccessAsync(string providerId);
    
    /// <summary>
    /// Record failure for circuit breaker state management
    /// </summary>
    Task RecordFailureAsync(string providerId, Exception exception);
    
    /// <summary>
    /// Get current circuit breaker state
    /// </summary>
    CircuitBreakerState GetCircuitState(string providerId);
    
    /// <summary>
    /// Manually reset circuit breaker (admin operation)
    /// </summary>
    Task ResetCircuitAsync(string providerId);
}

// Supporting Types
public enum ProviderHealthStatus
{
    Healthy,
    Degraded,
    Unhealthy,
    Unknown
}

public enum AICapabilityType
{
    DocumentGeneration,
    ContentAnalysis,
    TextCompletion,
    KeywordExtraction,
    Summarization,
    Translation,
    SentimentAnalysis,
    ComplianceCheck
}

public enum CircuitBreakerState
{
    Closed,    // Normal operation
    Open,      // Failing fast
    HalfOpen   // Testing recovery
}

public class ProviderCapabilities
{
    public List<AICapabilityType> SupportedCapabilities { get; set; } = new();
    public int MaxTokensPerRequest { get; set; }
    public int MaxRequestsPerMinute { get; set; }
    public int MaxConcurrentRequests { get; set; }
    public List<string> SupportedLanguages { get; set; } = new();
    public List<string> SupportedDocumentTypes { get; set; } = new();
    public bool SupportsStreaming { get; set; }
    public bool SupportsBatchProcessing { get; set; }
    public TimeSpan TypicalResponseTime { get; set; }
    public Dictionary<string, object> CustomCapabilities { get; set; } = new();
}

public class ProviderHealthResult
{
    public string ProviderId { get; set; } = string.Empty;
    public ProviderHealthStatus Status { get; set; }
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    public TimeSpan ResponseTime { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> HealthDetails { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

public class TextGenerationOptions
{
    public int MaxTokens { get; set; } = 1000;
    public float Temperature { get; set; } = 0.7f;
    public float TopP { get; set; } = 1.0f;
    public string? Model { get; set; }
    public List<string> StopSequences { get; set; } = new();
    public Dictionary<string, object> CustomOptions { get; set; } = new();
}

public class ProviderUsageStats
{
    public string ProviderId { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public int TotalRequests { get; set; }
    public int SuccessfulRequests { get; set; }
    public int FailedRequests { get; set; }
    public long TotalTokensUsed { get; set; }
    public TimeSpan TotalResponseTime { get; set; }
    public TimeSpan AverageResponseTime { get; set; }
    public decimal TotalCost { get; set; }
    public Dictionary<AICapabilityType, int> RequestsByCapability { get; set; } = new();
}

public class ProviderUsageRecord
{
    public string ProviderId { get; set; } = string.Empty;
    public AICapabilityType Capability { get; set; }
    public int TokensUsed { get; set; }
    public TimeSpan ResponseTime { get; set; }
    public decimal Cost { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Guid? UserId { get; set; }
    public Guid? TenantId { get; set; }
}

public class SystemHealthResult
{
    public ProviderHealthStatus OverallStatus { get; set; }
    public List<ProviderHealthResult> ProviderResults { get; set; } = new();
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    public Dictionary<AICapabilityType, ProviderHealthStatus> CapabilityStatus { get; set; } = new();
    public List<string> SystemWarnings { get; set; } = new();
    public bool HasFailoverCapability { get; set; }
}