using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents a role in the system for authorization
/// </summary>
public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    /// <summary>
    /// Whether this is a system-defined role that cannot be deleted
    /// </summary>
    public bool IsSystemRole { get; set; } = false;
    
    /// <summary>
    /// Whether the role is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Tenant this role belongs to (null for system roles)
    /// </summary>
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Users assigned to this role
    /// </summary>
    public List<UserRole> UserRoles { get; set; } = new();
    
    /// <summary>
    /// Permissions granted to this role
    /// </summary>
    public List<RolePermission> RolePermissions { get; set; } = new();
}

/// <summary>
/// Represents the assignment of a user to a role
/// </summary>
public class UserRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    
    /// <summary>
    /// When this role assignment becomes active
    /// </summary>
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// When this role assignment expires (null for permanent)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
    
    /// <summary>
    /// Whether this role assignment is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    /// <summary>
    /// User who assigned this role (alias for CreatedBy for compatibility)
    /// </summary>
    public Guid AssignedBy 
    { 
        get => CreatedBy; 
        set => CreatedBy = value; 
    }
    
    public User? AssignedByUser 
    { 
        get => CreatedByUser; 
        set => CreatedByUser = value; 
    }
}

/// <summary>
/// Represents a permission granted to a role
/// </summary>
public class RolePermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    
    /// <summary>
    /// Permission identifier (e.g., "Document.Read", "User.Admin")
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Permission { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether the permission is granted (true) or denied (false)
    /// </summary>
    public bool IsGranted { get; set; } = true;
    
    /// <summary>
    /// Optional resource filter for the permission
    /// </summary>
    [MaxLength(200)]
    public string? ResourceFilter { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}