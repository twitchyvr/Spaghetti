using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Infrastructure.Data;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Implementation of digital signature service with multiple provider support
/// </summary>
public class DigitalSignatureService : IDigitalSignatureService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DigitalSignatureService> _logger;
    private readonly IDocuSignService _docuSignService;
    private readonly IAdobeSignService _adobeSignService;
    private readonly Dictionary<string, IDigitalSignatureService> _providers;

    public DigitalSignatureService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<DigitalSignatureService> logger,
        IDocuSignService docuSignService,
        IAdobeSignService adobeSignService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _docuSignService = docuSignService;
        _adobeSignService = adobeSignService;

        _providers = new Dictionary<string, IDigitalSignatureService>
        {
            ["docusign"] = _docuSignService,
            ["adobesign"] = _adobeSignService
        };
    }

    public async Task<IEnumerable<SignatureProviderDto>> GetAvailableProvidersAsync()
    {
        var providers = new List<SignatureProviderDto>();

        // DocuSign provider
        var docuSignConfig = _configuration.GetSection("DigitalSignature:DocuSign");
        if (docuSignConfig.Exists() && !string.IsNullOrEmpty(docuSignConfig["ApiKey"]))
        {
            providers.Add(new SignatureProviderDto
            {
                ProviderId = "docusign",
                Name = "DocuSign",
                Description = "Industry-leading digital signature platform",
                IsEnabled = docuSignConfig.GetValue<bool>("Enabled", true),
                IsDefault = docuSignConfig.GetValue<bool>("IsDefault", false),
                SupportedFeatures = new List<string>
                {
                    "Sequential Signing",
                    "Parallel Signing",
                    "Templates",
                    "Bulk Send",
                    "Mobile Signing",
                    "Advanced Authentication"
                }
            });
        }

        // Adobe Sign provider
        var adobeSignConfig = _configuration.GetSection("DigitalSignature:AdobeSign");
        if (adobeSignConfig.Exists() && !string.IsNullOrEmpty(adobeSignConfig["ClientId"]))
        {
            providers.Add(new SignatureProviderDto
            {
                ProviderId = "adobesign",
                Name = "Adobe Sign",
                Description = "Adobe's comprehensive digital signature solution",
                IsEnabled = adobeSignConfig.GetValue<bool>("Enabled", true),
                IsDefault = adobeSignConfig.GetValue<bool>("IsDefault", false),
                SupportedFeatures = new List<string>
                {
                    "Sequential Signing",
                    "Parallel Signing",
                    "Library Templates",
                    "Web Forms",
                    "Mobile Signing",
                    "Government ID Authentication"
                }
            });
        }

        return providers;
    }

    public async Task<SignatureRequestDto> CreateSignatureRequestAsync(CreateSignatureRequestDto request)
    {
        try
        {
            // Validate document exists
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId);

            if (document == null)
            {
                throw new ArgumentException("Document not found");
            }

            // Get provider service
            var providerService = GetProviderService(request.ProviderId);

            // Create signature request entity
            var signatureRequest = new SignatureRequest
            {
                Id = Guid.NewGuid(),
                DocumentId = request.DocumentId,
                ProviderId = request.ProviderId,
                Title = request.Title,
                Message = request.Message,
                Status = SignatureRequestStatus.Draft,
                WorkflowType = request.WorkflowType,
                ExpirationDate = request.ExpirationDate,
                RequireEmailVerification = request.RequireEmailVerification,
                AllowDecline = request.AllowDecline,
                Metadata = JsonSerializer.Serialize(request.Metadata),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = GetCurrentUserId() // This would come from the authenticated user context
            };

            _context.SignatureRequests.Add(signatureRequest);

            // Add signers
            foreach (var signerDto in request.Signers)
            {
                var signer = new SignatureRequestSigner
                {
                    Id = Guid.NewGuid(),
                    SignatureRequestId = signatureRequest.Id,
                    Name = signerDto.Name,
                    Email = signerDto.Email,
                    Role = signerDto.Role,
                    SigningOrder = signerDto.SigningOrder,
                    IsRequired = signerDto.IsRequired,
                    AccessCode = signerDto.AccessCode,
                    Status = SignerStatus.Created,
                    SignatureFields = JsonSerializer.Serialize(signerDto.SignatureFields)
                };

                _context.SignatureRequestSigners.Add(signer);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Created signature request {RequestId} for document {DocumentId}", 
                signatureRequest.Id, request.DocumentId);

            return await GetSignatureRequestAsync(signatureRequest.Id) 
                ?? throw new InvalidOperationException("Failed to retrieve created signature request");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating signature request for document {DocumentId}", request.DocumentId);
            throw;
        }
    }

    public async Task<SignatureRequestDto?> GetSignatureRequestAsync(Guid requestId)
    {
        var request = await _context.SignatureRequests
            .Include(r => r.Document)
            .Include(r => r.Signers)
            .Include(r => r.CreatedByUser)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null) return null;

        return new SignatureRequestDto
        {
            Id = request.Id,
            DocumentId = request.DocumentId,
            DocumentTitle = request.Document?.Title ?? "Unknown Document",
            ProviderId = request.ProviderId,
            ProviderRequestId = request.ProviderRequestId ?? string.Empty,
            Title = request.Title,
            Message = request.Message,
            Status = request.Status,
            Signers = request.Signers.Select(s => new SignerDto
            {
                Name = s.Name,
                Email = s.Email,
                Role = s.Role,
                SigningOrder = s.SigningOrder,
                IsRequired = s.IsRequired,
                AccessCode = s.AccessCode,
                SignatureFields = string.IsNullOrEmpty(s.SignatureFields) 
                    ? new List<SignatureFieldDto>()
                    : JsonSerializer.Deserialize<List<SignatureFieldDto>>(s.SignatureFields) ?? new List<SignatureFieldDto>()
            }).ToList(),
            CreatedAt = request.CreatedAt,
            SentAt = request.SentAt,
            CompletedAt = request.CompletedAt,
            ExpirationDate = request.ExpirationDate,
            CreatedBy = request.CreatedBy,
            CreatedByName = request.CreatedByUser?.Email ?? "Unknown User",
            Metadata = string.IsNullOrEmpty(request.Metadata) 
                ? new Dictionary<string, object>()
                : JsonSerializer.Deserialize<Dictionary<string, object>>(request.Metadata) ?? new Dictionary<string, object>()
        };
    }

    public async Task<IEnumerable<SignatureRequestDto>> GetDocumentSignatureRequestsAsync(Guid documentId)
    {
        var requests = await _context.SignatureRequests
            .Include(r => r.Document)
            .Include(r => r.Signers)
            .Include(r => r.CreatedByUser)
            .Where(r => r.DocumentId == documentId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(request => new SignatureRequestDto
        {
            Id = request.Id,
            DocumentId = request.DocumentId,
            DocumentTitle = request.Document?.Title ?? "Unknown Document",
            ProviderId = request.ProviderId,
            ProviderRequestId = request.ProviderRequestId ?? string.Empty,
            Title = request.Title,
            Message = request.Message,
            Status = request.Status,
            Signers = request.Signers.Select(s => new SignerDto
            {
                Name = s.Name,
                Email = s.Email,
                Role = s.Role,
                SigningOrder = s.SigningOrder,
                IsRequired = s.IsRequired,
                AccessCode = s.AccessCode
            }).ToList(),
            CreatedAt = request.CreatedAt,
            SentAt = request.SentAt,
            CompletedAt = request.CompletedAt,
            ExpirationDate = request.ExpirationDate,
            CreatedBy = request.CreatedBy,
            CreatedByName = request.CreatedByUser?.Email ?? "Unknown User"
        });
    }

    public async Task<bool> SendSignatureRequestAsync(Guid requestId, SendSignatureRequestDto request)
    {
        try
        {
            var signatureRequest = await _context.SignatureRequests
                .Include(r => r.Document)
                .Include(r => r.Signers)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (signatureRequest == null)
            {
                _logger.LogWarning("Signature request {RequestId} not found", requestId);
                return false;
            }

            if (signatureRequest.Status != SignatureRequestStatus.Draft)
            {
                _logger.LogWarning("Signature request {RequestId} is not in draft status", requestId);
                return false;
            }

            // Get provider service and send request
            var providerService = GetProviderService(signatureRequest.ProviderId);
            
            // This would delegate to the specific provider implementation
            var providerRequestId = await SendToProviderAsync(signatureRequest, request);

            if (!string.IsNullOrEmpty(providerRequestId))
            {
                signatureRequest.ProviderRequestId = providerRequestId;
                signatureRequest.Status = SignatureRequestStatus.Sent;
                signatureRequest.SentAt = DateTime.UtcNow;

                // Update signer statuses
                foreach (var signer in signatureRequest.Signers)
                {
                    signer.Status = SignerStatus.Sent;
                }

                await _context.SaveChangesAsync();

                // Add audit entry
                await AddSignatureAuditEntryAsync(requestId, "RequestSent", GetCurrentUserId(), 
                    new Dictionary<string, object>
                    {
                        ["Subject"] = request.Subject,
                        ["ProviderRequestId"] = providerRequestId
                    });

                _logger.LogInformation("Sent signature request {RequestId} via provider {Provider}", 
                    requestId, signatureRequest.ProviderId);

                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending signature request {RequestId}", requestId);
            return false;
        }
    }

    public async Task<bool> CancelSignatureRequestAsync(Guid requestId, string reason)
    {
        try
        {
            var signatureRequest = await _context.SignatureRequests
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (signatureRequest == null) return false;

            // Cancel with provider if it was sent
            if (!string.IsNullOrEmpty(signatureRequest.ProviderRequestId))
            {
                var providerService = GetProviderService(signatureRequest.ProviderId);
                // Provider-specific cancellation would be implemented here
            }

            signatureRequest.Status = SignatureRequestStatus.Cancelled;
            await _context.SaveChangesAsync();

            await AddSignatureAuditEntryAsync(requestId, "RequestCancelled", GetCurrentUserId(),
                new Dictionary<string, object> { ["Reason"] = reason });

            _logger.LogInformation("Cancelled signature request {RequestId}: {Reason}", requestId, reason);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling signature request {RequestId}", requestId);
            return false;
        }
    }

    public async Task<SignatureStatusDto> GetSignatureStatusAsync(Guid requestId)
    {
        var request = await _context.SignatureRequests
            .Include(r => r.Signers)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            throw new ArgumentException("Signature request not found");
        }

        // If sent to provider, get updated status
        if (!string.IsNullOrEmpty(request.ProviderRequestId))
        {
            await UpdateRequestStatusFromProviderAsync(request);
        }

        var signerStatuses = request.Signers.Select(s => new SignerStatusDto
        {
            SignerEmail = s.Email,
            SignerName = s.Name,
            Status = s.Status,
            SignedAt = s.SignedAt,
            DeliveredAt = s.DeliveredAt,
            ViewedAt = s.ViewedAt,
            DeclineReason = s.DeclineReason ?? string.Empty,
            IpAddress = s.IpAddress ?? string.Empty
        }).ToList();

        var completedSigners = signerStatuses.Count(s => s.Status == SignerStatus.Signed);
        var totalSigners = signerStatuses.Count();
        var completionPercentage = totalSigners > 0 ? (double)completedSigners / totalSigners * 100 : 0;

        return new SignatureStatusDto
        {
            RequestId = requestId,
            Status = request.Status,
            SignerStatuses = signerStatuses,
            LastUpdated = request.UpdatedAt ?? request.CreatedAt,
            StatusMessage = GetStatusMessage(request.Status),
            CompletionPercentage = completionPercentage
        };
    }

    public async Task<SignedDocumentDto?> DownloadSignedDocumentAsync(Guid requestId)
    {
        var request = await _context.SignatureRequests
            .Include(r => r.Document)
            .Include(r => r.Signers)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null || request.Status != SignatureRequestStatus.Completed)
        {
            return null;
        }

        // Get signed document from provider
        var providerService = GetProviderService(request.ProviderId);
        var signedContent = await GetSignedDocumentFromProviderAsync(request);

        if (signedContent == null) return null;

        return new SignedDocumentDto
        {
            RequestId = requestId,
            FileName = $"{request.Document?.Title ?? "Document"}_signed.pdf",
            Content = signedContent,
            ContentType = "application/pdf",
            FileSize = signedContent.Length,
            SignedAt = request.CompletedAt ?? DateTime.UtcNow,
            Signatures = request.Signers
                .Where(s => s.Status == SignerStatus.Signed)
                .Select(s => new SignatureInfoDto
                {
                    SignerEmail = s.Email,
                    SignerName = s.Name,
                    SignedAt = s.SignedAt ?? DateTime.UtcNow,
                    SignatureId = s.Id.ToString(),
                    ValidationStatus = SignatureValidationStatus.Valid
                }).ToList()
        };
    }

    public async Task<SignatureVerificationDto> VerifySignatureAsync(Guid documentId, byte[] documentContent)
    {
        // This would implement actual signature verification logic
        // For now, returning a basic verification result
        return new SignatureVerificationDto
        {
            IsValid = true,
            Signatures = new List<SignatureInfoDto>(),
            ValidationErrors = new List<string>(),
            ValidationWarnings = new List<string>(),
            VerifiedAt = DateTime.UtcNow,
            VerificationMethod = "Basic Verification"
        };
    }

    public async Task<SignatureCertificateDto?> GetSignatureCertificateAsync(string certificateId)
    {
        // This would retrieve certificate information from the provider or certificate store
        return null;
    }

    public async Task<CertificateValidationDto> ValidateCertificateAsync(string certificateId)
    {
        // This would validate the certificate against certificate authorities
        return new CertificateValidationDto
        {
            IsValid = true,
            Status = CertificateStatus.Valid,
            ValidationErrors = new List<string>(),
            ValidationWarnings = new List<string>(),
            ValidatedAt = DateTime.UtcNow
        };
    }

    public async Task<IEnumerable<SignatureAuditEntryDto>> GetSignatureAuditTrailAsync(Guid requestId)
    {
        var auditEntries = await _context.SignatureAuditEntries
            .Where(a => a.SignatureRequestId == requestId)
            .OrderBy(a => a.Timestamp)
            .ToListAsync();

        return auditEntries.Select(entry => new SignatureAuditEntryDto
        {
            Id = entry.Id,
            RequestId = entry.SignatureRequestId,
            Action = entry.Action,
            ActorEmail = entry.ActorEmail,
            ActorName = entry.ActorName,
            Timestamp = entry.Timestamp,
            IpAddress = entry.IpAddress,
            UserAgent = entry.UserAgent,
            Details = string.IsNullOrEmpty(entry.Details)
                ? new Dictionary<string, object>()
                : JsonSerializer.Deserialize<Dictionary<string, object>>(entry.Details) ?? new Dictionary<string, object>()
        });
    }

    public async Task<SignatureWorkflowDto> CreateSignatureWorkflowAsync(CreateSignatureWorkflowDto request)
    {
        var workflow = new SignatureWorkflow
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            Status = SignatureWorkflowStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = GetCurrentUserId(),
            Configuration = JsonSerializer.Serialize(request.Configuration)
        };

        _context.SignatureWorkflows.Add(workflow);

        foreach (var stepDto in request.Steps)
        {
            var step = new SignatureWorkflowStep
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                Name = stepDto.Name,
                Order = stepDto.Order,
                Type = stepDto.Type,
                RequiredRoles = JsonSerializer.Serialize(stepDto.RequiredRoles),
                Configuration = JsonSerializer.Serialize(stepDto.Configuration),
                Status = SignatureWorkflowStepStatus.Pending
            };

            _context.SignatureWorkflowSteps.Add(step);
        }

        await _context.SaveChangesAsync();

        return new SignatureWorkflowDto
        {
            Id = workflow.Id,
            Name = workflow.Name,
            Type = workflow.Type,
            Status = workflow.Status,
            CreatedAt = workflow.CreatedAt,
            CreatedBy = workflow.CreatedBy
        };
    }

    public async Task<SignatureWorkflowStepResultDto> ExecuteWorkflowStepAsync(Guid workflowId, Guid stepId, ExecuteWorkflowStepDto request)
    {
        var step = await _context.SignatureWorkflowSteps
            .Include(s => s.Workflow)
            .FirstOrDefaultAsync(s => s.Id == stepId && s.WorkflowId == workflowId);

        if (step == null)
        {
            return new SignatureWorkflowStepResultDto
            {
                Success = false,
                Message = "Workflow step not found",
                NewStatus = SignatureWorkflowStepStatus.Failed
            };
        }

        // Execute step based on type
        var success = await ExecuteWorkflowStepLogicAsync(step, request);

        if (success)
        {
            step.Status = SignatureWorkflowStepStatus.Completed;
            
            // Find next step
            var nextStep = await _context.SignatureWorkflowSteps
                .Where(s => s.WorkflowId == workflowId && s.Order > step.Order)
                .OrderBy(s => s.Order)
                .FirstOrDefaultAsync();

            await _context.SaveChangesAsync();

            return new SignatureWorkflowStepResultDto
            {
                Success = true,
                Message = "Step completed successfully",
                NewStatus = SignatureWorkflowStepStatus.Completed,
                NextStepId = nextStep?.Id,
                Data = request.Data
            };
        }

        return new SignatureWorkflowStepResultDto
        {
            Success = false,
            Message = "Step execution failed",
            NewStatus = SignatureWorkflowStepStatus.Failed
        };
    }

    // Private helper methods
    private IDigitalSignatureService GetProviderService(string providerId)
    {
        if (_providers.TryGetValue(providerId.ToLower(), out var service))
        {
            return service;
        }
        throw new ArgumentException($"Signature provider '{providerId}' not supported");
    }

    private async Task<string> SendToProviderAsync(SignatureRequest request, SendSignatureRequestDto sendRequest)
    {
        // This would contain provider-specific logic for sending signature requests
        // For now, returning a mock provider request ID
        return $"provider_request_{Guid.NewGuid():N}";
    }

    private async Task UpdateRequestStatusFromProviderAsync(SignatureRequest request)
    {
        // This would poll the provider for status updates
        // Implementation would be provider-specific
    }

    private async Task<byte[]?> GetSignedDocumentFromProviderAsync(SignatureRequest request)
    {
        // This would retrieve the signed document from the provider
        // For now, returning null (would be implemented per provider)
        return null;
    }

    private async Task AddSignatureAuditEntryAsync(Guid requestId, string action, Guid userId, Dictionary<string, object> details)
    {
        var auditEntry = new SignatureAuditEntry
        {
            Id = Guid.NewGuid(),
            SignatureRequestId = requestId,
            Action = action,
            ActorEmail = "system@example.com", // Would get from user context
            ActorName = "System User", // Would get from user context
            Timestamp = DateTime.UtcNow,
            IpAddress = "127.0.0.1", // Would get from HTTP context
            UserAgent = "Enterprise Docs Platform", // Would get from HTTP context
            Details = JsonSerializer.Serialize(details)
        };

        _context.SignatureAuditEntries.Add(auditEntry);
        await _context.SaveChangesAsync();
    }

    private async Task<bool> ExecuteWorkflowStepLogicAsync(SignatureWorkflowStep step, ExecuteWorkflowStepDto request)
    {
        // Implementation would depend on step type
        return true;
    }

    private string GetStatusMessage(SignatureRequestStatus status)
    {
        return status switch
        {
            SignatureRequestStatus.Draft => "Request is being prepared",
            SignatureRequestStatus.Sent => "Request has been sent to signers",
            SignatureRequestStatus.InProgress => "Signers are reviewing and signing",
            SignatureRequestStatus.Completed => "All signers have completed signing",
            SignatureRequestStatus.Declined => "One or more signers declined to sign",
            SignatureRequestStatus.Expired => "Request has expired",
            SignatureRequestStatus.Cancelled => "Request was cancelled",
            SignatureRequestStatus.Failed => "Request failed due to an error",
            _ => "Unknown status"
        };
    }

    private Guid GetCurrentUserId()
    {
        // This would get the current user ID from the HTTP context or JWT token
        // For now, returning a placeholder
        return Guid.Parse("00000000-0000-0000-0000-000000000001");
    }
}

// Entity models for digital signatures (these would be added to the DbContext)
public class SignatureRequest
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public string ProviderId { get; set; } = string.Empty;
    public string? ProviderRequestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public SignatureRequestStatus Status { get; set; }
    public SignatureWorkflowType WorkflowType { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool RequireEmailVerification { get; set; }
    public bool AllowDecline { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }

    // Navigation properties
    public virtual Document? Document { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public virtual ICollection<SignatureRequestSigner> Signers { get; set; } = new List<SignatureRequestSigner>();
}

public class SignatureRequestSigner
{
    public Guid Id { get; set; }
    public Guid SignatureRequestId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Signer";
    public int SigningOrder { get; set; }
    public bool IsRequired { get; set; }
    public string AccessCode { get; set; } = string.Empty;
    public SignerStatus Status { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public string? DeclineReason { get; set; }
    public string? IpAddress { get; set; }
    public string? SignatureFields { get; set; }

    // Navigation properties
    public virtual SignatureRequest SignatureRequest { get; set; } = null!;
}

public class SignatureAuditEntry
{
    public Guid Id { get; set; }
    public Guid SignatureRequestId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActorEmail { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? Details { get; set; }

    // Navigation properties
    public virtual SignatureRequest SignatureRequest { get; set; } = null!;
}

public class SignatureWorkflow
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public SignatureWorkflowType Type { get; set; }
    public SignatureWorkflowStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public string? Configuration { get; set; }

    // Navigation properties
    public virtual User? CreatedByUser { get; set; }
    public virtual ICollection<SignatureWorkflowStep> Steps { get; set; } = new List<SignatureWorkflowStep>();
}

public class SignatureWorkflowStep
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public SignatureWorkflowStepType Type { get; set; }
    public string RequiredRoles { get; set; } = string.Empty;
    public string? Configuration { get; set; }
    public SignatureWorkflowStepStatus Status { get; set; }

    // Navigation properties
    public virtual SignatureWorkflow Workflow { get; set; } = null!;
}