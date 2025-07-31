using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FluentAssertions;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Infrastructure.Services;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.DTOs;

namespace EnterpriseDocsCore.Tests.Unit.Services;

public class DigitalSignatureServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<DigitalSignatureService>> _loggerMock;
    private readonly Mock<IDocuSignService> _docuSignServiceMock;
    private readonly Mock<IAdobeSignService> _adobeSignServiceMock;
    private readonly DigitalSignatureService _digitalSignatureService;

    public DigitalSignatureServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<DigitalSignatureService>>();
        _docuSignServiceMock = new Mock<IDocuSignService>();
        _adobeSignServiceMock = new Mock<IAdobeSignService>();

        SetupConfiguration();

        _digitalSignatureService = new DigitalSignatureService(
            _context,
            _configurationMock.Object,
            _loggerMock.Object,
            _docuSignServiceMock.Object,
            _adobeSignServiceMock.Object
        );
    }

    private void SetupConfiguration()
    {
        var docuSignSection = new Mock<IConfigurationSection>();
        docuSignSection.Setup(x => x.Exists()).Returns(true);
        docuSignSection.Setup(x => x["ApiKey"]).Returns("test-api-key");
        docuSignSection.Setup(x => x.GetValue<bool>("Enabled", true)).Returns(true);
        docuSignSection.Setup(x => x.GetValue<bool>("IsDefault", false)).Returns(false);

        var adobeSignSection = new Mock<IConfigurationSection>();
        adobeSignSection.Setup(x => x.Exists()).Returns(true);
        adobeSignSection.Setup(x => x["ClientId"]).Returns("test-client-id");
        adobeSignSection.Setup(x => x.GetValue<bool>("Enabled", true)).Returns(true);
        adobeSignSection.Setup(x => x.GetValue<bool>("IsDefault", false)).Returns(true);

        _configurationMock.Setup(x => x.GetSection("DigitalSignature:DocuSign")).Returns(docuSignSection.Object);
        _configurationMock.Setup(x => x.GetSection("DigitalSignature:AdobeSign")).Returns(adobeSignSection.Object);
    }

    [Fact]
    public async Task GetAvailableProvidersAsync_ShouldReturnConfiguredProviders()
    {
        // Act
        var providers = await _digitalSignatureService.GetAvailableProvidersAsync();

        // Assert
        providers.Should().HaveCount(2);
        
        var docuSignProvider = providers.FirstOrDefault(p => p.ProviderId == "docusign");
        docuSignProvider.Should().NotBeNull();
        docuSignProvider.Name.Should().Be("DocuSign");
        docuSignProvider.IsEnabled.Should().BeTrue();
        docuSignProvider.IsDefault.Should().BeFalse();

        var adobeSignProvider = providers.FirstOrDefault(p => p.ProviderId == "adobesign");
        adobeSignProvider.Should().NotBeNull();
        adobeSignProvider.Name.Should().Be("Adobe Sign");
        adobeSignProvider.IsEnabled.Should().BeTrue();
        adobeSignProvider.IsDefault.Should().BeTrue();
    }

    [Fact]  
    public async Task CreateSignatureRequestAsync_ShouldCreateValidRequest()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            TenantId = Guid.NewGuid()
        };
        
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        var createRequest = new CreateSignatureRequestDto
        {
            DocumentId = documentId,
            ProviderId = "docusign",
            Title = "Test Signature Request",
            Message = "Please sign this document",
            Signers = new List<SignerDto>
            {
                new SignerDto
                {
                    Name = "John Doe",
                    Email = "john.doe@example.com",
                    Role = "Signer",
                    SigningOrder = 1,
                    IsRequired = true
                }
            },
            WorkflowType = SignatureWorkflowType.Sequential,
            RequireEmailVerification = true,
            AllowDecline = true
        };

        // Act
        var result = await _digitalSignatureService.CreateSignatureRequestAsync(createRequest);

        // Assert
        result.Should().NotBeNull();
        result.DocumentId.Should().Be(documentId);
        result.ProviderId.Should().Be("docusign");
        result.Title.Should().Be("Test Signature Request");
        result.Status.Should().Be(SignatureRequestStatus.Draft);
        result.Signers.Should().HaveCount(1);
        result.Signers.First().Name.Should().Be("John Doe");
        result.Signers.First().Email.Should().Be("john.doe@example.com");

        // Verify database entities were created
        var signatureRequest = await _context.SignatureRequests
            .Include(r => r.Signers)
            .FirstOrDefaultAsync(r => r.Id == result.Id);

        signatureRequest.Should().NotBeNull();
        signatureRequest.Signers.Should().HaveCount(1);
    }

    [Fact]
    public async Task CreateSignatureRequestAsync_WithInvalidDocument_ShouldThrowException()
    {
        // Arrange
        var createRequest = new CreateSignatureRequestDto
        {
            DocumentId = Guid.NewGuid(), // Non-existent document
            ProviderId = "docusign",
            Title = "Test Signature Request"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _digitalSignatureService.CreateSignatureRequestAsync(createRequest)
        );
    }

    [Fact]
    public async Task GetSignatureRequestAsync_ShouldReturnCorrectRequest()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            TenantId = Guid.NewGuid()
        };
        
        _context.Documents.Add(document);

        var signatureRequest = new SignatureRequest
        {
            Id = Guid.NewGuid(),
            DocumentId = documentId,
            ProviderId = "docusign",
            Title = "Test Request",
            Message = "Test Message",
            Status = SignatureRequestStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid()
        };

        _context.SignatureRequests.Add(signatureRequest);

        var signer = new SignatureRequestSigner
        {
            Id = Guid.NewGuid(),
            SignatureRequestId = signatureRequest.Id,
            Name = "Test Signer",
            Email = "test@example.com",
            Role = "Signer",
            SigningOrder = 1,
            IsRequired = true,
            Status = SignerStatus.Created
        };

        _context.SignatureRequestSigners.Add(signer);
        await _context.SaveChangesAsync();

        // Act
        var result = await _digitalSignatureService.GetSignatureRequestAsync(signatureRequest.Id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(signatureRequest.Id);
        result.DocumentId.Should().Be(documentId);
        result.Title.Should().Be("Test Request");
        result.Signers.Should().HaveCount(1);
        result.Signers.First().Name.Should().Be("Test Signer");
    }

    [Fact]
    public async Task GetSignatureRequestAsync_WithNonExistentId_ShouldReturnNull()
    {
        // Act
        var result = await _digitalSignatureService.GetSignatureRequestAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SendSignatureRequestAsync_ShouldUpdateStatusAndCreateAuditEntry()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var document = new Document
        {
            Id = documentId,
            Title = "Test Document",
            TenantId = Guid.NewGuid()
        };

        _context.Documents.Add(document);

        var signatureRequest = new SignatureRequest
        {
            Id = Guid.NewGuid(),
            DocumentId = documentId,
            ProviderId = "docusign",
            Title = "Test Request",
            Status = SignatureRequestStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid()
        };

        _context.SignatureRequests.Add(signatureRequest);

        var signer = new SignatureRequestSigner
        {
            Id = Guid.NewGuid(),
            SignatureRequestId = signatureRequest.Id,
            Name = "Test Signer",
            Email = "test@example.com",
            Status = SignerStatus.Created
        };

        _context.SignatureRequestSigners.Add(signer);
        await _context.SaveChangesAsync();

        var sendRequest = new SendSignatureRequestDto
        {
            Subject = "Please sign this document",
            Message = "Your signature is required",
            SendImmediately = true
        };

        // Act
        var result = await _digitalSignatureService.SendSignatureRequestAsync(signatureRequest.Id, sendRequest);

        // Assert
        result.Should().BeTrue();

        // Verify status was updated
        var updatedRequest = await _context.SignatureRequests
            .Include(r => r.Signers)
            .FirstOrDefaultAsync(r => r.Id == signatureRequest.Id);

        updatedRequest.Should().NotBeNull();
        updatedRequest.Status.Should().Be(SignatureRequestStatus.Sent);
        updatedRequest.SentAt.Should().NotBeNull();
        updatedRequest.ProviderRequestId.Should().NotBeNullOrEmpty();

        // Verify signer status was updated
        updatedRequest.Signers.All(s => s.Status == SignerStatus.Sent).Should().BeTrue();

        // Verify audit entry was created
        var auditEntry = await _context.SignatureAuditEntries
            .FirstOrDefaultAsync(a => a.SignatureRequestId == signatureRequest.Id);

        auditEntry.Should().NotBeNull();
        auditEntry.Action.Should().Be("RequestSent");
    }

    [Fact]
    public async Task CancelSignatureRequestAsync_ShouldUpdateStatusAndCreateAuditEntry()
    {
        // Arrange
        var signatureRequest = new SignatureRequest
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            ProviderId = "docusign",
            Status = SignatureRequestStatus.Sent,
            ProviderRequestId = "provider_123",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid()
        };

        _context.SignatureRequests.Add(signatureRequest);
        await _context.SaveChangesAsync();

        // Act
        var result = await _digitalSignatureService.CancelSignatureRequestAsync(
            signatureRequest.Id, 
            "No longer needed"
        );

        // Assert
        result.Should().BeTrue();

        var updatedRequest = await _context.SignatureRequests
            .FirstOrDefaultAsync(r => r.Id == signatureRequest.Id);

        updatedRequest.Should().NotBeNull();
        updatedRequest.Status.Should().Be(SignatureRequestStatus.Cancelled);

        // Verify audit entry
        var auditEntry = await _context.SignatureAuditEntries
            .FirstOrDefaultAsync(a => a.SignatureRequestId == signatureRequest.Id 
                                    && a.Action == "RequestCancelled");

        auditEntry.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSignatureStatusAsync_ShouldReturnCorrectStatus()
    {
        // Arrange
        var signatureRequest = new SignatureRequest
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            ProviderId = "docusign",
            Status = SignatureRequestStatus.InProgress,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid()
        };

        _context.SignatureRequests.Add(signatureRequest);

        var signers = new List<SignatureRequestSigner>
        {
            new SignatureRequestSigner
            {
                Id = Guid.NewGuid(),
                SignatureRequestId = signatureRequest.Id,
                Name = "Signer 1",
                Email = "signer1@example.com",
                Status = SignerStatus.Signed,
                SignedAt = DateTime.UtcNow.AddHours(-1)
            },
            new SignatureRequestSigner
            {
                Id = Guid.NewGuid(),
                SignatureRequestId = signatureRequest.Id,
                Name = "Signer 2", 
                Email = "signer2@example.com",
                Status = SignerStatus.Delivered,
                DeliveredAt = DateTime.UtcNow.AddMinutes(-30)
            }
        };

        _context.SignatureRequestSigners.AddRange(signers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _digitalSignatureService.GetSignatureStatusAsync(signatureRequest.Id);

        // Assert
        result.Should().NotBeNull();
        result.RequestId.Should().Be(signatureRequest.Id);
        result.Status.Should().Be(SignatureRequestStatus.InProgress);
        result.SignerStatuses.Should().HaveCount(2);
        result.CompletionPercentage.Should().Be(50); // 1 of 2 signers completed

        var signer1Status = result.SignerStatuses.First(s => s.SignerEmail == "signer1@example.com");
        signer1Status.Status.Should().Be(SignerStatus.Signed);
        signer1Status.SignedAt.Should().NotBeNull();

        var signer2Status = result.SignerStatuses.First(s => s.SignerEmail == "signer2@example.com");
        signer2Status.Status.Should().Be(SignerStatus.Delivered);
        signer2Status.DeliveredAt.Should().NotBeNull();
    }

    [Fact]
    public async Task VerifySignatureAsync_ShouldReturnValidationResult()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var documentContent = new byte[] { 1, 2, 3, 4, 5 };

        // Act
        var result = await _digitalSignatureService.VerifySignatureAsync(documentId, documentContent);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.VerifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.VerificationMethod.Should().Be("Basic Verification");
    }

    [Fact]
    public async Task GetSignatureAuditTrailAsync_ShouldReturnAuditEntries()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var auditEntries = new List<SignatureAuditEntry>
        {
            new SignatureAuditEntry
            {
                Id = Guid.NewGuid(),
                SignatureRequestId = requestId,
                Action = "RequestCreated",
                ActorEmail = "user@example.com",
                ActorName = "Test User",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent"
            },
            new SignatureAuditEntry
            {
                Id = Guid.NewGuid(),
                SignatureRequestId = requestId,
                Action = "RequestSent",
                ActorEmail = "user@example.com",
                ActorName = "Test User", 
                Timestamp = DateTime.UtcNow.AddHours(-1),
                IpAddress = "192.168.1.1",
                UserAgent = "Test Agent"
            }
        };

        _context.SignatureAuditEntries.AddRange(auditEntries);
        await _context.SaveChangesAsync();

        // Act
        var result = await _digitalSignatureService.GetSignatureAuditTrailAsync(requestId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeInAscendingOrder(a => a.Timestamp);

        var firstEntry = result.First();
        firstEntry.Action.Should().Be("RequestCreated");
        firstEntry.ActorEmail.Should().Be("user@example.com");

        var secondEntry = result.Last();
        secondEntry.Action.Should().Be("RequestSent");
    }

    [Theory]
    [InlineData("docusign")]
    [InlineData("adobesign")]
    public async Task CreateSignatureWorkflowAsync_ShouldCreateWorkflowWithSteps(string providerId)
    {
        // Arrange
        var createWorkflowRequest = new CreateSignatureWorkflowDto
        {
            Name = "Test Workflow",
            Type = SignatureWorkflowType.Sequential,
            Steps = new List<CreateSignatureWorkflowStepDto>
            {
                new CreateSignatureWorkflowStepDto
                {
                    Name = "Review Step",
                    Order = 1,
                    Type = SignatureWorkflowStepType.Review,
                    RequiredRoles = new List<string> { "Reviewer" }
                },
                new CreateSignatureWorkflowStepDto
                {
                    Name = "Approval Step",
                    Order = 2,
                    Type = SignatureWorkflowStepType.Approve,
                    RequiredRoles = new List<string> { "Approver" }
                },
                new CreateSignatureWorkflowStepDto
                {
                    Name = "Signature Step",
                    Order = 3,
                    Type = SignatureWorkflowStepType.Sign,
                    RequiredRoles = new List<string> { "Signer" }
                }
            },
            Configuration = new Dictionary<string, object>
            {
                ["ProviderId"] = providerId,
                ["AutoProgress"] = true
            }
        };

        // Act
        var result = await _digitalSignatureService.CreateSignatureWorkflowAsync(createWorkflowRequest);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Test Workflow");
        result.Type.Should().Be(SignatureWorkflowType.Sequential);
        result.Status.Should().Be(SignatureWorkflowStatus.Draft);

        // Verify workflow was saved to database
        var workflow = await _context.SignatureWorkflows
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == result.Id);

        workflow.Should().NotBeNull();
        workflow.Steps.Should().HaveCount(3);
        workflow.Steps.Should().BeInAscendingOrder(s => s.Order);

        var reviewStep = workflow.Steps.First(s => s.Order == 1);
        reviewStep.Name.Should().Be("Review Step");
        reviewStep.Type.Should().Be(SignatureWorkflowStepType.Review);
        reviewStep.Status.Should().Be(SignatureWorkflowStepStatus.Pending);
    }

    [Fact]
    public async Task ExecuteWorkflowStepAsync_ShouldCompleteStepAndReturnNextStep()
    {
        // Arrange
        var workflowId = Guid.NewGuid();
        var workflow = new SignatureWorkflow
        {
            Id = workflowId,
            Name = "Test Workflow",
            Type = SignatureWorkflowType.Sequential,
            Status = SignatureWorkflowStatus.Active,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.NewGuid()
        };

        _context.SignatureWorkflows.Add(workflow);

        var step1 = new SignatureWorkflowStep
        {
            Id = Guid.NewGuid(),
            WorkflowId = workflowId,
            Name = "Step 1",
            Order = 1,
            Type = SignatureWorkflowStepType.Review,
            Status = SignatureWorkflowStepStatus.InProgress
        };

        var step2 = new SignatureWorkflowStep
        {
            Id = Guid.NewGuid(),
            WorkflowId = workflowId,
            Name = "Step 2",
            Order = 2,
            Type = SignatureWorkflowStepType.Approve,
            Status = SignatureWorkflowStepStatus.Pending
        };

        _context.SignatureWorkflowSteps.AddRange(step1, step2);
        await _context.SaveChangesAsync();

        var executeRequest = new ExecuteWorkflowStepDto
        {
            UserId = Guid.NewGuid(),
            Action = "complete",
            Data = new Dictionary<string, object> { ["decision"] = "approved" },
            Comments = "Looks good"
        };

        // Act
        var result = await _digitalSignatureService.ExecuteWorkflowStepAsync(
            workflowId, 
            step1.Id, 
            executeRequest
        );

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.NewStatus.Should().Be(SignatureWorkflowStepStatus.Completed);
        result.NextStepId.Should().Be(step2.Id);

        // Verify step status was updated in database
        var updatedStep = await _context.SignatureWorkflowSteps
            .FirstOrDefaultAsync(s => s.Id == step1.Id);

        updatedStep.Should().NotBeNull();
        updatedStep.Status.Should().Be(SignatureWorkflowStepStatus.Completed);
    }

    [Fact]
    public async Task ExecuteWorkflowStepAsync_WithNonExistentStep_ShouldReturnFailure()
    {
        // Arrange
        var workflowId = Guid.NewGuid();
        var stepId = Guid.NewGuid();
        var executeRequest = new ExecuteWorkflowStepDto
        {
            UserId = Guid.NewGuid(),
            Action = "complete"
        };

        // Act
        var result = await _digitalSignatureService.ExecuteWorkflowStepAsync(
            workflowId, 
            stepId, 
            executeRequest
        );

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Workflow step not found");
        result.NewStatus.Should().Be(SignatureWorkflowStepStatus.Failed);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}