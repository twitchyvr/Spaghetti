using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

/// <summary>
/// Request to create a digital signature request
/// </summary>
public class CreateSignatureRequestDto
{
    [Required]
    public Guid DocumentId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    public string? Message { get; set; }
    
    [Required]
    public List<SignerInfoDto> Signers { get; set; } = new();
    
    public DateTime? ExpiresAt { get; set; }
    
    public string? CallbackUrl { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = "docusign"; // docusign, adobe_sign, etc.
}

/// <summary>
/// Signer information for signature request
/// </summary>
public class SignerInfoDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    public int SigningOrder { get; set; } = 1;
    
    public Guid? UserId { get; set; }
    
    public string? Role { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Document signature request response
/// </summary>
public class DocumentSignatureRequestDto
{
    public Guid Id { get; set; }
    
    public Guid DocumentId { get; set; }
    
    public string? DocumentTitle { get; set; }
    
    public Guid TenantId { get; set; }
    
    public string? ExternalRequestId { get; set; }
    
    public string Provider { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    
    public string? Message { get; set; }
    
    public string Status { get; set; } = string.Empty; // Created, Sent, InProgress, Completed, Cancelled, Expired, Failed
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? SentAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    public Guid CreatedBy { get; set; }
    
    public string? CreatedByUserName { get; set; }
    
    public List<DocumentSignatureDto> Signatures { get; set; } = new();
    
    public string? CallbackUrl { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Individual document signature response
/// </summary>
public class DocumentSignatureDto
{
    public Guid Id { get; set; }
    
    public Guid SignatureRequestId { get; set; }
    
    public Guid? UserId { get; set; }
    
    public string? UserName { get; set; }
    
    public string SignerName { get; set; } = string.Empty;
    
    public string SignerEmail { get; set; } = string.Empty;
    
    public int SigningOrder { get; set; }
    
    public string? ExternalSignatureId { get; set; }
    
    public string Status { get; set; } = string.Empty; // Pending, Sent, Viewed, Signed, Declined, Failed, Expired
    
    public DateTime? SignedAt { get; set; }
    
    public string? SignerIPAddress { get; set; }
    
    public string? SignerUserAgent { get; set; }
    
    public string? DeclineReason { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Signed document response
/// </summary>
public class SignedDocumentDto
{
    public Guid Id { get; set; }
    
    public Guid DocumentId { get; set; }
    
    public string? DocumentTitle { get; set; }
    
    public Guid SignatureRequestId { get; set; }
    
    public string SignedDocumentPath { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    public string ContentType { get; set; } = string.Empty;
    
    public string? FileHash { get; set; }
    
    public string? Certificate { get; set; }
    
    public DateTime CompletedAt { get; set; }
    
    public bool IsLegallyValid { get; set; }
    
    public Dictionary<string, object> ValidationData { get; set; } = new();
    
    public Dictionary<string, object> AuditTrail { get; set; } = new();
}

/// <summary>
/// Request to sign a document (for internal/simple signatures)
/// </summary>
public class SignDocumentRequest
{
    [Required]
    public Guid DocumentId { get; set; }
    
    [Required]
    public string SignatureData { get; set; } = string.Empty; // Base64 encoded signature
    
    public string? SignatureType { get; set; } = "electronic"; // electronic, digital, wet
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Digital signature validation result
/// </summary>
public class SignatureValidationResult
{
    public bool IsValid { get; set; }
    
    public List<string> ValidationErrors { get; set; } = new();
    
    public List<string> ValidationWarnings { get; set; } = new();
    
    public DateTime ValidationTimestamp { get; set; } = DateTime.UtcNow;
    
    public string? CertificateInfo { get; set; }
    
    public bool IsTrusted { get; set; }
    
    public DateTime? SigningTime { get; set; }
    
    public string? SignerInfo { get; set; }
    
    public Dictionary<string, object> TechnicalDetails { get; set; } = new();
}

/// <summary>
/// Signature provider configuration
/// </summary>
public class SignatureProviderConfigDto
{
    public string Provider { get; set; } = string.Empty;
    
    public bool IsEnabled { get; set; }
    
    public string? ApiKey { get; set; }
    
    public string? ApiSecret { get; set; }
    
    public string? ApiBaseUrl { get; set; }
    
    public Dictionary<string, string> Settings { get; set; } = new();
    
    public List<string> SupportedFeatures { get; set; } = new();
}

/// <summary>
/// Signature request status update (webhook payload)
/// </summary>
public class SignatureStatusUpdateDto
{
    public string ExternalRequestId { get; set; } = string.Empty;
    
    public string Status { get; set; } = string.Empty;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public List<SignatureStatusDto> Signatures { get; set; } = new();
    
    public Dictionary<string, object> ProviderData { get; set; } = new();
}

/// <summary>
/// Individual signature status in webhook update
/// </summary>
public class SignatureStatusDto
{
    public string ExternalSignatureId { get; set; } = string.Empty;
    
    public string SignerEmail { get; set; } = string.Empty;
    
    public string Status { get; set; } = string.Empty;
    
    public DateTime? SignedAt { get; set; }
    
    public string? DeclineReason { get; set; }
    
    public string? IPAddress { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// Paginated response for signature requests
/// </summary>
public class SignatureRequestListResponse
{
    public List<DocumentSignatureRequestDto> Items { get; set; } = new();
    
    public int TotalCount { get; set; }
    
    public int PageNumber { get; set; }
    
    public int PageSize { get; set; }
    
    public int TotalPages { get; set; }
    
    public bool HasNextPage { get; set; }
    
    public bool HasPreviousPage { get; set; }
}