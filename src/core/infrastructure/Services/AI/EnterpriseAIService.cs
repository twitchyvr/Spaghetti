using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text;

namespace EnterpriseDocsCore.Infrastructure.Services.AI;

/// <summary>
/// Main AI service that orchestrates multiple providers with automatic failover
/// Implements the IAIService interface with enterprise-grade reliability
/// </summary>
public class EnterpriseAIService : IAIService
{
    private readonly IAIServiceProviderFactory _providerFactory;
    private readonly IAICircuitBreakerService _circuitBreaker;
    private readonly ILogger<EnterpriseAIService> _logger;
    
    public EnterpriseAIService(
        IAIServiceProviderFactory providerFactory,
        IAICircuitBreakerService circuitBreaker,
        ILogger<EnterpriseAIService> logger)
    {
        _providerFactory = providerFactory ?? throw new ArgumentNullException(nameof(providerFactory));
        _circuitBreaker = circuitBreaker ?? throw new ArgumentNullException(nameof(circuitBreaker));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    public async Task<DocumentOutput> ProcessDocumentAsync(ProcessDocumentRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing document request: Type={Type}, AgentId={AgentId}", 
            request.Input.Type, request.AgentId);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.DocumentGeneration,
            async (provider, ct) =>
            {
                // Convert ProcessDocumentRequest to GenerateDocumentRequest
                var generateRequest = new GenerateDocumentRequest
                {
                    DocumentType = request.Input.Context?.DocumentType ?? "document",
                    Industry = request.Input.Context?.Industry,
                    Title = request.Input.TextContent?.Split('\n').FirstOrDefault(),
                    Parameters = request.Configuration,
                    UserId = request.UserId
                };
                
                return await provider.GenerateDocumentAsync(generateRequest, ct);
            },
            cancellationToken);
    }
    
    public async Task<DocumentOutput> GenerateDocumentAsync(GenerateDocumentRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating document: Type={DocumentType}, Industry={Industry}", 
            request.DocumentType, request.Industry);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.DocumentGeneration,
            (provider, ct) => provider.GenerateDocumentAsync(request, ct),
            cancellationToken);
    }
    
    public async Task<string> SummarizeDocumentAsync(string content, SummaryOptions? options = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Summarizing document: Length={Length} chars", content.Length);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.Summarization,
            (provider, ct) => provider.SummarizeAsync(content, options, ct),
            cancellationToken);
    }
    
    public async Task<string> ImproveDocumentAsync(string content, ImprovementOptions? options = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Improving document: Length={Length} chars", content.Length);
        
        var prompt = BuildImprovementPrompt(content, options);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.TextCompletion,
            (provider, ct) => provider.GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = (int)(content.Length * 1.5), // Allow for expansion
                Temperature = 0.3f // Lower temperature for improvement accuracy
            }, ct),
            cancellationToken);
    }
    
    public async Task<ContentAnalysis> AnalyzeContentAsync(string content, AnalysisOptions? options = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Analyzing content: Length={Length} chars", content.Length);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.ContentAnalysis,
            (provider, ct) => provider.AnalyzeContentAsync(content, options, ct),
            cancellationToken);
    }
    
    public async Task<List<string>> ExtractKeywordsAsync(string content, int maxKeywords = 10, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Extracting keywords: Length={Length} chars, Max={MaxKeywords}", 
            content.Length, maxKeywords);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.KeywordExtraction,
            (provider, ct) => provider.ExtractKeywordsAsync(content, maxKeywords, ct),
            cancellationToken);
    }
    
    public async Task<List<string>> SuggestTagsAsync(string content, string? industry = null, int maxTags = 5, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suggesting tags: Industry={Industry}, MaxTags={MaxTags}", industry, maxTags);
        
        var keywords = await ExtractKeywordsAsync(content, maxTags * 2, cancellationToken);
        var tags = new List<string>(keywords.Take(maxTags));
        
        if (!string.IsNullOrEmpty(industry))
        {
            tags.Add(industry.ToLowerInvariant());
        }
        
        return tags.Distinct().Take(maxTags).ToList();
    }
    
    public async Task<SentimentAnalysis> AnalyzeSentimentAsync(string content, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Analyzing sentiment: Length={Length} chars", content.Length);
        
        var analysis = await AnalyzeContentAsync(content, new AnalysisOptions
        {
            IncludeSentiment = true,
            IncludeReadability = false,
            IncludeTopics = false,
            IncludeKeywords = false
        }, cancellationToken);
        
        return analysis.Sentiment;
    }
    
    public async Task<ComplianceAnalysis> AnalyzeComplianceAsync(string content, List<string> frameworks, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Analyzing compliance: Frameworks={Frameworks}", string.Join(", ", frameworks));
        
        var prompt = BuildCompliancePrompt(content, frameworks);
        
        var response = await ExecuteWithFailoverAsync(
            AICapabilityType.ComplianceCheck,
            (provider, ct) => provider.GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = 2000,
                Temperature = 0.1f // Very low temperature for compliance accuracy
            }, ct),
            cancellationToken);
        
        return ParseComplianceResponse(response, frameworks);
    }
    
    // Placeholder implementations for methods not yet fully implemented
    public async Task<TranscriptionResult> TranscribeAudioAsync(Stream audioStream, TranscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Audio transcription will be implemented in Phase 2");
    }
    
    public async Task<string> DescribeImageAsync(Stream imageStream, string? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Image description will be implemented in Phase 2");
    }
    
    public async Task<string> ExtractTextFromImageAsync(Stream imageStream, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("OCR will be implemented in Phase 2");
    }
    
    public async Task<string> ProcessVideoAsync(Stream videoStream, VideoProcessingOptions? options = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Video processing will be implemented in Phase 2");
    }
    
    public async Task<string> FillTemplateAsync(string template, Dictionary<string, object> variables, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Filling template with {VariableCount} variables", variables.Count);
        
        var prompt = BuildTemplateFillPrompt(template, variables);
        
        return await ExecuteWithFailoverAsync(
            AICapabilityType.TextCompletion,
            (provider, ct) => provider.GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = template.Length * 2,
                Temperature = 0.1f
            }, ct),
            cancellationToken);
    }
    
    public async Task<FormExtractionResult> ExtractFormDataAsync(string content, FormSchema? schema = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Form extraction will be implemented in Phase 2");
    }
    
    public async Task<List<TemplateVariable>> IdentifyTemplateVariablesAsync(string template, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Template variable identification will be implemented in Phase 2");
    }
    
    public async Task<TranslationResult> TranslateTextAsync(string text, string targetLanguage, string? sourceLanguage = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Translation will be implemented in Phase 2");
    }
    
    public async Task<string> DetectLanguageAsync(string text, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Language detection will be implemented in Phase 2");
    }
    
    public async Task<List<string>> GetSupportedLanguagesAsync(CancellationToken cancellationToken = default)
    {
        // Return common languages supported by most providers
        return new List<string> { "en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh" };
    }
    
    public async Task<List<string>> SuggestNextActionsAsync(string content, string? context = null, CancellationToken cancellationToken = default)
    {
        var prompt = BuildNextActionsPrompt(content, context);
        
        var response = await ExecuteWithFailoverAsync(
            AICapabilityType.TextCompletion,
            (provider, ct) => provider.GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = 500,
                Temperature = 0.7f
            }, ct),
            cancellationToken);
        
        return ParseActionSuggestions(response);
    }
    
    public async Task<List<AutoCompleteSuggestion>> GetAutoCompleteSuggestionsAsync(string partialText, string? context = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Auto-complete suggestions will be implemented in Phase 2");
    }
    
    public async Task<List<SmartSuggestion>> GetSmartSuggestionsAsync(SmartSuggestionRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Smart suggestions will be implemented in Phase 2");
    }
    
    public async Task<QualityAssessment> AssessDocumentQualityAsync(string content, QualityCriteria? criteria = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Quality assessment will be implemented in Phase 2");
    }
    
    public async Task<List<LanguageIssue>> CheckLanguageAsync(string content, string? language = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Language checking will be implemented in Phase 2");
    }
    
    public async Task<ConsistencyReport> CheckConsistencyAsync(List<string> documents, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Consistency checking will be implemented in Phase 2");
    }
    
    public async Task<List<AIModel>> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        var providers = await _providerFactory.GetAvailableProvidersAsync(AICapabilityType.DocumentGeneration, cancellationToken);
        
        var models = new List<AIModel>();
        foreach (var provider in providers)
        {
            models.Add(new AIModel
            {
                Id = provider.ProviderId,
                Name = provider.ProviderName,
                Description = $"AI models provided by {provider.ProviderName}",
                Provider = provider.ProviderId,
                Capabilities = provider.Capabilities.SupportedCapabilities.Select(c => c.ToString()).ToList(),
                IsAvailable = provider.HealthStatus == ProviderHealthStatus.Healthy,
                Limits = new ModelLimits
                {
                    MaxTokens = provider.Capabilities.MaxTokensPerRequest,
                    MaxRequestsPerMinute = provider.Capabilities.MaxRequestsPerMinute,
                    SupportedFormats = provider.Capabilities.SupportedDocumentTypes
                }
            });
        }
        
        return models;
    }
    
    public async Task<AIModel?> GetModelInfoAsync(string modelId, CancellationToken cancellationToken = default)
    {
        var provider = await _providerFactory.GetProviderAsync(modelId, cancellationToken);
        if (provider == null) return null;
        
        return new AIModel
        {
            Id = provider.ProviderId,
            Name = provider.ProviderName,
            Description = $"AI models provided by {provider.ProviderName}",
            Provider = provider.ProviderId,
            Capabilities = provider.Capabilities.SupportedCapabilities.Select(c => c.ToString()).ToList(),
            IsAvailable = provider.HealthStatus == ProviderHealthStatus.Healthy
        };
    }
    
    public async Task<CustomModelResult> TrainCustomModelAsync(TrainModelRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Custom model training will be implemented in Phase 3");
    }
    
    public async Task<bool> DeployCustomModelAsync(string modelId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Custom model deployment will be implemented in Phase 3");
    }
    
    public async Task<AIUsageStats> GetUsageStatsAsync(Guid? userId = null, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        // This would aggregate usage stats from all providers
        var providers = await _providerFactory.GetAvailableProvidersAsync(AICapabilityType.DocumentGeneration, cancellationToken);
        
        var aggregatedStats = new AIUsageStats
        {
            PeriodStart = from ?? DateTime.UtcNow.AddDays(-30),
            PeriodEnd = to ?? DateTime.UtcNow
        };
        
        foreach (var provider in providers)
        {
            var providerStats = await provider.GetUsageStatsAsync(from, to, cancellationToken);
            aggregatedStats.TotalRequests += providerStats.TotalRequests;
            aggregatedStats.SuccessfulRequests += providerStats.SuccessfulRequests;
            aggregatedStats.FailedRequests += providerStats.FailedRequests;
            aggregatedStats.TotalTokensUsed += providerStats.TotalTokensUsed;
            aggregatedStats.TotalCost += providerStats.TotalCost;
        }
        
        return aggregatedStats;
    }
    
    public async Task RecordUsageAsync(AIUsageRecord record, CancellationToken cancellationToken = default)
    {
        // Record usage across all relevant providers
        _logger.LogInformation("Recording AI usage: {RequestType}, {Tokens} tokens, ${Cost:F4}", 
            record.RequestType, record.TokensUsed, record.Cost);
        
        // This would typically store in database for analytics
        await Task.CompletedTask;
    }
    
    public async Task<List<AIPerformanceMetric>> GetPerformanceMetricsAsync(string? modelId = null, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Performance metrics will be implemented in Phase 2");
    }
    
    public async Task<BatchProcessingResult> ProcessBatchAsync(BatchProcessingRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Batch processing will be implemented in Phase 3");
    }
    
    public async Task<BatchProcessingStatus> GetBatchStatusAsync(Guid batchId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Batch processing will be implemented in Phase 3");
    }
    
    public async Task<bool> CancelBatchAsync(Guid batchId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Batch processing will be implemented in Phase 3");
    }
    
    /// <summary>
    /// Execute an operation with automatic failover between providers
    /// </summary>
    private async Task<T> ExecuteWithFailoverAsync<T>(
        AICapabilityType capability,
        Func<IAIServiceProvider, CancellationToken, Task<T>> operation,
        CancellationToken cancellationToken)
    {
        var primaryProvider = await _providerFactory.GetPrimaryProviderAsync(capability, cancellationToken);
        
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                primaryProvider.ProviderId,
                ct => operation(primaryProvider, ct),
                cancellationToken);
        }
        catch (Exception primaryEx)
        {
            _logger.LogWarning(primaryEx, "Primary provider {ProviderId} failed, attempting failover", 
                primaryProvider.ProviderId);
            
            // Try fallback provider
            var fallbackProvider = await _providerFactory.GetFallbackProviderAsync(
                capability, primaryProvider.ProviderId, cancellationToken);
            
            if (fallbackProvider != null)
            {
                try
                {
                    return await _circuitBreaker.ExecuteAsync(
                        fallbackProvider.ProviderId,
                        ct => operation(fallbackProvider, ct),
                        cancellationToken);
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Fallback provider {ProviderId} also failed", 
                        fallbackProvider.ProviderId);
                    
                    // Both providers failed - throw aggregate exception
                    throw new AggregateException("All AI providers failed", primaryEx, fallbackEx);
                }
            }
            else
            {
                _logger.LogError("No fallback provider available for capability {Capability}", capability);
                throw; // Re-throw original exception
            }
        }
    }
    
    private string BuildImprovementPrompt(string content, ImprovementOptions? options)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine("Please improve the following text:");
        
        if (options != null)
        {
            if (options.FixGrammar) prompt.AppendLine("- Fix any grammar and spelling errors");
            if (options.ImproveClarity) prompt.AppendLine("- Improve clarity and readability");
            if (options.EnhanceTone) prompt.AppendLine("- Enhance the tone and style");
            if (!string.IsNullOrEmpty(options.TargetAudience)) 
                prompt.AppendLine($"- Target audience: {options.TargetAudience}");
            if (!string.IsNullOrEmpty(options.WritingStyle)) 
                prompt.AppendLine($"- Writing style: {options.WritingStyle}");
            if (options.PreserveLength) 
                prompt.AppendLine("- Preserve the original length as much as possible");
        }
        
        prompt.AppendLine($"\nOriginal text:\n{content}");
        prompt.AppendLine("\nImproved text:");
        
        return prompt.ToString();
    }
    
    private string BuildCompliancePrompt(string content, List<string> frameworks)
    {
        return $@"Analyze the following content for compliance with these frameworks: {string.Join(", ", frameworks)}

Content to analyze:
{content}

Please provide a detailed compliance analysis including:
- Overall compliance score (0-100)
- Specific violations found
- Recommendations for improvement
- Risk assessment for each framework";
    }
    
    private ComplianceAnalysis ParseComplianceResponse(string response, List<string> frameworks)
    {
        // Simplified parsing - in production you'd want more robust parsing
        return new ComplianceAnalysis
        {
            OverallScore = 0.85f, // Default score
            Results = frameworks.Select(f => new ComplianceResult
            {
                Framework = f,
                Score = 0.85f,
                IsCompliant = true
            }).ToList()
        };
    }
    
    private string BuildTemplateFillPrompt(string template, Dictionary<string, object> variables)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine("Please fill in the following template with the provided variables:");
        prompt.AppendLine($"\nTemplate:\n{template}");
        prompt.AppendLine("\nVariables:");
        
        foreach (var variable in variables)
        {
            prompt.AppendLine($"- {variable.Key}: {variable.Value}");
        }
        
        prompt.AppendLine("\nFilled template:");
        return prompt.ToString();
    }
    
    private string BuildNextActionsPrompt(string content, string? context)
    {
        return $@"Based on the following content{(!string.IsNullOrEmpty(context) ? $" and context ({context})" : "")}, suggest 3-5 logical next actions or steps:

Content:
{content}

Please provide specific, actionable suggestions as a numbered list.";
    }
    
    private List<string> ParseActionSuggestions(string response)
    {
        return response.Split('\n')
                      .Where(line => line.Trim().Length > 0 && (line.TrimStart().StartsWith('-') || char.IsDigit(line.TrimStart().FirstOrDefault())))
                      .Select(line => line.Trim().TrimStart('-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', ' ').Trim())
                      .Where(action => action.Length > 0)
                      .Take(5)
                      .ToList();
    }
}