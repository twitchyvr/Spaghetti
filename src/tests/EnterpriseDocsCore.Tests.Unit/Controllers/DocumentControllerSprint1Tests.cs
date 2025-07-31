using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EnterpriseDocsCore.API.Controllers;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using System.Security.Claims;

namespace EnterpriseDocsCore.Tests.Unit.Controllers;

public class DocumentControllerSprint1Tests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IStorageService> _mockStorageService;
    private readonly Mock<ILogger<DocumentController>> _mockLogger;
    private readonly Mock<IDocumentRepository> _mockDocumentRepository;
    private readonly DocumentController _controller;

    public DocumentControllerSprint1Tests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockStorageService = new Mock<IStorageService>();
        _mockLogger = new Mock<ILogger<DocumentController>>();
        _mockDocumentRepository = new Mock<IDocumentRepository>();

        _mockUnitOfWork.Setup(x => x.Documents).Returns(_mockDocumentRepository.Object);

        _controller = new DocumentController(
            _mockUnitOfWork.Object,
            _mockStorageService.Object,
            _mockLogger.Object);

        // Setup controller context with user claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new("TenantId", Guid.NewGuid().ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
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
    public async Task GetDocuments_ShouldReturnPaginatedDocuments_Sprint1Requirement()
    {
        // Arrange - Test pagination support as per Sprint 1 Task 2
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var documents = new List<Document>
        {
            CreateTestDocument("Doc 1", userId, tenantId),
            CreateTestDocument("Doc 2", userId, tenantId),
            CreateTestDocument("Doc 3", userId, tenantId)
        };

        _mockDocumentRepository
            .Setup(x => x.GetAccessibleDocumentsAsync(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(documents);

        var searchRequest = new DocumentSearchRequest
        {
            Page = 1,
            PageSize = 2
        };

        // Act
        var result = await _controller.GetDocuments(searchRequest);

        // Assert - Verify pagination as per Sprint 1 requirements
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResponse<DocumentListResponse>>().Subject;
        
        response.Items.Should().HaveCount(2); // PageSize respected
        response.Page.Should().Be(1);
        response.PageSize.Should().Be(2);
        response.TotalItems.Should().Be(3);
        response.HasNextPage.Should().BeTrue();
        response.HasPreviousPage.Should().BeFalse();
    }

    [Fact]
    public async Task CreateDocument_ShouldCreateDocumentWithVersioning_Sprint1Requirement()
    {
        // Arrange - Test Document entity with versioning as per Sprint 1 Task 1
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createRequest = new EnterpriseDocsCore.API.DTOs.CreateDocumentRequest
        {
            Title = "Test Document",
            Content = "Test content",
            DocumentType = "Contract",
            Industry = "Legal",
            Status = DocumentStatus.Draft,
            Tags = new List<string> { "test", "sprint1" }
        };

        var createdDocument = CreateTestDocument(createRequest.Title, userId, tenantId);
        
        _mockDocumentRepository
            .Setup(x => x.AddAsync(It.IsAny<Document>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDocument);

        _mockDocumentRepository
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDocument);

        _mockUnitOfWork
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateDocument(createRequest);

        // Assert - Verify document creation with versioning fields
        result.Should().NotBeNull();
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var response = createdResult.Value.Should().BeOfType<DocumentResponse>().Subject;
        
        response.Title.Should().Be(createRequest.Title);
        response.Content.Should().Be(createRequest.Content);
        response.Version.Should().Be(1); // Initial version
        response.IsLatestVersion.Should().BeTrue(); // Sprint 1 versioning requirement
    }

    [Fact]
    public async Task UpdateDocument_ShouldUpdateDocument_Sprint1Requirement()
    {
        // Arrange - Test PUT endpoint as per Sprint 1 Task 3
        var documentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var existingDocument = CreateTestDocument("Original Title", userId, tenantId);
        existingDocument.Id = documentId;

        var updateRequest = new EnterpriseDocsCore.API.DTOs.UpdateDocumentRequest
        {
            Title = "Updated Title",
            Content = "Updated content",
            Status = DocumentStatus.InReview
        };

        _mockDocumentRepository
            .Setup(x => x.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDocument);

        _mockDocumentRepository
            .Setup(x => x.HasUserAccessAsync(documentId, It.IsAny<Guid>(), PermissionType.Write, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockDocumentRepository
            .Setup(x => x.UpdateAsync(It.IsAny<Document>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Document doc, CancellationToken _) => doc);

        _mockUnitOfWork
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.UpdateDocument(documentId, updateRequest);

        // Assert - Verify PUT endpoint functionality
        result.Should().NotBeNull();
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DocumentResponse>().Subject;
        
        response.Title.Should().Be(updateRequest.Title);
        response.Content.Should().Be(updateRequest.Content);
        response.Status.Should().Be(updateRequest.Status.Value);
    }

    [Fact]
    public async Task DeleteDocument_ShouldMarkDocumentAsDeleted_Sprint1Requirement()
    {
        // Arrange - Test DELETE endpoint as per Sprint 1 Task 3
        var documentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var document = CreateTestDocument("Document to Delete", userId, tenantId);
        document.Id = documentId;

        _mockDocumentRepository
            .Setup(x => x.GetByIdAsync(documentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(document);

        _mockDocumentRepository
            .Setup(x => x.HasUserAccessAsync(documentId, It.IsAny<Guid>(), PermissionType.Delete, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockDocumentRepository
            .Setup(x => x.UpdateAsync(It.IsAny<Document>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Document doc, CancellationToken _) => doc);

        _mockUnitOfWork
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.DeleteDocument(documentId);

        // Assert - Verify DELETE endpoint functionality (soft delete)
        result.Should().NotBeNull();
        result.Should().BeOfType<NoContentResult>();
        
        // Verify the document status was changed to Deleted
        _mockDocumentRepository.Verify(
            x => x.UpdateAsync(It.Is<Document>(d => d.Status == DocumentStatus.Deleted), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static Document CreateTestDocument(string title, Guid userId, Guid tenantId)
    {
        return new Document
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = "Test content",
            DocumentType = "Test",
            Industry = "Test",
            Status = DocumentStatus.Draft,
            CreatedBy = userId,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Version = 1,
            IsLatestVersion = true,
            Tags = new List<DocumentTag>(),
            Attachments = new List<DocumentAttachment>(),
            Permissions = new List<DocumentPermission>(),
            AuditEntries = new List<DocumentAuditEntry>()
        };
    }
}