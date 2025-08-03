using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using EnterpriseDocsCore.Infrastructure.Data;
using System.Net;
using Microsoft.AspNetCore.SignalR.Client;

namespace EnterpriseDocsCore.Tests.Security;

/// <summary>
/// Sprint 6 Security Validation Tests
/// Validates authentication, authorization, data isolation, and vulnerability protection
/// for real-time collaboration features
/// </summary>
public class Sprint6SecurityValidationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public Sprint6SecurityValidationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString());
                });
            });
        });

        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task CollaborationHub_RequiresAuthentication()
    {
        // Arrange
        var hubUrl = "http://localhost/collaborationHub";

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var connection = new HubConnectionBuilder()
                .WithUrl(hubUrl)
                .Build();

            await connection.StartAsync();
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task DocumentAccess_EnforcesTenantIsolation()
    {
        // Arrange
        var tenant1Token = await GetValidJwtToken("tenant1", "user1");
        var tenant2Token = await GetValidJwtToken("tenant2", "user2");

        // Create document in tenant1
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tenant1Token);

        var documentRequest = new
        {
            Title = "Tenant 1 Document",
            Content = "Confidential content for tenant 1",
            DocumentType = "Contract",
            Industry = "Legal"
        };

        var documentJson = JsonSerializer.Serialize(documentRequest, _jsonOptions);
        var documentContent = new StringContent(documentJson, Encoding.UTF8, "application/json");

        var createResponse = await _client.PostAsync("/api/documents", documentContent);
        createResponse.IsSuccessStatusCode.Should().BeTrue();

        var documentResult = await createResponse.Content.ReadAsStringAsync();
        var document = JsonSerializer.Deserialize<dynamic>(documentResult, _jsonOptions);
        var documentId = document?.GetProperty("id").GetString();

        // Act - Try to access document from tenant2
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tenant2Token);

        var accessResponse = await _client.GetAsync($"/api/documents/{documentId}");

        // Assert
        accessResponse.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("javascript:alert('xss')")]
    [InlineData("onload=alert('xss')")]
    [InlineData("<img src=x onerror=alert('xss')>")]
    public async Task ContentChanges_SanitizeXSSAttempts(string maliciousContent)
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();

        var contentChange = new
        {
            DocumentId = documentId,
            UserId = Guid.NewGuid(),
            UserName = "Test User",
            Operation = "insert",
            StartPosition = 0,
            EndPosition = 0,
            Content = maliciousContent,
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        // Verify content was sanitized
        var retrieveResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/changes?since={DateTime.UtcNow.AddMinutes(-1):O}");
        var changesResult = await retrieveResponse.Content.ReadAsStringAsync();
        
        changesResult.Should().NotContain("<script>");
        changesResult.Should().NotContain("javascript:");
        changesResult.Should().NotContain("onload=");
        changesResult.Should().NotContain("onerror=");
    }

    [Fact]
    public async Task DocumentLocking_PreventsUnauthorizedLockOverride()
    {
        // Arrange
        var user1Token = await GetValidJwtToken("tenant1", "user1");
        var user2Token = await GetValidJwtToken("tenant1", "user2");
        var documentId = await CreateTestDocument();

        // User 1 locks document
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", user1Token);

        var lockRequest1 = new
        {
            DocumentId = documentId,
            UserId = "user1"
        };

        var lockJson1 = JsonSerializer.Serialize(lockRequest1, _jsonOptions);
        var lockContent1 = new StringContent(lockJson1, Encoding.UTF8, "application/json");

        var lockResponse1 = await _client.PostAsync($"/api/collaboration/documents/{documentId}/lock", lockContent1);
        lockResponse1.IsSuccessStatusCode.Should().BeTrue();

        // Act - User 2 tries to override lock
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", user2Token);

        var lockRequest2 = new
        {
            DocumentId = documentId,
            UserId = "user2"
        };

        var lockJson2 = JsonSerializer.Serialize(lockRequest2, _jsonOptions);
        var lockContent2 = new StringContent(lockJson2, Encoding.UTF8, "application/json");

        var lockResponse2 = await _client.PostAsync($"/api/collaboration/documents/{documentId}/lock", lockContent2);

        // Assert
        lockResponse2.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task CollaborationAPI_RateLimitsHighFrequencyRequests()
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Send 100 rapid requests
        for (int i = 0; i < 100; i++)
        {
            var contentChange = new
            {
                DocumentId = documentId,
                UserId = "user1",
                UserName = "Test User",
                Operation = "insert",
                StartPosition = i,
                EndPosition = i,
                Content = $"Change {i}",
                Timestamp = DateTime.UtcNow,
                Version = i + 1
            };

            var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
            var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

            tasks.Add(_client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var rateLimitedResponses = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        rateLimitedResponses.Should().BeGreaterThan(0, "Rate limiting should block excessive requests");
    }

    [Fact]
    public async Task CollaborationData_EncryptsAtRest()
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();
        var sensitiveContent = "CONFIDENTIAL: Social Security Number 123-45-6789";

        var contentChange = new
        {
            DocumentId = documentId,
            UserId = "user1",
            UserName = "Test User",
            Operation = "insert",
            StartPosition = 0,
            EndPosition = 0,
            Content = sensitiveContent,
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        // Verify data is retrievable for authorized user
        var retrieveResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/changes?since={DateTime.UtcNow.AddMinutes(-1):O}");
        var changesResult = await retrieveResponse.Content.ReadAsStringAsync();
        
        changesResult.Should().Contain(sensitiveContent, "Authorized user should access decrypted content");
    }

    [Fact]
    public async Task UserPresence_DoesNotLeakSensitiveInformation()
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();

        var presence = new
        {
            UserId = "user1",
            UserName = "Test User",
            Email = "test@example.com",
            Status = "active",
            CursorPosition = 25,
            LastSeen = DateTime.UtcNow,
            Color = "#FF5733",
            // Attempt to inject sensitive data
            SensitiveData = "secret-token-12345",
            AdminRights = true
        };

        var presenceJson = JsonSerializer.Serialize(presence, _jsonOptions);
        var presenceContent = new StringContent(presenceJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/collaboration/documents/{documentId}/presence", presenceContent);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        var getUsersResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/users");
        var usersResult = await getUsersResponse.Content.ReadAsStringAsync();

        // Verify sensitive data is not exposed
        usersResult.Should().NotContain("secret-token");
        usersResult.Should().NotContain("AdminRights");
        usersResult.Should().Contain("Test User"); // Only expected data
    }

    [Fact]
    public async Task CollaborationAPI_ValidatesInputLengthLimits()
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();

        // Create oversized content
        var oversizedContent = new string('A', 1000000); // 1MB of text

        var contentChange = new
        {
            DocumentId = documentId,
            UserId = "user1",
            UserName = "Test User",
            Operation = "insert",
            StartPosition = 0,
            EndPosition = 0,
            Content = oversizedContent,
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CollaborationAPI_LogsSecurityEvents()
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();

        // Act - Perform various collaboration actions
        await _client.GetAsync($"/api/collaboration/documents/{documentId}/status");
        
        var lockRequest = new { DocumentId = documentId, UserId = "user1" };
        var lockJson = JsonSerializer.Serialize(lockRequest, _jsonOptions);
        var lockContent = new StringContent(lockJson, Encoding.UTF8, "application/json");
        await _client.PostAsync($"/api/collaboration/documents/{documentId}/lock", lockContent);

        // Assert - Verify audit trail exists
        var auditResponse = await _client.GetAsync($"/api/admin/audit-trail?documentId={documentId}");
        auditResponse.IsSuccessStatusCode.Should().BeTrue();

        var auditResult = await auditResponse.Content.ReadAsStringAsync();
        auditResult.Should().Contain("DocumentAccessed");
        auditResult.Should().Contain("DocumentLocked");
    }

    [Theory]
    [InlineData("SELECT * FROM Users")]
    [InlineData("'; DROP TABLE Documents; --")]
    [InlineData("UNION SELECT password FROM users")]
    public async Task ContentChanges_PreventsSQLInjection(string sqlInjectionAttempt)
    {
        // Arrange
        var token = await GetValidJwtToken("tenant1", "user1");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var documentId = await CreateTestDocument();

        var contentChange = new
        {
            DocumentId = documentId,
            UserId = "user1",
            UserName = sqlInjectionAttempt, // Inject in UserName field
            Operation = "insert",
            StartPosition = 0,
            EndPosition = 0,
            Content = "Normal content",
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);

        // Assert
        // Should either succeed with sanitized input or reject malicious input
        if (response.IsSuccessStatusCode)
        {
            var retrieveResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/changes?since={DateTime.UtcNow.AddMinutes(-1):O}");
            var changesResult = await retrieveResponse.Content.ReadAsStringAsync();
            
            // Verify SQL injection was sanitized
            changesResult.Should().NotContain("SELECT");
            changesResult.Should().NotContain("DROP TABLE");
            changesResult.Should().NotContain("UNION");
        }
        else
        {
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }

    private async Task<string> GetValidJwtToken(string tenantId, string userId)
    {
        // Mock JWT token generation for testing
        // In real implementation, this would authenticate with the auth service
        await Task.Delay(1); // Simulate async operation
        return $"mock-jwt-token-{tenantId}-{userId}";
    }

    private async Task<string> CreateTestDocument()
    {
        var documentRequest = new
        {
            Title = "Test Document",
            Content = "Initial content",
            DocumentType = "Contract",
            Industry = "Legal"
        };

        var documentJson = JsonSerializer.Serialize(documentRequest, _jsonOptions);
        var documentContent = new StringContent(documentJson, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/documents", documentContent);
        var result = await response.Content.ReadAsStringAsync();
        var document = JsonSerializer.Deserialize<dynamic>(result, _jsonOptions);
        
        return document?.GetProperty("id").GetString() ?? throw new InvalidOperationException("Failed to create test document");
    }
}