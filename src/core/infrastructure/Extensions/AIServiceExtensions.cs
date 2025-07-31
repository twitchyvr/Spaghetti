using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Services.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.Infrastructure.Extensions;

/// <summary>
/// Extension methods for configuring AI services in dependency injection
/// </summary>
public static class AIServiceExtensions
{
    /// <summary>
    /// Add AI services to the service collection with provider abstraction and circuit breaker
    /// </summary>
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add AI service providers
        services.AddHttpClient<OpenAIServiceProvider>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("User-Agent", "EnterpriseDocsCore/1.0");
        });
        
        services.AddHttpClient<ClaudeServiceProvider>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("User-Agent", "EnterpriseDocsCore/1.0");
        });
        
        // Register providers as singletons for better performance
        services.AddSingleton<OpenAIServiceProvider>();
        services.AddSingleton<ClaudeServiceProvider>();
        
        // Register core AI services
        services.AddSingleton<IAICircuitBreakerService, AICircuitBreakerService>();
        services.AddSingleton<IAIServiceProviderFactory, AIServiceProviderFactory>();
        services.AddScoped<IAIService, EnterpriseAIService>();
        
        // Validate configuration
        ValidateAIConfiguration(configuration);
        
        return services;
    }
    
    /// <summary>
    /// Add AI services with custom configuration
    /// </summary>
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration, Action<AIServiceOptions> configureOptions)
    {
        var options = new AIServiceOptions();
        configureOptions(options);
        
        services.Configure<AIServiceOptions>(opts =>
        {
            opts.EnableOpenAI = options.EnableOpenAI;
            opts.EnableClaude = options.EnableClaude;
            opts.DefaultProvider = options.DefaultProvider;
            opts.CircuitBreakerFailureThreshold = options.CircuitBreakerFailureThreshold;
            opts.CircuitBreakerTimeoutSeconds = options.CircuitBreakerTimeoutSeconds;
            opts.EnableUsageTracking = options.EnableUsageTracking;
            opts.EnableCostOptimization = options.EnableCostOptimization;
        });
        
        return services.AddAIServices(configuration);
    }
    
    /// <summary>
    /// Validate AI service configuration
    /// </summary>
    private static void ValidateAIConfiguration(IConfiguration configuration)
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger("AIConfiguration");
        
        // Check for required API keys
        var openAIKey = configuration["AI:OpenAI:ApiKey"];
        var claudeKey = configuration["AI:Claude:ApiKey"];
        
        if (string.IsNullOrEmpty(openAIKey) && string.IsNullOrEmpty(claudeKey))
        {
            logger.LogWarning("No AI provider API keys configured. AI services will not be functional.");
        }
        else
        {
            if (!string.IsNullOrEmpty(openAIKey))
            {
                logger.LogInformation("OpenAI provider configured");
            }
            
            if (!string.IsNullOrEmpty(claudeKey))
            {
                logger.LogInformation("Claude provider configured");
            }
        }
        
        // Check circuit breaker configuration
        var failureThreshold = configuration.GetValue("AI:CircuitBreaker:FailureThreshold", 5);
        var timeoutSeconds = configuration.GetValue("AI:CircuitBreaker:TimeoutSeconds", 30);
        
        if (failureThreshold < 1 || failureThreshold > 100)
        {
            logger.LogWarning("Circuit breaker failure threshold should be between 1 and 100. Current: {Threshold}", failureThreshold);
        }
        
        if (timeoutSeconds < 5 || timeoutSeconds > 300)
        {
            logger.LogWarning("Circuit breaker timeout should be between 5 and 300 seconds. Current: {Timeout}", timeoutSeconds);
        }
        
        logger.LogInformation("AI services configuration validated successfully");
    }
    
    /// <summary>
    /// Check if AI services are healthy
    /// </summary>
    public static async Task<bool> CheckAIServicesHealthAsync(this IServiceProvider serviceProvider)
    {
        try
        {
            var factory = serviceProvider.GetRequiredService<IAIServiceProviderFactory>();
            var healthResult = await factory.GetSystemHealthAsync();
            
            return healthResult.OverallStatus == ProviderHealthStatus.Healthy ||
                   healthResult.OverallStatus == ProviderHealthStatus.Degraded;
        }
        catch (Exception ex)
        {
            var logger = serviceProvider.GetRequiredService<ILogger<AIServiceExtensions>>();
            logger.LogError(ex, "Failed to check AI services health");
            return false;
        }
    }
}

/// <summary>
/// Configuration options for AI services
/// </summary>
public class AIServiceOptions
{
    /// <summary>
    /// Enable OpenAI provider
    /// </summary>
    public bool EnableOpenAI { get; set; } = true;
    
    /// <summary>
    /// Enable Claude provider
    /// </summary>
    public bool EnableClaude { get; set; } = true;
    
    /// <summary>
    /// Default provider to use (openai, claude)
    /// </summary>
    public string DefaultProvider { get; set; } = "openai";
    
    /// <summary>
    /// Circuit breaker failure threshold
    /// </summary>
    public int CircuitBreakerFailureThreshold { get; set; } = 5;
    
    /// <summary>
    /// Circuit breaker timeout in seconds
    /// </summary>
    public int CircuitBreakerTimeoutSeconds { get; set; } = 30;
    
    /// <summary>
    /// Enable usage tracking and analytics
    /// </summary>
    public bool EnableUsageTracking { get; set; } = true;
    
    /// <summary>
    /// Enable cost optimization features
    /// </summary>
    public bool EnableCostOptimization { get; set; } = true;
    
    /// <summary>
    /// Maximum concurrent requests per provider
    /// </summary>
    public int MaxConcurrentRequests { get; set; } = 10;
    
    /// <summary>
    /// Default request timeout in seconds
    /// </summary>
    public int DefaultTimeoutSeconds { get; set; } = 30;
    
    /// <summary>
    /// Enable provider failover
    /// </summary>
    public bool EnableFailover { get; set; } = true;
    
    /// <summary>
    /// Health check interval in minutes
    /// </summary>
    public int HealthCheckIntervalMinutes { get; set; } = 5;
}