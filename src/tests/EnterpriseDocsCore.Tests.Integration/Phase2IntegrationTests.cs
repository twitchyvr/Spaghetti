using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Domain.Entities;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace EnterpriseDocsCore.Tests.Integration;

/// <summary>
/// Phase 2 Integration Tests: Database Integration and Multi-Tenant Isolation
/// </summary>
public class Phase2IntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly ApplicationDbContext _context;
    private readonly Guid _testTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly Guid _otherTenantId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public Phase2IntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        
        // Get the database context for test setup
        var scope = _factory.Services.CreateScope();
        _context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Ensure database is created for testing
        _context.Database.EnsureCreated();
        
        SeedTestData().Wait();
    }

    [Fact]
    public async Task DatabaseHealth_ShouldReturnHealthyStatus()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/database-health");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var healthData = JsonSerializer.Deserialize<JsonElement>(content);
        
        healthData.GetProperty("status").GetString().Should().Be("healthy");
        healthData.GetProperty("connected").GetBoolean().Should().BeTrue();
        healthData.GetProperty("latency").GetDouble().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetDocuments_WithTenantHeader_ShouldReturnOnlyTenantDocuments()
    {
        // Arrange
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
        
        // Act
        var response = await _client.GetAsync("/api/document?page=1&pageSize=10");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content);
        
        var items = result.GetProperty("items").EnumerateArray();
        foreach (var item in items)
        {
            item.GetProperty("tenantId").GetString().Should().Be(_testTenantId.ToString());
        }
    }

    [Fact]
    public async Task GetUsers_WithTenantHeader_ShouldReturnOnlyTenantUsers()
    {
        // Arrange
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
        
        // Act
        var response = await _client.GetAsync("/api/user?page=1&pageSize=10");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content);
        
        var items = result.GetProperty("items").EnumerateArray();
        foreach (var item in items)
        {
            item.GetProperty("tenantId").GetString().Should().Be(_testTenantId.ToString());
        }
    }

    [Fact]
    public async Task CreateDocument_ShouldPersistToDatabase()
    {
        // Arrange
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
        
        var createRequest = new
        {
            Title = "Integration Test Document",
            Content = "This document was created during integration testing",
            DocumentType = "Test Document"
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/document", createRequest);
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var createdDoc = JsonSerializer.Deserialize<JsonElement>(content);
        
        var docId = Guid.Parse(createdDoc.GetProperty("id").GetString()!);
        
        // Verify it was saved to database
        var savedDoc = await _context.Documents.FirstOrDefaultAsync(d => d.Id == docId);
        savedDoc.Should().NotBeNull();
        savedDoc!.Title.Should().Be("Integration Test Document");
        savedDoc.TenantId.Should().Be(_testTenantId);
    }

    [Fact]
    public async Task MultiTenantIsolation_ShouldPreventCrossTenantAccess()
    {
        // Arrange - Create document for tenant A
        var docForTenantA = new Document
        {
            Id = Guid.NewGuid(),
            Title = "Tenant A Document",
            Content = "Private content for Tenant A",
            DocumentType = "Confidential",
            TenantId = _testTenantId,
            Status = DocumentStatus.Published,
            CreatedBy = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Documents.Add(docForTenantA);
        await _context.SaveChangesAsync();
        
        // Act - Try to access Tenant A's document as Tenant B
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _otherTenantId.ToString());
        
        var response = await _client.GetAsync($"/api/document/{docForTenantA.Id}");
        
        // Assert - Should not find the document (tenant isolation)
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DatabaseQueries_ShouldRespectTenantContext()
    {
        // Arrange
        var tenant1DocCount = await _context.Documents.CountAsync(d => d.TenantId == _testTenantId);
        var tenant2DocCount = await _context.Documents.CountAsync(d => d.TenantId == _otherTenantId);
        
        // Act & Assert - Tenant 1
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
        
        var tenant1Response = await _client.GetAsync("/api/document");
        tenant1Response.EnsureSuccessStatusCode();
        var tenant1Content = await tenant1Response.Content.ReadAsStringAsync();
        var tenant1Result = JsonSerializer.Deserialize<JsonElement>(tenant1Content);
        var tenant1ApiCount = tenant1Result.GetProperty("totalItems").GetInt32();
        
        // Act & Assert - Tenant 2
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _otherTenantId.ToString());
        
        var tenant2Response = await _client.GetAsync("/api/document");
        tenant2Response.EnsureSuccessStatusCode();
        var tenant2Content = await tenant2Response.Content.ReadAsStringAsync();
        var tenant2Result = JsonSerializer.Deserialize<JsonElement>(tenant2Content);
        var tenant2ApiCount = tenant2Result.GetProperty("totalItems").GetInt32();
        
        // Assert counts match database queries
        tenant1ApiCount.Should().Be(tenant1DocCount);
        tenant2ApiCount.Should().Be(tenant2DocCount);
    }

    [Fact]
    public async Task PaginationAndSorting_ShouldWorkCorrectly()
    {
        // Arrange
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", _testTenantId.ToString());
        
        // Act - Get first page
        var page1Response = await _client.GetAsync("/api/document?page=1&pageSize=2");
        page1Response.EnsureSuccessStatusCode();
        var page1Content = await page1Response.Content.ReadAsStringAsync();
        var page1Result = JsonSerializer.Deserialize<JsonElement>(page1Content);
        
        // Assert pagination metadata
        page1Result.GetProperty("page").GetInt32().Should().Be(1);
        page1Result.GetProperty("pageSize").GetInt32().Should().Be(2);
        page1Result.GetProperty("items").GetArrayLength().Should().BeLessOrEqualTo(2);
    }

    private async Task SeedTestData()
    {
        // Clear existing test data
        var existingDocs = _context.Documents.Where(d => 
            d.TenantId == _testTenantId || d.TenantId == _otherTenantId);
        _context.Documents.RemoveRange(existingDocs);
        
        var existingUsers = _context.Users.Where(u => 
            u.TenantId == _testTenantId || u.TenantId == _otherTenantId);
        _context.Users.RemoveRange(existingUsers);
        
        await _context.SaveChangesAsync();
        
        // Seed test tenants
        if (!await _context.Tenants.AnyAsync(t => t.Id == _testTenantId))
        {
            _context.Tenants.Add(new Tenant
            {
                Id = _testTenantId,
                Name = "Test Tenant A",
                Subdomain = "test-a",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        
        if (!await _context.Tenants.AnyAsync(t => t.Id == _otherTenantId))
        {
            _context.Tenants.Add(new Tenant
            {
                Id = _otherTenantId,
                Name = "Test Tenant B",
                Subdomain = "test-b",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        
        // Seed test users and documents
        var testUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        
        _context.Users.AddRange(
            new User
            {
                Id = testUserId,
                Email = "test@tenant-a.com",
                FirstName = "Test",
                LastName = "User A",
                TenantId = _testTenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = otherUserId,
                Email = "test@tenant-b.com",
                FirstName = "Test",
                LastName = "User B",
                TenantId = _otherTenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
        
        _context.Documents.AddRange(
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Tenant A Document 1",
                Content = "Content for Tenant A Document 1",
                DocumentType = "Test",
                TenantId = _testTenantId,
                Status = DocumentStatus.Published,
                CreatedBy = testUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Tenant A Document 2",
                Content = "Content for Tenant A Document 2",
                DocumentType = "Test",
                TenantId = _testTenantId,
                Status = DocumentStatus.Draft,
                CreatedBy = testUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Tenant B Document 1",
                Content = "Content for Tenant B Document 1",
                DocumentType = "Test",
                TenantId = _otherTenantId,
                Status = DocumentStatus.Published,
                CreatedBy = otherUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
        
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        // Clean up test data
        var testDocs = _context.Documents.Where(d => 
            d.TenantId == _testTenantId || d.TenantId == _otherTenantId);
        _context.Documents.RemoveRange(testDocs);
        
        var testUsers = _context.Users.Where(u => 
            u.TenantId == _testTenantId || u.TenantId == _otherTenantId);
        _context.Users.RemoveRange(testUsers);
        
        _context.SaveChanges();
        _context.Dispose();
        _client.Dispose();
    }
}
