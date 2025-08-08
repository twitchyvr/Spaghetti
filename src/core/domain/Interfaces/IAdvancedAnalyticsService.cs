namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service for advanced analytics and reporting functionality
/// </summary>
public interface IAdvancedAnalyticsService
{
    Task<object> GetDocumentAnalyticsAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<object> GetUserActivityAnalyticsAsync(Guid userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<object> GetTenantUsageAnalyticsAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<object> GetSystemPerformanceAnalyticsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<object> GenerateReportAsync(string reportType, Dictionary<string, object> parameters, CancellationToken cancellationToken = default);
    Task<object[]> GetAvailableReportsAsync(CancellationToken cancellationToken = default);
}