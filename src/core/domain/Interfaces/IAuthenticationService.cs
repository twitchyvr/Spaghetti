using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Enhanced authentication service interface with MFA and session management
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    Task<EnhancedAuthenticationResult> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Authenticate user with external provider (SSO)
    /// </summary>
    Task<EnhancedAuthenticationResult> AuthenticateExternalAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    Task<EnhancedAuthenticationResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Logout user and revoke tokens
    /// </summary>
    Task<bool> LogoutAsync(string token, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Logout user from all devices
    /// </summary>
    Task<int> LogoutAllDevicesAsync(Guid userId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Set up multi-factor authentication for user
    /// </summary>
    Task<MFASetupResult> SetupMFAAsync(Guid userId, MFAMethod method, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Validate MFA code
    /// </summary>
    Task<bool> ValidateMFAAsync(Guid userId, string code, MFAMethod method, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Disable MFA for user
    /// </summary>
    Task<bool> DisableMFAAsync(Guid userId, string verificationCode, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Create impersonation token for platform admin
    /// </summary>
    Task<ImpersonationToken> CreateImpersonationTokenAsync(Guid adminId, Guid targetUserId, TimeSpan? duration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// End impersonation session
    /// </summary>
    Task<bool> EndImpersonationAsync(string impersonationToken, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Validate session and update last accessed time
    /// </summary>
    Task<SessionValidationResult> ValidateSessionAsync(string sessionToken, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get active sessions for user
    /// </summary>
    Task<List<EnhancedUserSession>> GetActiveSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Revoke specific session
    /// </summary>
    Task<bool> RevokeSessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Authorization service interface for role and permission management
/// </summary>
public interface IAuthorizationService
{
    /// <summary>
    /// Check if user has specific permission
    /// </summary>
    Task<bool> HasPermissionAsync(Guid userId, string permission, string? resource = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if user has any of the specified permissions
    /// </summary>
    Task<bool> HasAnyPermissionAsync(Guid userId, IEnumerable<string> permissions, string? resource = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if user has all of the specified permissions
    /// </summary>
    Task<bool> HasAllPermissionsAsync(Guid userId, IEnumerable<string> permissions, string? resource = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get all permissions for user
    /// </summary>
    Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get all roles for user
    /// </summary>
    Task<List<Role>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Assign role to user
    /// </summary>
    Task<bool> AssignRoleAsync(Guid userId, Guid roleId, Guid assignedBy, DateTime? expiresAt = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove role from user
    /// </summary>
    Task<bool> RemoveRoleAsync(Guid userId, Guid roleId, Guid removedBy, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Assign direct permission to user
    /// </summary>
    Task<bool> AssignPermissionAsync(Guid userId, string permission, string? resource, Guid grantedBy, DateTime? expiresAt = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove direct permission from user
    /// </summary>
    Task<bool> RemovePermissionAsync(Guid userId, string permission, string? resource, Guid removedBy, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if user can access tenant
    /// </summary>
    Task<bool> CanAccessTenantAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if user can impersonate another user
    /// </summary>
    Task<bool> CanImpersonateUserAsync(Guid adminUserId, Guid targetUserId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get permission matrix for user within tenant
    /// </summary>
    Task<PermissionMatrix> GetPermissionMatrixAsync(Guid userId, Guid? tenantId = null, CancellationToken cancellationToken = default);
}

#region DTOs and Result Types

/// <summary>
/// Enhanced authentication result
/// </summary>
public class EnhancedAuthenticationResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> Errors { get; set; } = new();
    
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public User? User { get; set; }
    public Tenant? Tenant { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    
    public bool RequiresMFA { get; set; }
    public List<MFAMethod> AvailableMFAMethods { get; set; } = new();
    
    public static EnhancedAuthenticationResult Success(string accessToken, string refreshToken, DateTime expiresAt, User user, List<string> roles, List<string> permissions, Tenant? tenant = null)
    {
        return new EnhancedAuthenticationResult
        {
            IsSuccess = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = user,
            Tenant = tenant,
            Roles = roles,
            Permissions = permissions
        };
    }
    
    public static EnhancedAuthenticationResult Failure(string errorMessage, List<string>? errors = null)
    {
        return new EnhancedAuthenticationResult
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            Errors = errors ?? new List<string>()
        };
    }
    
    public static EnhancedAuthenticationResult MFARequired(List<MFAMethod> availableMethods)
    {
        return new EnhancedAuthenticationResult
        {
            IsSuccess = false,
            RequiresMFA = true,
            AvailableMFAMethods = availableMethods,
            ErrorMessage = "Multi-factor authentication required"
        };
    }
}

/// <summary>
/// Login request
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? TenantSubdomain { get; set; }
    public bool RememberMe { get; set; } = false;
    public string? MFACode { get; set; }
    public MFAMethod? MFAMethod { get; set; }
}

/// <summary>
/// External login request for SSO
/// </summary>
public class ExternalLoginRequest
{
    public string Provider { get; set; } = string.Empty; // "AzureAD", "Google", "Okta", etc.
    public string ExternalToken { get; set; } = string.Empty;
    public string? TenantSubdomain { get; set; }
    public Dictionary<string, object> ProviderData { get; set; } = new();
}

/// <summary>
/// MFA setup result
/// </summary>
public class MFASetupResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    
    public MFAMethod Method { get; set; }
    public string? Secret { get; set; } // For TOTP
    public string? QRCodeUri { get; set; } // For TOTP
    public List<string> BackupCodes { get; set; } = new();
}

/// <summary>
/// MFA methods
/// </summary>
public enum MFAMethod
{
    TOTP,           // Time-based One-Time Password (Google Authenticator, etc.)
    SMS,            // SMS verification
    Email,          // Email verification
    BackupCode,     // Backup recovery codes
    Hardware        // Hardware tokens (future)
}

/// <summary>
/// Impersonation token
/// </summary>
public class ImpersonationToken
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public User AdminUser { get; set; } = null!;
    public User TargetUser { get; set; } = null!;
    public DateTime StartedAt { get; set; }
}

/// <summary>
/// Session validation result
/// </summary>
public class SessionValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    
    public AuthenticationSession? Session { get; set; }
    public User? User { get; set; }
    public bool RequiresMFA { get; set; }
    public bool IsImpersonated { get; set; }
    public User? ImpersonatingUser { get; set; }
}

/// <summary>
/// Enhanced user session info
/// </summary>
public class EnhancedUserSession
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastAccessedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceType { get; set; }
    public string? Location { get; set; }
    public bool IsCurrentSession { get; set; }
    public bool IsImpersonated { get; set; }
}

/// <summary>
/// Permission matrix for user
/// </summary>
public class PermissionMatrix
{
    public Guid UserId { get; set; }
    public Guid? TenantId { get; set; }
    public List<string> Roles { get; set; } = new();
    public Dictionary<string, List<string>> ResourcePermissions { get; set; } = new(); // Resource -> Permissions
    public List<string> GlobalPermissions { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

#endregion