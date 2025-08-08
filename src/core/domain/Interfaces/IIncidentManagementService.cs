using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Domain.Interfaces;

public interface IIncidentManagementService
{
    Task<List<IncidentSummary>> GetActiveIncidentsAsync();
    Task<IncidentReport?> GetIncidentAsync(Guid incidentId);
    Task<IncidentReport> CreateIncidentAsync(IncidentDetails details);
    Task<bool> UpdateIncidentStatusAsync(Guid incidentId, IncidentStatus status);
    Task<bool> AddIncidentUpdateAsync(Guid incidentId, string message, Guid userId, IncidentUpdateType updateType);
}

// Supporting classes for the interface
public class IncidentSummary
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public IncidentSeverity Severity { get; set; }
    public IncidentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string[] AffectedServices { get; set; } = Array.Empty<string>();
}

public class IncidentReport
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IncidentSeverity Severity { get; set; }
    public IncidentStatus Status { get; set; }
    public IncidentImpact Impact { get; set; }
    public string[] AffectedServices { get; set; } = Array.Empty<string>();
    public int UsersAffected { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public List<IncidentUpdateRecord> Updates { get; set; } = new();
}

public class IncidentDetails
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IncidentSeverity Severity { get; set; }
    public IncidentImpact Impact { get; set; }
    public string[]? AffectedServices { get; set; }
    public int? UsersAffected { get; set; }
    public Guid CreatedBy { get; set; }
}

public class IncidentUpdateRecord
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public IncidentUpdateType UpdateType { get; set; }
    public DateTime Timestamp { get; set; }
    public Guid UserId { get; set; }
}

// Enums are defined in EnterpriseDocsCore.Domain.Entities namespace
// to avoid duplication and ambiguous references