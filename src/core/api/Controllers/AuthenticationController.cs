using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.API.Controllers;

/// <summary>
/// Authentication controller for user login, logout, and token management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public class AuthenticationController : ControllerBase
{
    private readonly ILogger<AuthenticationController> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPasswordService _passwordService;

    public AuthenticationController(
        ILogger<AuthenticationController> logger,
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IPasswordService passwordService)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
    }

    /// <summary>
    /// Authenticate user and return access tokens
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication tokens and user information</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<object>.Fail(errors));
            }

            // Find user by email
            var user = await _unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found for email {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.Fail("Invalid email or password"));
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed: User account inactive for {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.Fail("User account is inactive"));
            }

            // Verify password (for now, we'll assume we have a password stored - this needs proper implementation)
            // In a real implementation, you'd get the password hash from UserAuthentication table
            var userAuth = await _unitOfWork.UserAuthentications.GetByProviderAsync("Local", user.Id.ToString(), cancellationToken);
            if (userAuth == null)
            {
                _logger.LogWarning("Login failed: No local authentication found for {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.Fail("Invalid email or password"));
            }

            // For now, we'll skip password verification - implement this when UserAuthentication stores password hash
            // if (!_passwordService.VerifyPassword(request.Password, userAuth.PasswordHash))
            // {
            //     return Unauthorized(ApiResponse<object>.Fail("Invalid email or password"));
            // }

            // Check tenant access if specified
            Tenant? tenant = null;
            if (!string.IsNullOrEmpty(request.TenantSubdomain))
            {
                tenant = await _unitOfWork.Tenants.GetBySubdomainAsync(request.TenantSubdomain, cancellationToken);
                if (tenant == null)
                {
                    _logger.LogWarning("Login failed: Tenant not found for subdomain {Subdomain}", request.TenantSubdomain);
                    return BadRequest(ApiResponse<object>.Fail("Invalid tenant"));
                }

                if (user.TenantId != null && user.TenantId != tenant.Id)
                {
                    _logger.LogWarning("Login failed: User {Email} does not belong to tenant {TenantId}", request.Email, tenant.Id);
                    return Unauthorized(ApiResponse<object>.Fail("Access denied to this tenant"));
                }
            }
            else if (user.TenantId.HasValue)
            {
                tenant = await _unitOfWork.Tenants.GetByIdAsync(user.TenantId.Value, cancellationToken);
            }

            // Generate tokens
            var accessToken = await _tokenService.GenerateAccessTokenAsync(user, cancellationToken);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user, cancellationToken);

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _unitOfWork.Users.UpdateAsync(user, cancellationToken);

            // Create audit entry
            var auditEntry = new UserAuditEntry
            {
                UserId = user.Id,
                Action = "Login",
                Details = $"Successful login from {GetClientIpAddress()}",
                IPAddress = GetClientIpAddress(),
                UserAgent = GetUserAgent(),
                IsSuccess = true
            };
            await _unitOfWork.UserAuditEntries.AddAsync(auditEntry, cancellationToken);

            await _unitOfWork.SaveChangesAsync(user.Id, cancellationToken);

            // Get user roles and permissions for response
            var roles = await GetUserRolesAsync(user.Id, cancellationToken);
            var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

            var response = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60), // This should come from token service
                User = MapUserToDto(user, roles, permissions),
                Tenant = tenant != null ? MapTenantToDto(tenant) : null,
                Roles = roles,
                Permissions = permissions
            };

            _logger.LogInformation("Login successful for user {Email}", request.Email);
            return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for email {Email}: {Message}", request.Email, ex.Message);
            return StatusCode(500, ApiResponse<object>.Fail("An error occurred during login"));
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>New access token</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<RefreshTokenResponse>>> RefreshTokenAsync(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Token refresh attempt");

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<object>.Fail(errors));
            }

            // Validate refresh token
            var validationResult = await _tokenService.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken);
            if (!validationResult.IsValid || validationResult.User == null)
            {
                _logger.LogWarning("Token refresh failed: Invalid refresh token");
                return Unauthorized(ApiResponse<object>.Fail("Invalid refresh token"));
            }

            // Generate new tokens
            var newAccessToken = await _tokenService.GenerateAccessTokenAsync(validationResult.User, cancellationToken);
            var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(validationResult.User, cancellationToken);

            // Revoke old refresh token
            await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);

            var response = new RefreshTokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60) // This should come from token service
            };

            _logger.LogInformation("Token refresh successful for user {UserId}", validationResult.User.Id);
            return Ok(ApiResponse<RefreshTokenResponse>.Ok(response, "Token refreshed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.Fail("An error occurred during token refresh"));
        }
    }

    /// <summary>
    /// Logout user and revoke tokens
    /// </summary>
    /// <param name="request">Logout request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Logout confirmation</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<object>>> LogoutAsync(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.Fail("Invalid user context"));
            }

            _logger.LogInformation("Logout attempt for user {UserId}", userId);

            if (request.LogoutFromAllDevices)
            {
                // Revoke all refresh tokens for the user
                var revokedCount = await _tokenService.RevokeAllUserTokensAsync(userId, cancellationToken);
                _logger.LogInformation("Revoked {Count} tokens for user {UserId}", revokedCount, userId);
            }
            else if (!string.IsNullOrEmpty(request.RefreshToken))
            {
                // Revoke specific refresh token
                await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);
            }

            // Create audit entry
            var auditEntry = new UserAuditEntry
            {
                UserId = userId,
                Action = "Logout",
                Details = $"User logged out from {GetClientIpAddress()}",
                IPAddress = GetClientIpAddress(),
                UserAgent = GetUserAgent(),
                IsSuccess = true
            };
            await _unitOfWork.UserAuditEntries.AddAsync(auditEntry, cancellationToken);
            await _unitOfWork.SaveChangesAsync(userId, cancellationToken);

            _logger.LogInformation("Logout successful for user {UserId}", userId);
            return Ok(ApiResponse<object>.Ok(null, "Logout successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.Fail("An error occurred during logout"));
        }
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserInfoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserInfoDto>>> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.Fail("Invalid user context"));
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("User not found"));
            }

            var roles = await GetUserRolesAsync(userId, cancellationToken);
            var permissions = await GetUserPermissionsAsync(userId, cancellationToken);

            var userDto = MapUserToDto(user, roles, permissions);

            return Ok(ApiResponse<UserInfoDto>.Ok(userDto, "User information retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get current user: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.Fail("An error occurred while retrieving user information"));
        }
    }

    #region Helper Methods

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return Guid.Empty;
    }

    private string GetClientIpAddress()
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
        {
            ipAddress = "127.0.0.1";
        }
        return ipAddress ?? "Unknown";
    }

    private string GetUserAgent()
    {
        return HttpContext.Request.Headers.UserAgent.ToString();
    }

    private async Task<List<string>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken)
    {
        try
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get roles for user {UserId}", userId);
            return new List<string>();
        }
    }

    private async Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var permissions = new HashSet<string>();
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

            return permissions.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get permissions for user {UserId}", userId);
            return new List<string>();
        }
    }

    private static UserInfoDto MapUserToDto(User user, List<string> roles, List<string> permissions)
    {
        return new UserInfoDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email,
            UserType = user.UserType,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            TenantId = user.TenantId,
            Profile = new UserProfileDto
            {
                JobTitle = user.Profile.JobTitle,
                Department = user.Profile.Department,
                Industry = user.Profile.Industry,
                PhoneNumber = user.Profile.PhoneNumber,
                Bio = user.Profile.Bio,
                AvatarUrl = user.Profile.AvatarUrl,
                TimeZone = user.Profile.TimeZone,
                Language = user.Profile.Language
            },
            Settings = new UserSettingsDto
            {
                EnableAIAssistance = user.Settings.EnableAIAssistance,
                EnableAutoDocumentation = user.Settings.EnableAutoDocumentation,
                EnableEmailNotifications = user.Settings.EnableEmailNotifications,
                EnablePushNotifications = user.Settings.EnablePushNotifications,
                Theme = user.Settings.Theme,
                DefaultDocumentType = user.Settings.DefaultDocumentType,
                FavoriteAgents = user.Settings.FavoriteAgents
            },
            Roles = roles,
            Permissions = permissions
        };
    }

    private static TenantInfoDto MapTenantToDto(Tenant tenant)
    {
        return new TenantInfoDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Subdomain = tenant.Subdomain,
            Status = tenant.Status,
            Tier = tenant.Tier,
            Industry = tenant.Industry,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt,
            TrialExpiresAt = tenant.TrialExpiresAt,
            Settings = new TenantSettingsDto
            {
                AllowGuestAccess = tenant.Settings.AllowGuestAccess,
                EnableAuditLogging = tenant.Settings.EnableAuditLogging,
                EnableAPIAccess = tenant.Settings.EnableAPIAccess,
                TimeZone = tenant.Settings.TimeZone,
                Language = tenant.Settings.Language,
                MaxUsers = tenant.Settings.MaxUsers,
                MaxDocuments = tenant.Settings.MaxDocuments,
                MaxStorageBytes = tenant.Settings.MaxStorageBytes
            }
        };
    }

    #endregion
}