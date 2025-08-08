using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

// Digital Signature Provider DTOs
public record SignatureProviderDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool IsAvailable { get; init; }
    public string[] SupportedFormats { get; init; } = Array.Empty<string>();
    public Dictionary<string, object> Configuration { get; init; } = new();
}

// Signature Request DTOs
public record CreateSignatureRequestDto
{
    [Required]
    public string DocumentId { get; init; } = string.Empty;
    [Required]
    public string[] SignerEmails { get; init; } = Array.Empty<string>();
    public string Subject { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public DateTime? ExpirationDate { get; init; }
    public bool RequireAllSigners { get; init; } = true;
    public string SignatureType { get; init; } = "electronic";
}

public record SignatureRequestDto
{
    public string Id { get; init; } = string.Empty;
    public string DocumentId { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public SignerDto[] Signers { get; init; } = Array.Empty<SignerDto>();
    public bool RequireAllSigners { get; init; }
}

public record SignerDto
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? SignedAt { get; init; }
    public string? SignatureUrl { get; init; }
}

public record SendSignatureRequestDto
{
    [Required]
    public string[] SignerEmails { get; init; } = Array.Empty<string>();
    public string CustomMessage { get; init; } = string.Empty;
    public DateTime? ReminderDate { get; init; }
}

// Signature Status DTOs
public record SignatureStatusDto
{
    public string RequestId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int TotalSigners { get; init; }
    public int CompletedSigners { get; init; }
    public DateTime LastUpdated { get; init; }
    public SignerStatusDto[] SignerStatuses { get; init; } = Array.Empty<SignerStatusDto>();
}

public record SignerStatusDto
{
    public string Email { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? SignedAt { get; init; }
    public DateTime? ViewedAt { get; init; }
}

// Document DTOs
public record SignedDocumentDto
{
    public string DocumentId { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public byte[] Content { get; init; } = Array.Empty<byte>();
    public string ContentType { get; init; } = string.Empty;
    public DateTime SignedAt { get; init; }
    public SignatureInfoDto[] Signatures { get; init; } = Array.Empty<SignatureInfoDto>();
}

public record SignatureInfoDto
{
    public string SignerEmail { get; init; } = string.Empty;
    public string SignerName { get; init; } = string.Empty;
    public DateTime SignedAt { get; init; }
    public string SignatureType { get; init; } = string.Empty;
    public string CertificateId { get; init; } = string.Empty;
}

// Verification DTOs
public record SignatureVerificationDto
{
    public bool IsValid { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime VerificationDate { get; init; }
    public VerificationDetailDto[] Details { get; init; } = Array.Empty<VerificationDetailDto>();
    public string[] Errors { get; init; } = Array.Empty<string>();
}

public record VerificationDetailDto
{
    public string SignerEmail { get; init; } = string.Empty;
    public bool IsSignatureValid { get; init; }
    public bool IsCertificateValid { get; init; }
    public DateTime SignedAt { get; init; }
    public string CertificateInfo { get; init; } = string.Empty;
}

// Certificate DTOs
public record SignatureCertificateDto
{
    public string CertificateId { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public DateTime ValidFrom { get; init; }
    public DateTime ValidTo { get; init; }
    public string SerialNumber { get; init; } = string.Empty;
    public string Thumbprint { get; init; } = string.Empty;
}

public record CertificateValidationDto
{
    public bool IsValid { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime ValidationDate { get; init; }
    public string[] Issues { get; init; } = Array.Empty<string>();
    public CertificateChainDto? Chain { get; init; }
}

public record CertificateChainDto
{
    public SignatureCertificateDto[] Certificates { get; init; } = Array.Empty<SignatureCertificateDto>();
    public bool IsChainComplete { get; init; }
    public bool IsTrusted { get; init; }
}

// Audit DTOs
public record SignatureAuditEntryDto
{
    public string Id { get; init; } = string.Empty;
    public string RequestId { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public Dictionary<string, object> Metadata { get; init; } = new();
}

// Workflow DTOs
public record SignatureWorkflowDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public SignatureWorkflowStepDto[] Steps { get; init; } = Array.Empty<SignatureWorkflowStepDto>();
    public DateTime CreatedAt { get; init; }
}

public record SignatureWorkflowStepDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int Order { get; init; }
    public Dictionary<string, object> Configuration { get; init; } = new();
}

public record CreateSignatureWorkflowDto
{
    [Required]
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    [Required]
    public string Type { get; init; } = string.Empty;
    public CreateWorkflowStepDto[] Steps { get; init; } = Array.Empty<CreateWorkflowStepDto>();
}

public record CreateWorkflowStepDto
{
    [Required]
    public string Name { get; init; } = string.Empty;
    [Required]
    public string Type { get; init; } = string.Empty;
    public int Order { get; init; }
    public Dictionary<string, object> Configuration { get; init; } = new();
}

public record ExecuteWorkflowStepDto
{
    [Required]
    public string Action { get; init; } = string.Empty;
    public Dictionary<string, object> Parameters { get; init; } = new();
    public string? Comments { get; init; }
}

public record SignatureWorkflowStepResultDto
{
    public bool Success { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? NextStepId { get; init; }
    public Dictionary<string, object> Results { get; init; } = new();
    public string[] Errors { get; init; } = Array.Empty<string>();
}

// Enums for workflow and signature statuses
public enum SignatureRequestStatus
{
    Draft,
    Sent,
    InProgress,
    Completed,
    Expired,
    Cancelled,
    Failed
}

public enum SignerStatus
{
    Pending,
    Viewed,
    Signed,
    Declined,
    Expired
}

public enum SignatureWorkflowType
{
    Sequential,
    Parallel,
    Conditional
}

public enum SignatureWorkflowStatus
{
    Draft,
    Active,
    Paused,
    Completed,
    Cancelled
}

public enum SignatureWorkflowStepType
{
    SignatureRequest,
    Approval,
    Review,
    Notification,
    Condition
}

public enum SignatureWorkflowStepStatus
{
    Pending,
    InProgress,
    Completed,
    Skipped,
    Failed
}