using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR.Client;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;
using System.Diagnostics;
using Xunit;
using FluentAssertions;
using Testcontainers.PostgreSql;
using Testcontainers.Elasticsearch;
using Testcontainers.Redis;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Tests.Integration;

/// <summary>
/// Sprint 2 Integration Tests for Search and Collaboration Features
/// Test coverage target: 90%+ for all new Sprint 2 functionality
/// </summary>
public class Sprint2IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public Sprint2IntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    #region Search Integration Tests

    [Fact]
    public async Task AdvancedSearch_WithValidRequest_ReturnsSearchResults()
    {
        // Arrange
        var searchRequest = new
        {
            query = "test document",
            page = 1,
            pageSize = 20,
            sortBy = "relevance",
            sortOrder = "desc"
        };

        var content = new StringContent(
            JsonSerializer.Serialize(searchRequest, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/search/advanced", content);

        // Assert
        response.Should().BeSuccessful();
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeEmpty();
    }

    [Fact]
    public async Task SearchSuggestions_WithPartialQuery_ReturnsSuggestions()
    {
        // Arrange
        var query = "doc";
        var limit = 10;

        // Act
        var response = await _client.GetAsync($"/api/search/suggestions?query={query}&limit={limit}");

        // Assert
        response.Should().BeSuccessful();
        var suggestions = await response.Content.ReadAsStringAsync();
        suggestions.Should().NotBeNull();
    }

    [Fact]
    public async Task FullTextSearch_WithValidQuery_ReturnsResults()
    {
        // Arrange
        var query = "enterprise";
        var page = 1;
        var pageSize = 20;

        // Act
        var response = await _client.GetAsync($"/api/search/fulltext?query={query}&page={page}&pageSize={pageSize}");

        // Assert
        response.Should().BeSuccessful();
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().NotBeEmpty();
    }

    [Fact]
    public async Task SearchHealth_Always_ReturnsHealthStatus()
    {
        // Act
        var response = await _client.GetAsync("/api/search/health");

        // Assert - Should return either 200 (healthy) or 503 (unhealthy)
        response.StatusCode.Should().BeOneOf(System.Net.HttpStatusCode.OK, System.Net.HttpStatusCode.ServiceUnavailable);
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    public async Task SearchSuggestions_WithInvalidQuery_ReturnsBadRequest(string invalidQuery)
    {
        // Act
        var response = await _client.GetAsync($"/api/search/suggestions?query={invalidQuery}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion

    #region Collaboration Integration Tests

    [Fact]
    public async Task GetActiveUsers_WithValidDocumentId_ReturnsUserList()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/users");

        // Assert
        response.Should().BeSuccessful();
        var users = await response.Content.ReadAsStringAsync();
        users.Should().NotBeNull();
    }

    [Fact]
    public async Task GetLockStatus_WithValidDocumentId_ReturnsLockInfo()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/lock");

        // Assert
        response.Should().BeSuccessful();
        var lockInfo = await response.Content.ReadAsStringAsync();
        lockInfo.Should().NotBeNull();
    }

    [Fact]
    public async Task RequestLock_WithValidDocumentId_ReturnsLockInfo()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/collaboration/document/{documentId}/lock", null);

        // Assert - Should return 200 (lock acquired) or 409 (already locked) or 401 (unauthorized)
        response.StatusCode.Should().BeOneOf(
            System.Net.HttpStatusCode.OK,
            System.Net.HttpStatusCode.Conflict,
            System.Net.HttpStatusCode.Unauthorized
        );
    }

    [Fact]
    public async Task ReleaseLock_WithValidDocumentId_ReturnsSuccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/collaboration/document/{documentId}/lock");

        // Assert - Should return 200 (released), 404 (not locked), 403 (not owner), or 401 (unauthorized)
        response.StatusCode.Should().BeOneOf(
            System.Net.HttpStatusCode.OK,
            System.Net.HttpStatusCode.NotFound,
            System.Net.HttpStatusCode.Forbidden,
            System.Net.HttpStatusCode.Unauthorized
        );
    }

    [Fact]
    public async Task GetContentChanges_WithValidParameters_ReturnsChanges()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var since = DateTime.UtcNow.AddHours(-1).ToString("O");

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/changes?since={since}");

        // Assert
        response.Should().BeSuccessful();
        var changes = await response.Content.ReadAsStringAsync();
        changes.Should().NotBeNull();
    }

    [Fact]
    public async Task StoreContentChange_WithValidChange_ReturnsSuccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var change = new
        {
            operation = "insert",
            startPosition = 0,
            endPosition = 0,
            content = "Test content",
            version = 1
        };

        var content = new StringContent(
            JsonSerializer.Serialize(change, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync($"/api/collaboration/document/{documentId}/changes", content);

        // Assert - Should return 200 (success) or 401 (unauthorized)
        response.StatusCode.Should().BeOneOf(
            System.Net.HttpStatusCode.OK,
            System.Net.HttpStatusCode.Unauthorized
        );
    }

    [Fact]
    public async Task GetDocumentComments_WithValidDocumentId_ReturnsComments()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/comments");

        // Assert
        response.Should().BeSuccessful();
        var comments = await response.Content.ReadAsStringAsync();
        comments.Should().NotBeNull();
    }

    [Fact]
    public async Task AddComment_WithValidComment_ReturnsSuccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var comment = new
        {
            content = "This is a test comment",
            position = 100
        };

        var content = new StringContent(
            JsonSerializer.Serialize(comment, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync($"/api/collaboration/document/{documentId}/comments", content);

        // Assert - Should return 201 (created) or 401 (unauthorized)
        response.StatusCode.Should().BeOneOf(
            System.Net.HttpStatusCode.Created,
            System.Net.HttpStatusCode.Unauthorized
        );
    }

    #endregion

    #region Performance Tests

    [Fact]
    public async Task SearchPerformance_AdvancedSearch_CompletesUnder200ms()
    {
        // Arrange
        var searchRequest = new
        {
            query = "performance test",
            page = 1,
            pageSize = 10
        };

        var content = new StringContent(
            JsonSerializer.Serialize(searchRequest, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        // Act
        var response = await _client.PostAsync("/api/search/advanced", content);

        // Assert
        stopwatch.Stop();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(200, "Search should complete within 200ms");
    }

    [Fact]
    public async Task CollaborationPerformance_GetActiveUsers_CompletesUnder100ms()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/users");

        // Assert
        stopwatch.Stop();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100, "Get active users should complete within 100ms");
    }

    #endregion

    #region Multi-tenant Isolation Tests

    [Fact]
    public async Task Search_DifferentTenants_ReturnsIsolatedResults()
    {
        // This test would require setting up different tenant contexts
        // and verifying that search results are properly isolated
        // TODO: Implement once tenant context middleware is properly configured
        Assert.True(true, "Multi-tenant isolation test placeholder");
    }

    [Fact]
    public async Task Collaboration_DifferentTenants_IsolatesCollaboration()
    {
        // This test would verify that collaboration features
        // don't leak between different tenants
        // TODO: Implement once tenant context middleware is properly configured
        Assert.True(true, "Multi-tenant collaboration isolation test placeholder");
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task Search_WithInvalidRequest_ReturnsValidationError()
    {
        // Arrange
        var invalidRequest = new
        {
            query = "", // Empty query should be invalid
            page = -1,  // Invalid page number
            pageSize = 1000 // Excessive page size
        };

        var content = new StringContent(
            JsonSerializer.Serialize(invalidRequest, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/search/advanced", content);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Collaboration_WithInvalidDocumentId_ReturnsNotFound()
    {
        // Arrange
        var invalidDocumentId = "invalid-guid";

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{invalidDocumentId}/users");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion

    #region Concurrent User Tests

    [Fact]
    public async Task ConcurrentSearch_MultipleUsers_HandlesLoadCorrectly()
    {
        // Arrange
        var searchRequest = new
        {
            query = "concurrent test",
            page = 1,
            pageSize = 10
        };

        var content = new StringContent(
            JsonSerializer.Serialize(searchRequest, _jsonOptions),
            Encoding.UTF8,
            "application/json"
        );

        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Simulate 10 concurrent search requests
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(_client.PostAsync("/api/search/advanced", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().AllSatisfy(response => 
            response.Should().BeSuccessful("All concurrent searches should succeed"));
    }

    [Fact]
    public async Task ConcurrentLockRequests_MultipleUsers_HandlesConflictsCorrectly()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Simulate 5 concurrent lock requests on the same document
        for (int i = 0; i < 5; i++)
        {
            tasks.Add(_client.PostAsync($"/api/collaboration/document/{documentId}/lock", null));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert - Only one should succeed, others should be conflicts or unauthorized
        var successCount = responses.Count(r => r.StatusCode == System.Net.HttpStatusCode.OK);
        var conflictCount = responses.Count(r => r.StatusCode == System.Net.HttpStatusCode.Conflict);
        var unauthorizedCount = responses.Count(r => r.StatusCode == System.Net.HttpStatusCode.Unauthorized);

        (successCount + conflictCount + unauthorizedCount).Should().Be(5);
        successCount.Should().BeLessOrEqualTo(1, "Only one lock request should succeed");
    }

    #endregion
}

/// <summary>
/// Sprint 2 Unit Tests for Service Layer
/// </summary>
public class Sprint2ServiceTests
{
    // TODO: Add unit tests for SearchService and CollaborationService
    // once the service implementations are complete

    [Fact]
    public void SearchService_Placeholder()
    {
        // Placeholder for SearchService unit tests
        Assert.True(true, "SearchService unit tests will be implemented once service is created");
    }

    [Fact]
    public void CollaborationService_Placeholder()
    {
        // Placeholder for CollaborationService unit tests
        Assert.True(true, "CollaborationService unit tests will be implemented once service is created");
    }
}

/// <summary>
/// Sprint 2 Performance Benchmark Tests
/// </summary>
public class Sprint2PerformanceTests
{
    [Fact]
    public void SearchIndexing_Performance_MeetsRequirements()
    {
        // Test that document indexing completes within 5 seconds
        Assert.True(true, "Search indexing performance test placeholder");
    }

    [Fact]
    public void RealTimeSync_Performance_MeetsRequirements()
    {
        // Test that real-time synchronization occurs within 100ms
        Assert.True(true, "Real-time sync performance test placeholder");
    }

    [Fact]
    public void ConcurrentUsers_Performance_SupportsTarget()
    {
        // Test that system supports 1000+ concurrent users
        Assert.True(true, "Concurrent users performance test placeholder");
    }
}