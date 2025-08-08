namespace EnterpriseDocsCore.API.Services;

public interface ITenantContextService
{
    Guid CurrentTenantId { get; }
    void SetCurrentTenant(Guid tenantId);
    bool HasTenant { get; }
}

public class TenantContextService : ITenantContextService
{
    private Guid _currentTenantId;
    private bool _hasTenant;

    public Guid CurrentTenantId => _hasTenant ? _currentTenantId : throw new InvalidOperationException("No tenant context set");
    
    public bool HasTenant => _hasTenant;

    public void SetCurrentTenant(Guid tenantId)
    {
        _currentTenantId = tenantId;
        _hasTenant = true;
    }
}
