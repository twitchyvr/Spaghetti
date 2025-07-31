using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace EnterpriseDocsCore.Infrastructure.Services.AI;

/// <summary>
/// OpenAI service provider implementation with enterprise-grade error handling and monitoring
/// </summary>
public class OpenAIServiceProvider : IAIServiceProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenAIServiceProvider> _logger;
    private readonly string _apiKey;
    private readonly string _baseUrl;
    private ProviderHealthStatus _healthStatus = ProviderHealthStatus.Unknown;
    
    public string ProviderId => "openai";
    public string ProviderName => "OpenAI GPT";
    public ProviderHealthStatus HealthStatus => _healthStatus;
    public decimal CostPerToken => 0.000002m; // GPT-4 pricing per token
    
    public ProviderCapabilities Capabilities { get; } = new()
    {
        SupportedCapabilities = new List<AICapabilityType>
        {
            AICapabilityType.DocumentGeneration,
            AICapabilityType.ContentAnalysis,
            AICapabilityType.TextCompletion,
            AICapabilityType.KeywordExtraction,
            AICapabilityType.Summarization,
            AICapabilityType.SentimentAnalysis
        },
        MaxTokensPerRequest = 8192,
        MaxRequestsPerMinute = 3500,
        MaxConcurrentRequests = 10,
        SupportedLanguages = new List<string> { "en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh" },
        SupportedDocumentTypes = new List<string> { "text", "markdown", "legal", "contract", "email", "report" },
        SupportsStreaming = true,
        SupportsBatchProcessing = false,
        TypicalResponseTime = TimeSpan.FromSeconds(2)
    };
    
    public OpenAIServiceProvider(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAIServiceProvider> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        _apiKey = _configuration["AI:OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API key not configured");
        _baseUrl = _configuration["AI:OpenAI:BaseUrl"] ?? "https://api.openai.com/v1";
        
        _httpClient.BaseAddress = new Uri(_baseUrl);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "EnterpriseDocsCore/1.0");
    }
    
    public async Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await PerformHealthCheckAsync(cancellationToken);
            return result.Status == ProviderHealthStatus.Healthy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed for OpenAI provider");
            return false;
        }
    }
    
    public async Task<ProviderHealthResult> PerformHealthCheckAsync(CancellationToken cancellationToken = default)
    {
        var startTime = DateTime.UtcNow;
        var result = new ProviderHealthResult
        {
            ProviderId = ProviderId,
            CheckedAt = startTime
        };
        
        try
        {
            // Simple health check using models endpoint
            var response = await _httpClient.GetAsync("/models", cancellationToken);
            var responseTime = DateTime.UtcNow - startTime;
            result.ResponseTime = responseTime;
            
            if (response.IsSuccessStatusCode)
            {
                _healthStatus = ProviderHealthStatus.Healthy;
                result.Status = ProviderHealthStatus.Healthy;
                result.HealthDetails["models_available"] = true;
                result.HealthDetails["response_time_ms"] = responseTime.TotalMilliseconds;
                
                _logger.LogInformation("OpenAI health check passed in {ResponseTime}ms", responseTime.TotalMilliseconds);
            }
            else
            {
                _healthStatus = ProviderHealthStatus.Degraded;
                result.Status = ProviderHealthStatus.Degraded;
                result.ErrorMessage = $"HTTP {response.StatusCode}: {response.ReasonPhrase}";
                result.Warnings.Add("API endpoint returned non-success status");
                
                _logger.LogWarning("OpenAI health check returned {StatusCode}", response.StatusCode);
            }
        }
        catch (TaskCanceledException ex) when (ex.CancellationToken.IsCancellationRequested)
        {
            _healthStatus = ProviderHealthStatus.Unhealthy;
            result.Status = ProviderHealthStatus.Unhealthy;
            result.ErrorMessage = "Health check timed out";
            result.ResponseTime = DateTime.UtcNow - startTime;
            
            _logger.LogError("OpenAI health check timed out after {Timeout}ms", result.ResponseTime.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            _healthStatus = ProviderHealthStatus.Unhealthy;
            result.Status = ProviderHealthStatus.Unhealthy;
            result.ErrorMessage = ex.Message;
            result.ResponseTime = DateTime.UtcNow - startTime;
            
            _logger.LogError(ex, "OpenAI health check failed");
        }
        
        return result;
    }
    
    public async Task<DocumentOutput> GenerateDocumentAsync(GenerateDocumentRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating document of type {DocumentType} using OpenAI", request.DocumentType);
        
        try
        {
            var prompt = BuildDocumentPrompt(request);
            var completion = await GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = request.TargetLength ?? 2000,
                Temperature = 0.7f,
                Model = "gpt-4"
            }, cancellationToken);
            
            var output = new DocumentOutput
            {
                Title = request.Title ?? $"Generated {request.DocumentType}",
                Content = completion,
                DocumentType = request.DocumentType,
                ConfidenceScore = 0.85f, // OpenAI typically provides good quality
                AIMetadata = new AIMetadata
                {
                    ProviderId = ProviderId,
                    ModelUsed = "gpt-4",
                    GeneratedAt = DateTime.UtcNow,
                    TokensUsed = EstimateTokens(completion),
                    Cost = EstimateTokens(completion) * CostPerToken
                }
            };
            
            // Generate summary and keywords
            output.Summary = await SummarizeAsync(completion, new SummaryOptions { MaxLength = 200 }, cancellationToken);
            output.Keywords = await ExtractKeywordsAsync(completion, 10, cancellationToken);
            output.SuggestedTags = GenerateTagsFromKeywords(output.Keywords, request.Industry);
            
            return output;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate document using OpenAI");
            throw new InvalidOperationException($"Document generation failed: {ex.Message}", ex);
        }
    }
    
    public async Task<ContentAnalysis> AnalyzeContentAsync(string content, AnalysisOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new AnalysisOptions();
        
        _logger.LogInformation("Analyzing content using OpenAI (length: {Length} chars)", content.Length);
        
        try
        {
            var prompt = BuildAnalysisPrompt(content, options);
            var response = await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = 1000,
                Temperature = 0.1f, // Lower temperature for analysis accuracy
                Model = "gpt-4"
            }, cancellationToken);
            
            return ParseAnalysisResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze content using OpenAI");
            throw new InvalidOperationException($"Content analysis failed: {ex.Message}", ex);
        }
    }
    
    public async Task<string> GenerateTextAsync(string prompt, TextGenerationOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new TextGenerationOptions();
        
        try
        {
            return await CallCompletionAPI(prompt, options, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate text using OpenAI");
            throw new InvalidOperationException($"Text generation failed: {ex.Message}", ex);
        }
    }
    
    public async Task<List<string>> ExtractKeywordsAsync(string content, int maxKeywords = 10, CancellationToken cancellationToken = default)
    {
        var prompt = $@"Extract the {maxKeywords} most important keywords from the following text. 
Return only the keywords as a comma-separated list, no explanations:

{content}";
        
        try
        {
            var response = await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = 200,
                Temperature = 0.1f,
                Model = "gpt-3.5-turbo"
            }, cancellationToken);
            
            return response.Split(',')
                          .Select(k => k.Trim())
                          .Where(k => !string.IsNullOrEmpty(k))
                          .Take(maxKeywords)
                          .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract keywords using OpenAI");
            return new List<string>();
        }
    }
    
    public async Task<string> SummarizeAsync(string content, SummaryOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new SummaryOptions();
        
        var prompt = $@"Summarize the following text in {options.MaxLength} characters or less. 
Style: {options.Style}
{(options.IncludeKeyPoints ? "Include key points." : "")}
{(!string.IsNullOrEmpty(options.Focus) ? $"Focus on: {options.Focus}" : "")}

Text to summarize:
{content}";
        
        try
        {
            return await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = options.MaxLength / 4, // Rough token estimation
                Temperature = 0.3f,
                Model = "gpt-3.5-turbo"
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to summarize content using OpenAI");
            throw new InvalidOperationException($"Summarization failed: {ex.Message}", ex);
        }
    }
    
    public async Task<ProviderUsageStats> GetUsageStatsAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        // This would typically query a database or cache for usage statistics
        // For now, return a placeholder implementation
        return new ProviderUsageStats
        {
            ProviderId = ProviderId,
            PeriodStart = from ?? DateTime.UtcNow.AddDays(-30),
            PeriodEnd = to ?? DateTime.UtcNow
        };
    }
    
    public async Task RecordUsageAsync(ProviderUsageRecord record, CancellationToken cancellationToken = default)
    {
        // Record usage for analytics and cost tracking
        _logger.LogInformation("Recording OpenAI usage: {Capability}, {Tokens} tokens, ${Cost:F4}", 
            record.Capability, record.TokensUsed, record.Cost);
        
        // This would typically store in database or send to analytics service
        await Task.CompletedTask;
    }
    
    private async Task<string> CallCompletionAPI(string prompt, TextGenerationOptions options, CancellationToken cancellationToken)
    {
        var requestBody = new
        {
            model = options.Model ?? "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = options.MaxTokens,
            temperature = options.Temperature,
            top_p = options.TopP,
            stop = options.StopSequences.Any() ? options.StopSequences.ToArray() : null
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync("/chat/completions", content, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"OpenAI API error ({response.StatusCode}): {errorContent}");
        }
        
        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var document = JsonDocument.Parse(responseJson);
        
        var completion = document.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
            
        return completion ?? string.Empty;
    }
    
    private string BuildDocumentPrompt(GenerateDocumentRequest request)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine($"Generate a professional {request.DocumentType} document");
        
        if (!string.IsNullOrEmpty(request.Industry))
            prompt.AppendLine($"Industry: {request.Industry}");
            
        if (!string.IsNullOrEmpty(request.Title))
            prompt.AppendLine($"Title: {request.Title}");
            
        if (!string.IsNullOrEmpty(request.Style))
            prompt.AppendLine($"Writing style: {request.Style}");
            
        if (request.TargetLength.HasValue)
            prompt.AppendLine($"Target length: approximately {request.TargetLength} words");
            
        if (request.Parameters.Any())
        {
            prompt.AppendLine("\nParameters:");
            foreach (var param in request.Parameters)
            {
                prompt.AppendLine($"- {param.Key}: {param.Value}");
            }
        }
        
        prompt.AppendLine("\nPlease generate a well-structured, professional document that meets these requirements.");
        
        return prompt.ToString();
    }
    
    private string BuildAnalysisPrompt(string content, AnalysisOptions options)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine("Analyze the following content and provide a detailed analysis in JSON format:");
        
        if (options.IncludeSentiment)
            prompt.AppendLine("- Include sentiment analysis with scores");
            
        if (options.IncludeReadability)
            prompt.AppendLine("- Include readability assessment");
            
        if (options.IncludeTopics)
            prompt.AppendLine("- Include topic identification");
            
        if (options.IncludeKeywords)
            prompt.AppendLine("- Include keyword extraction");
            
        prompt.AppendLine($"\nContent to analyze:\n{content}");
        
        return prompt.ToString();
    }
    
    private ContentAnalysis ParseAnalysisResponse(string response)
    {
        // This is a simplified parser - in production, you'd want more robust JSON parsing
        // and error handling for the AI response format
        try
        {
            using var document = JsonDocument.Parse(response);
            var root = document.RootElement;
            
            return new ContentAnalysis
            {
                ReadabilityScore = root.TryGetProperty("readability_score", out var readability) 
                    ? readability.GetSingle() : 0.7f,
                ReadabilityLevel = root.TryGetProperty("readability_level", out var level) 
                    ? level.GetString() ?? "Medium" : "Medium",
                WordCount = CountWords(response),
                Sentiment = new SentimentAnalysis
                {
                    Overall = SentimentType.Neutral,
                    ConfidenceScore = 0.8f
                }
            };
        }
        catch (JsonException)
        {
            // Fallback if AI doesn't return valid JSON
            return new ContentAnalysis
            {
                ReadabilityScore = 0.7f,
                ReadabilityLevel = "Medium",
                WordCount = CountWords(response)
            };
        }
    }
    
    private int CountWords(string text) => 
        string.IsNullOrEmpty(text) ? 0 : text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    
    private int EstimateTokens(string text) => 
        (int)Math.Ceiling(text.Length / 4.0); // Rough approximation: 1 token ≈ 4 characters
    
    private List<string> GenerateTagsFromKeywords(List<string> keywords, string? industry)
    {
        var tags = new List<string>(keywords.Take(5));
        
        if (!string.IsNullOrEmpty(industry))
            tags.Add(industry.ToLowerInvariant());
            
        return tags.Distinct().ToList();
    }
}