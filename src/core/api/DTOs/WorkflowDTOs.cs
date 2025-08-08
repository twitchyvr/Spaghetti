using System.ComponentModel.DataAnnotations;

namespace EnterpriseDocsCore.API.DTOs;

// Core Workflow DTOs
public record WorkflowDefinitionDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public WorkflowNodeDto[] Nodes { get; init; } = Array.Empty<WorkflowNodeDto>();
    public WorkflowConnectionDto[] Connections { get; init; } = Array.Empty<WorkflowConnectionDto>();
    public Dictionary<string, object> Configuration { get; init; } = new();
}

public record WorkflowNodeDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public PositionDto Position { get; init; } = new();
    public Dictionary<string, object> Properties { get; init; } = new();
}

public record PositionDto
{
    public double X { get; init; }
    public double Y { get; init; }
}

public record WorkflowConnectionDto
{
    public string Id { get; init; } = string.Empty;
    public string SourceNodeId { get; init; } = string.Empty;
    public string TargetNodeId { get; init; } = string.Empty;
    public string? Condition { get; init; }
}

// Workflow Instance DTOs
public record WorkflowInstanceDto
{
    public string Id { get; init; } = string.Empty;
    public string DefinitionId { get; init; } = string.Empty;
    public string DocumentId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string CurrentStepId { get; init; } = string.Empty;
    public Dictionary<string, object> Variables { get; init; } = new();
    public WorkflowTaskDto[] Tasks { get; init; } = Array.Empty<WorkflowTaskDto>();
}

public record WorkflowTaskDto
{
    public string Id { get; init; } = string.Empty;
    public string InstanceId { get; init; } = string.Empty;
    public string NodeId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string AssignedUserId { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public DateTime? DueDate { get; init; }
    public Dictionary<string, object> Data { get; init; } = new();
}

// Workflow Analytics DTOs
public record WorkflowAnalyticsDto
{
    public string WorkflowId { get; init; } = string.Empty;
    public int TotalInstances { get; init; }
    public int CompletedInstances { get; init; }
    public int InProgressInstances { get; init; }
    public int FailedInstances { get; init; }
    public TimeSpan AverageExecutionTime { get; init; }
    public WorkflowStepAnalyticsDto[] StepAnalytics { get; init; } = Array.Empty<WorkflowStepAnalyticsDto>();
}

public record WorkflowStepAnalyticsDto
{
    public string StepId { get; init; } = string.Empty;
    public string StepName { get; init; } = string.Empty;
    public int TotalExecutions { get; init; }
    public int SuccessfulExecutions { get; init; }
    public TimeSpan AverageExecutionTime { get; init; }
}

public record WorkflowPerformanceMetric
{
    public string MetricName { get; init; } = string.Empty;
    public double Value { get; init; }
    public string Unit { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public Dictionary<string, object> Tags { get; init; } = new();
}

// Workflow History DTOs
public record WorkflowHistoryDto
{
    public string Id { get; init; } = string.Empty;
    public string InstanceId { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string? Comments { get; init; }
    public Dictionary<string, object> Metadata { get; init; } = new();
}

// Request DTOs
public record CreateWorkflowDefinitionRequest
{
    [Required]
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    [Required]
    public WorkflowNodeDto[] Nodes { get; init; } = Array.Empty<WorkflowNodeDto>();
    public WorkflowConnectionDto[] Connections { get; init; } = Array.Empty<WorkflowConnectionDto>();
    public Dictionary<string, object> Configuration { get; init; } = new();
}

public record UpdateWorkflowDefinitionRequest : CreateWorkflowDefinitionRequest
{
    [Required]
    public string Version { get; init; } = string.Empty;
}

public record CreateWorkflowInstanceRequest
{
    [Required]
    public string DefinitionId { get; init; } = string.Empty;
    [Required]
    public string DocumentId { get; init; } = string.Empty;
    public Dictionary<string, object> InitialVariables { get; init; } = new();
}

public record CompleteWorkflowTaskRequest
{
    [Required]
    public string Action { get; init; } = string.Empty;
    public Dictionary<string, object> Data { get; init; } = new();
    public string? Comments { get; init; }
}

public record ReassignWorkflowTaskRequest
{
    [Required]
    public string NewAssigneeUserId { get; init; } = string.Empty;
    public string? Reason { get; init; }
}

// Validation DTOs
public record WorkflowValidationResult
{
    public bool IsValid { get; init; }
    public WorkflowValidationError[] Errors { get; init; } = Array.Empty<WorkflowValidationError>();
    public WorkflowValidationWarning[] Warnings { get; init; } = Array.Empty<WorkflowValidationWarning>();
}

public record WorkflowValidationError
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? NodeId { get; init; }
}

public record WorkflowValidationWarning
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? NodeId { get; init; }
}

// Domain models that need to be defined
public record WorkflowDefinition
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record WorkflowInstance
{
    public Guid Id { get; init; }
    public Guid DefinitionId { get; init; }
    public Guid DocumentId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

public record WorkflowTask
{
    public Guid Id { get; init; }
    public Guid InstanceId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public Guid AssignedUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

public record WorkflowNode
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record WorkflowHistoryEntry
{
    public Guid Id { get; init; }
    public Guid InstanceId { get; init; }
    public string Action { get; init; } = string.Empty;
    public Guid UserId { get; init; }
    public DateTime Timestamp { get; init; }
}

public record WorkflowCondition
{
    public string Expression { get; init; } = string.Empty;
    public Dictionary<string, object> Variables { get; init; } = new();
}

// Enums
public enum WorkflowStatus
{
    Draft,
    Active,
    Paused,
    Completed,
    Cancelled,
    Failed
}

public enum WorkflowPermissionType
{
    View,
    Edit,
    Delete,
    Execute,
    Manage
}