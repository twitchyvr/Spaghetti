namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for digital signature services supporting multiple providers
/// </summary>
public interface IDigitalSignatureService
{
    /// <summary>
    /// Get available signature providers
    /// </summary>
    Task<IEnumerable<object>> GetAvailableProvidersAsync();

    /// <summary>
    /// Create a signature request for a document
    /// </summary>
    Task<object> CreateSignatureRequestAsync(object request);

    /// <summary>
    /// Get signature request details
    /// </summary>
    Task<object?> GetSignatureRequestAsync(Guid requestId);

    /// <summary>
    /// Get signature requests for a document
    /// </summary>
    Task<IEnumerable<object>> GetDocumentSignatureRequestsAsync(Guid documentId);

    /// <summary>
    /// Send signature request to signers
    /// </summary>
    Task<bool> SendSignatureRequestAsync(Guid requestId, object request);

    /// <summary>
    /// Cancel signature request
    /// </summary>
    Task<bool> CancelSignatureRequestAsync(Guid requestId, string reason);

    /// <summary>
    /// Get signature request status
    /// </summary>
    Task<object> GetSignatureStatusAsync(Guid requestId);

    /// <summary>
    /// Download signed document
    /// </summary>
    Task<object?> DownloadSignedDocumentAsync(Guid requestId);

    /// <summary>
    /// Verify document signature
    /// </summary>
    Task<object> VerifySignatureAsync(Guid documentId, byte[] documentContent);

    /// <summary>
    /// Get signature certificate details
    /// </summary>
    Task<object?> GetSignatureCertificateAsync(string certificateId);

    /// <summary>
    /// Validate signature certificate
    /// </summary>
    Task<object> ValidateCertificateAsync(string certificateId);

    /// <summary>
    /// Get audit trail for signature request
    /// </summary>
    Task<IEnumerable<object>> GetSignatureAuditTrailAsync(Guid requestId);

    /// <summary>
    /// Generate signature workflow
    /// </summary>
    Task<object> CreateSignatureWorkflowAsync(object request);

    /// <summary>
    /// Execute signature workflow step
    /// </summary>
    Task<object> ExecuteWorkflowStepAsync(Guid workflowId, Guid stepId, object request);
}

/// <summary>
/// Interface for DocuSign integration
/// </summary>
public interface IDocuSignService : IDigitalSignatureService
{
    /// <summary>
    /// Authenticate with DocuSign API
    /// </summary>
    Task<bool> AuthenticateAsync(string apiKey, string userId, string accountId);

    /// <summary>
    /// Create DocuSign envelope
    /// </summary>
    Task<string> CreateEnvelopeAsync(object envelope);

    /// <summary>
    /// Get envelope status
    /// </summary>
    Task<object> GetEnvelopeStatusAsync(string envelopeId);

    /// <summary>
    /// Get envelope documents
    /// </summary>
    Task<byte[]> GetEnvelopeDocumentAsync(string envelopeId, string documentId);

    /// <summary>
    /// Void envelope
    /// </summary>
    Task<bool> VoidEnvelopeAsync(string envelopeId, string reason);
}

/// <summary>
/// Interface for Adobe Sign integration
/// </summary>
public interface IAdobeSignService : IDigitalSignatureService
{
    /// <summary>
    /// Authenticate with Adobe Sign API
    /// </summary>
    Task<bool> AuthenticateAsync(string clientId, string clientSecret, string refreshToken);

    /// <summary>
    /// Create agreement
    /// </summary>
    Task<string> CreateAgreementAsync(object agreement);

    /// <summary>
    /// Get agreement status
    /// </summary>
    Task<object> GetAgreementStatusAsync(string agreementId);

    /// <summary>
    /// Download agreement document
    /// </summary>
    Task<byte[]> DownloadAgreementDocumentAsync(string agreementId);

    /// <summary>
    /// Cancel agreement
    /// </summary>
    Task<bool> CancelAgreementAsync(string agreementId, string reason);
}