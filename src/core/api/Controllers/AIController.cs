using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Domain.Entities;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Controllers;

/// <summary>
/// AI services controller providing document generation, analysis, and other AI capabilities
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly IAIServiceProviderFactory _providerFactory;
    private readonly ILogger<AIController> _logger;
    
    public AIController(
        IAIService aiService,
        IAIServiceProviderFactory providerFactory,
        ILogger<AIController> logger)
    {
        _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
        _providerFactory = providerFactory ?? throw new ArgumentNullException(nameof(providerFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    /// <summary>
    /// Generate a document using AI
    /// </summary>
    [HttpPost("generate-document")]
    [Authorize(Policy = "Document.Create")]
    public async Task<ActionResult<DocumentOutput>> GenerateDocument([FromBody] GenerateDocumentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            request.UserId = userId;
            
            _logger.LogInformation("Generating document for user {UserId}: {DocumentType}", userId, request.DocumentType);
            
            var result = await _aiService.GenerateDocumentAsync(request, cancellationToken);
            
            _logger.LogInformation("Document generated successfully: {Title}", result.Title);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate document");
            return StatusCode(500, new { error = "Failed to generate document", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Analyze content using AI
    /// </summary>
    [HttpPost("analyze-content")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<ContentAnalysis>> AnalyzeContent([FromBody] AnalyzeContentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Analyzing content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.AnalyzeContentAsync(request.Content, request.Options, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze content");
            return StatusCode(500, new { error = "Failed to analyze content", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Summarize document content
    /// </summary>
    [HttpPost("summarize")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<string>> SummarizeContent([FromBody] SummarizeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Summarizing content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.SummarizeDocumentAsync(request.Content, request.Options, cancellationToken);
            
            return Ok(new { summary = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to summarize content");
            return StatusCode(500, new { error = "Failed to summarize content", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Extract keywords from content
    /// </summary>
    [HttpPost("extract-keywords")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<List<string>>> ExtractKeywords([FromBody] ExtractKeywordsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Extracting keywords from content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.ExtractKeywordsAsync(request.Content, request.MaxKeywords, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract keywords");
            return StatusCode(500, new { error = "Failed to extract keywords", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Improve document content
    /// </summary>
    [HttpPost("improve-content")]
    [Authorize(Policy = "Document.Write")]
    public async Task<ActionResult<string>> ImproveContent([FromBody] ImproveContentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Improving content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.ImproveDocumentAsync(request.Content, request.Options, cancellationToken);
            
            return Ok(new { improvedContent = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to improve content");
            return StatusCode(500, new { error = "Failed to improve content", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Suggest tags for content
    /// </summary>
    [HttpPost("suggest-tags")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<List<string>>> SuggestTags([FromBody] SuggestTagsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Suggesting tags for content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.SuggestTagsAsync(request.Content, request.Industry, request.MaxTags, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to suggest tags");
            return StatusCode(500, new { error = "Failed to suggest tags", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Analyze sentiment of content
    /// </summary>
    [HttpPost("analyze-sentiment")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<SentimentAnalysis>> AnalyzeSentiment([FromBody] AnalyzeSentimentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Analyzing sentiment: {Length} characters", request.Content.Length);
            
            var result = await _aiService.AnalyzeSentimentAsync(request.Content, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze sentiment");
            return StatusCode(500, new { error = "Failed to analyze sentiment", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Fill template with variables
    /// </summary>
    [HttpPost("fill-template")]
    [Authorize(Policy = "Document.Create")]
    public async Task<ActionResult<string>> FillTemplate([FromBody] FillTemplateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Filling template with {VariableCount} variables", request.Variables.Count);
            
            var result = await _aiService.FillTemplateAsync(request.Template, request.Variables, cancellationToken);
            
            return Ok(new { filledTemplate = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fill template");
            return StatusCode(500, new { error = "Failed to fill template", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Suggest next actions based on content
    /// </summary>
    [HttpPost("suggest-actions")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<List<string>>> SuggestNextActions([FromBody] SuggestActionsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Suggesting actions for content: {Length} characters", request.Content.Length);
            
            var result = await _aiService.SuggestNextActionsAsync(request.Content, request.Context, cancellationToken);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to suggest actions");
            return StatusCode(500, new { error = "Failed to suggest actions", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Get available AI models
    /// </summary>
    [HttpGet("models")]
    [Authorize(Policy = "Document.Read")]
    public async Task<ActionResult<List<AIModel>>> GetAvailableModels(CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.GetAvailableModelsAsync(cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get available models");
            return StatusCode(500, new { error = "Failed to get available models", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Get AI system health status
    /// </summary>
    [HttpGet("health")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult<SystemHealthResult>> GetSystemHealth(CancellationToken cancellationToken)
    {
        try
        {
            var result = await _providerFactory.GetSystemHealthAsync(cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get system health");
            return StatusCode(500, new { error = "Failed to get system health", details = ex.Message });
        }
    }
    
    /// <summary>
    /// Get AI usage statistics
    /// </summary>
    [HttpGet("usage-stats")]
    [Authorize(Policy = "ClientAdmin")]
    public async Task<ActionResult<AIUsageStats>> GetUsageStats(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _aiService.GetUsageStatsAsync(userId, from, to, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get usage stats");
            return StatusCode(500, new { error = "Failed to get usage stats", details = ex.Message });
        }
    }
    
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
        return userId;
    }
}

// Request DTOs
public class AnalyzeContentRequest
{
    public string Content { get; set; } = string.Empty;
    public AnalysisOptions? Options { get; set; }
}

public class SummarizeRequest
{
    public string Content { get; set; } = string.Empty;
    public SummaryOptions? Options { get; set; }
}

public class ExtractKeywordsRequest
{
    public string Content { get; set; } = string.Empty;
    public int MaxKeywords { get; set; } = 10;
}

public class ImproveContentRequest
{
    public string Content { get; set; } = string.Empty;
    public ImprovementOptions? Options { get; set; }
}

public class SuggestTagsRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public int MaxTags { get; set; } = 5;
}

public class AnalyzeSentimentRequest
{
    public string Content { get; set; } = string.Empty;
}

public class FillTemplateRequest
{
    public string Template { get; set; } = string.Empty;
    public Dictionary<string, object> Variables { get; set; } = new();
}

public class SuggestActionsRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Context { get; set; }
}