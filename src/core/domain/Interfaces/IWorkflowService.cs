using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Core.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service interface for workflow management operations
/// </summary>
public interface IWorkflowService
{
    #region Workflow Definitions
    
    /// <summary>
    /// Get all workflow definitions for a tenant
    /// </summary>
    Task<IEnumerable<WorkflowDefinitionDto>> GetWorkflowDefinitionsAsync(
        Guid tenantId,
        Guid userId,
        string? category = null,
        string? search = null,
        bool includeInactive = false,
        int page = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Get a specific workflow definition by ID
    /// </summary>
    Task<WorkflowDefinitionDto?> GetWorkflowDefinitionAsync(Guid id, Guid userId);
    
    /// <summary>
    /// Create a new workflow definition
    /// </summary>
    Task<WorkflowDefinitionDto> CreateWorkflowDefinitionAsync(
        Guid tenantId,
        Guid userId,
        CreateWorkflowDefinitionRequest request);
    
    /// <summary>
    /// Update an existing workflow definition
    /// </summary>
    Task<WorkflowDefinitionDto?> UpdateWorkflowDefinitionAsync(
        Guid id,
        Guid userId,
        UpdateWorkflowDefinitionRequest request);
    
    /// <summary>
    /// Delete a workflow definition
    /// </summary>
    Task<bool> DeleteWorkflowDefinitionAsync(Guid id, Guid userId);
    
    /// <summary>
    /// Validate a workflow definition
    /// </summary>
    Task<WorkflowValidationResult?> ValidateWorkflowDefinitionAsync(Guid id, Guid userId);
    
    #endregion
    
    #region Workflow Instances
    
    /// <summary>
    /// Create a new workflow instance from a definition
    /// </summary>
    Task<WorkflowInstanceDto> CreateWorkflowInstanceAsync(
        Guid workflowDefinitionId,
        Guid userId,
        CreateWorkflowInstanceRequest request);
    
    /// <summary>
    /// Get all workflow instances for a tenant/user
    /// </summary>
    Task<IEnumerable<WorkflowInstanceDto>> GetWorkflowInstancesAsync(
        Guid tenantId,
        Guid userId,
        Guid? workflowDefinitionId = null,
        WorkflowStatus? status = null,
        bool assignedToMe = false,
        int page = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Get a specific workflow instance by ID
    /// </summary>
    Task<WorkflowInstanceDto?> GetWorkflowInstanceAsync(Guid id, Guid userId);
    
    /// <summary>
    /// Cancel a workflow instance
    /// </summary>
    Task<WorkflowInstanceDto?> CancelWorkflowInstanceAsync(
        Guid id,
        Guid userId,
        string reason);
    
    /// <summary>
    /// Pause a workflow instance
    /// </summary>
    Task<WorkflowInstanceDto?> PauseWorkflowInstanceAsync(Guid id, Guid userId);
    
    /// <summary>
    /// Resume a paused workflow instance
    /// </summary>
    Task<WorkflowInstanceDto?> ResumeWorkflowInstanceAsync(Guid id, Guid userId);
    
    #endregion
    
    #region Workflow Tasks
    
    /// <summary>
    /// Complete a workflow task
    /// </summary>
    Task<WorkflowInstanceDto?> CompleteWorkflowTaskAsync(
        Guid taskId,
        Guid userId,
        CompleteWorkflowTaskRequest request);
    
    /// <summary>
    /// Reassign a workflow task to another user
    /// </summary>
    Task<WorkflowTaskDto?> ReassignWorkflowTaskAsync(
        Guid taskId,
        Guid userId,
        ReassignWorkflowTaskRequest request);
    
    /// <summary>
    /// Get pending tasks for a user
    /// </summary>
    Task<IEnumerable<WorkflowTaskDto>> GetPendingTasksAsync(
        Guid userId,
        Guid tenantId,
        int page = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Get overdue tasks for a tenant
    /// </summary>
    Task<IEnumerable<WorkflowTaskDto>> GetOverdueTasksAsync(
        Guid tenantId,
        int page = 1,
        int pageSize = 20);
    
    #endregion
    
    #region Workflow Analytics
    
    /// <summary>
    /// Get workflow analytics and statistics
    /// </summary>
    Task<WorkflowAnalyticsDto> GetWorkflowAnalyticsAsync(
        Guid tenantId,
        Guid userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        Guid? workflowDefinitionId = null);
    
    /// <summary>
    /// Get workflow performance metrics
    /// </summary>
    Task<IEnumerable<WorkflowPerformanceMetric>> GetWorkflowPerformanceMetricsAsync(
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null);
    
    #endregion
    
    #region Workflow Permissions
    
    /// <summary>
    /// Check if user has permission to perform action on workflow
    /// </summary>
    Task<bool> HasWorkflowPermissionAsync(
        Guid userId,
        Guid workflowDefinitionId,
        WorkflowPermissionType permissionType);
    
    /// <summary>
    /// Grant workflow permission to user or role
    /// </summary>
    Task<bool> GrantWorkflowPermissionAsync(
        Guid workflowDefinitionId,
        Guid grantedBy,
        Guid? userId = null,
        Guid? roleId = null,
        WorkflowPermissionType permissionType = WorkflowPermissionType.View,
        string[]? actions = null,
        string? conditions = null,
        DateTime? expiresAt = null);
    
    /// <summary>
    /// Revoke workflow permission
    /// </summary>
    Task<bool> RevokeWorkflowPermissionAsync(Guid permissionId, Guid revokedBy);
    
    #endregion
    
    #region Workflow Execution Engine
    
    /// <summary>
    /// Execute workflow step/transition
    /// </summary>
    Task<WorkflowInstanceDto?> ExecuteWorkflowStepAsync(
        Guid instanceId,
        string stepId,
        Guid userId,
        Dictionary<string, object>? data = null);
    
    /// <summary>
    /// Process pending workflow steps (background task)
    /// </summary>
    Task ProcessPendingWorkflowStepsAsync();
    
    /// <summary>
    /// Evaluate workflow conditions
    /// </summary>
    Task<bool> EvaluateWorkflowConditionAsync(
        WorkflowCondition condition,
        Dictionary<string, object> context);
    
    #endregion
}