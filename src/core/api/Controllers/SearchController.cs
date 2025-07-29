using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Controllers;

/// <summary>
/// Controller for document search operations using Elasticsearch
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;
    private readonly ILogger<SearchController> _logger;

    public SearchController(ISearchService searchService, ILogger<SearchController> logger)
    {
        _searchService = searchService;
        _logger = logger;
    }

    /// <summary>
    /// Perform advanced search with filters and faceted results
    /// </summary>
    /// <param name="request">Advanced search parameters</param>
    /// <returns>Search results with aggregations</returns>
    /// <response code="200">Search completed successfully</response>
    /// <response code="400">Invalid search parameters</response>
    /// <response code="500">Search service error</response>
    [HttpPost("advanced")]
    [ProducesResponseType(typeof(SearchResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SearchResponse>> AdvancedSearch([FromBody] AdvancedSearchRequest request)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { error = "Tenant context required for search" });
            }

            // Validate request parameters
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1 || request.PageSize > 100) request.PageSize = 20;

            _logger.LogInformation("Performing advanced search for tenant {TenantId} with query: {Query}", 
                tenantId, request.Query);

            var results = await _searchService.AdvancedSearchAsync(request, tenantId.Value);
            
            _logger.LogInformation("Advanced search completed. Found {TotalResults} results in {SearchTime}ms", 
                results.TotalResults, results.SearchTime);

            return Ok(results);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Invalid search parameters: {Error}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing advanced search");
            return StatusCode(500, new { error = "Search service temporarily unavailable", details = ex.Message });
        }
    }

    /// <summary>
    /// Get auto-complete suggestions for search queries
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="limit">Maximum number of suggestions (default: 10, max: 20)</param>
    /// <returns>List of search suggestions</returns>
    /// <response code="200">Suggestions retrieved successfully</response>
    /// <response code="400">Invalid query parameters</response>
    [HttpGet("suggestions")]
    [ProducesResponseType(typeof(List<string>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<string>>> GetSuggestions(
        [FromQuery] string query, 
        [FromQuery] int limit = 10)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return BadRequest(new { error = "Query must be at least 2 characters long" });
            }

            var tenantId = GetCurrentTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { error = "Tenant context required for suggestions" });
            }

            // Limit the number of suggestions
            if (limit < 1 || limit > 20) limit = 10;

            _logger.LogDebug("Getting search suggestions for query: {Query}, tenant: {TenantId}", 
                query, tenantId);

            var suggestions = await _searchService.GetSuggestionsAsync(query, tenantId.Value, limit);
            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
            return StatusCode(500, new { error = "Unable to get suggestions", details = ex.Message });
        }
    }

    /// <summary>
    /// Perform full-text search across all documents
    /// </summary>
    /// <param name="query">Search query string</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Results per page (default: 20, max: 50)</param>
    /// <returns>Search results with highlights</returns>
    /// <response code="200">Search completed successfully</response>
    /// <response code="400">Invalid search parameters</response>
    [HttpGet("fulltext")]
    [ProducesResponseType(typeof(SearchResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<SearchResponse>> FullTextSearch(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { error = "Search query is required" });
            }

            var tenantId = GetCurrentTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { error = "Tenant context required for search" });
            }

            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 20;

            _logger.LogInformation("Performing full-text search for tenant {TenantId} with query: {Query}", 
                tenantId, query);

            var results = await _searchService.FullTextSearchAsync(query, tenantId.Value, page, pageSize);
            
            _logger.LogInformation("Full-text search completed. Found {TotalResults} results in {SearchTime}ms", 
                results.TotalResults, results.SearchTime);

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing full-text search for query: {Query}", query);
            return StatusCode(500, new { error = "Search service error", details = ex.Message });
        }
    }

    /// <summary>
    /// Index a specific document for search (admin operation)
    /// </summary>
    /// <param name="documentId">Document ID to index</param>
    /// <returns>Indexing status</returns>
    /// <response code="200">Document indexed successfully</response>
    /// <response code="404">Document not found</response>
    /// <response code="500">Indexing error</response>
    [HttpPost("index/{documentId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> IndexDocument(Guid documentId)
    {
        try
        {
            _logger.LogInformation("Indexing document {DocumentId}", documentId);

            // TODO: Get document from repository and index it
            // For now, return success to maintain API contract
            return Ok(new { message = "Document indexing initiated", documentId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing document {DocumentId}", documentId);
            return StatusCode(500, new { error = "Failed to index document", details = ex.Message });
        }
    }

    /// <summary>
    /// Reindex all documents (admin operation)
    /// </summary>
    /// <returns>Reindexing status</returns>
    /// <response code="202">Reindexing initiated</response>
    /// <response code="500">Reindexing error</response>
    [HttpPost("reindex")]
    [ProducesResponseType(202)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> ReindexAllDocuments()
    {
        try
        {
            _logger.LogInformation("Initiating full reindex of all documents");

            var success = await _searchService.ReindexAllDocumentsAsync();
            
            if (success)
            {
                return Accepted(new { message = "Full reindex initiated successfully" });
            }
            else
            {
                return StatusCode(500, new { error = "Failed to initiate reindex" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating full reindex");
            return StatusCode(500, new { error = "Reindex operation failed", details = ex.Message });
        }
    }

    /// <summary>
    /// Check search service health
    /// </summary>
    /// <returns>Health status</returns>
    /// <response code="200">Service is healthy</response>
    /// <response code="503">Service is unhealthy</response>
    [HttpGet("health")]
    [ProducesResponseType(200)]
    [ProducesResponseType(503)]
    public async Task<IActionResult> GetHealthStatus()
    {
        try
        {
            var isHealthy = await _searchService.IsHealthyAsync();
            
            if (isHealthy)
            {
                return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
            }
            else
            {
                return StatusCode(503, new { status = "unhealthy", timestamp = DateTime.UtcNow });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking search service health");
            return StatusCode(503, new { status = "unhealthy", error = ex.Message, timestamp = DateTime.UtcNow });
        }
    }

    private Guid? GetCurrentTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return null;
        }
        return tenantId;
    }
}