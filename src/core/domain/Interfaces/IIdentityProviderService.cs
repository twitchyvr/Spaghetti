namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for enterprise identity provider integration (SAML/OIDC)
/// </summary>
public interface IIdentityProviderService
{
    /// <summary>
    /// Get available identity providers
    /// </summary>
    Task<IEnumerable<object>> GetAvailableProvidersAsync();

    /// <summary>
    /// Configure identity provider
    /// </summary>
    Task<object> ConfigureProviderAsync(object request);

    /// <summary>
    /// Get identity provider configuration
    /// </summary>
    Task<object?> GetProviderConfigurationAsync(string providerId);

    /// <summary>
    /// Update identity provider configuration
    /// </summary>
    Task<object?> UpdateProviderConfigurationAsync(string providerId, object request);

    /// <summary>
    /// Delete identity provider configuration
    /// </summary>
    Task<bool> DeleteProviderConfigurationAsync(string providerId);

    /// <summary>
    /// Initiate SAML authentication
    /// </summary>
    Task<object> InitiateSamlAuthenticationAsync(string providerId, string returnUrl);

    /// <summary>
    /// Process SAML authentication response
    /// </summary>
    Task<object> ProcessSamlResponseAsync(string providerId, string samlResponse, string relayState);

    /// <summary>
    /// Initiate OIDC authentication
    /// </summary>
    Task<object> InitiateOidcAuthenticationAsync(string providerId, string returnUrl);

    /// <summary>
    /// Process OIDC authorization code
    /// </summary>
    Task<object> ProcessOidcCallbackAsync(string providerId, string code, string state);

    /// <summary>
    /// Refresh OIDC token
    /// </summary>
    Task<object> RefreshOidcTokenAsync(string providerId, string refreshToken);

    /// <summary>
    /// Validate token with identity provider
    /// </summary>
    Task<object> ValidateTokenAsync(string providerId, string token);

    /// <summary>
    /// Get user profile from identity provider
    /// </summary>
    Task<object> GetUserProfileAsync(string providerId, string accessToken);

    /// <summary>
    /// Map external user to internal user
    /// </summary>
    Task<object> MapExternalUserAsync(string providerId, object externalProfile);

    /// <summary>
    /// Initiate single logout
    /// </summary>
    Task<object> InitiateSingleLogoutAsync(string providerId, string userId);

    /// <summary>
    /// Process single logout response
    /// </summary>
    Task<bool> ProcessSingleLogoutResponseAsync(string providerId, string logoutResponse);

    /// <summary>
    /// Get identity provider metadata
    /// </summary>
    Task<object> GetProviderMetadataAsync(string providerId);

    /// <summary>
    /// Test identity provider connection
    /// </summary>
    Task<object> TestProviderConnectionAsync(string providerId);

    /// <summary>
    /// Get identity provider statistics
    /// </summary>
    Task<object> GetProviderStatsAsync(string providerId, DateTime? fromDate = null, DateTime? toDate = null);
}

/// <summary>
/// Interface for Zero Trust security service
/// </summary>
public interface IZeroTrustService
{
    /// <summary>
    /// Evaluate access request based on Zero Trust principles
    /// </summary>
    Task<object> EvaluateAccessRequestAsync(object request);

    /// <summary>
    /// Perform continuous verification
    /// </summary>
    Task<object> PerformContinuousVerificationAsync(string userId, string sessionId);

    /// <summary>
    /// Assess device trust
    /// </summary>
    Task<object> AssessDeviceTrustAsync(object request);

    /// <summary>
    /// Assess network trust
    /// </summary>
    Task<object> AssessNetworkTrustAsync(object request);

    /// <summary>
    /// Calculate risk score
    /// </summary>
    Task<object> CalculateRiskScoreAsync(object request);

    /// <summary>
    /// Apply adaptive access policies
    /// </summary>
    Task<object> ApplyAdaptiveAccessPoliciesAsync(object request);

    /// <summary>
    /// Log security event
    /// </summary>
    Task LogSecurityEventAsync(object securityEvent);

    /// <summary>
    /// Get security events
    /// </summary>
    Task<IEnumerable<object>> GetSecurityEventsAsync(object query);

    /// <summary>
    /// Create security policy
    /// </summary>
    Task<object> CreateSecurityPolicyAsync(object request);

    /// <summary>
    /// Update security policy
    /// </summary>
    Task<object?> UpdateSecurityPolicyAsync(Guid policyId, object request);

    /// <summary>
    /// Get security policies
    /// </summary>
    Task<IEnumerable<object>> GetSecurityPoliciesAsync();

    /// <summary>
    /// Evaluate security policy
    /// </summary>
    Task<object> EvaluateSecurityPolicyAsync(Guid policyId, object request);
}