using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Implementation of incident management service for tracking and resolving platform issues
/// </summary>
public class IncidentManagementService : IIncidentManagementService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentUpdateRepository _incidentUpdateRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<IncidentManagementService> _logger;

    public IncidentManagementService(
        IIncidentRepository incidentRepository,
        IIncidentUpdateRepository incidentUpdateRepository,
        IUserRepository userRepository,
        ILogger<IncidentManagementService> logger)
    {
        _incidentRepository = incidentRepository;
        _incidentUpdateRepository = incidentUpdateRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<IncidentReport> CreateIncidentAsync(IncidentDetails details)
    {
        try
        {
            var incident = new Incident
            {
                Title = details.Title,
                Description = details.Description,
                Severity = details.Severity,
                Impact = details.Impact,
                CreatedBy = details.CreatedBy,
                AffectedServices = details.AffectedServices != null ? string.Join(",", details.AffectedServices) : null,
                UsersAffected = details.UsersAffected,
                Status = IncidentStatus.Open
            };

            await _incidentRepository.AddAsync(incident);

            // Create initial incident update
            var initialUpdate = new IncidentUpdate
            {
                IncidentId = incident.Id,
                Message = "Incident created",
                CreatedBy = details.CreatedBy,
                UpdateType = IncidentUpdateType.StatusChange,
                StatusChange = IncidentStatus.Open
            };

            await _incidentUpdateRepository.AddAsync(initialUpdate);

            _logger.LogInformation("Created incident {IncidentId}: {Title} with severity {Severity}", 
                incident.Id, incident.Title, incident.Severity);

            return await MapToIncidentReportAsync(incident);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create incident: {Title}", details.Title);
            throw;
        }
    }

    public async Task<bool> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus status)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId);
            if (incident == null)
            {
                _logger.LogWarning("Attempted to update status of non-existent incident {IncidentId}", incidentId);
                return false;
            }

            var oldStatus = incident.Status;
            incident.Status = status;
            incident.UpdatedAt = DateTime.UtcNow;

            if (status == IncidentStatus.Resolved || status == IncidentStatus.Closed)
            {
                incident.ResolvedAt = DateTime.UtcNow;
            }

            await _incidentRepository.UpdateAsync(incident);

            _logger.LogInformation("Updated incident {IncidentId} status from {OldStatus} to {NewStatus}", 
                incidentId, oldStatus, status);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update incident {IncidentId} status to {Status}", incidentId, status);
            return false;
        }
    }

    public async Task<bool> AddIncidentUpdateAsync(Guid incidentId, string message, Guid userId, IncidentUpdateType updateType = IncidentUpdateType.Comment)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId);
            if (incident == null)
            {
                _logger.LogWarning("Attempted to add update to non-existent incident {IncidentId}", incidentId);
                return false;
            }

            var update = new IncidentUpdate
            {
                IncidentId = incidentId,
                Message = message,
                CreatedBy = userId,
                UpdateType = updateType
            };

            await _incidentUpdateRepository.AddAsync(update);

            // Update the incident's UpdatedAt timestamp
            incident.UpdatedAt = DateTime.UtcNow;
            await _incidentRepository.UpdateAsync(incident);

            _logger.LogInformation("Added update to incident {IncidentId} by user {UserId}: {UpdateType}", 
                incidentId, userId, updateType);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add update to incident {IncidentId}", incidentId);
            return false;
        }
    }

    public async Task<List<IncidentSummary>> GetActiveIncidentsAsync()
    {
        try
        {
            var activeIncidents = await _incidentRepository.GetActiveIncidentsAsync();
            
            var summaries = new List<IncidentSummary>();
            
            foreach (var incident in activeIncidents)
            {
                var assignedUser = incident.AssignedTo.HasValue 
                    ? await _userRepository.GetByIdAsync(incident.AssignedTo.Value)
                    : null;

                summaries.Add(new IncidentSummary
                {
                    Id = incident.Id,
                    Title = incident.Title,
                    Severity = incident.Severity,
                    Status = incident.Status,
                    CreatedAt = incident.CreatedAt,
                    AffectedServices = incident.AffectedServices?.Split(',', StringSplitOptions.RemoveEmptyEntries),
                    AssignedToName = assignedUser != null ? $"{assignedUser.FirstName} {assignedUser.LastName}" : null
                });
            }

            _logger.LogInformation("Retrieved {IncidentCount} active incidents", summaries.Count);
            return summaries;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get active incidents");
            throw;
        }
    }

    public async Task<IncidentReport?> GetIncidentAsync(Guid incidentId)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId);
            if (incident == null)
            {
                _logger.LogWarning("Incident {IncidentId} not found", incidentId);
                return null;
            }

            return await MapToIncidentReportAsync(incident);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get incident {IncidentId}", incidentId);
            throw;
        }
    }

    public async Task<bool> AssignIncidentAsync(Guid incidentId, Guid userId)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId);
            if (incident == null)
            {
                _logger.LogWarning("Attempted to assign non-existent incident {IncidentId}", incidentId);
                return false;
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Attempted to assign incident {IncidentId} to non-existent user {UserId}", incidentId, userId);
                return false;
            }

            var oldAssignee = incident.AssignedTo;
            incident.AssignedTo = userId;
            incident.UpdatedAt = DateTime.UtcNow;

            await _incidentRepository.UpdateAsync(incident);

            // Add an update about the assignment
            var assignmentMessage = oldAssignee.HasValue 
                ? $"Incident reassigned to {user.FirstName} {user.LastName}"
                : $"Incident assigned to {user.FirstName} {user.LastName}";

            await AddIncidentUpdateAsync(incidentId, assignmentMessage, userId, IncidentUpdateType.Assignment);

            _logger.LogInformation("Assigned incident {IncidentId} to user {UserId} ({UserName})", 
                incidentId, userId, $"{user.FirstName} {user.LastName}");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign incident {IncidentId} to user {UserId}", incidentId, userId);
            return false;
        }
    }

    public async Task<bool> ResolveIncidentAsync(Guid incidentId, string resolution, Guid resolvedBy)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId);
            if (incident == null)
            {
                _logger.LogWarning("Attempted to resolve non-existent incident {IncidentId}", incidentId);
                return false;
            }

            incident.Status = IncidentStatus.Resolved;
            incident.Resolution = resolution;
            incident.ResolvedAt = DateTime.UtcNow;
            incident.UpdatedAt = DateTime.UtcNow;

            await _incidentRepository.UpdateAsync(incident);

            // Add resolution update
            await AddIncidentUpdateAsync(incidentId, $"Incident resolved: {resolution}", resolvedBy, IncidentUpdateType.Resolution);

            _logger.LogInformation("Resolved incident {IncidentId} by user {UserId}: {Resolution}", 
                incidentId, resolvedBy, resolution);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resolve incident {IncidentId}", incidentId);
            return false;
        }
    }

    #region Private Helper Methods

    private async Task<IncidentReport> MapToIncidentReportAsync(Incident incident)
    {
        // Get incident updates
        var updates = await _incidentUpdateRepository.GetByIncidentIdAsync(incident.Id);
        var updateSummaries = new List<IncidentUpdateSummary>();

        foreach (var update in updates.OrderBy(u => u.CreatedAt))
        {
            var user = await _userRepository.GetByIdAsync(update.CreatedBy);
            updateSummaries.Add(new IncidentUpdateSummary
            {
                Id = update.Id,
                Message = update.Message,
                CreatedAt = update.CreatedAt,
                CreatedByName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User",
                UpdateType = update.UpdateType,
                StatusChange = update.StatusChange
            });
        }

        return new IncidentReport
        {
            Id = incident.Id,
            Title = incident.Title,
            Description = incident.Description,
            Severity = incident.Severity,
            Status = incident.Status,
            Impact = incident.Impact,
            CreatedAt = incident.CreatedAt,
            ResolvedAt = incident.ResolvedAt,
            Resolution = incident.Resolution,
            AffectedServices = incident.AffectedServices?.Split(',', StringSplitOptions.RemoveEmptyEntries),
            UsersAffected = incident.UsersAffected,
            Updates = updateSummaries
        };
    }

    #endregion
}