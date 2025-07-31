using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.API.DTOs;

namespace EnterpriseDocsCore.Tests.Integration;

public class CollaborationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public CollaborationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory database for testing
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
    public async Task CollaborationHub_JoinDocument_ShouldSucceed()
    {
        // Arrange - First create a document
        var documentRequest = new
        {
            Title = "Test Collaboration Document",
            Content = "This is test content for collaboration",
            DocumentType = "Contract",
            Industry = "Legal"
        };

        var documentJson = JsonSerializer.Serialize(documentRequest, _jsonOptions);
        var documentContent = new StringContent(documentJson, Encoding.UTF8, "application/json");

        // Create document
        var documentResponse = await _client.PostAsync("/api/documents", documentContent);
        documentResponse.IsSuccessStatusCode.Should().BeTrue();

        var documentResult = await documentResponse.Content.ReadAsStringAsync();
        var document = JsonSerializer.Deserialize<DocumentDto>(documentResult, _jsonOptions);

        // Act & Assert - Test SignalR connection would be done in a more sophisticated test
        // For now, testing the REST API endpoints that support collaboration

        // Test getting collaboration status
        var collaborationResponse = await _client.GetAsync($"/api/collaboration/documents/{document.Id}/status");
        collaborationResponse.IsSuccessStatusCode.Should().BeTrue();

        var collaborationResult = await collaborationResponse.Content.ReadAsStringAsync();
        collaborationResult.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task DocumentLocking_RequestAndReleaseLock_ShouldWorkCorrectly()
    {
        // Arrange - Create a document first
        await SeedTestDocument();
        var documentId = await GetFirstDocumentId();

        // Act - Request lock
        var lockRequest = new
        {
            DocumentId = documentId,
            UserId = Guid.NewGuid()
        };

        var lockJson = JsonSerializer.Serialize(lockRequest, _jsonOptions);
        var lockContent = new StringContent(lockJson, Encoding.UTF8, "application/json");

        var lockResponse = await _client.PostAsync($"/api/collaboration/documents/{documentId}/lock", lockContent);

        // Assert
        lockResponse.IsSuccessStatusCode.Should().BeTrue();

        var lockResult = await lockResponse.Content.ReadAsStringAsync();
        var lockInfo = JsonSerializer.Deserialize<DocumentLockInfo>(lockResult, _jsonOptions);

        lockInfo.Should().NotBeNull();
        lockInfo.DocumentId.Should().Be(documentId.ToString());
        lockInfo.IsActive.Should().BeTrue();

        // Act - Release lock
        var releaseResponse = await _client.DeleteAsync($"/api/collaboration/documents/{documentId}/lock");

        // Assert
        releaseResponse.IsSuccessStatusCode.Should().BeTrue();

        // Verify lock is released
        var statusResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/lock");
        statusResponse.IsSuccessStatusCode.Should().BeTrue();

        var statusResult = await statusResponse.Content.ReadAsStringAsync();
        // Should return null or empty when no lock exists
        if (!string.IsNullOrEmpty(statusResult) && statusResult != "null")
        {
            var lockStatus = JsonSerializer.Deserialize<DocumentLockInfo>(statusResult, _jsonOptions);
            lockStatus?.IsActive.Should().BeFalse();
        }
    }

    [Fact]
    public async Task ContentChanges_StoreAndRetrieve_ShouldWorkCorrectly()
    {
        // Arrange
        await SeedTestDocument();
        var documentId = await GetFirstDocumentId();

        var contentChange = new
        {
            DocumentId = documentId,
            UserId = Guid.NewGuid(),
            UserName = "Test User",
            Operation = "insert",
            StartPosition = 0,
            EndPosition = 5,
            Content = "Hello",
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

        // Act - Store content change
        var storeResponse = await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);

        // Assert
        storeResponse.IsSuccessStatusCode.Should().BeTrue();

        // Act - Retrieve content changes
        var since = DateTime.UtcNow.AddMinutes(-5);
        var retrieveResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/changes?since={since:O}");

        // Assert
        retrieveResponse.IsSuccessStatusCode.Should().BeTrue();

        var changesResult = await retrieveResponse.Content.ReadAsStringAsync();
        var changes = JsonSerializer.Deserialize<List<ContentChange>>(changesResult, _jsonOptions);

        changes.Should().NotBeNull();
        changes.Should().HaveCountGreaterThan(0);

        var storedChange = changes.First();
        storedChange.DocumentId.Should().Be(documentId.ToString());
        storedChange.Operation.Should().Be("insert");
        storedChange.Content.Should().Be("Hello");
    }

    [Fact]
    public async Task DocumentComments_AddAndRetrieve_ShouldWorkCorrectly()
    {
        // Arrange
        await SeedTestDocument();
        var documentId = await GetFirstDocumentId();

        var comment = new
        {
            DocumentId = documentId,
            UserId = Guid.NewGuid(),
            UserName = "Test Commenter",
            Content = "This is a test comment",
            Position = 10,
            CreatedAt = DateTime.UtcNow,
            IsResolved = false
        };

        var commentJson = JsonSerializer.Serialize(comment, _jsonOptions);
        var commentContent = new StringContent(commentJson, Encoding.UTF8, "application/json");

        // Act - Add comment
        var addResponse = await _client.PostAsync($"/api/collaboration/documents/{documentId}/comments", commentContent);

        // Assert
        addResponse.IsSuccessStatusCode.Should().BeTrue();

        // Act - Retrieve comments
        var retrieveResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/comments");

        // Assert
        retrieveResponse.IsSuccessStatusCode.Should().BeTrue();

        var commentsResult = await retrieveResponse.Content.ReadAsStringAsync();
        var comments = JsonSerializer.Deserialize<List<DocumentComment>>(commentsResult, _jsonOptions);

        comments.Should().NotBeNull();
        comments.Should().HaveCount(1);

        var retrievedComment = comments.First();
        retrievedComment.DocumentId.Should().Be(documentId.ToString());
        retrievedComment.Content.Should().Be("This is a test comment");
        retrievedComment.UserName.Should().Be("Test Commenter");
        retrievedComment.IsResolved.Should().BeFalse();
    }

    [Fact]
    public async Task UserPresence_UpdateAndRetrieve_ShouldWorkCorrectly()
    {
        // Arrange
        await SeedTestDocument();
        var documentId = await GetFirstDocumentId();

        var presence = new
        {
            UserId = Guid.NewGuid(),
            UserName = "Test User",
            Email = "test@example.com",
            Status = "active",
            CursorPosition = 25,
            LastSeen = DateTime.UtcNow,
            Color = "#FF5733"
        };

        var presenceJson = JsonSerializer.Serialize(presence, _jsonOptions);
        var presenceContent = new StringContent(presenceJson, Encoding.UTF8, "application/json");

        // Act - Update presence
        var updateResponse = await _client.PostAsync($"/api/collaboration/documents/{documentId}/presence", presenceContent);

        // Assert
        updateResponse.IsSuccessStatusCode.Should().BeTrue();

        // Act - Get active users
        var getUsersResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/users");

        // Assert
        getUsersResponse.IsSuccessStatusCode.Should().BeTrue();

        var usersResult = await getUsersResponse.Content.ReadAsStringAsync();
        var activeUsers = JsonSerializer.Deserialize<List<UserPresence>>(usersResult, _jsonOptions);

        activeUsers.Should().NotBeNull();
        activeUsers.Should().HaveCount(1);

        var user = activeUsers.First();
        user.UserName.Should().Be("Test User");
        user.Status.Should().Be("active");
        user.CursorPosition.Should().Be(25);
        user.Color.Should().Be("#FF5733");
    }

    [Fact]
    public async Task CollaborationHistory_ShouldTrackAllChanges()
    {
        // Arrange
        await SeedTestDocument();
        var documentId = await GetFirstDocumentId();

        // Add multiple changes
        var changes = new[]
        {
            new { Operation = "insert", Content = "Hello", Position = 0 },
            new { Operation = "insert", Content = " World", Position = 5 },
            new { Operation = "delete", Content = "", Position = 5, Length = 6 }
        };

        foreach (var change in changes)
        {
            var contentChange = new
            {
                DocumentId = documentId,
                UserId = Guid.NewGuid(),
                UserName = "Test User",
                Operation = change.Operation,
                StartPosition = change.Position,
                EndPosition = change.Position + (change.Content?.Length ?? change.Length ?? 0),
                Content = change.Content,
                Timestamp = DateTime.UtcNow,
                Version = 1
            };

            var changeJson = JsonSerializer.Serialize(contentChange, _jsonOptions);
            var changeContent = new StringContent(changeJson, Encoding.UTF8, "application/json");

            await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", changeContent);
            
            // Small delay to ensure different timestamps
            await Task.Delay(10);
        }

        // Act - Get collaboration history
        var historyResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/history");

        // Assert
        historyResponse.IsSuccessStatusCode.Should().BeTrue();

        var historyResult = await historyResponse.Content.ReadAsStringAsync();
        var history = JsonSerializer.Deserialize<List<ContentChange>>(historyResult, _jsonOptions);

        history.Should().NotBeNull();
        history.Should().HaveCount(3);

        // Verify changes are in chronological order
        history.Should().BeInAscendingOrder(h => h.Timestamp);

        // Verify operations
        history[0].Operation.Should().Be("insert");
        history[0].Content.Should().Be("Hello");
        
        history[1].Operation.Should().Be("insert");
        history[1].Content.Should().Be(" World");
        
        history[2].Operation.Should().Be("delete");
    }

    [Theory]
    [InlineData(1, 5)]   // Small document, few concurrent users
    [InlineData(10, 20)] // Medium load
    [InlineData(50, 100)] // High load simulation
    public async Task ConcurrentCollaboration_ShouldHandleMultipleUsers(int documentCount, int operationsPerDocument)
    {
        // Arrange - Create multiple documents
        var documentIds = new List<Guid>();
        for (int i = 0; i < documentCount; i++)
        {
            await SeedTestDocument($"Concurrent Test Document {i}");
            var docId = await GetFirstDocumentId(); // This will get the last created document
            documentIds.Add(docId);
        }

        // Act - Simulate concurrent operations on each document
        var tasks = new List<Task>();

        foreach (var documentId in documentIds)
        {
            for (int i = 0; i < operationsPerDocument; i++)
            {
                var operationIndex = i; // Capture loop variable
                var task = Task.Run(async () =>
                {
                    var userId = Guid.NewGuid();
                    
                    // Simulate various collaboration operations
                    var operations = new[]
                    {
                        () => SimulateContentChange(documentId, userId, operationIndex),
                        () => SimulatePresenceUpdate(documentId, userId),
                        () => SimulateComment(documentId, userId, operationIndex)
                    };

                    var operation = operations[operationIndex % operations.Length];
                    await operation();
                });

                tasks.Add(task);
            }
        }

        // Assert - All operations should complete without errors
        await Task.WhenAll(tasks);

        // Verify results
        foreach (var documentId in documentIds)
        {
            var changesResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/changes?since={DateTime.UtcNow.AddMinutes(-5):O}");
            changesResponse.IsSuccessStatusCode.Should().BeTrue();

            var usersResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/users");
            usersResponse.IsSuccessStatusCode.Should().BeTrue();

            var commentsResponse = await _client.GetAsync($"/api/collaboration/documents/{documentId}/comments");
            commentsResponse.IsSuccessStatusCode.Should().BeTrue();
        }
    }

    private async Task SimulateContentChange(Guid documentId, Guid userId, int operationIndex)
    {
        var contentChange = new
        {
            DocumentId = documentId,
            UserId = userId,
            UserName = $"User {userId:N}"[..8],
            Operation = operationIndex % 2 == 0 ? "insert" : "delete",
            StartPosition = operationIndex * 5,
            EndPosition = operationIndex * 5 + 3,
            Content = operationIndex % 2 == 0 ? "abc" : "",
            Timestamp = DateTime.UtcNow,
            Version = operationIndex + 1
        };

        var json = JsonSerializer.Serialize(contentChange, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        await _client.PostAsync($"/api/collaboration/documents/{documentId}/changes", content);
    }

    private async Task SimulatePresenceUpdate(Guid documentId, Guid userId)
    {
        var presence = new
        {
            UserId = userId,
            UserName = $"User {userId:N}"[..8],
            Email = $"user{userId:N}"[..8] + "@example.com",
            Status = "active",
            CursorPosition = new Random().Next(0, 100),
            LastSeen = DateTime.UtcNow,
            Color = $"#{new Random().Next(0x1000000):X6}"
        };

        var json = JsonSerializer.Serialize(presence, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        await _client.PostAsync($"/api/collaboration/documents/{documentId}/presence", content);
    }

    private async Task SimulateComment(Guid documentId, Guid userId, int commentIndex)
    {
        var comment = new
        {
            DocumentId = documentId,
            UserId = userId,
            UserName = $"User {userId:N}"[..8],
            Content = $"Comment {commentIndex} from user {userId:N}"[..8],
            Position = commentIndex * 10,
            CreatedAt = DateTime.UtcNow,
            IsResolved = false
        };

        var json = JsonSerializer.Serialize(comment, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        await _client.PostAsync($"/api/collaboration/documents/{documentId}/comments", content);
    }

    private async Task SeedTestDocument(string title = "Test Document")
    {
        var documentRequest = new
        {
            Title = title,
            Content = "This is test content for collaboration testing",
            DocumentType = "Contract",
            Industry = "Legal"
        };

        var json = JsonSerializer.Serialize(documentRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/documents", content);
        response.EnsureSuccessStatusCode();
    }

    private async Task<Guid> GetFirstDocumentId()
    {
        var response = await _client.GetAsync("/api/documents");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadAsStringAsync();
        var documents = JsonSerializer.Deserialize<List<DocumentDto>>(result, _jsonOptions);

        return documents.Should().NotBeEmpty().And.Subject.First().Id;
    }
}

// DTOs for testing (these would normally be imported from the main project)
public class DocumentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
}

public class DocumentLockInfo
{
    public string DocumentId { get; set; } = string.Empty;
    public string LockedBy { get; set; } = string.Empty;
    public string LockedByName { get; set; } = string.Empty;
    public string LockedAt { get; set; } = string.Empty;
    public string ExpiresAt { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class ContentChange
{
    public string Id { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public int StartPosition { get; set; }
    public int EndPosition { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int Version { get; set; }
}

public class DocumentComment
{
    public string Id { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
}

public class UserPresence
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CursorPosition { get; set; }
    public DateTime LastSeen { get; set; }
    public string Color { get; set; } = string.Empty;
}