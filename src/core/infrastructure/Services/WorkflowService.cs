using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using EnterpriseDocsCore.API.DTOs;
using EnterpriseDocsCore.Core.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;
using EnterpriseDocsCore.Infrastructure.Data;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Service implementation for workflow management operations
/// </summary>
public class WorkflowService : IWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WorkflowService> _logger;

    public WorkflowService(
        ApplicationDbContext context,
        ILogger<WorkflowService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Workflow Definitions

    public async Task<IEnumerable<WorkflowDefinitionDto>> GetWorkflowDefinitionsAsync(
        Guid tenantId,
        Guid userId,
        string? category = null,
        string? search = null,
        bool includeInactive = false,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.WorkflowDefinitions
            .Include(w => w.CreatedByUser)
            .Include(w => w.UpdatedByUser)
            .Where(w => w.TenantId == tenantId);

        if (!includeInactive)
        {
            query = query.Where(w => w.IsActive);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(w => w.Category == category);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(w => w.Name.Contains(search) || 
                                   (w.Description != null && w.Description.Contains(search)));
        }

        var workflows = await query
            .OrderBy(w => w.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return workflows.Select(MapToDto);
    }

    public async Task<WorkflowDefinitionDto?> GetWorkflowDefinitionAsync(Guid id, Guid userId)
    {
        var workflow = await _context.WorkflowDefinitions
            .Include(w => w.CreatedByUser)
            .Include(w => w.UpdatedByUser)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null) return null;

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, id, WorkflowPermissionType.View))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to view this workflow");
        }

        return MapToDto(workflow);
    }

    public async Task<WorkflowDefinitionDto> CreateWorkflowDefinitionAsync(
        Guid tenantId,
        Guid userId,
        CreateWorkflowDefinitionRequest request)
    {
        var workflow = new WorkflowDefinition
        {
            TenantId = tenantId,
            Name = request.Name,
            Description = request.Description,
            Definition = JsonSerializer.Serialize(request.Definition),
            Category = request.Category,
            Tags = request.Tags,
            CreatedBy = userId,
            UpdatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.WorkflowDefinitions.Add(workflow);
        await _context.SaveChangesAsync();

        // Grant creator full permissions
        await GrantWorkflowPermissionAsync(
            workflow.Id,
            userId,
            userId: userId,
            permissionType: WorkflowPermissionType.Admin);

        _logger.LogInformation("Created workflow definition {WorkflowId} for tenant {TenantId}", 
            workflow.Id, tenantId);

        return await GetWorkflowDefinitionAsync(workflow.Id, userId) 
               ?? throw new InvalidOperationException("Failed to retrieve created workflow");
    }

    public async Task<WorkflowDefinitionDto?> UpdateWorkflowDefinitionAsync(
        Guid id,
        Guid userId,
        UpdateWorkflowDefinitionRequest request)
    {
        var workflow = await _context.WorkflowDefinitions
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null) return null;

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, id, WorkflowPermissionType.Edit))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to edit this workflow");
        }

        workflow.Name = request.Name;
        workflow.Description = request.Description;
        workflow.Definition = JsonSerializer.Serialize(request.Definition);
        workflow.Category = request.Category;
        workflow.Tags = request.Tags;
        workflow.IsActive = request.IsActive;
        workflow.UpdatedBy = userId;
        workflow.UpdatedAt = DateTime.UtcNow;
        workflow.Version++;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated workflow definition {WorkflowId} to version {Version}", 
            id, workflow.Version);

        return await GetWorkflowDefinitionAsync(id, userId);
    }

    public async Task<bool> DeleteWorkflowDefinitionAsync(Guid id, Guid userId)
    {
        var workflow = await _context.WorkflowDefinitions
            .Include(w => w.Instances)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null) return false;

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, id, WorkflowPermissionType.Delete))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to delete this workflow");
        }

        // Check if there are active instances
        var activeInstances = workflow.Instances.Any(i => 
            i.Status == WorkflowStatus.Active || 
            i.Status == WorkflowStatus.Waiting || 
            i.Status == WorkflowStatus.Paused);

        if (activeInstances)
        {
            throw new InvalidOperationException("Cannot delete workflow with active instances");
        }

        _context.WorkflowDefinitions.Remove(workflow);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted workflow definition {WorkflowId}", id);
        return true;
    }

    public async Task<WorkflowValidationResult?> ValidateWorkflowDefinitionAsync(Guid id, Guid userId)
    {
        var workflow = await GetWorkflowDefinitionAsync(id, userId);
        if (workflow == null) return null;

        var result = new WorkflowValidationResult { IsValid = true };
        var definition = workflow.Definition;

        // Validate nodes
        if (!definition.Nodes.Any())
        {
            result.Errors.Add(new WorkflowValidationError
            {
                Type = "EmptyWorkflow",
                Message = "Workflow must contain at least one node"
            });
            result.IsValid = false;
        }

        // Check for start node
        var startNodes = definition.Nodes.Where(n => n.Type == "start").ToList();
        if (!startNodes.Any())
        {
            result.Errors.Add(new WorkflowValidationError
            {
                Type = "MissingStartNode",
                Message = "Workflow must have at least one start node"
            });
            result.IsValid = false;
        }
        else if (startNodes.Count > 1)
        {
            result.Warnings.Add(new WorkflowValidationWarning
            {
                Type = "MultipleStartNodes",
                Message = "Workflow has multiple start nodes"
            });
        }

        // Check for end node
        var endNodes = definition.Nodes.Where(n => n.Type == "end").ToList();
        if (!endNodes.Any())
        {
            result.Errors.Add(new WorkflowValidationError
            {
                Type = "MissingEndNode",
                Message = "Workflow must have at least one end node"
            });
            result.IsValid = false;
        }

        // Validate connections
        foreach (var node in definition.Nodes)
        {
            if (node.Type == "start") continue;

            var hasIncoming = definition.Connections.Any(c => c.TargetNodeId == node.Id);
            if (!hasIncoming)
            {
                result.Warnings.Add(new WorkflowValidationWarning
                {
                    Type = "UnreachableNode",
                    Message = $"Node '{node.Name}' has no incoming connections",
                    NodeId = node.Id
                });
            }

            if (node.Type == "end") continue;

            var hasOutgoing = definition.Connections.Any(c => c.SourceNodeId == node.Id);
            if (!hasOutgoing)
            {
                result.Warnings.Add(new WorkflowValidationWarning
                {
                    Type = "DeadEndNode",
                    Message = $"Node '{node.Name}' has no outgoing connections",
                    NodeId = node.Id
                });
            }
        }

        return result;
    }

    #endregion

    #region Workflow Instances

    public async Task<WorkflowInstanceDto> CreateWorkflowInstanceAsync(
        Guid workflowDefinitionId,
        Guid userId,
        CreateWorkflowInstanceRequest request)
    {
        var definition = await _context.WorkflowDefinitions
            .FirstOrDefaultAsync(w => w.Id == workflowDefinitionId && w.IsActive);

        if (definition == null)
        {
            throw new ArgumentException("Workflow definition not found or inactive");
        }

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, workflowDefinitionId, WorkflowPermissionType.Execute))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to execute this workflow");
        }

        var instance = new WorkflowInstance
        {
            WorkflowDefinitionId = workflowDefinitionId,
            DocumentId = request.DocumentId,
            CurrentState = "start",
            Context = JsonSerializer.Serialize(request.Context),
            StartedBy = userId,
            AssignedTo = request.AssignedTo,
            Priority = Enum.Parse<Priority>(request.Priority, true),
            DueDate = request.DueDate,
            StartedAt = DateTime.UtcNow
        };

        _context.WorkflowInstances.Add(instance);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created workflow instance {InstanceId} from definition {DefinitionId}", 
            instance.Id, workflowDefinitionId);

        return await GetWorkflowInstanceAsync(instance.Id, userId) 
               ?? throw new InvalidOperationException("Failed to retrieve created workflow instance");
    }

    public async Task<IEnumerable<WorkflowInstanceDto>> GetWorkflowInstancesAsync(
        Guid tenantId,
        Guid userId,
        Guid? workflowDefinitionId = null,
        WorkflowStatus? status = null,
        bool assignedToMe = false,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .Include(i => i.Document)
            .Include(i => i.StartedByUser)
            .Include(i => i.AssignedToUser)
            .Include(i => i.Tasks)
            .Where(i => i.WorkflowDefinition!.TenantId == tenantId);

        if (workflowDefinitionId.HasValue)
        {
            query = query.Where(i => i.WorkflowDefinitionId == workflowDefinitionId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        if (assignedToMe)
        {
            query = query.Where(i => i.AssignedTo == userId);
        }

        var instances = await query
            .OrderByDescending(i => i.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return instances.Select(MapToDto);
    }

    public async Task<WorkflowInstanceDto?> GetWorkflowInstanceAsync(Guid id, Guid userId)
    {
        var instance = await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .Include(i => i.Document)
            .Include(i => i.StartedByUser)
            .Include(i => i.AssignedToUser)
            .Include(i => i.Tasks)
                .ThenInclude(t => t.AssignedToUser)
            .Include(i => i.Tasks)
                .ThenInclude(t => t.CompletedByUser)
            .Include(i => i.History)
                .ThenInclude(h => h.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instance == null) return null;

        // Check if user can view this instance
        var canView = instance.StartedBy == userId ||
                     instance.AssignedTo == userId ||
                     instance.Tasks.Any(t => t.AssignedTo == userId) ||
                     await HasWorkflowPermissionAsync(userId, instance.WorkflowDefinitionId, WorkflowPermissionType.View);

        if (!canView)
        {
            throw new UnauthorizedAccessException("Insufficient permissions to view this workflow instance");
        }

        return MapToDto(instance);
    }

    public async Task<WorkflowInstanceDto?> CancelWorkflowInstanceAsync(
        Guid id,
        Guid userId,
        string reason)
    {
        var instance = await _context.WorkflowInstances
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instance == null) return null;

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, instance.WorkflowDefinitionId, WorkflowPermissionType.Cancel))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to cancel this workflow instance");
        }

        instance.Status = WorkflowStatus.Cancelled;
        instance.CompletedAt = DateTime.UtcNow;

        // Add history entry
        var historyEntry = new WorkflowHistoryEntry
        {
            WorkflowInstanceId = id,
            Action = "Cancel",
            FromState = instance.CurrentState,
            ToState = "cancelled",
            UserId = userId,
            Comments = reason,
            Timestamp = DateTime.UtcNow
        };

        _context.WorkflowHistoryEntries.Add(historyEntry);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Cancelled workflow instance {InstanceId} by user {UserId}: {Reason}", 
            id, userId, reason);

        return await GetWorkflowInstanceAsync(id, userId);
    }

    public async Task<WorkflowInstanceDto?> PauseWorkflowInstanceAsync(Guid id, Guid userId)
    {
        var instance = await _context.WorkflowInstances
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instance == null) return null;

        if (instance.Status != WorkflowStatus.Active)
        {
            throw new ArgumentException("Only active workflows can be paused");
        }

        instance.Status = WorkflowStatus.Paused;

        var historyEntry = new WorkflowHistoryEntry
        {
            WorkflowInstanceId = id,
            Action = "Pause",
            FromState = instance.CurrentState,
            ToState = instance.CurrentState,
            UserId = userId,
            Timestamp = DateTime.UtcNow
        };

        _context.WorkflowHistoryEntries.Add(historyEntry);
        await _context.SaveChangesAsync();

        return await GetWorkflowInstanceAsync(id, userId);
    }

    public async Task<WorkflowInstanceDto?> ResumeWorkflowInstanceAsync(Guid id, Guid userId)
    {
        var instance = await _context.WorkflowInstances
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instance == null) return null;

        if (instance.Status != WorkflowStatus.Paused)
        {
            throw new ArgumentException("Only paused workflows can be resumed");
        }

        instance.Status = WorkflowStatus.Active;

        var historyEntry = new WorkflowHistoryEntry
        {
            WorkflowInstanceId = id,
            Action = "Resume",
            FromState = instance.CurrentState,
            ToState = instance.CurrentState,
            UserId = userId,
            Timestamp = DateTime.UtcNow
        };

        _context.WorkflowHistoryEntries.Add(historyEntry);
        await _context.SaveChangesAsync();

        return await GetWorkflowInstanceAsync(id, userId);
    }

    #endregion

    #region Workflow Tasks

    public async Task<WorkflowInstanceDto?> CompleteWorkflowTaskAsync(
        Guid taskId,
        Guid userId,
        CompleteWorkflowTaskRequest request)
    {
        var task = await _context.WorkflowTasks
            .Include(t => t.WorkflowInstance)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return null;

        // Check if user can complete this task
        if (task.AssignedTo != userId)
        {
            throw new UnauthorizedAccessException("You are not assigned to this task");
        }

        task.Status = TaskStatus.Completed;
        task.CompletedAt = DateTime.UtcNow;
        task.CompletedBy = userId;
        task.CompletionNotes = request.Comments;
        task.TaskData = JsonSerializer.Serialize(request.TaskData);

        // Add history entry
        var historyEntry = new WorkflowHistoryEntry
        {
            WorkflowInstanceId = task.WorkflowInstanceId,
            Action = $"TaskCompleted:{request.Action}",
            FromState = task.WorkflowInstance!.CurrentState,
            ToState = task.WorkflowInstance.CurrentState,
            UserId = userId,
            Comments = request.Comments,
            ActionData = JsonSerializer.Serialize(new { TaskId = taskId, Action = request.Action }),
            Timestamp = DateTime.UtcNow
        };

        _context.WorkflowHistoryEntries.Add(historyEntry);
        await _context.SaveChangesAsync();

        // Process next steps in workflow
        await ProcessWorkflowAfterTaskCompletionAsync(task.WorkflowInstance, task, request.Action);

        return await GetWorkflowInstanceAsync(task.WorkflowInstanceId, userId);
    }

    public async Task<WorkflowTaskDto?> ReassignWorkflowTaskAsync(
        Guid taskId,
        Guid userId,
        ReassignWorkflowTaskRequest request)
    {
        var task = await _context.WorkflowTasks
            .Include(t => t.WorkflowInstance)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return null;

        // Check permissions
        if (!await HasWorkflowPermissionAsync(userId, task.WorkflowInstance!.WorkflowDefinitionId, WorkflowPermissionType.Reassign))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to reassign this task");
        }

        var oldAssignee = task.AssignedTo;
        task.AssignedTo = request.AssignedTo;

        // Add history entry
        var historyEntry = new WorkflowHistoryEntry
        {
            WorkflowInstanceId = task.WorkflowInstanceId,
            Action = "TaskReassigned",
            FromState = task.WorkflowInstance.CurrentState,
            ToState = task.WorkflowInstance.CurrentState,
            UserId = userId,
            Comments = request.Reason,
            ActionData = JsonSerializer.Serialize(new { TaskId = taskId, OldAssignee = oldAssignee, NewAssignee = request.AssignedTo }),
            Timestamp = DateTime.UtcNow
        };

        _context.WorkflowHistoryEntries.Add(historyEntry);
        await _context.SaveChangesAsync();

        var updatedTask = await _context.WorkflowTasks
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        return MapToDto(updatedTask!);
    }

    public async Task<IEnumerable<WorkflowTaskDto>> GetPendingTasksAsync(
        Guid userId,
        Guid tenantId,
        int page = 1,
        int pageSize = 20)
    {
        var tasks = await _context.WorkflowTasks
            .Include(t => t.WorkflowInstance)
                .ThenInclude(i => i.WorkflowDefinition)
            .Include(t => t.AssignedToUser)
            .Where(t => t.AssignedTo == userId && 
                       t.Status == TaskStatus.Pending &&
                       t.WorkflowInstance!.WorkflowDefinition!.TenantId == tenantId)
            .OrderBy(t => t.DueDate ?? DateTime.MaxValue)
            .ThenBy(t => t.Priority)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return tasks.Select(MapToDto);
    }

    public async Task<IEnumerable<WorkflowTaskDto>> GetOverdueTasksAsync(
        Guid tenantId,
        int page = 1,
        int pageSize = 20)
    {
        var cutoffDate = DateTime.UtcNow;

        var tasks = await _context.WorkflowTasks
            .Include(t => t.WorkflowInstance)
                .ThenInclude(i => i.WorkflowDefinition)
            .Include(t => t.AssignedToUser)
            .Where(t => t.DueDate < cutoffDate && 
                       t.Status == TaskStatus.Pending &&
                       t.WorkflowInstance!.WorkflowDefinition!.TenantId == tenantId)
            .OrderBy(t => t.DueDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return tasks.Select(MapToDto);
    }

    #endregion

    #region Workflow Analytics

    public async Task<WorkflowAnalyticsDto> GetWorkflowAnalyticsAsync(
        Guid tenantId,
        Guid userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        Guid? workflowDefinitionId = null)
    {
        fromDate ??= DateTime.UtcNow.AddDays(-30);
        toDate ??= DateTime.UtcNow;

        var query = _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .Where(i => i.WorkflowDefinition!.TenantId == tenantId &&
                       i.StartedAt >= fromDate &&
                       i.StartedAt <= toDate);

        if (workflowDefinitionId.HasValue)
        {
            query = query.Where(i => i.WorkflowDefinitionId == workflowDefinitionId.Value);
        }

        var instances = await query.ToListAsync();
        var tasks = await _context.WorkflowTasks
            .Where(t => instances.Select(i => i.Id).Contains(t.WorkflowInstanceId))
            .ToListAsync();

        var analytics = new WorkflowAnalyticsDto
        {
            TotalWorkflows = await _context.WorkflowDefinitions
                .CountAsync(w => w.TenantId == tenantId && w.IsActive),
            ActiveInstances = instances.Count(i => i.Status == WorkflowStatus.Active),
            CompletedInstances = instances.Count(i => i.Status == WorkflowStatus.Completed),
            FailedInstances = instances.Count(i => i.Status == WorkflowStatus.Failed),
            PendingTasks = tasks.Count(t => t.Status == TaskStatus.Pending),
            OverdueTasks = tasks.Count(t => t.Status == TaskStatus.Pending && t.DueDate < DateTime.UtcNow)
        };

        var completedInstances = instances.Where(i => i.CompletedAt.HasValue).ToList();
        if (completedInstances.Any())
        {
            analytics.AverageCompletionTime = completedInstances
                .Average(i => (i.CompletedAt!.Value - i.StartedAt).TotalHours);
            analytics.SuccessRate = (double)analytics.CompletedInstances / (analytics.CompletedInstances + analytics.FailedInstances) * 100;
        }

        return analytics;
    }

    public async Task<IEnumerable<WorkflowPerformanceMetric>> GetWorkflowPerformanceMetricsAsync(
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        fromDate ??= DateTime.UtcNow.AddDays(-30);
        toDate ??= DateTime.UtcNow;

        var metrics = await _context.WorkflowDefinitions
            .Where(w => w.TenantId == tenantId && w.IsActive)
            .Select(w => new WorkflowPerformanceMetric
            {
                WorkflowName = w.Name,
                WorkflowDefinitionId = w.Id,
                ExecutionCount = w.Instances.Count(i => i.StartedAt >= fromDate && i.StartedAt <= toDate),
                SuccessfulExecutions = w.Instances.Count(i => i.Status == WorkflowStatus.Completed && i.StartedAt >= fromDate && i.StartedAt <= toDate),
                FailedExecutions = w.Instances.Count(i => i.Status == WorkflowStatus.Failed && i.StartedAt >= fromDate && i.StartedAt <= toDate),
                LastExecuted = w.Instances.Where(i => i.StartedAt >= fromDate && i.StartedAt <= toDate).Max(i => (DateTime?)i.StartedAt)
            })
            .ToListAsync();

        foreach (var metric in metrics)
        {
            if (metric.ExecutionCount > 0)
            {
                var completedInstances = await _context.WorkflowInstances
                    .Where(i => i.WorkflowDefinitionId == metric.WorkflowDefinitionId &&
                               i.Status == WorkflowStatus.Completed &&
                               i.StartedAt >= fromDate && i.StartedAt <= toDate &&
                               i.CompletedAt.HasValue)
                    .ToListAsync();

                if (completedInstances.Any())
                {
                    metric.AverageCompletionTime = completedInstances
                        .Average(i => (i.CompletedAt!.Value - i.StartedAt).TotalHours);
                }

                metric.SuccessRate = metric.SuccessfulExecutions + metric.FailedExecutions > 0
                    ? (double)metric.SuccessfulExecutions / (metric.SuccessfulExecutions + metric.FailedExecutions) * 100
                    : 0;
            }
        }

        return metrics.OrderByDescending(m => m.ExecutionCount);
    }

    #endregion

    #region Workflow Permissions

    public async Task<bool> HasWorkflowPermissionAsync(
        Guid userId,
        Guid workflowDefinitionId,
        WorkflowPermissionType permissionType)
    {
        // Check if user is the creator (has admin rights)
        var workflow = await _context.WorkflowDefinitions
            .FirstOrDefaultAsync(w => w.Id == workflowDefinitionId);

        if (workflow?.CreatedBy == userId)
            return true;

        // Check explicit permissions
        var hasPermission = await _context.WorkflowPermissions
            .AnyAsync(p => p.WorkflowDefinitionId == workflowDefinitionId &&
                          p.IsActive &&
                          (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow) &&
                          (p.UserId == userId || 
                           (p.RoleId != null && _context.UserRoles.Any(ur => ur.UserId == userId && ur.RoleId == p.RoleId))) &&
                          (p.PermissionType == permissionType || p.PermissionType == WorkflowPermissionType.Admin));

        return hasPermission;
    }

    public async Task<bool> GrantWorkflowPermissionAsync(
        Guid workflowDefinitionId,
        Guid grantedBy,
        Guid? userId = null,
        Guid? roleId = null,
        WorkflowPermissionType permissionType = WorkflowPermissionType.View,
        string[]? actions = null,
        string? conditions = null,
        DateTime? expiresAt = null)
    {
        if (userId == null && roleId == null)
        {
            throw new ArgumentException("Either userId or roleId must be specified");
        }

        var permission = new WorkflowPermission
        {
            WorkflowDefinitionId = workflowDefinitionId,
            UserId = userId,
            RoleId = roleId,
            PermissionType = permissionType,
            Actions = JsonSerializer.Serialize(actions ?? Array.Empty<string>()),
            Conditions = conditions,
            GrantedBy = grantedBy,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkflowPermissions.Add(permission);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RevokeWorkflowPermissionAsync(Guid permissionId, Guid revokedBy)
    {
        var permission = await _context.WorkflowPermissions
            .FirstOrDefaultAsync(p => p.Id == permissionId);

        if (permission == null) return false;

        permission.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Workflow Execution Engine

    public async Task<WorkflowInstanceDto?> ExecuteWorkflowStepAsync(
        Guid instanceId,
        string stepId,
        Guid userId,
        Dictionary<string, object>? data = null)
    {
        var instance = await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .FirstOrDefaultAsync(i => i.Id == instanceId);

        if (instance == null) return null;

        // Parse workflow definition to find the step
        var definition = JsonSerializer.Deserialize<WorkflowDefinitionSchema>(instance.WorkflowDefinition!.Definition);
        var step = definition?.Nodes.FirstOrDefault(n => n.Id == stepId);

        if (step == null)
        {
            throw new ArgumentException($"Step {stepId} not found in workflow definition");
        }

        // Execute step based on type
        var success = await ExecuteWorkflowNodeAsync(instance, step, userId, data);

        if (success)
        {
            // Move to next step
            await AdvanceWorkflowAsync(instance, step, userId);
        }

        return await GetWorkflowInstanceAsync(instanceId, userId);
    }

    public async Task ProcessPendingWorkflowStepsAsync()
    {
        var pendingInstances = await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .Where(i => i.Status == WorkflowStatus.Active || i.Status == WorkflowStatus.Waiting)
            .ToListAsync();

        foreach (var instance in pendingInstances)
        {
            try
            {
                await ProcessWorkflowInstanceStepsAsync(instance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing workflow instance {InstanceId}", instance.Id);
            }
        }
    }

    public async Task<bool> EvaluateWorkflowConditionAsync(
        WorkflowCondition condition,
        Dictionary<string, object> context)
    {
        // Simple condition evaluation - in production, use a proper expression engine
        switch (condition.Type.ToLower())
        {
            case "expression":
                return EvaluateSimpleExpression(condition.Expression, context);
            case "value":
                return context.ContainsKey(condition.Expression) && 
                       context[condition.Expression]?.ToString()?.ToLower() == "true";
            case "script":
                // In production, use a scripting engine like JavaScript.NET or similar
                return true; // Placeholder
            default:
                return false;
        }
    }

    #endregion

    #region Private Helper Methods

    private WorkflowDefinitionDto MapToDto(WorkflowDefinition workflow)
    {
        var definition = string.IsNullOrEmpty(workflow.Definition) 
            ? new WorkflowDefinitionSchema() 
            : JsonSerializer.Deserialize<WorkflowDefinitionSchema>(workflow.Definition) ?? new WorkflowDefinitionSchema();

        return new WorkflowDefinitionDto
        {
            Id = workflow.Id,
            TenantId = workflow.TenantId,
            Name = workflow.Name,
            Description = workflow.Description,
            Definition = definition,
            Version = workflow.Version,
            IsActive = workflow.IsActive,
            Category = workflow.Category,
            Tags = workflow.Tags,
            CreatedAt = workflow.CreatedAt,
            UpdatedAt = workflow.UpdatedAt,
            CreatedBy = workflow.CreatedBy,
            CreatedByUserName = workflow.CreatedByUser?.Email,
            UpdatedBy = workflow.UpdatedBy,
            UpdatedByUserName = workflow.UpdatedByUser?.Email
        };
    }

    private WorkflowInstanceDto MapToDto(WorkflowInstance instance)
    {
        var context = string.IsNullOrEmpty(instance.Context) 
            ? new Dictionary<string, object>() 
            : JsonSerializer.Deserialize<Dictionary<string, object>>(instance.Context) ?? new Dictionary<string, object>();

        return new WorkflowInstanceDto
        {
            Id = instance.Id,
            WorkflowDefinitionId = instance.WorkflowDefinitionId,
            WorkflowName = instance.WorkflowDefinition?.Name ?? "Unknown",
            DocumentId = instance.DocumentId,
            DocumentTitle = instance.Document?.Title,
            CurrentState = instance.CurrentState,
            Context = context,
            Status = instance.Status.ToString(),
            StartedAt = instance.StartedAt,
            CompletedAt = instance.CompletedAt,
            StartedBy = instance.StartedBy,
            StartedByUserName = instance.StartedByUser?.Email,
            AssignedTo = instance.AssignedTo,
            AssignedToUserName = instance.AssignedToUser?.Email,
            Priority = instance.Priority.ToString(),
            DueDate = instance.DueDate,
            Tasks = instance.Tasks?.Select(MapToDto).ToList() ?? new List<WorkflowTaskDto>(),
            History = instance.History?.Select(MapToDto).ToList() ?? new List<WorkflowHistoryDto>()
        };
    }

    private WorkflowTaskDto MapToDto(WorkflowTask task)
    {
        var taskData = string.IsNullOrEmpty(task.TaskData) 
            ? new Dictionary<string, object>() 
            : JsonSerializer.Deserialize<Dictionary<string, object>>(task.TaskData) ?? new Dictionary<string, object>();

        return new WorkflowTaskDto
        {
            Id = task.Id,
            WorkflowInstanceId = task.WorkflowInstanceId,
            Name = task.Name,
            Description = task.Description,
            TaskType = task.TaskType,
            AssignedTo = task.AssignedTo,
            AssignedToUserName = task.AssignedToUser?.Email,
            AssignedToRole = task.AssignedToRole,
            AssignedToRoleName = task.AssignedToRoleEntity?.Name,
            Status = task.Status.ToString(),
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt,
            DueDate = task.DueDate,
            CompletedBy = task.CompletedBy,
            CompletedByUserName = task.CompletedByUser?.Email,
            CompletionNotes = task.CompletionNotes,
            TaskData = taskData,
            Priority = task.Priority.ToString()
        };
    }

    private WorkflowHistoryDto MapToDto(WorkflowHistoryEntry history)
    {
        var actionData = string.IsNullOrEmpty(history.ActionData) 
            ? new Dictionary<string, object>() 
            : JsonSerializer.Deserialize<Dictionary<string, object>>(history.ActionData) ?? new Dictionary<string, object>();

        return new WorkflowHistoryDto
        {
            Id = history.Id,
            Action = history.Action,
            FromState = history.FromState,
            ToState = history.ToState,
            Timestamp = history.Timestamp,
            UserId = history.UserId,
            UserName = history.User?.Email,
            Comments = history.Comments,
            ActionData = actionData
        };
    }

    private async Task ProcessWorkflowAfterTaskCompletionAsync(WorkflowInstance instance, WorkflowTask task, string action)
    {
        // Update workflow state based on task completion
        // This is a simplified implementation - in production, this would be much more sophisticated
        var allTasksCompleted = await _context.WorkflowTasks
            .Where(t => t.WorkflowInstanceId == instance.Id && 
                       t.Status != TaskStatus.Completed && 
                       t.Status != TaskStatus.Cancelled)
            .CountAsync() == 0;

        if (allTasksCompleted)
        {
            instance.Status = WorkflowStatus.Completed;
            instance.CompletedAt = DateTime.UtcNow;
            instance.CurrentState = "completed";
        }

        await _context.SaveChangesAsync();
    }

    private async Task<bool> ExecuteWorkflowNodeAsync(WorkflowInstance instance, WorkflowNode node, Guid userId, Dictionary<string, object>? data)
    {
        // Execute node based on type
        switch (node.Type.ToLower())
        {
            case "task":
                return await ExecuteTaskNodeAsync(instance, node, userId, data);
            case "decision":
                return await ExecuteDecisionNodeAsync(instance, node, userId, data);
            case "end":
                return await ExecuteEndNodeAsync(instance, node, userId, data);
            default:
                return true; // Default success for unknown node types
        }
    }

    private async Task<bool> ExecuteTaskNodeAsync(WorkflowInstance instance, WorkflowNode node, Guid userId, Dictionary<string, object>? data)
    {
        // Create task for this node if it doesn't exist
        var existingTask = await _context.WorkflowTasks
            .FirstOrDefaultAsync(t => t.WorkflowInstanceId == instance.Id && t.Name == node.Name);

        if (existingTask == null)
        {
            var task = new WorkflowTask
            {
                WorkflowInstanceId = instance.Id,
                Name = node.Name,
                Description = node.Description,
                TaskType = node.Properties.GetValueOrDefault("taskType", "manual").ToString() ?? "manual",
                AssignedTo = instance.AssignedTo,
                Priority = instance.Priority,
                DueDate = instance.DueDate,
                TaskData = JsonSerializer.Serialize(data ?? new Dictionary<string, object>())
            };

            _context.WorkflowTasks.Add(task);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    private async Task<bool> ExecuteDecisionNodeAsync(WorkflowInstance instance, WorkflowNode node, Guid userId, Dictionary<string, object>? data)
    {
        // Evaluate decision conditions
        var conditions = node.Properties.GetValueOrDefault("conditions", new List<object>());
        // Implementation would evaluate conditions and route accordingly
        return true;
    }

    private async Task<bool> ExecuteEndNodeAsync(WorkflowInstance instance, WorkflowNode node, Guid userId, Dictionary<string, object>? data)
    {
        instance.Status = WorkflowStatus.Completed;
        instance.CompletedAt = DateTime.UtcNow;
        instance.CurrentState = "completed";
        
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task AdvanceWorkflowAsync(WorkflowInstance instance, WorkflowNode currentNode, Guid userId)
    {
        // Find next node(s) in workflow
        var definition = JsonSerializer.Deserialize<WorkflowDefinitionSchema>(instance.WorkflowDefinition!.Definition);
        var nextConnections = definition?.Connections.Where(c => c.SourceNodeId == currentNode.Id).ToList();

        if (nextConnections?.Any() == true)
        {
            // For simplicity, take the first connection
            var nextConnection = nextConnections.First();
            var nextNode = definition!.Nodes.FirstOrDefault(n => n.Id == nextConnection.TargetNodeId);

            if (nextNode != null)
            {
                instance.CurrentState = nextNode.Id;
                await _context.SaveChangesAsync();

                // Execute next node
                await ExecuteWorkflowNodeAsync(instance, nextNode, userId, null);
            }
        }
    }

    private async Task ProcessWorkflowInstanceStepsAsync(WorkflowInstance instance)
    {
        // Process any automated steps or time-based transitions
        // This would be implemented based on specific workflow requirements
        await Task.CompletedTask;
    }

    private bool EvaluateSimpleExpression(string expression, Dictionary<string, object> context)
    {
        // Very simple expression evaluator - in production use a proper expression library
        if (expression.Contains("=="))
        {
            var parts = expression.Split("==", 2);
            if (parts.Length == 2)
            {
                var left = parts[0].Trim();
                var right = parts[1].Trim().Trim('"', '\'');
                
                if (context.ContainsKey(left))
                {
                    return context[left]?.ToString() == right;
                }
            }
        }

        return false;
    }

    #endregion
}