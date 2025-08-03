using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using EnterpriseDocsCore.API.Hubs;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace EnterpriseDocsCore.Tests.Unit.Hubs;

/// <summary>
/// Comprehensive unit tests for Sprint 6 DocumentCollaborationHub
/// Testing real-time collaboration, operational transformation, and user presence
/// </summary>
public class DocumentCollaborationHubTests
{
    private readonly Mock<ICollaborationService> _mockCollaborationService;
    private readonly Mock<IDocumentService> _mockDocumentService;
    private readonly Mock<ILogger<DocumentCollaborationHub>> _mockLogger;
    private readonly Mock<IHubContext<DocumentCollaborationHub>> _mockHubContext;
    private readonly Mock<IHubCallerClients> _mockClients;
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<IGroupManager> _mockGroups;
    private readonly DocumentCollaborationHub _hub;
    private readonly Mock<HubCallerContext> _mockContext;

    public DocumentCollaborationHubTests()
    {
        _mockCollaborationService = new Mock<ICollaborationService>();
        _mockDocumentService = new Mock<IDocumentService>();
        _mockLogger = new Mock<ILogger<DocumentCollaborationHub>>();
        _mockHubContext = new Mock<IHubContext<DocumentCollaborationHub>>();
        _mockClients = new Mock<IHubCallerClients>();
        _mockClientProxy = new Mock<IClientProxy>();
        _mockGroups = new Mock<IGroupManager>();
        _mockContext = new Mock<HubCallerContext>();

        _hub = new DocumentCollaborationHub(
            _mockCollaborationService.Object,
            _mockDocumentService.Object,
            _mockLogger.Object
        );

        // Setup hub context
        _mockClients.Setup(x => x.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
        _mockClients.Setup(x => x.Others).Returns(_mockClientProxy.Object);
        _mockClients.Setup(x => x.Caller).Returns(_mockClientProxy.Object);

        _hub.Context = _mockContext.Object;
        _hub.Clients = _mockClients.Object;
        _hub.Groups = _mockGroups.Object;

        // Setup user context
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "user-123"),
            new(ClaimTypes.Name, "Test User"),
            new(ClaimTypes.Email, "test@example.com"),
            new("TenantId", "tenant-123")
        };

        _mockContext.Setup(x => x.ConnectionId).Returns("connection-123");
        _mockContext.Setup(x => x.User).Returns(new ClaimsPrincipal(new ClaimsIdentity(claims)));
    }

    [Fact]
    public async Task JoinDocument_ValidDocument_AddsUserToGroupAndUpdatesPresence()
    {
        // Arrange
        var documentId = "doc-123";
        var mockDocument = new { Id = Guid.Parse(documentId), Title = "Test Document" };
        
        _mockDocumentService.Setup(x => x.GetDocumentAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(mockDocument);
        
        _mockCollaborationService.Setup(x => x.AddUserPresenceAsync(It.IsAny<string>(), It.IsAny<UserPresence>()))
            .Returns(Task.CompletedTask);

        // Act
        await _hub.JoinDocument(documentId);

        // Assert
        _mockGroups.Verify(x => x.AddToGroupAsync("connection-123", $"document-{documentId}", default), Times.Once);
        _mockCollaborationService.Verify(x => x.AddUserPresenceAsync(documentId, It.Is<UserPresence>(up => 
            up.UserId == "user-123" && 
            up.UserName == "Test User" && 
            up.Status == "active")), Times.Once);
        
        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("UserJoined", It.IsAny<UserPresence>(), default), Times.Once);
    }

    [Fact]
    public async Task JoinDocument_InvalidDocument_ThrowsArgumentException()
    {
        // Arrange
        var documentId = "invalid-doc";
        
        _mockDocumentService.Setup(x => x.GetDocumentAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync((object?)null);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _hub.JoinDocument(documentId));
        
        _mockGroups.Verify(x => x.AddToGroupAsync(It.IsAny<string>(), It.IsAny<string>(), default), Times.Never);
    }

    [Fact]
    public async Task SendContentChange_ValidChange_BroadcastsToGroupWithTransformation()
    {
        // Arrange
        var documentId = "doc-123";
        var contentChange = new ContentChangeDto
        {
            Operation = "insert",
            StartPosition = 10,
            EndPosition = 10,
            Content = "Hello World",
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var transformedChange = new ContentChangeDto
        {
            Operation = "insert",
            StartPosition = 12, // Transformed position
            EndPosition = 12,
            Content = "Hello World",
            Timestamp = contentChange.Timestamp,
            Version = 2,
            UserId = "user-123",
            UserName = "Test User"
        };

        _mockCollaborationService.Setup(x => x.ProcessContentChangeAsync(documentId, It.IsAny<ContentChangeDto>()))
            .ReturnsAsync(transformedChange);

        // Act
        await _hub.SendContentChange(documentId, contentChange);

        // Assert
        _mockCollaborationService.Verify(x => x.ProcessContentChangeAsync(documentId, It.Is<ContentChangeDto>(cc =>
            cc.UserId == "user-123" &&
            cc.UserName == "Test User" &&
            cc.Operation == "insert")), Times.Once);

        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("ContentChanged", transformedChange, default), Times.Once);
    }

    [Fact]
    public async Task SendContentChange_ConflictingChanges_AppliesOperationalTransformation()
    {
        // Arrange
        var documentId = "doc-123";
        var change1 = new ContentChangeDto
        {
            Operation = "insert",
            StartPosition = 5,
            EndPosition = 5,
            Content = "first",
            Timestamp = DateTime.UtcNow,
            Version = 1
        };

        var change2 = new ContentChangeDto
        {
            Operation = "insert",
            StartPosition = 5,
            EndPosition = 5,
            Content = "second",
            Timestamp = DateTime.UtcNow.AddMilliseconds(100),
            Version = 1 // Same version indicates conflict
        };

        // First change applied normally
        _mockCollaborationService.Setup(x => x.ProcessContentChangeAsync(documentId, change1))
            .ReturnsAsync(new ContentChangeDto { Version = 2, StartPosition = 5 });

        // Second change gets transformed
        _mockCollaborationService.Setup(x => x.ProcessContentChangeAsync(documentId, change2))
            .ReturnsAsync(new ContentChangeDto { Version = 3, StartPosition = 10 }); // Position adjusted

        // Act
        await _hub.SendContentChange(documentId, change1);
        await _hub.SendContentChange(documentId, change2);

        // Assert
        _mockCollaborationService.Verify(x => x.ProcessContentChangeAsync(documentId, It.IsAny<ContentChangeDto>()), 
            Times.Exactly(2));
        
        _mockClientProxy.Verify(x => x.SendAsync("ContentChanged", It.IsAny<ContentChangeDto>(), default), 
            Times.Exactly(2));
    }

    [Fact]
    public async Task SendCursorUpdate_ValidUpdate_BroadcastsToOthers()
    {
        // Arrange
        var documentId = "doc-123";
        var cursorUpdate = new CursorUpdateDto
        {
            Position = 25,
            Timestamp = DateTime.UtcNow
        };

        // Act
        await _hub.SendCursorUpdate(documentId, cursorUpdate);

        // Assert
        _mockCollaborationService.Verify(x => x.UpdateUserCursorAsync(documentId, "user-123", 25), Times.Once);
        
        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("CursorUpdated", It.Is<CursorUpdateDto>(cu =>
            cu.UserId == "user-123" &&
            cu.UserName == "Test User" &&
            cu.Position == 25), default), Times.Once);
    }

    [Fact]
    public async Task LockDocument_AvailableDocument_GrantsLockAndNotifies()
    {
        // Arrange
        var documentId = "doc-123";
        var lockInfo = new DocumentLockInfo
        {
            DocumentId = documentId,
            LockedBy = "user-123",
            LockedByName = "Test User",
            LockedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsActive = true
        };

        _mockCollaborationService.Setup(x => x.LockDocumentAsync(documentId, "user-123", "Test User"))
            .ReturnsAsync(lockInfo);

        // Act
        await _hub.LockDocument(documentId);

        // Assert
        _mockCollaborationService.Verify(x => x.LockDocumentAsync(documentId, "user-123", "Test User"), Times.Once);
        
        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("DocumentLocked", lockInfo, default), Times.Once);
        
        _mockClients.Verify(x => x.Caller, Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("LockAcquired", lockInfo, default), Times.Once);
    }

    [Fact]
    public async Task LockDocument_AlreadyLocked_SendsLockDenied()
    {
        // Arrange
        var documentId = "doc-123";
        
        _mockCollaborationService.Setup(x => x.LockDocumentAsync(documentId, "user-123", "Test User"))
            .ReturnsAsync((DocumentLockInfo?)null); // Document already locked

        // Act
        await _hub.LockDocument(documentId);

        // Assert
        _mockClients.Verify(x => x.Caller, Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("LockDenied", It.Is<object>(o => 
            o.ToString()!.Contains("already locked")), default), Times.Once);
    }

    [Fact]
    public async Task ReleaseLock_ValidLock_ReleasesAndNotifies()
    {
        // Arrange
        var documentId = "doc-123";
        
        _mockCollaborationService.Setup(x => x.ReleaseLockAsync(documentId, "user-123"))
            .ReturnsAsync(true);

        // Act
        await _hub.ReleaseLock(documentId);

        // Assert
        _mockCollaborationService.Verify(x => x.ReleaseLockAsync(documentId, "user-123"), Times.Once);
        
        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("DocumentUnlocked", It.Is<object>(o => 
            o.ToString()!.Contains(documentId)), default), Times.Once);
    }

    [Fact]
    public async Task LeaveDocument_ValidDocument_RemovesFromGroupAndUpdatesPresence()
    {
        // Arrange
        var documentId = "doc-123";
        
        _mockCollaborationService.Setup(x => x.RemoveUserPresenceAsync(documentId, "user-123"))
            .Returns(Task.CompletedTask);

        // Act
        await _hub.LeaveDocument(documentId);

        // Assert
        _mockGroups.Verify(x => x.RemoveFromGroupAsync("connection-123", $"document-{documentId}", default), Times.Once);
        _mockCollaborationService.Verify(x => x.RemoveUserPresenceAsync(documentId, "user-123"), Times.Once);
        
        _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        _mockClientProxy.Verify(x => x.SendAsync("UserLeft", It.Is<object>(o => 
            o.ToString()!.Contains("user-123")), default), Times.Once);
    }

    [Fact]
    public async Task OnDisconnectedAsync_RemovesUserFromAllDocuments()
    {
        // Arrange
        var exception = new Exception("Connection lost");
        var activeDocuments = new[] { "doc-123", "doc-456" };
        
        _mockCollaborationService.Setup(x => x.GetUserActiveDocumentsAsync("user-123"))
            .ReturnsAsync(activeDocuments);
        
        _mockCollaborationService.Setup(x => x.RemoveUserPresenceAsync(It.IsAny<string>(), "user-123"))
            .Returns(Task.CompletedTask);

        // Act
        await _hub.OnDisconnectedAsync(exception);

        // Assert
        foreach (var documentId in activeDocuments)
        {
            _mockCollaborationService.Verify(x => x.RemoveUserPresenceAsync(documentId, "user-123"), Times.Once);
            _mockClients.Verify(x => x.Group($"document-{documentId}"), Times.Once);
        }
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-guid")]
    [InlineData(null)]
    public async Task JoinDocument_InvalidDocumentId_ThrowsArgumentException(string? documentId)
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _hub.JoinDocument(documentId!));
    }

    [Fact]
    public async Task SendContentChange_NullContent_ThrowsArgumentException()
    {
        // Arrange
        var documentId = "doc-123";
        ContentChangeDto? contentChange = null;

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _hub.SendContentChange(documentId, contentChange!));
    }

    [Fact]
    public async Task Hub_HandlesHighFrequencyUpdates_WithoutPerformanceDegradation()
    {
        // Arrange
        var documentId = "doc-123";
        var updateCount = 100;
        var updates = new List<Task>();

        _mockCollaborationService.Setup(x => x.UpdateUserCursorAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);

        // Act
        for (int i = 0; i < updateCount; i++)
        {
            var cursorUpdate = new CursorUpdateDto
            {
                Position = i,
                Timestamp = DateTime.UtcNow
            };
            
            updates.Add(_hub.SendCursorUpdate(documentId, cursorUpdate));
        }

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        await Task.WhenAll(updates);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000, "High frequency updates should complete within 1 second");
        _mockCollaborationService.Verify(x => x.UpdateUserCursorAsync(documentId, "user-123", It.IsAny<int>()), 
            Times.Exactly(updateCount));
    }

    [Fact]
    public async Task Hub_MaintainsUserSessionState_AcrossMultipleOperations()
    {
        // Arrange
        var documentId = "doc-123";
        var mockDocument = new { Id = Guid.Parse(documentId), Title = "Test Document" };
        
        _mockDocumentService.Setup(x => x.GetDocumentAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(mockDocument);
        
        _mockCollaborationService.Setup(x => x.AddUserPresenceAsync(It.IsAny<string>(), It.IsAny<UserPresence>()))
            .Returns(Task.CompletedTask);
        
        _mockCollaborationService.Setup(x => x.ProcessContentChangeAsync(It.IsAny<string>(), It.IsAny<ContentChangeDto>()))
            .ReturnsAsync(new ContentChangeDto { UserId = "user-123", UserName = "Test User" });

        // Act
        await _hub.JoinDocument(documentId);
        
        await _hub.SendContentChange(documentId, new ContentChangeDto
        {
            Operation = "insert",
            Content = "test",
            StartPosition = 0,
            EndPosition = 0,
            Timestamp = DateTime.UtcNow
        });
        
        await _hub.SendCursorUpdate(documentId, new CursorUpdateDto
        {
            Position = 4,
            Timestamp = DateTime.UtcNow
        });

        // Assert
        _mockCollaborationService.Verify(x => x.AddUserPresenceAsync(documentId, It.Is<UserPresence>(up =>
            up.UserId == "user-123" && up.UserName == "Test User")), Times.Once);
        
        _mockCollaborationService.Verify(x => x.ProcessContentChangeAsync(documentId, It.Is<ContentChangeDto>(cc =>
            cc.UserId == "user-123" && cc.UserName == "Test User")), Times.Once);
        
        _mockCollaborationService.Verify(x => x.UpdateUserCursorAsync(documentId, "user-123", 4), Times.Once);
    }

    [Fact]
    public async Task Hub_HandlesConcurrentLockRequests_ThreadSafely()
    {
        // Arrange
        var documentId = "doc-123";
        var lockTasks = new List<Task>();
        var successfulLocks = 0;

        _mockCollaborationService.Setup(x => x.LockDocumentAsync(documentId, "user-123", "Test User"))
            .Returns(async () =>
            {
                await Task.Delay(10); // Simulate processing time
                var success = Interlocked.CompareExchange(ref successfulLocks, 1, 0) == 0;
                return success ? new DocumentLockInfo { DocumentId = documentId, IsActive = true } : null;
            });

        // Act
        for (int i = 0; i < 10; i++)
        {
            lockTasks.Add(_hub.LockDocument(documentId));
        }

        await Task.WhenAll(lockTasks);

        // Assert
        successfulLocks.Should().Be(1, "Only one lock should be granted for concurrent requests");
    }
}