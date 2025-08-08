namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service for zero trust security implementations
/// </summary>
public interface IZeroTrustSecurityService
{
    Task<object> VerifyUserIdentityAsync(Guid userId, string deviceId, CancellationToken cancellationToken = default);
    Task<object> AuthorizeResourceAccessAsync(Guid userId, string resourceId, string action, CancellationToken cancellationToken = default);
    Task<object> ValidateDeviceAsync(string deviceId, CancellationToken cancellationToken = default);
    Task<object> GetSecurityPolicyAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<object> ApplySecurityPolicyAsync(Guid tenantId, Dictionary<string, object> policy, CancellationToken cancellationToken = default);
    Task<object> AuditSecurityEventAsync(string eventType, Dictionary<string, object> eventData, CancellationToken cancellationToken = default);
    Task<object[]> GetSecurityAlertsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}