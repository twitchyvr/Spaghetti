using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Domain.Entities;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Implementation of maintenance window management service
/// </summary>
public class MaintenanceService : IMaintenanceService
{
    private readonly IMaintenanceWindowRepository _maintenanceRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<MaintenanceService> _logger;

    public MaintenanceService(
        IMaintenanceWindowRepository maintenanceRepository,
        IUserRepository userRepository,
        ILogger<MaintenanceService> logger)
    {
        _maintenanceRepository = maintenanceRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<MaintenanceWindow> ScheduleMaintenanceAsync(MaintenanceRequest request)
    {
        try
        {
            // Validate the request
            ValidateMaintenanceRequest(request);

            // Check for conflicting maintenance windows
            var conflictingMaintenance = await _maintenanceRepository.GetConflictingMaintenanceAsync(
                request.StartTime, request.EndTime);

            if (conflictingMaintenance.Any())
            {
                _logger.LogWarning("Maintenance window conflicts detected for {StartTime} - {EndTime}", 
                    request.StartTime, request.EndTime);
                // In a real implementation, you might want to throw a specific exception here
            }

            var maintenanceWindow = new MaintenanceWindow
            {
                Title = request.Title,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Type = request.Type,
                AffectedServices = request.AffectedServices != null ? string.Join(",", request.AffectedServices) : null,
                ExpectedImpact = request.ExpectedImpact,
                NotifyUsers = request.NotifyUsers,
                CreatedBy = request.CreatedBy,
                Status = MaintenanceStatus.Scheduled
            };

            await _maintenanceRepository.AddAsync(maintenanceWindow);

            _logger.LogInformation("Scheduled maintenance window {MaintenanceId}: {Title} from {StartTime} to {EndTime}", 
                maintenanceWindow.Id, maintenanceWindow.Title, maintenanceWindow.StartTime, maintenanceWindow.EndTime);

            return maintenanceWindow;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to schedule maintenance: {Title}", request.Title);
            throw;
        }
    }

    public async Task<List<MaintenanceWindow>> GetScheduledMaintenanceAsync()
    {
        try
        {
            var scheduledMaintenance = await _maintenanceRepository.GetScheduledAsync();
            var result = scheduledMaintenance.OrderBy(m => m.StartTime).ToList();

            _logger.LogInformation("Retrieved {MaintenanceCount} scheduled maintenance windows", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get scheduled maintenance");
            throw;
        }
    }

    public async Task<bool> UpdateMaintenanceStatusAsync(Guid maintenanceId, MaintenanceStatus status)
    {
        try
        {
            var maintenance = await _maintenanceRepository.GetByIdAsync(maintenanceId);
            if (maintenance == null)
            {
                _logger.LogWarning("Attempted to update status of non-existent maintenance window {MaintenanceId}", maintenanceId);
                return false;
            }

            var oldStatus = maintenance.Status;
            maintenance.Status = status;
            maintenance.UpdatedAt = DateTime.UtcNow;

            await _maintenanceRepository.UpdateAsync(maintenance);

            _logger.LogInformation("Updated maintenance window {MaintenanceId} status from {OldStatus} to {NewStatus}", 
                maintenanceId, oldStatus, status);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update maintenance {MaintenanceId} status to {Status}", maintenanceId, status);
            return false;
        }
    }

    public async Task<bool> CancelMaintenanceAsync(Guid maintenanceId)
    {
        try
        {
            var maintenance = await _maintenanceRepository.GetByIdAsync(maintenanceId);
            if (maintenance == null)
            {
                _logger.LogWarning("Attempted to cancel non-existent maintenance window {MaintenanceId}", maintenanceId);
                return false;
            }

            if (maintenance.Status == MaintenanceStatus.InProgress)
            {
                _logger.LogWarning("Cannot cancel maintenance window {MaintenanceId} that is already in progress", maintenanceId);
                return false;
            }

            if (maintenance.Status == MaintenanceStatus.Completed)
            {
                _logger.LogWarning("Cannot cancel maintenance window {MaintenanceId} that is already completed", maintenanceId);
                return false;
            }

            maintenance.Status = MaintenanceStatus.Cancelled;
            maintenance.UpdatedAt = DateTime.UtcNow;

            await _maintenanceRepository.UpdateAsync(maintenance);

            _logger.LogInformation("Cancelled maintenance window {MaintenanceId}: {Title}", 
                maintenanceId, maintenance.Title);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel maintenance {MaintenanceId}", maintenanceId);
            return false;
        }
    }

    public async Task<List<MaintenanceWindow>> GetMaintenanceForServicesAsync(string[] serviceNames)
    {
        try
        {
            var allMaintenance = new List<MaintenanceWindow>();

            foreach (var serviceName in serviceNames)
            {
                var serviceMaintenance = await _maintenanceRepository.GetByAffectedServiceAsync(serviceName);
                allMaintenance.AddRange(serviceMaintenance);
            }

            // Remove duplicates and filter to current/upcoming maintenance
            var uniqueMaintenance = allMaintenance
                .Distinct()
                .Where(m => m.EndTime > DateTime.UtcNow && m.Status != MaintenanceStatus.Cancelled)
                .OrderBy(m => m.StartTime)
                .ToList();

            _logger.LogInformation("Retrieved {MaintenanceCount} maintenance windows affecting services: {Services}", 
                uniqueMaintenance.Count, string.Join(", ", serviceNames));

            return uniqueMaintenance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get maintenance for services: {Services}", string.Join(", ", serviceNames));
            throw;
        }
    }

    #region Private Helper Methods

    private static void ValidateMaintenanceRequest(MaintenanceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Maintenance title is required", nameof(request.Title));

        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("Maintenance start time must be before end time", nameof(request.StartTime));

        if (request.StartTime < DateTime.UtcNow.AddMinutes(-5)) // Allow small buffer for clock differences
            throw new ArgumentException("Cannot schedule maintenance in the past", nameof(request.StartTime));

        if (request.CreatedBy == Guid.Empty)
            throw new ArgumentException("CreatedBy user ID is required", nameof(request.CreatedBy));
    }

    #endregion
}