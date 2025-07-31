using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

/// <summary>
/// Request to create a workflow definition
/// </summary>
public class CreateWorkflowDefinitionRequest
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public WorkflowDefinitionDto Definition { get; set; } = new();
    
    [MaxLength(100)]
    public string Category { get; set; } = "General";
    
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// Workflow definition response
/// </summary>
public class WorkflowDefinitionDto
{
    public Guid Id { get; set; }
    
    public Guid TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public WorkflowDefinitionSchema Definition { get; set; } = new();
    
    public int Version { get; set; }
    
    public bool IsActive { get; set; }
    
    public string Category { get; set; } = string.Empty;
    
    public List<string> Tags { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    public Guid CreatedBy { get; set; }
    
    public string? CreatedByUserName { get; set; }
    
    public Guid? UpdatedBy { get; set; }
    
    public string? UpdatedByUserName { get; set; }
}

/// <summary>
/// Workflow definition schema
/// </summary>
public class WorkflowDefinitionSchema
{
    public List<WorkflowNode> Nodes { get; set; } = new();
    
    public List<WorkflowConnection> Connections { get; set; } = new();
    
    public WorkflowSettings Settings { get; set; } = new();
    
    public Dictionary<string, object> Variables { get; set; } = new();
}

/// <summary>
/// Workflow node definition
/// </summary>
public class WorkflowNode
{
    public string Id { get; set; } = string.Empty;
    
    public string Type { get; set; } = string.Empty; // start, end, task, decision, parallel, wait
    
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public WorkflowNodePosition Position { get; set; } = new();
    
    public Dictionary<string, object> Properties { get; set; } = new();
    
    public List<string> InputPorts { get; set; } = new();
    
    public List<string> OutputPorts { get; set; } = new();
}

/// <summary>
/// Workflow node position for visual designer
/// </summary>
public class WorkflowNodePosition
{
    public double X { get; set; }
    
    public double Y { get; set; }
    
    public double? Width { get; set; }
    
    public double? Height { get; set; }
}

/// <summary>
/// Workflow connection between nodes
/// </summary>
public class WorkflowConnection
{
    public string Id { get; set; } = string.Empty;
    
    public string SourceNodeId { get; set; } = string.Empty;
    
    public string SourcePort { get; set; } = string.Empty;
    
    public string TargetNodeId { get; set; } = string.Empty;
    
    public string TargetPort { get; set; } = string.Empty;
    
    public string? Label { get; set; }
    
    public WorkflowCondition? Condition { get; set; }
    
    public Dictionary<string, object> Properties { get; set; } = new();
}

/// <summary>
/// Workflow condition for conditional routing
/// </summary>
public class WorkflowCondition
{
    public string Type { get; set; } = string.Empty; // expression, value, script
    
    public string Expression { get; set; } = string.Empty;
    
    public Dictionary<string, object> Parameters { get; set; } = new();
}

/// <summary>
/// Workflow settings
/// </summary>
public class WorkflowSettings
{
    public TimeSpan? DefaultTimeout { get; set; }
    
    public int MaxRetries { get; set; } = 3;
    
    public bool AllowParallelExecution { get; set; } = true;
    
    public string? NotificationEmail { get; set; }
    
    public List<string> NotificationChannels { get; set; } = new();
    
    public Dictionary<string, object> CustomSettings { get; set; } = new();
}

/// <summary>
/// Request to start a workflow instance
/// </summary>
public class StartWorkflowRequest
{
    [Required]
    public Guid WorkflowDefinitionId { get; set; }
    
    public Guid? DocumentId { get; set; }
    
    public Dictionary<string, object> Context { get; set; } = new();
    
    public Guid? AssignedTo { get; set; }
    
    public string Priority { get; set; } = "Normal"; // Low, Normal, High, Urgent, Critical
    
    public DateTime? DueDate { get; set; }
}

/// <summary>
/// Workflow instance response
/// </summary>
public class WorkflowInstanceDto
{
    public Guid Id { get; set; }
    
    public Guid WorkflowDefinitionId { get; set; }
    
    public string WorkflowName { get; set; } = string.Empty;
    
    public Guid? DocumentId { get; set; }
    
    public string? DocumentTitle { get; set; }
    
    public string CurrentState { get; set; } = string.Empty;
    
    public Dictionary<string, object> Context { get; set; } = new();
    
    public string Status { get; set; } = string.Empty; // Active, Paused, Completed, Cancelled, Failed, Waiting
    
    public DateTime StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public Guid StartedBy { get; set; }
    
    public string? StartedByUserName { get; set; }
    
    public Guid? AssignedTo { get; set; }
    
    public string? AssignedToUserName { get; set; }
    
    public string Priority { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public List<WorkflowTaskDto> Tasks { get; set; } = new();
    
    public List<WorkflowHistoryDto> History { get; set; } = new();
}

/// <summary>
/// Workflow task response
/// </summary>
public class WorkflowTaskDto
{
    public Guid Id { get; set; }
    
    public Guid WorkflowInstanceId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string TaskType { get; set; } = string.Empty;
    
    public Guid? AssignedTo { get; set; }
    
    public string? AssignedToUserName { get; set; }
    
    public Guid? AssignedToRole { get; set; }
    
    public string? AssignedToRoleName { get; set; }
    
    public string Status { get; set; } = string.Empty; // Pending, InProgress, Completed, Cancelled, Overdue, Escalated
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public Guid? CompletedBy { get; set; }
    
    public string? CompletedByUserName { get; set; }
    
    public string? CompletionNotes { get; set; }
    
    public Dictionary<string, object> TaskData { get; set; } = new();
    
    public string Priority { get; set; } = string.Empty;
}

/// <summary>
/// Workflow history entry response
/// </summary>
public class WorkflowHistoryDto
{
    public Guid Id { get; set; }
    
    public string Action { get; set; } = string.Empty;
    
    public string? FromState { get; set; }
    
    public string? ToState { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public Guid UserId { get; set; }
    
    public string? UserName { get; set; }
    
    public string? Comments { get; set; }
    
    public Dictionary<string, object> ActionData { get; set; } = new();
}

/// <summary>
/// Request to execute a workflow action
/// </summary>
public class ExecuteWorkflowActionRequest
{
    [Required]
    public string Action { get; set; } = string.Empty;
    
    public Dictionary<string, object> Data { get; set; } = new();
    
    public string? Comments { get; set; }
}

/// <summary>
/// Request to complete a workflow task
/// </summary>
public class CompleteWorkflowTaskRequest
{
    [Required]
    public string Action { get; set; } = string.Empty; // approve, reject, complete, escalate
    
    public string? Comments { get; set; }
    
    public Dictionary<string, object> TaskData { get; set; } = new();
}

/// <summary>
/// Paginated response for workflows
/// </summary>
public class WorkflowListResponse
{
    public List<WorkflowInstanceDto> Items { get; set; } = new();
    
    public int TotalCount { get; set; }
    
    public int PageNumber { get; set; }
    
    public int PageSize { get; set; }
    
    public int TotalPages { get; set; }
    
    public bool HasNextPage { get; set; }
    
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Request to update a workflow definition
/// </summary>
public class UpdateWorkflowDefinitionRequest
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public WorkflowDefinitionSchema Definition { get; set; } = new();
    
    [MaxLength(100)]
    public string Category { get; set; } = "General";
    
    public List<string> Tags { get; set; } = new();
    
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Request to create a workflow instance
/// </summary>
public class CreateWorkflowInstanceRequest
{
    [Required]
    public Guid WorkflowDefinitionId { get; set; }
    
    public Guid? DocumentId { get; set; }
    
    public Dictionary<string, object> Context { get; set; } = new();
    
    public Guid? AssignedTo { get; set; }
    
    public string Priority { get; set; } = "Normal";
    
    public DateTime? DueDate { get; set; }
}

/// <summary>
/// Request to reassign a workflow task
/// </summary>
public class ReassignWorkflowTaskRequest
{
    [Required]
    public Guid AssignedTo { get; set; }
    
    public string? Reason { get; set; }
}

/// <summary>
/// Request to cancel a workflow instance
/// </summary>
public class CancelWorkflowInstanceRequest
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Workflow validation result
/// </summary>
public class WorkflowValidationResult
{
    public bool IsValid { get; set; }
    
    public List<WorkflowValidationError> Errors { get; set; } = new();
    
    public List<WorkflowValidationWarning> Warnings { get; set; } = new();
    
    public Dictionary<string, object> ValidationData { get; set; } = new();
}

/// <summary>
/// Workflow validation error
/// </summary>
public class WorkflowValidationError
{
    public string Type { get; set; } = string.Empty;
    
    public string Message { get; set; } = string.Empty;
    
    public string? NodeId { get; set; }
    
    public string? ConnectionId { get; set; }
    
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

/// <summary>
/// Workflow validation warning
/// </summary>
public class WorkflowValidationWarning
{
    public string Type { get; set; } = string.Empty;
    
    public string Message { get; set; } = string.Empty;
    
    public string? NodeId { get; set; }
    
    public string? ConnectionId { get; set; }
    
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

/// <summary>
/// Workflow analytics and statistics
/// </summary>
public class WorkflowAnalyticsDto
{
    public int TotalWorkflows { get; set; }
    
    public int ActiveInstances { get; set; }
    
    public int CompletedInstances { get; set; }
    
    public int FailedInstances { get; set; }
    
    public int PendingTasks { get; set; }
    
    public int OverdueTasks { get; set; }
    
    public double AverageCompletionTime { get; set; }
    
    public double SuccessRate { get; set; }
    
    public List<WorkflowPerformanceMetric> PerformanceMetrics { get; set; } = new();
    
    public List<WorkflowUsageStatistic> UsageStatistics { get; set; } = new();
    
    public Dictionary<string, object> CustomMetrics { get; set; } = new();
}

/// <summary>
/// Workflow performance metric
/// </summary>
public class WorkflowPerformanceMetric
{
    public string WorkflowName { get; set; } = string.Empty;
    
    public Guid WorkflowDefinitionId { get; set; }
    
    public int ExecutionCount { get; set; }
    
    public int SuccessfulExecutions { get; set; }
    
    public int FailedExecutions { get; set; }
    
    public double AverageCompletionTime { get; set; }
    
    public double SuccessRate { get; set; }
    
    public DateTime? LastExecuted { get; set; }
}

/// <summary>
/// Workflow usage statistic
/// </summary>
public class WorkflowUsageStatistic
{
    public DateTime Date { get; set; }
    
    public int ExecutionsStarted { get; set; }
    
    public int ExecutionsCompleted { get; set; }
    
    public int ExecutionsFailed { get; set; }
    
    public int TasksCompleted { get; set; }
    
    public double AverageCompletionTime { get; set; }
}