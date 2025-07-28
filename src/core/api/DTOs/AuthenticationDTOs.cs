using System.ComponentModel.DataAnnotations;
using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.API.DTOs;

/// <summary>
/// Login request DTO
/// </summary>
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
    
    public string? TenantSubdomain { get; set; }
}

/// <summary>
/// Login response DTO
/// </summary>
public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserInfoDto User { get; set; } = new();
    public TenantInfoDto? Tenant { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

/// <summary>
/// Refresh token request DTO
/// </summary>
public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

/// <summary>
/// Refresh token response DTO
/// </summary>
public class RefreshTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// Logout request DTO
/// </summary>
public class LogoutRequest
{
    public string? RefreshToken { get; set; }
    public bool LogoutFromAllDevices { get; set; } = false;
}

/// <summary>
/// User information DTO
/// </summary>
public class UserInfoDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public UserType UserType { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public Guid? TenantId { get; set; }
    public UserProfileDto Profile { get; set; } = new();
    public UserSettingsDto Settings { get; set; } = new();
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

/// <summary>
/// User profile DTO
/// </summary>
public class UserProfileDto
{
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Industry { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? TimeZone { get; set; }
    public string Language { get; set; } = "en";
}

/// <summary>
/// User settings DTO
/// </summary>
public class UserSettingsDto
{
    public bool EnableAIAssistance { get; set; } = true;
    public bool EnableAutoDocumentation { get; set; } = true;
    public bool EnableEmailNotifications { get; set; } = true;
    public bool EnablePushNotifications { get; set; } = true;
    public string Theme { get; set; } = "light";
    public string DefaultDocumentType { get; set; } = "general";
    public List<string> FavoriteAgents { get; set; } = new();
}

/// <summary>
/// Tenant information DTO
/// </summary>
public class TenantInfoDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public TenantStatus Status { get; set; }
    public TenantTier Tier { get; set; }
    public string Industry { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? TrialExpiresAt { get; set; }
    public TenantSettingsDto Settings { get; set; } = new();
}

/// <summary>
/// Tenant settings DTO
/// </summary>
public class TenantSettingsDto
{
    public bool AllowGuestAccess { get; set; } = false;
    public bool EnableAuditLogging { get; set; } = true;
    public bool EnableAPIAccess { get; set; } = true;
    public string TimeZone { get; set; } = "UTC";
    public string Language { get; set; } = "en";
    public int MaxUsers { get; set; } = 10;
    public int MaxDocuments { get; set; } = 1000;
    public long MaxStorageBytes { get; set; } = 1_073_741_824; // 1GB
}

/// <summary>
/// Password change request DTO
/// </summary>
public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Password reset request DTO
/// </summary>
public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public string? TenantSubdomain { get; set; }
}

/// <summary>
/// Password reset confirmation DTO
/// </summary>
public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// API response wrapper
/// </summary>
/// <typeparam name="T">Response data type</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }

    public static ApiResponse<T> Fail(List<string> errors)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Errors = errors,
            Message = "One or more validation errors occurred"
        };
    }
}