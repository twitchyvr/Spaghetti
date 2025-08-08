namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Service for enterprise system integrations
/// </summary>
public interface IEnterpriseIntegrationService
{
    Task<object> GetAvailableIntegrationsAsync(CancellationToken cancellationToken = default);
    Task<object> ConfigureIntegrationAsync(string integrationType, Dictionary<string, object> configuration, CancellationToken cancellationToken = default);
    Task<bool> TestIntegrationAsync(string integrationId, CancellationToken cancellationToken = default);
    Task<object> SyncDataAsync(string integrationId, CancellationToken cancellationToken = default);
    Task<object> GetIntegrationStatusAsync(string integrationId, CancellationToken cancellationToken = default);
    Task<bool> DisableIntegrationAsync(string integrationId, CancellationToken cancellationToken = default);
}