using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using Microsoft.Extensions.Options;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// JWT token service implementation for generating and validating tokens
/// </summary>
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokenService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenExpirationMinutes;
    private readonly int _refreshTokenExpirationDays;

    public TokenService(
        IConfiguration configuration,
        ILogger<TokenService> logger,
        IUnitOfWork unitOfWork)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

        var authSection = _configuration.GetSection("Authentication");
        _secretKey = authSection["SecretKey"] ?? 
                    throw new InvalidOperationException("JWT SecretKey is required");
        _issuer = authSection["Issuer"] ?? "EnterpriseDocsAPI";
        _audience = authSection["Audience"] ?? "EnterpriseDocsClient";
        _accessTokenExpirationMinutes = int.TryParse(authSection["AccessTokenExpirationMinutes"], out var accessMinutes) ? accessMinutes : 60;
        _refreshTokenExpirationDays = int.TryParse(authSection["RefreshTokenExpirationDays"], out var refreshDays) ? refreshDays : 30;
    }

    public async Task<string> GenerateAccessTokenAsync(User user, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get user roles and permissions
            var roles = await GetUserRolesAsync(user.Id, cancellationToken);
            var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

            // Create claims
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new(ClaimTypes.Name, user.FullName),
                new("user_type", user.UserType.ToString()),
                new("tenant_id", user.TenantId?.ToString() ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add permission claims
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            // Create token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_accessTokenExpirationMinutes);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogDebug("Generated access token for user {UserId} with {ClaimCount} claims, expires at {ExpiresAt}",
                user.Id, claims.Count, expires);

            return tokenString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate access token for user {UserId}", user.Id);
            throw;
        }
    }

    public async Task<string> GenerateRefreshTokenAsync(User user, CancellationToken cancellationToken = default)
    {
        try
        {
            // Generate cryptographically secure random token
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            var token = Convert.ToBase64String(randomBytes);

            // Create refresh token entity
            var refreshToken = new RefreshToken
            {
                Token = token,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpirationDays)
            };

            // Store in database (would need to add RefreshToken repository)
            // For now, we'll store in a separate table or extend UserAuthentication
            
            _logger.LogDebug("Generated refresh token for user {UserId}, expires at {ExpiresAt}",
                user.Id, refreshToken.ExpiresAt);

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate refresh token for user {UserId}", user.Id);
            throw;
        }
    }

    public async Task<Domain.Interfaces.TokenValidationResult> ValidateAccessTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _issuer,
                ValidAudience = _audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken)
            {
                return Domain.Interfaces.TokenValidationResult.Failure("Invalid token format");
            }

            // Extract user information from claims
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Domain.Interfaces.TokenValidationResult.Failure("Invalid user ID in token");
            }

            // Get user from database
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return Domain.Interfaces.TokenValidationResult.Failure("User not found");
            }

            if (!user.IsActive)
            {
                return Domain.Interfaces.TokenValidationResult.Failure("User account is inactive");
            }

            // Extract roles and permissions
            var roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var permissions = principal.FindAll("permission").Select(c => c.Value).ToList();

            // Extract tenant ID
            var tenantIdClaim = principal.FindFirst("tenant_id");
            Guid? tenantId = null;
            if (tenantIdClaim != null && !string.IsNullOrEmpty(tenantIdClaim.Value) && Guid.TryParse(tenantIdClaim.Value, out var parsedTenantId))
            {
                tenantId = parsedTenantId;
            }

            return Domain.Interfaces.TokenValidationResult.Success(user, jwtToken.ValidTo, roles, permissions, tenantId);
        }
        catch (SecurityTokenExpiredException)
        {
            return Domain.Interfaces.TokenValidationResult.Failure("Token has expired");
        }
        catch (SecurityTokenValidationException ex)
        {
            _logger.LogWarning("Token validation failed: {Message}", ex.Message);
            return Domain.Interfaces.TokenValidationResult.Failure("Invalid token");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token validation");
            return Domain.Interfaces.TokenValidationResult.Failure("Token validation error");
        }
    }

    public async Task<Domain.Interfaces.TokenValidationResult> ValidateRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real implementation, you would:
            // 1. Look up the refresh token in the database
            // 2. Check if it's not expired and not revoked
            // 3. Return the associated user
            
            // For now, we'll implement a basic version
            // This would need a proper RefreshToken repository
            
            _logger.LogDebug("Validating refresh token");
            
            // Placeholder implementation - in production, implement proper refresh token storage
            return Domain.Interfaces.TokenValidationResult.Failure("Refresh token validation not yet implemented");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate refresh token");
            return Domain.Interfaces.TokenValidationResult.Failure("Refresh token validation error");
        }
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real implementation, you would:
            // 1. Find the refresh token in the database
            // 2. Mark it as revoked with timestamp and reason
            
            _logger.LogDebug("Revoking refresh token");
            
            // Placeholder implementation
            await Task.CompletedTask;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to revoke refresh token");
            return false;
        }
    }

    public async Task<int> RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real implementation, you would:
            // 1. Find all active refresh tokens for the user
            // 2. Mark them all as revoked
            
            _logger.LogDebug("Revoking all tokens for user {UserId}", userId);
            
            // Placeholder implementation
            await Task.CompletedTask;
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to revoke all tokens for user {UserId}", userId);
            return 0;
        }
    }

    public async Task<int> CleanupExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real implementation, you would:
            // 1. Find all expired refresh tokens
            // 2. Delete them from the database
            
            _logger.LogDebug("Cleaning up expired tokens");
            
            // Placeholder implementation
            await Task.CompletedTask;
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup expired tokens");
            return 0;
        }
    }

    private async Task<List<string>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var userRoles = await _unitOfWork.UserRoles.GetActiveByUserIdAsync(userId, cancellationToken);
            var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
            
            var roles = new List<string>();
            foreach (var roleId in roleIds)
            {
                var role = await _unitOfWork.Roles.GetByIdAsync(roleId, cancellationToken);
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
}