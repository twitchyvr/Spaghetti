using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Refresh token entity for database storage and authentication security
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(512)]
    public string Token { get; set; } = string.Empty;
    
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    
    [MaxLength(45)]
    public string? RevokedByIp { get; set; }
    
    [MaxLength(200)]
    public string? RevokedReason { get; set; }
    
    [MaxLength(45)]
    public string? CreatedByIp { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    // Computed properties for token state
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsActive => !IsExpired && !IsRevoked;
}