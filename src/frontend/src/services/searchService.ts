// Sprint 2 Frontend Search Service Implementation
import { AdvancedSearchRequest, SearchResponse } from '../types/collaboration';
import api from './api';

class SearchServiceImpl {
  private readonly baseUrl = '/search';

  /**
   * Perform advanced search with filters and facets
   */
  async advancedSearch(request: AdvancedSearchRequest): Promise<SearchResponse> {
    try {
      const response = await api.post<SearchResponse>(
        `${this.baseUrl}/advanced`,
        request
      );
      
      return response;
    } catch (error) {
      console.error('Advanced search error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to perform advanced search'
      );
    }
  }

  /**
   * Get auto-complete suggestions for search queries
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const url = new URL(`${this.baseUrl}/suggestions`, window.location.origin);
      url.searchParams.append('query', query);
      url.searchParams.append('limit', limit.toString());
      
      const response = await api.get<string[]>(url.pathname + url.search);
      
      return response;
    } catch (error) {
      console.error('Search suggestions error:', error);
      // Return empty array on error to not break the UI
      return [];
    }
  }

  /**
   * Perform full-text search across all documents
   */
  async fullTextSearch(
    query: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<SearchResponse> {
    try {
      const url = new URL(`${this.baseUrl}/fulltext`, window.location.origin);
      url.searchParams.append('query', query);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      
      const response = await api.get<SearchResponse>(url.pathname + url.search);
      
      return response;
    } catch (error) {
      console.error('Full-text search error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to perform full-text search'
      );
    }
  }

  /**
   * Index a document for search (admin operation)
   */
  async indexDocument(documentId: string): Promise<void> {
    try {
      await api.post<void>(
        `${this.baseUrl}/index/${documentId}`
      );
    } catch (error) {
      console.error('Document indexing error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to index document'
      );
    }
  }

  /**
   * Reindex all documents (admin operation)
   */
  async reindexAllDocuments(): Promise<void> {
    try {
      await api.post<void>(
        `${this.baseUrl}/reindex`
      );
    } catch (error) {
      console.error('Reindex error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to reindex documents'
      );
    }
  }

  /**
   * Check search service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get<{ status: string }>(
        `${this.baseUrl}/health`
      );
      
      return response.status === 'healthy';
    } catch (error) {
      console.error('Search health check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const searchService = new SearchServiceImpl();

// Export default for easier importing
export default searchService;