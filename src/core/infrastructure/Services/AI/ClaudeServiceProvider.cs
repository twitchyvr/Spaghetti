using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace EnterpriseDocsCore.Infrastructure.Services.AI;

/// <summary>
/// Claude (Anthropic) service provider implementation with enterprise-grade reliability
/// </summary>
public class ClaudeServiceProvider : IAIServiceProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ClaudeServiceProvider> _logger;
    private readonly string _apiKey;
    private readonly string _baseUrl;
    private ProviderHealthStatus _healthStatus = ProviderHealthStatus.Unknown;
    
    public string ProviderId => "claude";
    public string ProviderName => "Anthropic Claude";
    public ProviderHealthStatus HealthStatus => _healthStatus;
    public decimal CostPerToken => 0.000008m; // Claude pricing per token
    
    public ProviderCapabilities Capabilities { get; } = new()
    {
        SupportedCapabilities = new List<AICapabilityType>
        {
            AICapabilityType.DocumentGeneration,
            AICapabilityType.ContentAnalysis,
            AICapabilityType.TextCompletion,
            AICapabilityType.KeywordExtraction,
            AICapabilityType.Summarization,
            AICapabilityType.SentimentAnalysis,
            AICapabilityType.ComplianceCheck
        },
        MaxTokensPerRequest = 100000, // Claude has much higher context window
        MaxRequestsPerMinute = 1000,
        MaxConcurrentRequests = 5,
        SupportedLanguages = new List<string> { "en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh" },
        SupportedDocumentTypes = new List<string> { "text", "markdown", "legal", "contract", "email", "report", "academic", "technical" },
        SupportsStreaming = true,
        SupportsBatchProcessing = false,
        TypicalResponseTime = TimeSpan.FromSeconds(3)
    };
    
    public ClaudeServiceProvider(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ClaudeServiceProvider> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        _apiKey = _configuration["AI:Claude:ApiKey"] ?? throw new InvalidOperationException("Claude API key not configured");
        _baseUrl = _configuration["AI:Claude:BaseUrl"] ?? "https://api.anthropic.com/v1";
        
        _httpClient.BaseAddress = new Uri(_baseUrl);
        _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
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
            _logger.LogError(ex, "Health check failed for Claude provider");
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
            // Simple health check using a minimal completion request
            var testPrompt = "Hello, this is a health check.";
            var response = await CallCompletionAPI(testPrompt, new TextGenerationOptions
            {
                MaxTokens = 10,
                Temperature = 0.1f
            }, cancellationToken);
            
            var responseTime = DateTime.UtcNow - startTime;
            result.ResponseTime = responseTime;
            
            if (!string.IsNullOrEmpty(response))
            {
                _healthStatus = ProviderHealthStatus.Healthy;
                result.Status = ProviderHealthStatus.Healthy;
                result.HealthDetails["completion_successful"] = true;
                result.HealthDetails["response_time_ms"] = responseTime.TotalMilliseconds;
                
                _logger.LogInformation("Claude health check passed in {ResponseTime}ms", responseTime.TotalMilliseconds);
            }
            else
            {
                _healthStatus = ProviderHealthStatus.Degraded;
                result.Status = ProviderHealthStatus.Degraded;
                result.ErrorMessage = "Empty response from Claude API";
                result.Warnings.Add("API returned empty completion");
                
                _logger.LogWarning("Claude health check returned empty response");
            }
        }
        catch (TaskCanceledException ex) when (ex.CancellationToken.IsCancellationRequested)
        {
            _healthStatus = ProviderHealthStatus.Unhealthy;
            result.Status = ProviderHealthStatus.Unhealthy;
            result.ErrorMessage = "Health check timed out";
            result.ResponseTime = DateTime.UtcNow - startTime;
            
            _logger.LogError("Claude health check timed out after {Timeout}ms", result.ResponseTime.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            _healthStatus = ProviderHealthStatus.Unhealthy;
            result.Status = ProviderHealthStatus.Unhealthy;
            result.ErrorMessage = ex.Message;
            result.ResponseTime = DateTime.UtcNow - startTime;
            
            _logger.LogError(ex, "Claude health check failed");
        }
        
        return result;
    }
    
    public async Task<DocumentOutput> GenerateDocumentAsync(GenerateDocumentRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating document of type {DocumentType} using Claude", request.DocumentType);
        
        try
        {
            var prompt = BuildDocumentPrompt(request);
            var completion = await GenerateTextAsync(prompt, new TextGenerationOptions
            {
                MaxTokens = request.TargetLength ?? 3000,
                Temperature = 0.7f
            }, cancellationToken);
            
            var output = new DocumentOutput
            {
                Title = request.Title ?? $"Generated {request.DocumentType}",
                Content = completion,
                DocumentType = request.DocumentType,
                ConfidenceScore = 0.90f, // Claude typically provides high quality
                AIMetadata = new AIMetadata
                {
                    ProviderId = ProviderId,
                    ModelUsed = "claude-3-sonnet",
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
            _logger.LogError(ex, "Failed to generate document using Claude");
            throw new InvalidOperationException($"Document generation failed: {ex.Message}", ex);
        }
    }
    
    public async Task<ContentAnalysis> AnalyzeContentAsync(string content, AnalysisOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new AnalysisOptions();
        
        _logger.LogInformation("Analyzing content using Claude (length: {Length} chars)", content.Length);
        
        try
        {
            var prompt = BuildAnalysisPrompt(content, options);
            var response = await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = 1500,
                Temperature = 0.1f // Lower temperature for analysis accuracy
            }, cancellationToken);
            
            return ParseAnalysisResponse(response, content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze content using Claude");
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
            _logger.LogError(ex, "Failed to generate text using Claude");
            throw new InvalidOperationException($"Text generation failed: {ex.Message}", ex);
        }
    }
    
    public async Task<List<string>> ExtractKeywordsAsync(string content, int maxKeywords = 10, CancellationToken cancellationToken = default)
    {
        var prompt = $@"Please extract the {maxKeywords} most important and relevant keywords from the following text. 
Return only the keywords as a simple comma-separated list, with no additional explanation or formatting.

Text: {content}";
        
        try
        {
            var response = await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = 200,
                Temperature = 0.1f
            }, cancellationToken);
            
            return response.Split(',')
                          .Select(k => k.Trim())
                          .Where(k => !string.IsNullOrEmpty(k))
                          .Take(maxKeywords)
                          .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract keywords using Claude");
            return new List<string>();
        }
    }
    
    public async Task<string> SummarizeAsync(string content, SummaryOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new SummaryOptions();
        
        var prompt = $@"Please provide a {options.Style.ToString().ToLowerInvariant()} summary of the following text. 
The summary should be between {options.MinLength} and {options.MaxLength} characters.
{(options.IncludeKeyPoints ? "Make sure to include the key points." : "")}
{(!string.IsNullOrEmpty(options.Focus) ? $"Focus particularly on: {options.Focus}" : "")}

Text to summarize:
{content}";
        
        try
        {
            return await CallCompletionAPI(prompt, new TextGenerationOptions
            {
                MaxTokens = options.MaxLength / 3, // Conservative token estimation
                Temperature = 0.3f
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to summarize content using Claude");
            throw new InvalidOperationException($"Summarization failed: {ex.Message}", ex);
        }
    }
    
    public async Task<ProviderUsageStats> GetUsageStatsAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        // This would typically query a database or cache for usage statistics
        return new ProviderUsageStats
        {
            ProviderId = ProviderId,
            PeriodStart = from ?? DateTime.UtcNow.AddDays(-30),
            PeriodEnd = to ?? DateTime.UtcNow
        };
    }
    
    public async Task RecordUsageAsync(ProviderUsageRecord record, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Recording Claude usage: {Capability}, {Tokens} tokens, ${Cost:F4}", 
            record.Capability, record.TokensUsed, record.Cost);
        
        // This would typically store in database or send to analytics service
        await Task.CompletedTask;
    }
    
    private async Task<string> CallCompletionAPI(string prompt, TextGenerationOptions options, CancellationToken cancellationToken)
    {
        var requestBody = new
        {
            model = "claude-3-sonnet-20240229",
            max_tokens = options.MaxTokens,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = options.Temperature,
            top_p = options.TopP,
            stop_sequences = options.StopSequences.Any() ? options.StopSequences.ToArray() : null
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync("/messages", content, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Claude API error ({response.StatusCode}): {errorContent}");
        }
        
        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var document = JsonDocument.Parse(responseJson);
        
        var completion = document.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString();
            
        return completion ?? string.Empty;
    }
    
    private string BuildDocumentPrompt(GenerateDocumentRequest request)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine($"Please generate a comprehensive and professional {request.DocumentType} document.");
        
        if (!string.IsNullOrEmpty(request.Industry))
            prompt.AppendLine($"This document is for the {request.Industry} industry.");
            
        if (!string.IsNullOrEmpty(request.Title))
            prompt.AppendLine($"The document title should be: {request.Title}");
            
        if (!string.IsNullOrEmpty(request.Style))
            prompt.AppendLine($"Please write in a {request.Style} style.");
            
        if (request.TargetLength.HasValue)
            prompt.AppendLine($"The document should be approximately {request.TargetLength} words long.");
            
        if (request.Parameters.Any())
        {
            prompt.AppendLine("\nPlease incorporate the following specific requirements:");
            foreach (var param in request.Parameters)
            {
                prompt.AppendLine($"- {param.Key}: {param.Value}");
            }
        }
        
        prompt.AppendLine("\nEnsure the document is well-structured, professionally written, and meets all specified requirements. Include appropriate sections, headers, and formatting as needed for this document type.");
        
        return prompt.ToString();
    }
    
    private string BuildAnalysisPrompt(string content, AnalysisOptions options)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine("Please analyze the following content and provide a comprehensive analysis. Return your analysis in a structured format that includes:");
        
        if (options.IncludeSentiment)
            prompt.AppendLine("- Sentiment analysis with overall sentiment and confidence scores");
            
        if (options.IncludeReadability)
            prompt.AppendLine("- Readability assessment with score and reading level");
            
        if (options.IncludeTopics)
            prompt.AppendLine("- Main topics and themes identified");
            
        if (options.IncludeKeywords)
            prompt.AppendLine("- Important keywords and key phrases");
            
        prompt.AppendLine("- Word count, sentence count, and paragraph count");
        prompt.AppendLine("\nPlease structure your response clearly with labeled sections.");
        prompt.AppendLine($"\nContent to analyze:\n\n{content}");
        
        return prompt.ToString();
    }
    
    private ContentAnalysis ParseAnalysisResponse(string response, string originalContent)
    {
        // Claude provides more structured responses, so we can parse more reliably
        var lines = response.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        
        var analysis = new ContentAnalysis
        {
            WordCount = CountWords(originalContent),
            SentenceCount = CountSentences(originalContent),
            ParagraphCount = CountParagraphs(originalContent),
            ReadabilityScore = ExtractReadabilityScore(response),
            ReadabilityLevel = DetermineReadabilityLevel(ExtractReadabilityScore(response)),
            Sentiment = ExtractSentimentAnalysis(response),
            KeyPhrases = ExtractKeyPhrases(response),
            TopicSummary = ExtractTopics(response)
        };
        
        return analysis;
    }
    
    private float ExtractReadabilityScore(string response)
    {
        // Simple pattern matching for readability score
        // In production, you'd want more sophisticated parsing
        var lines = response.ToLowerInvariant().Split('\n');
        foreach (var line in lines)
        {
            if (line.Contains("readability") && line.Contains("score"))
            {
                var numbers = System.Text.RegularExpressions.Regex.Matches(line, @"\d+\.?\d*");
                if (numbers.Count > 0 && float.TryParse(numbers[0].Value, out var score))
                {
                    return Math.Min(score / 100f, 1.0f); // Normalize to 0-1 range
                }
            }
        }
        return 0.75f; // Default score
    }
    
    private string DetermineReadabilityLevel(float score)
    {
        return score switch
        {
            >= 0.9f => "Very Easy",
            >= 0.8f => "Easy",
            >= 0.7f => "Fairly Easy",
            >= 0.6f => "Standard",
            >= 0.5f => "Fairly Difficult",
            >= 0.3f => "Difficult",
            _ => "Very Difficult"
        };
    }
    
    private SentimentAnalysis ExtractSentimentAnalysis(string response)
    {
        var sentiment = new SentimentAnalysis
        {
            Overall = SentimentType.Neutral,
            ConfidenceScore = 0.8f,
            NeutralScore = 0.6f,
            PositiveScore = 0.3f,
            NegativeScore = 0.1f
        };
        
        var lowerResponse = response.ToLowerInvariant();
        if (lowerResponse.Contains("positive"))
            sentiment.Overall = SentimentType.Positive;
        else if (lowerResponse.Contains("negative"))
            sentiment.Overall = SentimentType.Negative;
        else if (lowerResponse.Contains("mixed"))
            sentiment.Overall = SentimentType.Mixed;
            
        return sentiment;
    }
    
    private List<string> ExtractKeyPhrases(string response)
    {
        // Extract key phrases from the analysis response
        var keyPhrases = new List<string>();
        var lines = response.Split('\n');
        
        foreach (var line in lines)
        {
            if (line.ToLowerInvariant().Contains("key") && (line.Contains("phrase") || line.Contains("word")))
            {
                // Simple extraction - in production you'd want more sophisticated parsing
                var phrases = line.Split(',', ';')
                                 .Select(p => p.Trim())
                                 .Where(p => p.Length > 3 && !p.ToLowerInvariant().Contains("key"))
                                 .Take(5);
                keyPhrases.AddRange(phrases);
            }
        }
        
        return keyPhrases.Take(10).ToList();
    }
    
    private List<string> ExtractTopics(string response)
    {
        var topics = new List<string>();
        var lines = response.Split('\n');
        
        foreach (var line in lines)
        {
            if (line.ToLowerInvariant().Contains("topic") || line.ToLowerInvariant().Contains("theme"))
            {
                var topicItems = line.Split(',', ';')
                                    .Select(t => t.Trim())
                                    .Where(t => t.Length > 3 && !t.ToLowerInvariant().Contains("topic"))
                                    .Take(3);
                topics.AddRange(topicItems);
            }
        }
        
        return topics.Take(5).ToList();
    }
    
    private int CountWords(string text) => 
        string.IsNullOrEmpty(text) ? 0 : text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;
    
    private int CountSentences(string text) =>
        string.IsNullOrEmpty(text) ? 0 : text.Split(new[] { '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries).Length;
    
    private int CountParagraphs(string text) =>
        string.IsNullOrEmpty(text) ? 0 : text.Split(new[] { "\n\n", "\r\n\r\n" }, StringSplitOptions.RemoveEmptyEntries).Length;
    
    private int EstimateTokens(string text) => 
        (int)Math.Ceiling(text.Length / 3.5); // Claude's token estimation
    
    private List<string> GenerateTagsFromKeywords(List<string> keywords, string? industry)
    {
        var tags = new List<string>(keywords.Take(5));
        
        if (!string.IsNullOrEmpty(industry))
            tags.Add(industry.ToLowerInvariant());
            
        return tags.Distinct().ToList();
    }
}