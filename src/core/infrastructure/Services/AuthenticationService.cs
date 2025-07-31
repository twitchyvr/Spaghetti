using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Enhanced authentication service implementation
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly ILogger<AuthenticationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;
    
    // Session configuration
    private readonly TimeSpan _defaultSessionTimeout;
    private readonly TimeSpan _defaultImpersonationTimeout;
    private readonly int _maxFailedAttempts;
    private readonly TimeSpan _lockoutDuration;

    public AuthenticationService(
        ILogger<AuthenticationService> logger,
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IPasswordService passwordService,
        IConfiguration configuration)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        
        // Load configuration with defaults
        _defaultSessionTimeout = TimeSpan.FromHours(_configuration.GetValue("Authentication:SessionTimeoutHours", 8));
        _defaultImpersonationTimeout = TimeSpan.FromHours(_configuration.GetValue("Authentication:ImpersonationTimeoutHours", 4));
        _maxFailedAttempts = _configuration.GetValue("Authentication:MaxFailedAttempts", 5);
        _lockoutDuration = TimeSpan.FromMinutes(_configuration.GetValue("Authentication:LockoutDurationMinutes", 30));
    }

    public async Task<EnhancedAuthenticationResult> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Authentication attempt for email: {Email}", request.Email);

            // Find user by email
            var user = await _unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Authentication failed: User not found for email {Email}", request.Email);
                return EnhancedAuthenticationResult.Failure("Invalid email or password");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Authentication failed: User account inactive for {Email}", request.Email);
                return EnhancedAuthenticationResult.Failure("User account is inactive");
            }

            // Get password authentication method
            var passwordAuth = await GetPasswordAuthenticationAsync(user.Id, cancellationToken);
            if (passwordAuth == null || !passwordAuth.IsUsable)
            {
                _logger.LogWarning("Authentication failed: No valid password authentication for {Email}", request.Email);
                return EnhancedAuthenticationResult.Failure("Invalid email or password");
            }

            // Check for account lockout
            if (passwordAuth.IsLocked)
            {
                _logger.LogWarning("Authentication failed: Account locked for {Email}", request.Email);
                return EnhancedAuthenticationResult.Failure($"Account is locked until {passwordAuth.LockedUntil:yyyy-MM-dd HH:mm:ss UTC}");
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, passwordAuth.CredentialData ?? string.Empty))
            {
                await RecordFailedLoginAsync(passwordAuth, cancellationToken);
                _logger.LogWarning("Authentication failed: Invalid password for {Email}", request.Email);
                return EnhancedAuthenticationResult.Failure("Invalid email or password");
            }

            // Reset failed attempts on successful password verification
            await ResetFailedAttemptsAsync(passwordAuth, cancellationToken);

            // Check tenant access if specified
            Tenant? tenant = null;
            if (!string.IsNullOrEmpty(request.TenantSubdomain))
            {
                tenant = await _unitOfWork.Tenants.GetBySubdomainAsync(request.TenantSubdomain, cancellationToken);
                if (tenant == null)
                {
                    _logger.LogWarning("Authentication failed: Tenant not found for subdomain {Subdomain}", request.TenantSubdomain);
                    return EnhancedAuthenticationResult.Failure("Invalid tenant");
                }

                if (user.TenantId != null && user.TenantId != tenant.Id)
                {
                    _logger.LogWarning("Authentication failed: User {Email} does not belong to tenant {TenantId}", request.Email, tenant.Id);
                    return EnhancedAuthenticationResult.Failure("Access denied to this tenant");
                }
            }
            else if (user.TenantId.HasValue)
            {
                tenant = await _unitOfWork.Tenants.GetByIdAsync(user.TenantId.Value, cancellationToken);
            }

            // Check MFA requirements
            var mfaMethods = await GetMFAMethodsAsync(user.Id, cancellationToken);
            if (mfaMethods.Any() && string.IsNullOrEmpty(request.MFACode))
            {
                _logger.LogInformation("MFA required for user {Email}", request.Email);
                return EnhancedAuthenticationResult.MFARequired(mfaMethods);
            }

            // Validate MFA if provided
            if (!string.IsNullOrEmpty(request.MFACode) && request.MFAMethod.HasValue)
            {
                var mfaValid = await ValidateMFAAsync(user.Id, request.MFACode, request.MFAMethod.Value, cancellationToken);
                if (!mfaValid)
                {
                    _logger.LogWarning("Authentication failed: Invalid MFA code for {Email}", request.Email);
                    return EnhancedAuthenticationResult.Failure("Invalid MFA code");
                }
            }

            // Create authentication session
            var session = await CreateSessionAsync(user, request.RememberMe, cancellationToken);
            
            // Generate tokens
            var accessToken = await _tokenService.GenerateAccessTokenAsync(user, cancellationToken);
            var refreshToken = session.RefreshToken;

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _unitOfWork.Users.UpdateAsync(user, cancellationToken);

            // Get user roles and permissions
            var roles = await GetUserRolesStringAsync(user.Id, cancellationToken);
            var permissions = await GetUserPermissionsStringAsync(user.Id, cancellationToken);

            await _unitOfWork.SaveChangesAsync(user.Id, cancellationToken);

            _logger.LogInformation("Authentication successful for user {Email}", request.Email);
            return EnhancedAuthenticationResult.Success(accessToken, refreshToken, session.ExpiresAt, user, roles, permissions, tenant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Authentication failed for email {Email}: {Message}", request.Email, ex.Message);
            return EnhancedAuthenticationResult.Failure("An error occurred during authentication");
        }
    }

    public async Task<EnhancedAuthenticationResult> AuthenticateExternalAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("External authentication attempt for provider: {Provider}", request.Provider);

            // TODO: Implement external authentication based on provider
            // This would involve validating the external token with the provider
            // and either finding an existing user or creating a new one
            
            throw new NotImplementedException("External authentication not yet implemented");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "External authentication failed for provider {Provider}: {Message}", request.Provider, ex.Message);
            return EnhancedAuthenticationResult.Failure("External authentication failed");
        }
    }

    public async Task<EnhancedAuthenticationResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Token refresh attempt");

            var session = await _unitOfWork.AuthenticationSessions.GetByRefreshTokenAsync(refreshToken, cancellationToken);
            if (session == null || !session.IsActive || session.IsExpired)
            {
                _logger.LogWarning("Token refresh failed: Invalid or expired refresh token");
                return EnhancedAuthenticationResult.Failure("Invalid refresh token");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(session.UserId, cancellationToken);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Token refresh failed: User not found or inactive");
                return EnhancedAuthenticationResult.Failure("User not found or inactive");
            }

            // Extend session
            session.ExtendSession(_defaultSessionTimeout);
            await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);

            // Generate new access token
            var newAccessToken = await _tokenService.GenerateAccessTokenAsync(user, cancellationToken);

            // Get user roles and permissions
            var roles = await GetUserRolesStringAsync(user.Id, cancellationToken);
            var permissions = await GetUserPermissionsStringAsync(user.Id, cancellationToken);

            await _unitOfWork.SaveChangesAsync(user.Id, cancellationToken);

            _logger.LogInformation("Token refresh successful for user {UserId}", user.Id);
            return EnhancedAuthenticationResult.Success(newAccessToken, refreshToken, session.ExpiresAt, user, roles, permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed: {Message}", ex.Message);
            return EnhancedAuthenticationResult.Failure("Token refresh failed");
        }
    }

    public async Task<bool> LogoutAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var session = await _unitOfWork.AuthenticationSessions.GetByRefreshTokenAsync(token, cancellationToken);
            if (session != null)
            {
                session.IsActive = false;
                await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);
                await _unitOfWork.SaveChangesAsync(session.UserId, cancellationToken);
                
                _logger.LogInformation("User {UserId} logged out successfully", session.UserId);
                return true;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<int> LogoutAllDevicesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var activeSessions = await _unitOfWork.AuthenticationSessions.GetActiveByUserIdAsync(userId, cancellationToken);
            var count = 0;

            foreach (var session in activeSessions)
            {
                session.IsActive = false;
                await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);
                count++;
            }

            await _unitOfWork.SaveChangesAsync(userId, cancellationToken);
            
            _logger.LogInformation("Logged out user {UserId} from {Count} devices", userId, count);
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout all devices failed for user {UserId}: {Message}", userId, ex.Message);
            return 0;
        }
    }

    public async Task<MFASetupResult> SetupMFAAsync(Guid userId, MFAMethod method, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Setting up MFA for user {UserId} with method {Method}", userId, method);

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return new MFASetupResult { IsSuccess = false, ErrorMessage = "User not found" };
            }

            switch (method)
            {
                case MFAMethod.TOTP:
                    return await SetupTOTPAsync(userId, cancellationToken);
                case MFAMethod.SMS:
                    return await SetupSMSAsync(userId, cancellationToken);
                case MFAMethod.Email:
                    return await SetupEmailMFAAsync(userId, cancellationToken);
                default:
                    return new MFASetupResult { IsSuccess = false, ErrorMessage = "Unsupported MFA method" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MFA setup failed for user {UserId}: {Message}", userId, ex.Message);
            return new MFASetupResult { IsSuccess = false, ErrorMessage = "MFA setup failed" };
        }
    }

    public async Task<bool> ValidateMFAAsync(Guid userId, string code, MFAMethod method, CancellationToken cancellationToken = default)
    {
        try
        {
            var mfaAuth = await GetMFAAuthenticationAsync(userId, method, cancellationToken);
            if (mfaAuth == null || !mfaAuth.IsUsable)
            {
                return false;
            }

            switch (method)
            {
                case MFAMethod.TOTP:
                    return ValidateTOTPCode(code, mfaAuth.CredentialData ?? string.Empty);
                case MFAMethod.BackupCode:
                    return await ValidateBackupCodeAsync(userId, code, cancellationToken);
                default:
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MFA validation failed for user {UserId}: {Message}", userId, ex.Message);
            return false;
        }
    }

    public async Task<bool> DisableMFAAsync(Guid userId, string verificationCode, CancellationToken cancellationToken = default)
    {
        // Implementation would verify the code and disable MFA
        throw new NotImplementedException();
    }

    public async Task<ImpersonationToken> CreateImpersonationTokenAsync(Guid adminId, Guid targetUserId, TimeSpan? duration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var admin = await _unitOfWork.Users.GetByIdAsync(adminId, cancellationToken);
            var target = await _unitOfWork.Users.GetByIdAsync(targetUserId, cancellationToken);
            
            if (admin == null || target == null)
            {
                throw new ArgumentException("Admin or target user not found");
            }

            var impersonationDuration = duration ?? _defaultImpersonationTimeout;
            var session = await CreateImpersonationSessionAsync(admin, target, impersonationDuration, cancellationToken);
            
            var token = await _tokenService.GenerateAccessTokenAsync(target, cancellationToken);
            
            return new ImpersonationToken
            {
                Token = token,
                ExpiresAt = session.ImpersonationExpiresAt ?? DateTime.UtcNow.Add(impersonationDuration),
                AdminUser = admin,
                TargetUser = target,
                StartedAt = session.ImpersonationStartedAt ?? DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Impersonation token creation failed: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<bool> EndImpersonationAsync(string impersonationToken, CancellationToken cancellationToken = default)
    {
        // Implementation would end the impersonation session
        throw new NotImplementedException();
    }

    public async Task<SessionValidationResult> ValidateSessionAsync(string sessionToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var session = await _unitOfWork.AuthenticationSessions.GetBySessionTokenAsync(sessionToken, cancellationToken);
            if (session == null || !session.IsActive || session.IsExpired)
            {
                return new SessionValidationResult { IsValid = false, ErrorMessage = "Invalid or expired session" };
            }

            var user = await _unitOfWork.Users.GetByIdAsync(session.UserId, cancellationToken);
            if (user == null || !user.IsActive)
            {
                return new SessionValidationResult { IsValid = false, ErrorMessage = "User not found or inactive" };
            }

            // Update last accessed time
            session.UpdateLastAccessed();
            await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);
            await _unitOfWork.SaveChangesAsync(session.UserId, cancellationToken);

            User? impersonatingUser = null;
            if (session.IsImpersonated && session.ImpersonatedBy.HasValue)
            {
                impersonatingUser = await _unitOfWork.Users.GetByIdAsync(session.ImpersonatedBy.Value, cancellationToken);
            }

            return new SessionValidationResult
            {
                IsValid = true,
                Session = session,
                User = user,
                RequiresMFA = session.IsMFARequired,
                IsImpersonated = session.IsImpersonated,
                ImpersonatingUser = impersonatingUser
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Session validation failed: {Message}", ex.Message);
            return new SessionValidationResult { IsValid = false, ErrorMessage = "Session validation failed" };
        }
    }

    public async Task<List<EnhancedUserSession>> GetActiveSessionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessions = await _unitOfWork.AuthenticationSessions.GetActiveByUserIdAsync(userId, cancellationToken);
            return sessions.Select(s => new EnhancedUserSession
            {
                Id = s.Id,
                CreatedAt = s.CreatedAt,
                LastAccessedAt = s.LastAccessedAt,
                ExpiresAt = s.ExpiresAt,
                IPAddress = s.IPAddress,
                UserAgent = s.UserAgent,
                DeviceType = s.DeviceType,
                Location = s.Location,
                IsImpersonated = s.IsImpersonated
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get active sessions failed for user {UserId}: {Message}", userId, ex.Message);
            return new List<EnhancedUserSession>();
        }
    }

    public async Task<bool> RevokeSessionAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var session = await _unitOfWork.AuthenticationSessions.GetByIdAsync(sessionId, cancellationToken);
            if (session != null)
            {
                session.IsActive = false;
                await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);
                await _unitOfWork.SaveChangesAsync(session.UserId, cancellationToken);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Revoke session failed for session {SessionId}: {Message}", sessionId, ex.Message);
            return false;
        }
    }

    #region Private Helper Methods

    private async Task<UserAuthenticationMethod?> GetPasswordAuthenticationAsync(Guid userId, CancellationToken cancellationToken)
    {
        var authMethods = await _unitOfWork.UserAuthenticationMethods.GetByUserIdAsync(userId, cancellationToken);
        return authMethods.FirstOrDefault(a => a.Provider == "Local" && a.AuthenticationType == "Password" && a.IsUsable);
    }

    private async Task<UserAuthenticationMethod?> GetMFAAuthenticationAsync(Guid userId, MFAMethod method, CancellationToken cancellationToken)
    {
        var authMethods = await _unitOfWork.UserAuthenticationMethods.GetByUserIdAsync(userId, cancellationToken);
        var methodType = method.ToString();
        return authMethods.FirstOrDefault(a => a.AuthenticationType == methodType && a.IsMFA && a.IsUsable);
    }

    private async Task<List<MFAMethod>> GetMFAMethodsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var authMethods = await _unitOfWork.UserAuthenticationMethods.GetByUserIdAsync(userId, cancellationToken);
        return authMethods
            .Where(a => a.IsMFA && a.IsUsable)
            .Select(a => Enum.Parse<MFAMethod>(a.AuthenticationType))
            .ToList();
    }

    private async Task RecordFailedLoginAsync(UserAuthenticationMethod authMethod, CancellationToken cancellationToken)
    {
        authMethod.FailedAttempts++;
        
        if (authMethod.FailedAttempts >= _maxFailedAttempts)
        {
            authMethod.LockedUntil = DateTime.UtcNow.Add(_lockoutDuration);
            _logger.LogWarning("Account locked for user {UserId} due to {FailedAttempts} failed attempts", authMethod.UserId, authMethod.FailedAttempts);
        }

        await _unitOfWork.UserAuthenticationMethods.UpdateAsync(authMethod, cancellationToken);
    }

    private async Task ResetFailedAttemptsAsync(UserAuthenticationMethod authMethod, CancellationToken cancellationToken)
    {
        if (authMethod.FailedAttempts > 0)
        {
            authMethod.FailedAttempts = 0;
            authMethod.LockedUntil = null;
            await _unitOfWork.UserAuthenticationMethods.UpdateAsync(authMethod, cancellationToken);
        }
    }

    private async Task<AuthenticationSession> CreateSessionAsync(User user, bool rememberMe, CancellationToken cancellationToken)
    {
        var sessionTimeout = rememberMe ? TimeSpan.FromDays(30) : _defaultSessionTimeout;
        var refreshToken = GenerateRefreshToken();

        var session = new AuthenticationSession
        {
            UserId = user.Id,
            SessionToken = GenerateSessionToken(),
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.Add(sessionTimeout),
            // Additional properties would be set from HTTP context
        };

        await _unitOfWork.AuthenticationSessions.AddAsync(session, cancellationToken);
        return session;
    }

    private async Task<AuthenticationSession> CreateImpersonationSessionAsync(User admin, User target, TimeSpan duration, CancellationToken cancellationToken)
    {
        var session = await CreateSessionAsync(target, false, cancellationToken);
        session.StartImpersonation(admin.Id, duration);
        
        await _unitOfWork.AuthenticationSessions.UpdateAsync(session, cancellationToken);
        return session;
    }

    private async Task<MFASetupResult> SetupTOTPAsync(Guid userId, CancellationToken cancellationToken)
    {
        var secret = GenerateTOTPSecret();
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        
        var qrCodeUri = $"otpauth://totp/{user?.Email}?secret={secret}&issuer=Spaghetti";
        
        // Store MFA method
        var mfaAuth = new UserAuthenticationMethod
        {
            UserId = userId,
            Provider = "Local",
            AuthenticationType = "TOTP",
            CredentialData = secret,
            IsMFA = true,
            IsActive = true
        };

        await _unitOfWork.UserAuthenticationMethods.AddAsync(mfaAuth, cancellationToken);
        await _unitOfWork.SaveChangesAsync(userId, cancellationToken);

        return new MFASetupResult
        {
            IsSuccess = true,
            Method = MFAMethod.TOTP,
            Secret = secret,
            QRCodeUri = qrCodeUri,
            BackupCodes = GenerateBackupCodes()
        };
    }

    private async Task<MFASetupResult> SetupSMSAsync(Guid userId, CancellationToken cancellationToken)
    {
        // Implementation would set up SMS MFA
        throw new NotImplementedException();
    }

    private async Task<MFASetupResult> SetupEmailMFAAsync(Guid userId, CancellationToken cancellationToken)
    {
        // Implementation would set up email MFA
        throw new NotImplementedException();
    }

    private async Task<List<string>> GetUserRolesStringAsync(Guid userId, CancellationToken cancellationToken)
    {
        var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
        var roles = new List<string>();

        foreach (var userRole in userRoles)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(userRole.RoleId, cancellationToken);
            if (role != null && role.IsActive)
            {
                roles.Add(role.Name);
            }
        }

        return roles;
    }

    private async Task<List<string>> GetUserPermissionsStringAsync(Guid userId, CancellationToken cancellationToken)
    {
        var permissions = new HashSet<string>();
        
        // Get permissions from roles
        var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
        foreach (var userRole in userRoles)
        {
            var rolePermissions = await _unitOfWork.RolePermissions.GetByRoleIdAsync(userRole.RoleId, cancellationToken);
            foreach (var rolePermission in rolePermissions.Where(rp => rp.IsGranted))
            {
                var permissionName = string.IsNullOrEmpty(rolePermission.Resource)
                    ? rolePermission.Permission
                    : $"{rolePermission.Permission}.{rolePermission.Resource}";
                permissions.Add(permissionName);
            }
        }

        // Get direct permissions
        var userPermissions = await _unitOfWork.UserPermissions.GetActiveByUserIdAsync(userId, cancellationToken);
        foreach (var userPermission in userPermissions.Where(up => up.IsValid))
        {
            permissions.Add(userPermission.FullPermission);
        }

        return permissions.ToList();
    }

    private bool ValidateTOTPCode(string code, string secret)
    {
        // Implementation would validate TOTP code using the secret
        // This is a simplified placeholder
        return !string.IsNullOrEmpty(code) && code.Length == 6 && code.All(char.IsDigit);
    }

    private async Task<bool> ValidateBackupCodeAsync(Guid userId, string code, CancellationToken cancellationToken)
    {
        // Implementation would validate and consume backup code
        throw new NotImplementedException();
    }

    private string GenerateSessionToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }

    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    private string GenerateTOTPSecret()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(20));
    }

    private List<string> GenerateBackupCodes()
    {
        var codes = new List<string>();
        for (int i = 0; i < 10; i++)
        {
            codes.Add(Guid.NewGuid().ToString("N")[..8].ToUpperInvariant());
        }
        return codes;
    }

    #endregion
}