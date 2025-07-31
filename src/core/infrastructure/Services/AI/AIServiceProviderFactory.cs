using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EnterpriseDocsCore.Infrastructure.Services.AI;

/// <summary>
/// Factory for managing AI service providers with automatic failover and circuit breaker integration
/// </summary>
public class AIServiceProviderFactory : IAIServiceProviderFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IAICircuitBreakerService _circuitBreaker;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIServiceProviderFactory> _logger;
    
    private readonly Dictionary<string, IAIServiceProvider> _providers = new();
    private readonly Dictionary<AICapabilityType, List<string>> _capabilityProviders = new();
    private readonly object _lock = new();
    
    public AIServiceProviderFactory(
        IServiceProvider serviceProvider,
        IAICircuitBreakerService circuitBreaker,
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<AIServiceProviderFactory> logger)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _circuitBreaker = circuitBreaker ?? throw new ArgumentNullException(nameof(circuitBreaker));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        InitializeProviders();
    }
    
    public async Task<IAIServiceProvider> GetPrimaryProviderAsync(AICapabilityType capability, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"primary_provider_{capability}";
        
        if (_cache.TryGetValue(cacheKey, out IAIServiceProvider? cachedProvider) && cachedProvider != null)
        {
            // Check if cached provider is still healthy
            if (await cachedProvider.IsHealthyAsync(cancellationToken) && 
                _circuitBreaker.GetCircuitState(cachedProvider.ProviderId) != CircuitBreakerState.Open)
            {
                return cachedProvider;
            }
        }
        
        lock (_lock)
        {
            if (!_capabilityProviders.TryGetValue(capability, out var providerIds) || !providerIds.Any())
            {
                throw new InvalidOperationException($"No providers configured for capability: {capability}");
            }
            
            // Get the primary provider (first in configuration)
            var primaryProviderId = providerIds.First();
            
            if (!_providers.TryGetValue(primaryProviderId, out var provider))
            {
                throw new InvalidOperationException($"Provider not found: {primaryProviderId}");
            }
            
            // Cache the result for a short time
            _cache.Set(cacheKey, provider, TimeSpan.FromMinutes(5));
            
            _logger.LogDebug("Selected primary provider {ProviderId} for capability {Capability}", 
                primaryProviderId, capability);
            
            return provider;
        }
    }
    
    public async Task<IAIServiceProvider?> GetFallbackProviderAsync(AICapabilityType capability, string excludeProviderId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            if (!_capabilityProviders.TryGetValue(capability, out var providerIds))
            {
                return null;
            }
            
            // Find the next available provider that's not excluded and not circuit-broken
            foreach (var providerId in providerIds.Where(id => id != excludeProviderId))
            {
                if (_providers.TryGetValue(providerId, out var provider) && 
                    _circuitBreaker.GetCircuitState(providerId) != CircuitBreakerState.Open)
                {
                    _logger.LogInformation("Selected fallback provider {ProviderId} for capability {Capability} (excluding {ExcludedProvider})", 
                        providerId, capability, excludeProviderId);
                    
                    return provider;
                }
            }
            
            _logger.LogWarning("No fallback provider available for capability {Capability} (excluding {ExcludedProvider})", 
                capability, excludeProviderId);
            
            return null;
        }
    }
    
    public async Task<List<IAIServiceProvider>> GetAvailableProvidersAsync(AICapabilityType capability, CancellationToken cancellationToken = default)
    {
        var availableProviders = new List<IAIServiceProvider>();
        
        lock (_lock)
        {
            if (!_capabilityProviders.TryGetValue(capability, out var providerIds))
            {
                return availableProviders;
            }
            
            foreach (var providerId in providerIds)
            {
                if (_providers.TryGetValue(providerId, out var provider) && 
                    _circuitBreaker.GetCircuitState(providerId) != CircuitBreakerState.Open)
                {
                    availableProviders.Add(provider);
                }
            }
        }
        
        // Filter by health status
        var healthyProviders = new List<IAIServiceProvider>();
        foreach (var provider in availableProviders)
        {
            try
            {
                if (await provider.IsHealthyAsync(cancellationToken))
                {
                    healthyProviders.Add(provider);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Health check failed for provider {ProviderId}", provider.ProviderId);
            }
        }
        
        return healthyProviders;
    }
    
    public async Task<IAIServiceProvider?> GetProviderAsync(string providerId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return _providers.TryGetValue(providerId, out var provider) ? provider : null;
        }
    }
    
    public async Task UpdateProviderHealthAsync(string providerId, ProviderHealthStatus status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating provider {ProviderId} health status to {Status}", providerId, status);
        
        // Invalidate relevant cache entries
        var cacheKeysToRemove = new List<string>();
        foreach (var capability in Enum.GetValues<AICapabilityType>())
        {
            cacheKeysToRemove.Add($"primary_provider_{capability}");
        }
        
        foreach (var key in cacheKeysToRemove)
        {
            _cache.Remove(key);
        }
        
        // The health status is maintained by individual providers
        // This method allows external systems to trigger health updates
        await Task.CompletedTask;
    }
    
    public async Task<SystemHealthResult> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        var result = new SystemHealthResult
        {
            CheckedAt = DateTime.UtcNow
        };
        
        var healthTasks = new List<Task<ProviderHealthResult>>();
        
        lock (_lock)
        {
            foreach (var provider in _providers.Values)
            {
                healthTasks.Add(provider.PerformHealthCheckAsync(cancellationToken));
            }
        }
        
        try
        {
            var healthResults = await Task.WhenAll(healthTasks);
            result.ProviderResults.AddRange(healthResults);
            
            // Determine overall system health
            var healthyCount = healthResults.Count(r => r.Status == ProviderHealthStatus.Healthy);
            var totalCount = healthResults.Length;
            
            if (healthyCount == totalCount)
            {
                result.OverallStatus = ProviderHealthStatus.Healthy;
            }
            else if (healthyCount > 0)
            {
                result.OverallStatus = ProviderHealthStatus.Degraded;
                result.SystemWarnings.Add($"{totalCount - healthyCount} out of {totalCount} providers are unhealthy");
            }
            else
            {
                result.OverallStatus = ProviderHealthStatus.Unhealthy;
                result.SystemWarnings.Add("All AI providers are unhealthy");
            }
            
            // Check failover capability
            result.HasFailoverCapability = CheckFailoverCapability(healthResults);
            
            // Analyze capability status
            foreach (var capability in Enum.GetValues<AICapabilityType>())
            {
                var capabilityStatus = DetermineCapabilityStatus(capability, healthResults);
                result.CapabilityStatus[capability] = capabilityStatus;
                
                if (capabilityStatus == ProviderHealthStatus.Unhealthy)
                {
                    result.SystemWarnings.Add($"No healthy providers available for {capability}");
                }
            }
            
            _logger.LogInformation("System health check completed: {OverallStatus}, {HealthyProviders}/{TotalProviders} providers healthy", 
                result.OverallStatus, healthyCount, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform system health check");
            result.OverallStatus = ProviderHealthStatus.Unknown;
            result.SystemWarnings.Add($"Health check failed: {ex.Message}");
        }
        
        return result;
    }
    
    private void InitializeProviders()
    {
        _logger.LogInformation("Initializing AI service providers");
        
        // Get configured providers from dependency injection
        var openAIProvider = _serviceProvider.GetService(typeof(OpenAIServiceProvider)) as IAIServiceProvider;
        var claudeProvider = _serviceProvider.GetService(typeof(ClaudeServiceProvider)) as IAIServiceProvider;
        
        if (openAIProvider != null)
        {
            _providers[openAIProvider.ProviderId] = openAIProvider;
            RegisterProviderCapabilities(openAIProvider);
            _logger.LogInformation("Registered OpenAI provider");
        }
        
        if (claudeProvider != null)
        {
            _providers[claudeProvider.ProviderId] = claudeProvider;
            RegisterProviderCapabilities(claudeProvider);
            _logger.LogInformation("Registered Claude provider");
        }
        
        // Load provider priorities from configuration
        ConfigureProviderPriorities();
        
        _logger.LogInformation("Initialized {ProviderCount} AI service providers", _providers.Count);
    }
    
    private void RegisterProviderCapabilities(IAIServiceProvider provider)
    {
        foreach (var capability in provider.Capabilities.SupportedCapabilities)
        {
            if (!_capabilityProviders.ContainsKey(capability))
            {
                _capabilityProviders[capability] = new List<string>();
            }
            
            if (!_capabilityProviders[capability].Contains(provider.ProviderId))
            {
                _capabilityProviders[capability].Add(provider.ProviderId);
            }
        }
    }
    
    private void ConfigureProviderPriorities()
    {
        // Read provider priorities from configuration
        var prioritiesSection = _configuration.GetSection("AI:ProviderPriorities");
        
        foreach (var capability in Enum.GetValues<AICapabilityType>())
        {
            var capabilityConfig = prioritiesSection.GetSection(capability.ToString());
            var priorityList = capabilityConfig.Get<List<string>>();
            
            if (priorityList != null && priorityList.Any())
            {
                // Reorder providers based on configuration
                if (_capabilityProviders.ContainsKey(capability))
                {
                    var currentProviders = _capabilityProviders[capability];
                    var orderedProviders = new List<string>();
                    
                    // Add providers in priority order
                    foreach (var providerId in priorityList)
                    {
                        if (currentProviders.Contains(providerId))
                        {
                            orderedProviders.Add(providerId);
                        }
                    }
                    
                    // Add any remaining providers not in priority list
                    foreach (var providerId in currentProviders)
                    {
                        if (!orderedProviders.Contains(providerId))
                        {
                            orderedProviders.Add(providerId);
                        }
                    }
                    
                    _capabilityProviders[capability] = orderedProviders;
                }
            }
        }
    }
    
    private bool CheckFailoverCapability(ProviderHealthResult[] healthResults)
    {
        // Check if we have at least 2 healthy providers for each capability
        foreach (var capability in Enum.GetValues<AICapabilityType>())
        {
            if (!_capabilityProviders.TryGetValue(capability, out var providerIds))
                continue;
                
            var healthyProvidersForCapability = healthResults
                .Where(r => providerIds.Contains(r.ProviderId) && r.Status == ProviderHealthStatus.Healthy)
                .Count();
                
            if (healthyProvidersForCapability < 2)
            {
                return false; // No failover capability for this capability
            }
        }
        
        return true;
    }
    
    private ProviderHealthStatus DetermineCapabilityStatus(AICapabilityType capability, ProviderHealthResult[] healthResults)
    {
        if (!_capabilityProviders.TryGetValue(capability, out var providerIds))
        {
            return ProviderHealthStatus.Unhealthy;
        }
        
        var relevantResults = healthResults.Where(r => providerIds.Contains(r.ProviderId)).ToList();
        
        if (!relevantResults.Any())
        {
            return ProviderHealthStatus.Unhealthy;
        }
        
        var healthyCount = relevantResults.Count(r => r.Status == ProviderHealthStatus.Healthy);
        var totalCount = relevantResults.Count;
        
        if (healthyCount == totalCount)
        {
            return ProviderHealthStatus.Healthy;
        }
        else if (healthyCount > 0)
        {
            return ProviderHealthStatus.Degraded;
        }
        else
        {
            return ProviderHealthStatus.Unhealthy;
        }
    }
}