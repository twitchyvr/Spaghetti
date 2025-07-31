using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents permissions for workflow definitions and instances
/// </summary>
public class WorkflowPermission
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid WorkflowDefinitionId { get; set; }
    public virtual WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    
    /// <summary>
    /// User who has the permission (optional - can be role-based)
    /// </summary>
    public Guid? UserId { get; set; }
    public virtual User? User { get; set; }
    
    /// <summary>
    /// Role that has the permission (optional - can be user-based)
    /// </summary>
    public Guid? RoleId { get; set; }
    public virtual Role? Role { get; set; }
    
    /// <summary>
    /// Type of permission granted
    /// </summary>
    [Required]
    public WorkflowPermissionType PermissionType { get; set; }
    
    /// <summary>
    /// Specific actions allowed within the permission type
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Actions { get; set; } = "[]";
    
    /// <summary>
    /// Conditions or constraints for the permission (JSON)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Conditions { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    
    [Required]
    public Guid GrantedBy { get; set; }
    public virtual User GrantedByUser { get; set; } = null!;
    
    public bool IsActive { get; set; } = true;
}

public enum WorkflowPermissionType
{
    /// <summary>
    /// Can view workflow definitions and instances
    /// </summary>
    View = 0,
    
    /// <summary>
    /// Can create new workflow instances
    /// </summary>
    Execute = 1,
    
    /// <summary>
    /// Can edit workflow definitions
    /// </summary>
    Edit = 2,
    
    /// <summary>
    /// Can manage workflow permissions
    /// </summary>
    Manage = 3,
    
    /// <summary>
    /// Can delete workflow definitions
    /// </summary>
    Delete = 4,
    
    /// <summary>
    /// Can approve or complete workflow tasks
    /// </summary>
    Approve = 5,
    
    /// <summary>
    /// Can reassign workflow tasks
    /// </summary>
    Reassign = 6,
    
    /// <summary>
    /// Can cancel or terminate workflow instances
    /// </summary>
    Cancel = 7,
    
    /// <summary>
    /// Full administrative access
    /// </summary>
    Admin = 99
}