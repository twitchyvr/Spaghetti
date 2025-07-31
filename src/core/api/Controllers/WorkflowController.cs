using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EnterpriseDocsCore.Application.DTOs.Workflow;
using EnterpriseDocsCore.Application.Services;
using EnterpriseDocsCore.Core.Domain.Entities;
using System.Security.Claims;

namespace EnterpriseDocsCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkflowController : ControllerBase
{
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(
        IWorkflowService workflowService,
        ILogger<WorkflowController> logger)
    {
        _workflowService = workflowService;
        _logger = logger;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    private Guid CurrentTenantId => Guid.Parse(User.FindFirst("tenant_id")?.Value ?? throw new UnauthorizedAccessException());

    /// <summary>
    /// Get all workflow definitions for the current tenant
    /// </summary>
    [HttpGet("definitions")]
    public async Task<ActionResult<IEnumerable<WorkflowDefinitionDto>>> GetWorkflowDefinitions(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var definitions = await _workflowService.GetWorkflowDefinitionsAsync(
                CurrentTenantId, 
                CurrentUserId, 
                category, 
                search, 
                includeInactive, 
                page, 
                pageSize);

            return Ok(definitions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definitions for tenant {TenantId}", CurrentTenantId);
            return StatusCode(500, "An error occurred while retrieving workflow definitions");
        }
    }

    /// <summary>
    /// Get a specific workflow definition by ID
    /// </summary>
    [HttpGet("definitions/{id}")]
    public async Task<ActionResult<WorkflowDefinitionDto>> GetWorkflowDefinition(Guid id)
    {
        try
        {
            var definition = await _workflowService.GetWorkflowDefinitionAsync(id, CurrentUserId);
            
            if (definition == null)
                return NotFound();

            return Ok(definition);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definition {WorkflowId}", id);
            return StatusCode(500, "An error occurred while retrieving the workflow definition");
        }
    }

    /// <summary>
    /// Create a new workflow definition
    /// </summary>
    [HttpPost("definitions")]
    public async Task<ActionResult<WorkflowDefinitionDto>> CreateWorkflowDefinition([FromBody] CreateWorkflowDefinitionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var definition = await _workflowService.CreateWorkflowDefinitionAsync(
                CurrentTenantId,
                CurrentUserId,
                request);

            return CreatedAtAction(
                nameof(GetWorkflowDefinition),
                new { id = definition.Id },
                definition);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow definition for tenant {TenantId}", CurrentTenantId);
            return StatusCode(500, "An error occurred while creating the workflow definition");
        }
    }

    /// <summary>
    /// Update an existing workflow definition
    /// </summary>
    [HttpPut("definitions/{id}")]
    public async Task<ActionResult<WorkflowDefinitionDto>> UpdateWorkflowDefinition(Guid id, [FromBody] UpdateWorkflowDefinitionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var definition = await _workflowService.UpdateWorkflowDefinitionAsync(
                id,
                CurrentUserId,
                request);

            if (definition == null)
                return NotFound();

            return Ok(definition);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow definition {WorkflowId}", id);
            return StatusCode(500, "An error occurred while updating the workflow definition");
        }
    }

    /// <summary>
    /// Delete a workflow definition
    /// </summary>
    [HttpDelete("definitions/{id}")]
    public async Task<ActionResult> DeleteWorkflowDefinition(Guid id)
    {
        try
        {
            var success = await _workflowService.DeleteWorkflowDefinitionAsync(id, CurrentUserId);
            
            if (!success)
                return NotFound();

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow definition {WorkflowId}", id);
            return StatusCode(500, "An error occurred while deleting the workflow definition");
        }
    }

    /// <summary>
    /// Validate a workflow definition
    /// </summary>
    [HttpPost("definitions/{id}/validate")]
    public async Task<ActionResult<WorkflowValidationResult>> ValidateWorkflowDefinition(Guid id)
    {
        try
        {
            var result = await _workflowService.ValidateWorkflowDefinitionAsync(id, CurrentUserId);
            
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating workflow definition {WorkflowId}", id);
            return StatusCode(500, "An error occurred while validating the workflow definition");
        }
    }

    /// <summary>
    /// Create a new workflow instance from a definition
    /// </summary>
    [HttpPost("instances")]
    public async Task<ActionResult<WorkflowInstanceDto>> CreateWorkflowInstance([FromBody] CreateWorkflowInstanceRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var instance = await _workflowService.CreateWorkflowInstanceAsync(
                request.WorkflowDefinitionId,
                CurrentUserId,
                request);

            return CreatedAtAction(
                nameof(GetWorkflowInstance),
                new { id = instance.Id },
                instance);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow instance for definition {WorkflowDefinitionId}", request.WorkflowDefinitionId);
            return StatusCode(500, "An error occurred while creating the workflow instance");
        }
    }

    /// <summary>
    /// Get all workflow instances for the current user
    /// </summary>
    [HttpGet("instances")]
    public async Task<ActionResult<IEnumerable<WorkflowInstanceDto>>> GetWorkflowInstances(
        [FromQuery] Guid? workflowDefinitionId = null,
        [FromQuery] WorkflowStatus? status = null,
        [FromQuery] bool assignedToMe = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var instances = await _workflowService.GetWorkflowInstancesAsync(
                CurrentTenantId,
                CurrentUserId,
                workflowDefinitionId,
                status,
                assignedToMe,
                page,
                pageSize);

            return Ok(instances);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow instances for user {UserId}", CurrentUserId);
            return StatusCode(500, "An error occurred while retrieving workflow instances");
        }
    }

    /// <summary>
    /// Get a specific workflow instance by ID
    /// </summary>
    [HttpGet("instances/{id}")]
    public async Task<ActionResult<WorkflowInstanceDto>> GetWorkflowInstance(Guid id)
    {
        try
        {
            var instance = await _workflowService.GetWorkflowInstanceAsync(id, CurrentUserId);
            
            if (instance == null)
                return NotFound();

            return Ok(instance);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow instance {InstanceId}", id);
            return StatusCode(500, "An error occurred while retrieving the workflow instance");
        }
    }

    /// <summary>
    /// Complete a workflow task
    /// </summary>
    [HttpPost("tasks/{taskId}/complete")]
    public async Task<ActionResult<WorkflowInstanceDto>> CompleteWorkflowTask(Guid taskId, [FromBody] CompleteWorkflowTaskRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var instance = await _workflowService.CompleteWorkflowTaskAsync(
                taskId,
                CurrentUserId,
                request);

            if (instance == null)
                return NotFound();

            return Ok(instance);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing workflow task {TaskId}", taskId);
            return StatusCode(500, "An error occurred while completing the workflow task");
        }
    }

    /// <summary>
    /// Reassign a workflow task to another user
    /// </summary>
    [HttpPost("tasks/{taskId}/reassign")]
    public async Task<ActionResult<WorkflowTaskDto>> ReassignWorkflowTask(Guid taskId, [FromBody] ReassignWorkflowTaskRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var task = await _workflowService.ReassignWorkflowTaskAsync(
                taskId,
                CurrentUserId,
                request);

            if (task == null)
                return NotFound();

            return Ok(task);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reassigning workflow task {TaskId}", taskId);
            return StatusCode(500, "An error occurred while reassigning the workflow task");
        }
    }

    /// <summary>
    /// Cancel a workflow instance
    /// </summary>
    [HttpPost("instances/{id}/cancel")]
    public async Task<ActionResult<WorkflowInstanceDto>> CancelWorkflowInstance(Guid id, [FromBody] CancelWorkflowInstanceRequest request)
    {
        try
        {
            var instance = await _workflowService.CancelWorkflowInstanceAsync(
                id,
                CurrentUserId,
                request.Reason);

            if (instance == null)
                return NotFound();

            return Ok(instance);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling workflow instance {InstanceId}", id);
            return StatusCode(500, "An error occurred while cancelling the workflow instance");
        }
    }

    /// <summary>
    /// Get workflow analytics and statistics
    /// </summary>
    [HttpGet("analytics")]
    public async Task<ActionResult<WorkflowAnalyticsDto>> GetWorkflowAnalytics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] Guid? workflowDefinitionId = null)
    {
        try
        {
            var analytics = await _workflowService.GetWorkflowAnalyticsAsync(
                CurrentTenantId,
                CurrentUserId,
                fromDate,
                toDate,
                workflowDefinitionId);

            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow analytics for tenant {TenantId}", CurrentTenantId);
            return StatusCode(500, "An error occurred while retrieving workflow analytics");
        }
    }
}