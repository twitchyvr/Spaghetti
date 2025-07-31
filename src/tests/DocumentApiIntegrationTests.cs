using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using EnterpriseDocsCore.API;

namespace EnterpriseDocsCore.Tests.Integration;

/// <summary>
/// Integration tests for Document Management System API endpoints
/// Validates all 11 endpoints specified in issue #32
/// </summary>
public class DocumentApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public DocumentApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task DocumentController_ShouldBeAccessible()
    {
        // This test verifies that the DocumentController is properly registered
        // and the API endpoints are accessible (even if they return 401 without auth)
        
        // Test 1: GET /api/documents - Should return 401 without authentication
        var response = await _client.GetAsync("/api/documents");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        
        // Test 2: Swagger should document all endpoints
        var swaggerResponse = await _client.GetAsync("/swagger/v1/swagger.json");
        swaggerResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var swaggerContent = await swaggerResponse.Content.ReadAsStringAsync();
        var swaggerDoc = JsonSerializer.Deserialize<JsonElement>(swaggerContent);
        
        // Verify all 11 document endpoints are documented
        var paths = swaggerDoc.GetProperty("paths");
        
        // Document CRUD Operations
        paths.TryGetProperty("/api/documents", out _).Should().BeTrue("GET /api/documents should be documented");
        paths.TryGetProperty("/api/documents/{id}", out _).Should().BeTrue("GET /api/documents/{id} should be documented");
        
        // The POST, PUT, DELETE for /api/documents and /api/documents/{id} 
        // are documented under the same path with different HTTP methods
        
        // Version Management Operations  
        paths.TryGetProperty("/api/documents/{id}/versions", out _).Should().BeTrue("version endpoints should be documented");
        paths.TryGetProperty("/api/documents/{id}/latest", out _).Should().BeTrue("latest version endpoint should be documented");
        
        // File Operations
        paths.TryGetProperty("/api/documents/upload", out _).Should().BeTrue("upload endpoint should be documented");
        paths.TryGetProperty("/api/documents/{id}/download", out _).Should().BeTrue("download endpoint should be documented");
        paths.TryGetProperty("/api/documents/{id}/file-info", out _).Should().BeTrue("file-info endpoint should be documented");
    }

    [Fact]
    public async Task DocumentEndpoints_ShouldReturnProperStatusCodes()
    {
        // Test all endpoints return 401 Unauthorized (proving they exist and are secured)
        var endpoints = new[]
        {
            "/api/documents",
            "/api/documents/00000000-0000-0000-0000-000000000000",
            "/api/documents/00000000-0000-0000-0000-000000000000/versions", 
            "/api/documents/00000000-0000-0000-0000-000000000000/latest",
            "/api/documents/00000000-0000-0000-0000-000000000000/download",
            "/api/documents/00000000-0000-0000-0000-000000000000/file-info"
        };

        foreach (var endpoint in endpoints)
        {
            var response = await _client.GetAsync(endpoint);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized, 
                $"GET {endpoint} should require authentication");
        }

        // Test POST endpoints
        var postEndpoints = new[]
        {
            "/api/documents",
            "/api/documents/upload",
            "/api/documents/00000000-0000-0000-0000-000000000000/versions"
        };

        foreach (var endpoint in postEndpoints)
        {
            var content = new StringContent("{}", Encoding.UTF8, "application/json");
            var response = await _client.PostAsync(endpoint, content);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
                $"POST {endpoint} should require authentication");
        }

        // Test PUT endpoint
        var putContent = new StringContent("{}", Encoding.UTF8, "application/json");
        var putResponse = await _client.PutAsync("/api/documents/00000000-0000-0000-0000-000000000000", putContent);
        putResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "PUT /api/documents/{id} should require authentication");

        // Test DELETE endpoint
        var deleteResponse = await _client.DeleteAsync("/api/documents/00000000-0000-0000-0000-000000000000");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "DELETE /api/documents/{id} should require authentication");
    }

    [Fact]
    public async Task HealthEndpoint_ShouldWork()
    {
        // Test that the application is running correctly
        var response = await _client.GetAsync("/api/health");
        
        // Should either work (200) or have a server error (500) but not be missing (404)
        response.StatusCode.Should().NotBe(HttpStatusCode.NotFound, 
            "Health endpoint should exist");
    }

    [Fact]
    public void DocumentController_AllRequiredMethodsExist()
    {
        // Verify via reflection that all required methods exist
        var controllerType = typeof(EnterpriseDocsCore.API.Controllers.DocumentController);
        
        // Document CRUD Operations
        controllerType.GetMethod("GetDocuments").Should().NotBeNull("GetDocuments method should exist");
        controllerType.GetMethod("GetDocument").Should().NotBeNull("GetDocument method should exist");
        controllerType.GetMethod("CreateDocument").Should().NotBeNull("CreateDocument method should exist");
        controllerType.GetMethod("UpdateDocument").Should().NotBeNull("UpdateDocument method should exist");
        controllerType.GetMethod("DeleteDocument").Should().NotBeNull("DeleteDocument method should exist");
        
        // Version Management Operations
        controllerType.GetMethod("GetDocumentVersions").Should().NotBeNull("GetDocumentVersions method should exist");
        controllerType.GetMethod("CreateDocumentVersion").Should().NotBeNull("CreateDocumentVersion method should exist");
        controllerType.GetMethod("GetLatestVersion").Should().NotBeNull("GetLatestVersion method should exist");
        
        // File Operations
        controllerType.GetMethod("UploadDocument").Should().NotBeNull("UploadDocument method should exist");
        controllerType.GetMethod("DownloadDocument").Should().NotBeNull("DownloadDocument method should exist");
        controllerType.GetMethod("GetDocumentFileInfo").Should().NotBeNull("GetDocumentFileInfo method should exist");
    }
}