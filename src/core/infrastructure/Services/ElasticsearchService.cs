using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nest;
using System.Diagnostics;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Elasticsearch implementation of ISearchService for document search and indexing
/// </summary>
public class ElasticsearchService : ISearchService
{
    private readonly IElasticClient _elasticClient;
    private readonly ILogger<ElasticsearchService> _logger;
    private const string DocumentIndex = "enterprise-documents";

    public ElasticsearchService(IConfiguration configuration, ILogger<ElasticsearchService> logger)
    {
        _logger = logger;
        
        var elasticsearchUrl = configuration.GetConnectionString("Elasticsearch") ?? "http://localhost:9200";
        var settings = new ConnectionSettings(new Uri(elasticsearchUrl))
            .DefaultIndex(DocumentIndex)
            .DefaultMappingFor<DocumentSearchIndex>(m => m
                .IndexName(DocumentIndex)
                .IdProperty(d => d.Id))
            .DisableDirectStreaming();

        _elasticClient = new ElasticClient(settings);
        
        // Initialize index on startup (fire and forget)
        _ = Task.Run(async () => await InitializeIndexAsync());
    }

    public async Task<SearchResponse> AdvancedSearchAsync(AdvancedSearchRequest request, Guid tenantId)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var searchDescriptor = new SearchDescriptor<DocumentSearchIndex>()
                .Index(DocumentIndex)
                .From((request.Page - 1) * request.PageSize)
                .Size(request.PageSize)
                .Query(q => BuildQuery(q, request, tenantId))
                .Highlight(h => h
                    .Fields(f => f
                        .Field(doc => doc.Title)
                        .Field(doc => doc.Content)
                        .PreTags("<mark>")
                        .PostTags("</mark>")
                        .NumberOfFragments(3)
                        .FragmentSize(150)));

            var response = await _elasticClient.SearchAsync<DocumentSearchIndex>(searchDescriptor);
            
            if (!response.IsValid)
            {
                _logger.LogError("Elasticsearch query failed: {Error}", response.OriginalException?.Message);
                return new SearchResponse
                {
                    Documents = new List<DocumentSearchResult>(),
                    TotalResults = 0,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    SearchTime = stopwatch.ElapsedMilliseconds,
                    Aggregations = new Dictionary<string, int>()
                };
            }

            stopwatch.Stop();
            
            var results = response.Documents.Select(doc => new DocumentSearchResult
            {
                Id = doc.Id,
                Title = doc.Title,
                Summary = doc.Summary,
                Score = 0, // Simplified for now
                Highlights = new List<string>(), // Simplified for now
                DocumentType = doc.DocumentType,
                Industry = doc.Industry,
                CreatedAt = doc.CreatedAt,
                CreatedByName = doc.CreatedByName,
                Tags = doc.Tags
            }).ToList();

            return new SearchResponse
            {
                Documents = results,
                TotalResults = response.Total > 0 ? (int)response.Total : 0,
                Page = request.Page,
                PageSize = request.PageSize,
                SearchTime = stopwatch.ElapsedMilliseconds,
                Aggregations = new Dictionary<string, int>() // Simplified for now
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing advanced search for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<List<string>> GetSuggestionsAsync(string query, Guid tenantId, int limit = 10)
    {
        try
        {
            // Simple term-based suggestion for now
            var response = await _elasticClient.SearchAsync<DocumentSearchIndex>(s => s
                .Index(DocumentIndex)
                .Size(limit)
                .Query(q => q.Bool(b => b
                    .Must(m => m.Term(t => t.Field(f => f.TenantId).Value(tenantId)))
                    .Must(m => m.Wildcard(w => w
                        .Field(f => f.Title)
                        .Value($"*{query.ToLowerInvariant()}*")))))
                .Source(src => src.Includes(i => i.Field(f => f.Title))));

            if (!response.IsValid)
            {
                _logger.LogWarning("Suggestion query failed: {Error}", response.OriginalException?.Message);
                return new List<string>();
            }

            return response.Documents
                .Select(d => d.Title)
                .Where(title => !string.IsNullOrWhiteSpace(title))
                .Distinct()
                .Take(limit)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting suggestions for query: {Query}", query);
            return new List<string>();
        }
    }

    public async Task<SearchResponse> FullTextSearchAsync(string query, Guid tenantId, int page = 1, int pageSize = 20)
    {
        var request = new AdvancedSearchRequest
        {
            Query = query,
            Page = page,
            PageSize = pageSize,
            SortBy = "relevance"
        };
        
        return await AdvancedSearchAsync(request, tenantId);
    }

    public async Task<bool> IndexDocumentAsync(Document document)
    {
        try
        {
            var searchDoc = new DocumentSearchIndex
            {
                Id = document.Id,
                TenantId = document.TenantId ?? Guid.Empty,
                Title = document.Title,
                Content = document.Content,
                Summary = document.Content.Length > 200 ? document.Content[..200] + "..." : document.Content,
                DocumentType = document.DocumentType,
                Industry = document.Industry,
                CreatedAt = document.CreatedAt,
                CreatedByName = document.CreatedByUser?.FullName ?? "Unknown",
                Tags = document.Tags?.Select(dt => dt.Name ?? "").Where(name => !string.IsNullOrEmpty(name)).ToList() ?? new List<string>(),
                Status = document.Status.ToString()
            };

            var response = await _elasticClient.IndexDocumentAsync(searchDoc);
            
            if (!response.IsValid)
            {
                _logger.LogError("Failed to index document {DocumentId}: {Error}", 
                    document.Id, response.OriginalException?.Message);
                return false;
            }

            _logger.LogDebug("Successfully indexed document {DocumentId}", document.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing document {DocumentId}", document.Id);
            return false;
        }
    }

    public async Task<bool> RemoveDocumentFromIndexAsync(Guid documentId)
    {
        try
        {
            var response = await _elasticClient.DeleteAsync<DocumentSearchIndex>(documentId);
            
            if (!response.IsValid && response.Result != Result.NotFound)
            {
                _logger.LogError("Failed to remove document {DocumentId} from index: {Error}", 
                    documentId, response.OriginalException?.Message);
                return false;
            }

            _logger.LogDebug("Successfully removed document {DocumentId} from index", documentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing document {DocumentId} from index", documentId);
            return false;
        }
    }

    public async Task<bool> ReindexTenantDocumentsAsync(Guid tenantId)
    {
        try
        {
            // Delete existing documents for this tenant
            var deleteResponse = await _elasticClient.DeleteByQueryAsync<DocumentSearchIndex>(d => d
                .Index(DocumentIndex)
                .Query(q => q.Term(t => t.Field(f => f.TenantId).Value(tenantId))));

            if (!deleteResponse.IsValid)
            {
                _logger.LogError("Failed to delete existing documents for tenant {TenantId}: {Error}", 
                    tenantId, deleteResponse.OriginalException?.Message);
                return false;
            }

            _logger.LogInformation("Reindex completed for tenant {TenantId}. Deleted {DeletedCount} documents", 
                tenantId, deleteResponse.Deleted);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reindexing documents for tenant {TenantId}", tenantId);
            return false;
        }
    }

    public async Task<bool> ReindexAllDocumentsAsync()
    {
        try
        {
            // Delete all documents
            var deleteResponse = await _elasticClient.DeleteByQueryAsync<DocumentSearchIndex>(d => d
                .Index(DocumentIndex)
                .Query(q => q.MatchAll()));

            if (!deleteResponse.IsValid)
            {
                _logger.LogError("Failed to delete all documents: {Error}", deleteResponse.OriginalException?.Message);
                return false;
            }

            _logger.LogInformation("Full reindex initiated. Deleted {DeletedCount} documents", deleteResponse.Deleted);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing full reindex");
            return false;
        }
    }

    public async Task<bool> IsHealthyAsync()
    {
        try
        {
            var response = await _elasticClient.Cluster.HealthAsync();
            return response.IsValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking Elasticsearch health");
            return false;
        }
    }

    private async Task InitializeIndexAsync()
    {
        try
        {
            var existsResponse = await _elasticClient.Indices.ExistsAsync(DocumentIndex);
            if (existsResponse.Exists)
            {
                _logger.LogDebug("Index {IndexName} already exists", DocumentIndex);
                return;
            }

            var createResponse = await _elasticClient.Indices.CreateAsync(DocumentIndex, c => c
                .Map<DocumentSearchIndex>(m => m.AutoMap()));

            if (createResponse.IsValid)
            {
                _logger.LogInformation("Created Elasticsearch index: {IndexName}", DocumentIndex);
            }
            else
            {
                _logger.LogError("Failed to create index {IndexName}: {Error}", 
                    DocumentIndex, createResponse.OriginalException?.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Elasticsearch index");
        }
    }

    private QueryContainer BuildQuery(QueryContainerDescriptor<DocumentSearchIndex> q, AdvancedSearchRequest request, Guid tenantId)
    {
        var queries = new List<QueryContainer>
        {
            q.Term(t => t.Field(f => f.TenantId).Value(tenantId))
        };

        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            queries.Add(q.MultiMatch(m => m
                .Fields(f => f
                    .Field(doc => doc.Title, 3.0)
                    .Field(doc => doc.Content, 1.0))
                .Query(request.Query)
                .Type(TextQueryType.BestFields)
                .Fuzziness(Fuzziness.Auto)));
        }

        if (request.Tags?.Any() == true)
        {
            queries.Add(q.Terms(t => t.Field(f => f.Tags).Terms(request.Tags)));
        }

        if (request.DocumentTypes?.Any() == true)
        {
            queries.Add(q.Terms(t => t.Field(f => f.DocumentType).Terms(request.DocumentTypes)));
        }

        if (request.Industries?.Any() == true)
        {
            queries.Add(q.Terms(t => t.Field(f => f.Industry).Terms(request.Industries)));
        }

        if (request.FromDate.HasValue || request.ToDate.HasValue)
        {
            queries.Add(q.DateRange(d => d
                .Field(f => f.CreatedAt)
                .GreaterThanOrEquals(request.FromDate)
                .LessThanOrEquals(request.ToDate)));
        }

        if (request.Status.HasValue)
        {
            queries.Add(q.Term(t => t.Field(f => f.Status).Value(request.Status.ToString())));
        }

        return q.Bool(b => b.Must(queries.ToArray()));
    }
}

/// <summary>
/// Elasticsearch document mapping for search indexing
/// </summary>
public class DocumentSearchIndex
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Status { get; set; } = string.Empty;
}