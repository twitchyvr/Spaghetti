using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using EnterpriseDocsCore.API.Controllers;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using Xunit;
using FluentAssertions;

namespace EnterpriseDocsCore.Tests.Unit.Controllers;

public class DocumentControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IStorageService> _mockStorageService;
    private readonly Mock<ILogger<DocumentController>> _mockLogger;
    private readonly DocumentController _controller;
    private readonly Mock<IDocumentRepository> _mockDocumentRepository;
    private readonly Mock<IDocumentTagRepository> _mockDocumentTagRepository;

    public DocumentControllerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockStorageService = new Mock<IStorageService>();
        _mockLogger = new Mock<ILogger<DocumentController>>();
        _mockDocumentRepository = new Mock<IDocumentRepository>();
        _mockDocumentTagRepository = new Mock<IDocumentTagRepository>();

        _mockUnitOfWork.Setup(u => u.Documents).Returns(_mockDocumentRepository.Object);
        _mockUnitOfWork.Setup(u => u.DocumentTags).Returns(_mockDocumentTagRepository.Object);

        _controller = new DocumentController(
            _mockUnitOfWork.Object,
            _mockStorageService.Object,
            _mockLogger.Object);

        // Setup user claims for authentication
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim("TenantId", Guid.NewGuid().ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = principal
            }
        };
    }

    [Fact]
    public async Task GetDocuments_ShouldReturnPaginatedDocuments_WhenValidRequest()
    {
        // Arrange
        var request = new DocumentSearchRequest
        {
            Page = 1,
            PageSize = 10,
            SearchTerm = "test"
        };

        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tenantId = Guid.Parse(_controller.User.FindFirst("TenantId")!.Value);

        var documents = new List<Document>
        {
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Test Document 1",
                Content = "Test content",
                DocumentType = "Legal",
                Industry = "Technology",
                Status = DocumentStatus.Published,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                TenantId = tenantId,
                Tags = new List<DocumentTag>
                {
                    new DocumentTag { Name = "test", Category = "User" }
                }
            },
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Test Document 2",
                Content = "Another test content",
                DocumentType = "Contract",
                Industry = "Legal",
                Status = DocumentStatus.Draft,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                TenantId = tenantId,
                Tags = new List<DocumentTag>
                {
                    new DocumentTag { Name = "contract", Category = "User" }
                }
            }
        };

        _mockDocumentRepository
            .Setup(r => r.GetAccessibleDocumentsAsync(userId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(documents);

        // Act
        var result = await _controller.GetDocuments(request);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResponse<DocumentListResponse>>().Subject;

        response.Items.Should().HaveCount(2);
        response.Page.Should().Be(1);
        response.PageSize.Should().Be(10);
        response.TotalItems.Should().Be(2);
        response.Items.First().Title.Should().Be("Test Document 1");
    }

    [Fact]
    public async Task GetDocument_ShouldReturnDocument_WhenDocumentExistsAndUserHasAccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            Content = "Test content",
            DocumentType = "Legal",
            Industry = "Technology",
            Status = DocumentStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            Tags = new List<DocumentTag>(),
            Attachments = new List<DocumentAttachment>(),
            Metadata = new DocumentMetadata(),
            AIMetadata = null
        };

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(document);

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(documentId, userId, PermissionType.Read, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.GetDocument(documentId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DocumentResponse>().Subject;

        response.Id.Should().Be(documentId);
        response.Title.Should().Be("Test Document");
        response.DocumentType.Should().Be("Legal");
    }

    [Fact]
    public async Task GetDocument_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Document?)null);

        // Act
        var result = await _controller.GetDocument(documentId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetDocument_ShouldReturnForbidden_WhenUserDoesNotHaveAccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            CreatedBy = Guid.NewGuid() // Different user
        };

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(document);

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(documentId, userId, PermissionType.Read, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.GetDocument(documentId);

        // Assert
        result.Should().NotBeNull();
        result.Result.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task CreateDocument_ShouldReturnCreatedDocument_WhenValidRequest()
    {
        // Arrange
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tenantId = Guid.Parse(_controller.User.FindFirst("TenantId")!.Value);

        var request = new EnterpriseDocsCore.API.DTOs.CreateDocumentRequest
        {
            Title = "New Document",
            Content = "Document content",
            DocumentType = "Legal",
            Industry = "Technology",
            Status = DocumentStatus.Draft,
            Tags = new List<string> { "legal", "technology" }
        };

        var createdDocument = new Document
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            DocumentType = request.DocumentType,
            Industry = request.Industry,
            Status = request.Status,
            CreatedBy = userId,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Tags = new List<DocumentTag>(),
            Attachments = new List<DocumentAttachment>(),
            Metadata = new DocumentMetadata(),
            AIMetadata = null
        };

        _mockDocumentRepository
            .Setup(r => r.AddAsync(It.IsAny<Document>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDocument);

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(createdDocument.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDocument);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateDocument(request);

        // Assert
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var response = createdResult.Value.Should().BeOfType<DocumentResponse>().Subject;

        response.Title.Should().Be(request.Title);
        response.DocumentType.Should().Be(request.DocumentType);
        response.Status.Should().Be(request.Status);
    }

    [Fact]
    public async Task UpdateDocument_ShouldReturnUpdatedDocument_WhenValidRequest()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existingDocument = new Document
        {
            Id = documentId,
            Title = "Original Title",
            Content = "Original content",
            DocumentType = "Legal",
            Industry = "Technology",
            Status = DocumentStatus.Draft,
            CreatedBy = userId,
            Tags = new List<DocumentTag>(),
            Attachments = new List<DocumentAttachment>(),
            Metadata = new DocumentMetadata(),
            AIMetadata = null
        };

        var updateRequest = new EnterpriseDocsCore.API.DTOs.UpdateDocumentRequest
        {
            Title = "Updated Title",
            Content = "Updated content",
            Status = DocumentStatus.Published
        };

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDocument);

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(documentId, userId, PermissionType.Write, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.UpdateDocument(documentId, updateRequest);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DocumentResponse>().Subject;

        response.Title.Should().Be(updateRequest.Title);
        response.Status.Should().Be(updateRequest.Status.Value);
    }

    [Fact]
    public async Task DeleteDocument_ShouldReturnNoContent_WhenDocumentExistsAndUserHasAccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            CreatedBy = userId,
            Status = DocumentStatus.Published
        };

        _mockDocumentRepository
            .Setup(r => r.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(document);

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(documentId, userId, PermissionType.Delete, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.DeleteDocument(documentId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();

        // Verify the document status was updated to Deleted
        document.Status.Should().Be(DocumentStatus.Deleted);
    }

    [Fact]
    public async Task GetDocumentVersions_ShouldReturnVersions_WhenUserHasAccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var versions = new List<Document>
        {
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Document v1",
                Version = 1,
                IsLatestVersion = false,
                ParentDocumentId = documentId,
                Tags = new List<DocumentTag>()
            },
            new Document
            {
                Id = Guid.NewGuid(),
                Title = "Document v2",
                Version = 2,
                IsLatestVersion = true,
                ParentDocumentId = documentId,
                Tags = new List<DocumentTag>()
            }
        };

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(documentId, userId, PermissionType.Read, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockDocumentRepository
            .Setup(r => r.GetVersionsAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(versions);

        // Act
        var result = await _controller.GetDocumentVersions(documentId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<List<DocumentListResponse>>().Subject;

        response.Should().HaveCount(2);
        response[0].Version.Should().Be(1);
        response[1].Version.Should().Be(2);
        response[1].IsLatestVersion.Should().BeTrue();
    }

    [Fact]
    public async Task GetLatestVersion_ShouldReturnLatestVersion_WhenUserHasAccess()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var userId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var latestVersion = new Document
        {
            Id = Guid.NewGuid(),
            Title = "Latest Version",
            Version = 3,
            IsLatestVersion = true,
            ParentDocumentId = documentId,
            Tags = new List<DocumentTag>(),
            Attachments = new List<DocumentAttachment>(),
            Metadata = new DocumentMetadata(),
            AIMetadata = null
        };

        _mockDocumentRepository
            .Setup(r => r.GetLatestVersionAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(latestVersion);

        _mockDocumentRepository
            .Setup(r => r.HasUserAccessAsync(latestVersion.Id, userId, PermissionType.Read, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.GetLatestVersion(documentId);

        // Assert
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DocumentResponse>().Subject;

        response.Version.Should().Be(3);
        response.IsLatestVersion.Should().BeTrue();
        response.Title.Should().Be("Latest Version");
    }
}