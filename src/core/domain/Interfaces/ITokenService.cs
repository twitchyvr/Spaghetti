using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// JWT token service interface for generating and validating tokens
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generate access token for authenticated user
    /// </summary>
    Task<string> GenerateAccessTokenAsync(User user, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Generate refresh token for user
    /// </summary>
    Task<string> GenerateRefreshTokenAsync(User user, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Validate and extract user information from access token
    /// </summary>
    Task<TokenValidationResult> ValidateAccessTokenAsync(string token, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Validate refresh token and get associated user
    /// </summary>
    Task<TokenValidationResult> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Revoke refresh token (logout)
    /// </summary>
    Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Revoke all refresh tokens for a user
    /// </summary>
    Task<int> RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Clean up expired refresh tokens
    /// </summary>
    Task<int> CleanupExpiredTokensAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of token validation
/// </summary>
public class TokenValidationResult
{
    public bool IsValid { get; set; }
    public User? User { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public Guid? TenantId { get; set; }
    
    public static TokenValidationResult Success(User user, DateTime expiresAt, List<string> roles, List<string> permissions, Guid? tenantId = null)
    {
        return new TokenValidationResult
        {
            IsValid = true,
            User = user,
            ExpiresAt = expiresAt,
            Roles = roles,
            Permissions = permissions,
            TenantId = tenantId
        };
    }
    
    public static TokenValidationResult Failure(string errorMessage)
    {
        return new TokenValidationResult
        {
            IsValid = false,
            ErrorMessage = errorMessage
        };
    }
}

/// <summary>
/// Refresh token entity for database storage
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? RevokedReason { get; set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsActive => !IsExpired && !IsRevoked;
}