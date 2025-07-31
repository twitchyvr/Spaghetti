// DTOs will be referenced as object types to avoid circular dependencies

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service interface for workflow management operations
/// </summary>
public interface IWorkflowService
{
    /// <summary>
    /// Create a new workflow definition
    /// </summary>
    Task<object> CreateWorkflowDefinitionAsync(object workflowDefinition);

    /// <summary>
    /// Update an existing workflow definition
    /// </summary>
    Task<object?> UpdateWorkflowDefinitionAsync(Guid workflowDefinitionId, object workflowDefinition);

    /// <summary>
    /// Get a workflow definition by ID
    /// </summary>
    Task<object?> GetWorkflowDefinitionAsync(Guid workflowDefinitionId);

    /// <summary>
    /// Get all workflow definitions for a tenant
    /// </summary>
    Task<List<object>> GetWorkflowDefinitionsAsync(Guid tenantId);

    /// <summary>
    /// Delete a workflow definition
    /// </summary>
    Task<bool> DeleteWorkflowDefinitionAsync(Guid workflowDefinitionId);

    /// <summary>
    /// Start a workflow instance for a document
    /// </summary>
    Task<object> StartWorkflowAsync(Guid documentId, Guid workflowDefinitionId, Guid initiatedBy);

    /// <summary>
    /// Get workflow instance by ID
    /// </summary>
    Task<object?> GetWorkflowInstanceAsync(Guid workflowInstanceId);

    /// <summary>
    /// Get workflow instances for a document
    /// </summary>
    Task<List<object>> GetDocumentWorkflowInstancesAsync(Guid documentId);

    /// <summary>
    /// Get active workflow instances for a user
    /// </summary>
    Task<List<object>> GetUserActiveWorkflowsAsync(Guid userId);

    /// <summary>
    /// Complete a workflow task
    /// </summary>
    Task<object> CompleteWorkflowTaskAsync(Guid workflowInstanceId, Guid taskId, Guid userId, object request);

    /// <summary>
    /// Reassign a workflow task to another user
    /// </summary>
    Task<object> ReassignWorkflowTaskAsync(Guid workflowInstanceId, Guid taskId, object request);

    /// <summary>
    /// Get pending tasks for a user
    /// </summary>
    Task<List<object>> GetUserTasksAsync(Guid userId);

    /// <summary>
    /// Get all tasks for a workflow instance
    /// </summary>
    Task<List<object>> GetWorkflowTasksAsync(Guid workflowInstanceId);

    /// <summary>
    /// Cancel a workflow instance
    /// </summary>
    Task<bool> CancelWorkflowAsync(Guid workflowInstanceId, Guid cancelledBy, string reason);

    /// <summary>
    /// Get workflow analytics
    /// </summary>
    Task<object> GetWorkflowAnalyticsAsync(Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null);

    /// <summary>
    /// Get workflow performance metrics
    /// </summary>
    Task<List<object>> GetWorkflowPerformanceMetricsAsync(Guid workflowDefinitionId, DateTime? fromDate = null, DateTime? toDate = null);

    /// <summary>
    /// Execute workflow step
    /// </summary>
    Task<object> ExecuteWorkflowStepAsync(Guid workflowInstanceId, Guid stepId, object stepData);

    /// <summary>
    /// Evaluate workflow conditions
    /// </summary>
    Task<bool> EvaluateWorkflowConditionAsync(Guid workflowInstanceId, object condition);
}