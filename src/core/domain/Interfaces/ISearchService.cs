using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for search operations using Elasticsearch
/// </summary>
public interface ISearchService
{
    /// <summary>
    /// Perform advanced search with filters and pagination
    /// </summary>
    Task<SearchResponse> AdvancedSearchAsync(AdvancedSearchRequest request, Guid tenantId);
    
    /// <summary>
    /// Get auto-complete suggestions for search queries
    /// </summary>
    Task<List<string>> GetSuggestionsAsync(string query, Guid tenantId, int limit = 10);
    
    /// <summary>
    /// Perform full-text search across documents
    /// </summary>
    Task<SearchResponse> FullTextSearchAsync(string query, Guid tenantId, int page = 1, int pageSize = 20);
    
    /// <summary>
    /// Index a single document for search
    /// </summary>
    Task<bool> IndexDocumentAsync(Document document);
    
    /// <summary>
    /// Remove a document from the search index
    /// </summary>
    Task<bool> RemoveDocumentFromIndexAsync(Guid documentId);
    
    /// <summary>
    /// Reindex all documents for a tenant
    /// </summary>
    Task<bool> ReindexTenantDocumentsAsync(Guid tenantId);
    
    /// <summary>
    /// Reindex all documents in the system
    /// </summary>
    Task<bool> ReindexAllDocumentsAsync();
    
    /// <summary>
    /// Check if the search service is healthy
    /// </summary>
    Task<bool> IsHealthyAsync();
}

/// <summary>
/// Advanced search request with filters
/// </summary>
public class AdvancedSearchRequest
{
    public string Query { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }
    public List<string>? DocumentTypes { get; set; }
    public List<string>? Industries { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? CreatedBy { get; set; }
    public DocumentStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "relevance"; // relevance, date, title
    public string SortOrder { get; set; } = "desc"; // asc, desc
}

/// <summary>
/// Search response with results and metadata
/// </summary>
public class SearchResponse
{
    public List<DocumentSearchResult> Documents { get; set; } = new();
    public int TotalResults { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public double SearchTime { get; set; } // in milliseconds
    public Dictionary<string, int> Aggregations { get; set; } = new(); // facets
}

/// <summary>
/// Individual document search result
/// </summary>
public class DocumentSearchResult
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public float Score { get; set; }
    public List<string> Highlights { get; set; } = new();
    public string DocumentType { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
}