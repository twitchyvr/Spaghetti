using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IMaintenanceService
{
    Task<List<MaintenanceWindow>> GetScheduledMaintenanceAsync();
    Task<MaintenanceWindow> ScheduleMaintenanceAsync(MaintenanceRequest request);
    Task<bool> UpdateMaintenanceStatusAsync(Guid maintenanceId, MaintenanceStatus status);
    Task<bool> CancelMaintenanceAsync(Guid maintenanceId, Guid cancelledBy);
    Task<MaintenanceWindow?> GetMaintenanceAsync(Guid maintenanceId);
}

// Supporting classes for the interface
public class MaintenanceRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public MaintenanceType Type { get; set; }
    public string[]? AffectedServices { get; set; }
    public MaintenanceImpact ExpectedImpact { get; set; }
    public bool NotifyUsers { get; set; }
    public Guid CreatedBy { get; set; }
}

public enum MaintenanceType
{
    Scheduled,
    Emergency,
    Preventive,
    Corrective
}

public enum MaintenanceStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    Failed
}

public enum MaintenanceImpact
{
    Low,
    Medium,
    High
}