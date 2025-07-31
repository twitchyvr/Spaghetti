using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents a digital signature request for a document
/// </summary>
public class DocumentSignatureRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    /// <summary>
    /// External signature service request ID (DocuSign, Adobe Sign, etc.)
    /// </summary>
    [MaxLength(255)]
    public string? ExternalRequestId { get; set; }
    
    /// <summary>
    /// Signature service provider (docusign, adobe_sign, etc.)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = string.Empty;
    
    /// <summary>
    /// Title/subject of the signature request
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Message to signers
    /// </summary>
    public string? Message { get; set; }
    
    public SignatureRequestStatus Status { get; set; } = SignatureRequestStatus.Created;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    [Required]
    public Guid CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    /// <summary>
    /// Individual signatures within this request
    /// </summary>
    public List<DocumentSignature> Signatures { get; set; } = new();
    
    /// <summary>
    /// Callback URL for signature completion notifications
    /// </summary>
    [MaxLength(500)]
    public string? CallbackUrl { get; set; }
    
    /// <summary>
    /// Additional metadata for the signature request (JSON)
    /// </summary>
    public string? Metadata { get; set; }
}

/// <summary>
/// Represents an individual signature within a signature request
/// </summary>
public class DocumentSignature
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid SignatureRequestId { get; set; }
    public DocumentSignatureRequest? SignatureRequest { get; set; }
    
    /// <summary>
    /// User who needs to sign (if internal user)
    /// </summary>
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    /// <summary>
    /// External signer information
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string SignerName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string SignerEmail { get; set; } = string.Empty;
    
    /// <summary>
    /// Signing order (1, 2, 3, etc.)
    /// </summary>
    public int SigningOrder { get; set; } = 1;
    
    /// <summary>
    /// External signature ID from the provider
    /// </summary>
    [MaxLength(255)]
    public string? ExternalSignatureId { get; set; }
    
    public SignatureStatus Status { get; set; } = SignatureStatus.Pending;
    
    /// <summary>
    /// Date when the signature was completed
    /// </summary>
    public DateTime? SignedAt { get; set; }
    
    /// <summary>
    /// IP address of the signer
    /// </summary>
    [MaxLength(45)]
    public string? SignerIPAddress { get; set; }
    
    /// <summary>
    /// User agent of the signer
    /// </summary>
    [MaxLength(500)]
    public string? SignerUserAgent { get; set; }
    
    /// <summary>
    /// Signature image/data (base64 encoded)
    /// </summary>
    public string? SignatureData { get; set; }
    
    /// <summary>
    /// Certificate information for the signature
    /// </summary>
    public string? CertificateData { get; set; }
    
    /// <summary>
    /// Decline reason if signature was declined
    /// </summary>
    public string? DeclineReason { get; set; }
    
    /// <summary>
    /// Additional signature metadata (JSON)
    /// </summary>
    public string? Metadata { get; set; }
}

/// <summary>
/// Represents a completed signed document
/// </summary>
public class SignedDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    [Required]
    public Guid SignatureRequestId { get; set; }
    public DocumentSignatureRequest? SignatureRequest { get; set; }
    
    /// <summary>
    /// File path/URL to the signed document
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string SignedDocumentPath { get; set; } = string.Empty;
    
    /// <summary>
    /// File size of the signed document
    /// </summary>
    public long FileSize { get; set; }
    
    /// <summary>
    /// MIME type of the signed document
    /// </summary>
    [MaxLength(100)]
    public string ContentType { get; set; } = "application/pdf";
    
    /// <summary>
    /// Hash of the signed document for integrity verification
    /// </summary>
    [MaxLength(64)]
    public string? FileHash { get; set; }
    
    /// <summary>
    /// Digital certificate used for signing
    /// </summary>
    public string? Certificate { get; set; }
    
    /// <summary>
    /// Timestamp when the document was fully signed
    /// </summary>
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Whether the signature is legally valid
    /// </summary>
    public bool IsLegallyValid { get; set; } = true;
    
    /// <summary>
    /// Signature validation details (JSON)
    /// </summary>
    public string? ValidationData { get; set; }
    
    /// <summary>
    /// Audit trail for the signing process (JSON)
    /// </summary>
    public string? AuditTrail { get; set; }
}

public enum SignatureRequestStatus
{
    Created,
    Sent,
    InProgress,
    Completed,
    Cancelled,
    Expired,
    Failed
}

public enum SignatureStatus
{
    Pending,
    Sent,
    Viewed,
    Signed,
    Declined,
    Failed,
    Expired
}