using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IUserService
{
    // User CRUD operations
    Task<User> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> DeactivateUserAsync(Guid id, Guid deactivatedBy, CancellationToken cancellationToken = default);
    Task<bool> ActivateUserAsync(Guid id, Guid activatedBy, CancellationToken cancellationToken = default);
    
    // User querying
    Task<PagedResult<User>> GetUsersAsync(UserFilter filter, CancellationToken cancellationToken = default);
    Task<List<User>> SearchUsersAsync(string query, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<List<User>> GetUsersByRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<List<User>> GetUsersByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    
    // User authentication
    Task<AuthenticationResult> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthenticationResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<bool> LogoutAsync(Guid userId, string? refreshToken = null, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default);
    
    // User profile management
    Task<UserProfile> GetUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfile> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default);
    Task<string> UploadAvatarAsync(Guid userId, Stream avatarStream, string fileName, CancellationToken cancellationToken = default);
    Task<bool> DeleteAvatarAsync(Guid userId, CancellationToken cancellationToken = default);
    
    // User settings management
    Task<UserSettings> GetUserSettingsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserSettings> UpdateUserSettingsAsync(Guid userId, UpdateUserSettingsRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateModuleSettingAsync(Guid userId, string moduleName, ModuleSettings settings, CancellationToken cancellationToken = default);
    
    // User roles and permissions
    Task<List<UserRole>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserRole> AssignRoleAsync(Guid userId, AssignRoleRequest request, Guid assignedBy, CancellationToken cancellationToken = default);
    Task<bool> RemoveRoleAsync(Guid userId, Guid roleId, Guid removedBy, CancellationToken cancellationToken = default);
    Task<List<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> HasPermissionAsync(Guid userId, string permission, string? resource = null, CancellationToken cancellationToken = default);
    
    // User activity and audit
    Task<List<UserAuditEntry>> GetUserAuditTrailAsync(Guid userId, int count = 50, CancellationToken cancellationToken = default);
    Task RecordUserActivityAsync(Guid userId, string action, string? details = null, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<UserActivity> GetUserActivitySummaryAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    
    // User preferences and customization
    Task<Dictionary<string, object>> GetUserPreferencesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> UpdateUserPreferenceAsync(Guid userId, string key, object value, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserPreferenceAsync(Guid userId, string key, CancellationToken cancellationToken = default);
    
    // User notifications
    Task<List<UserNotification>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false, CancellationToken cancellationToken = default);
    Task<UserNotification> CreateNotificationAsync(CreateNotificationRequest request, CancellationToken cancellationToken = default);
    Task<bool> MarkNotificationAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);
    Task<bool> MarkAllNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteNotificationAsync(Guid notificationId, CancellationToken cancellationToken = default);
    
    // User sessions
    Task<List<UserSession>> GetActiveSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserSession> CreateSessionAsync(Guid userId, CreateSessionRequest request, CancellationToken cancellationToken = default);
    Task<bool> InvalidateSessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task<bool> InvalidateAllSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    
    // User analytics
    Task<UserAnalytics> GetUserAnalyticsAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<List<UserEngagement>> GetTopUsersAsync(Guid tenantId, int count = 10, CancellationToken cancellationToken = default);
    
    // Bulk operations
    Task<BulkOperationResult> BulkInviteUsersAsync(List<InviteUserRequest> requests, Guid invitedBy, CancellationToken cancellationToken = default);
    Task<BulkOperationResult> BulkUpdateRolesAsync(List<BulkRoleUpdateRequest> requests, Guid updatedBy, CancellationToken cancellationToken = default);
    Task<BulkOperationResult> BulkDeactivateUsersAsync(List<Guid> userIds, Guid deactivatedBy, CancellationToken cancellationToken = default);
}

// Request/Response DTOs
public class CreateUserRequest
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public string? Password { get; set; } // Optional for invited users
    public Guid? TenantId { get; set; }
    public UserProfile? Profile { get; set; }
    public List<Guid> RoleIds { get; set; } = new();
    public bool SendInviteEmail { get; set; } = true;
}

public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
    public Guid? TenantId { get; set; }
}

public class UserFilter
{
    public string? Search { get; set; }
    public Guid? TenantId { get; set; }
    public bool? IsActive { get; set; }
    public List<Guid> RoleIds { get; set; } = new();
    public string? Department { get; set; }
    public string? Industry { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public DateTime? LastLoginFrom { get; set; }
    public DateTime? LastLoginTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "CreatedAt";
    public SortOrder SortOrder { get; set; } = SortOrder.Descending;
}

public class AuthenticationResult
{
    public required User User { get; set; }
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
    public List<string> Permissions { get; set; } = new();
    public bool RequiresMFA { get; set; }
    public string? MFAToken { get; set; }
}

public class ChangePasswordRequest
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}

public class ResetPasswordRequest
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public required string NewPassword { get; set; }
    public required string ConfirmPassword { get; set; }
}

public class UpdateUserProfileRequest
{
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Industry { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? TimeZone { get; set; }
    public string? Language { get; set; }
    public Dictionary<string, object>? CustomFields { get; set; }
}

public class UpdateUserSettingsRequest
{
    public bool? EnableAIAssistance { get; set; }
    public bool? EnableAutoDocumentation { get; set; }
    public bool? EnableVoiceCapture { get; set; }
    public bool? EnableScreenCapture { get; set; }
    public bool? EnableFileMonitoring { get; set; }
    public PrivacyLevel? PrivacyLevel { get; set; }
    public bool? AllowDataRetention { get; set; }
    public int? DataRetentionDays { get; set; }
    public bool? EnableEmailNotifications { get; set; }
    public bool? EnablePushNotifications { get; set; }
    public bool? EnableSlackNotifications { get; set; }
    public bool? EnableTeamsNotifications { get; set; }
    public string? Theme { get; set; }
    public string? DefaultDocumentType { get; set; }
    public List<string>? FavoriteAgents { get; set; }
    public Dictionary<string, object>? CustomSettings { get; set; }
}

public class AssignRoleRequest
{
    public required Guid RoleId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UserActivity
{
    public int DocumentsCreated { get; set; }
    public int DocumentsEdited { get; set; }
    public int DocumentsViewed { get; set; }
    public int DocumentsShared { get; set; }
    public int LoginCount { get; set; }
    public TimeSpan TotalTimeSpent { get; set; }
    public DateTime? LastActivity { get; set; }
    public Dictionary<string, int> ActivityByDay { get; set; } = new();
    public Dictionary<string, int> DocumentTypeActivity { get; set; } = new();
}

public class UserNotification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationType Type { get; set; }
    public string? ActionUrl { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error,
    DocumentShared,
    DocumentCommented,
    DocumentUpdated,
    PermissionGranted,
    PermissionRevoked,
    SystemUpdate,
    SecurityAlert
}

public class CreateNotificationRequest
{
    public required Guid UserId { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? ActionUrl { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public DateTime? ExpiresAt { get; set; }
}

public class UserSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string SessionToken { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? LastAccessedAt { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSessionRequest
{
    public required string IPAddress { get; set; }
    public required string UserAgent { get; set; }
    public string? Location { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UserAnalytics
{
    public UserActivity Activity { get; set; } = new();
    public Dictionary<string, int> ModuleUsage { get; set; } = new();
    public Dictionary<string, int> AgentUsage { get; set; } = new();
    public List<string> PopularDocumentTypes { get; set; } = new();
    public List<string> PopularTags { get; set; } = new();
    public Dictionary<DateTime, int> LoginHistory { get; set; } = new();
    public TimeSpan AverageSessionDuration { get; set; }
    public int TotalSessions { get; set; }
}

public class UserEngagement
{
    public required User User { get; set; }
    public int EngagementScore { get; set; }
    public UserActivity Activity { get; set; } = new();
    public DateTime LastActivity { get; set; }
    public List<string> TopActivities { get; set; } = new();
}

public class InviteUserRequest
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public List<Guid> RoleIds { get; set; } = new();
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public string? CustomMessage { get; set; }
}

public class BulkRoleUpdateRequest
{
    public required Guid UserId { get; set; }
    public List<Guid> RoleIdsToAdd { get; set; } = new();
    public List<Guid> RoleIdsToRemove { get; set; } = new();
}