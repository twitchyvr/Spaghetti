using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.Domain.Entities;

/// <summary>
/// Represents a reusable workflow definition template
/// </summary>
public class WorkflowDefinition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// Workflow definition in JSON format (nodes, connections, rules)
    /// </summary>
    [Required]
    public string Definition { get; set; } = string.Empty;
    
    /// <summary>
    /// Workflow version for change management
    /// </summary>
    public int Version { get; set; } = 1;
    
    /// <summary>
    /// Whether this workflow is currently active and can be used
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Category for organizing workflows
    /// </summary>
    [MaxLength(100)]
    public string Category { get; set; } = "General";
    
    /// <summary>
    /// Tags for searchability
    /// </summary>
    public List<string> Tags { get; set; } = new();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    public Guid? UpdatedBy { get; set; }
    public User? UpdatedByUser { get; set; }
    
    /// <summary>
    /// Workflow instances created from this definition
    /// </summary>
    public List<WorkflowInstance> Instances { get; set; } = new();
}

/// <summary>
/// Represents an active workflow instance executing on a document or process
/// </summary>
public class WorkflowInstance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid WorkflowDefinitionId { get; set; }
    public WorkflowDefinition? WorkflowDefinition { get; set; }
    
    /// <summary>
    /// Document this workflow is operating on (optional)
    /// </summary>
    public Guid? DocumentId { get; set; }
    public Document? Document { get; set; }
    
    /// <summary>
    /// Current state/step in the workflow
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string CurrentState { get; set; } = string.Empty;
    
    /// <summary>
    /// Workflow execution context and variables (JSON)
    /// </summary>
    public string? Context { get; set; }
    
    /// <summary>
    /// Current status of the workflow execution
    /// </summary>
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Active;
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    [Required]
    public Guid StartedBy { get; set; }
    public User? StartedByUser { get; set; }
    
    /// <summary>
    /// User currently assigned to handle the workflow
    /// </summary>
    public Guid? AssignedTo { get; set; }
    public User? AssignedToUser { get; set; }
    
    /// <summary>
    /// Priority level for workflow execution
    /// </summary>
    public Priority Priority { get; set; } = Priority.Normal;
    
    /// <summary>
    /// Due date for workflow completion
    /// </summary>
    public DateTime? DueDate { get; set; }
    
    /// <summary>
    /// Workflow execution history
    /// </summary>
    public List<WorkflowHistoryEntry> History { get; set; } = new();
    
    /// <summary>
    /// Pending tasks in this workflow
    /// </summary>
    public List<WorkflowTask> Tasks { get; set; } = new();
}

/// <summary>
/// Represents a task within a workflow instance
/// </summary>
public class WorkflowTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid WorkflowInstanceId { get; set; }
    public WorkflowInstance? WorkflowInstance { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// Task type (approval, review, notification, etc.)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string TaskType { get; set; } = string.Empty;
    
    /// <summary>
    /// User assigned to complete this task
    /// </summary>
    public Guid? AssignedTo { get; set; }
    public User? AssignedToUser { get; set; }
    
    /// <summary>
    /// Role that can complete this task (alternative to specific user)
    /// </summary>
    public Guid? AssignedToRole { get; set; }
    public Role? AssignedToRoleEntity { get; set; }
    
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? DueDate { get; set; }
    
    /// <summary>
    /// User who completed the task
    /// </summary>
    public Guid? CompletedBy { get; set; }
    public User? CompletedByUser { get; set; }
    
    /// <summary>
    /// Task completion result/comments
    /// </summary>
    public string? CompletionNotes { get; set; }
    
    /// <summary>
    /// Task-specific data and form inputs (JSON)
    /// </summary>
    public string? TaskData { get; set; }
    
    public Priority Priority { get; set; } = Priority.Normal;
}

/// <summary>
/// Represents a history entry for workflow state changes
/// </summary>
public class WorkflowHistoryEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid WorkflowInstanceId { get; set; }
    public WorkflowInstance? WorkflowInstance { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? FromState { get; set; }
    
    [MaxLength(100)]
    public string? ToState { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [Required]
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    public string? Comments { get; set; }
    
    /// <summary>
    /// Additional context data for the action (JSON)
    /// </summary>
    public string? ActionData { get; set; }
}

public enum WorkflowStatus
{
    Active,
    Paused,
    Completed,
    Cancelled,
    Failed,
    Waiting
}

public enum TaskStatus
{
    Pending,
    InProgress,
    Completed,
    Cancelled,
    Overdue,
    Escalated
}

public enum Priority
{
    Low,
    Normal,
    High,
    Urgent,
    Critical
}