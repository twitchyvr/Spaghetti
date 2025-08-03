// Sprint 7 Mock Data for API Fallback
// Provides static responses when backend API is unavailable

export const mockApiResponses: Record<string, any> = {
  '/api/health': {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'enterprise-docs-api-sprint7',
    version: '0.0.16-alpha',
    phase: 'Sprint 7 - Deployment Architecture Optimization',
    database: 'mock-data',
    deployment: 'frontend-fallback'
  },
  
  '/api/status': {
    service: 'Enterprise Documentation Platform API',
    version: '0.0.16-alpha',
    status: 'operational',
    uptime: 3600000,
    sprint: 'Sprint 7 - Deployment Architecture Optimization',
    features: {
      collaboration: 'feature-flagged',
      workflowAutomation: 'feature-flagged',
      basicOperations: 'active'
    }
  },
  
  '/api/admin/database-stats': {
    totalDocuments: 7,
    totalUsers: 8,
    totalTenants: 3,
    totalCollections: 5,
    systemHealth: 'optimal',
    lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    storageUsed: '245 MB',
    storageLimit: '10 GB'
  },
  
  '/api/admin/sample-data-status': {
    hasSampleData: true,
    lastSeeded: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    recordCount: {
      tenants: 3,
      users: 8,
      documents: 7,
      tags: 20
    }
  },
  
  '/api/platform/metrics': {
    cpu: { usage: 35, trend: 'stable' },
    memory: { usage: 62, available: 38 },
    requests: { total: 1250, perMinute: 42 },
    errors: { count: 0, rate: 0 },
    activeUsers: 3,
    timestamp: new Date().toISOString()
  },
  
  '/api/clients': [
    {
      id: '1',
      name: 'Acme Legal',
      industry: 'Legal',
      status: 'active',
      userCount: 3,
      documentCount: 4,
      subscription: 'Professional'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      industry: 'Technology',
      status: 'trial',
      userCount: 2,
      documentCount: 2,
      subscription: 'Trial'
    },
    {
      id: '3',
      name: 'Global Consulting Group',
      industry: 'Consulting',
      status: 'active',
      userCount: 3,
      documentCount: 1,
      subscription: 'Enterprise'
    }
  ],
  
  '/api/documents': [
    {
      id: '1',
      title: 'Q4 2024 Strategic Plan',
      type: 'Strategic Document',
      status: 'published',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'John Smith'
    },
    {
      id: '2',
      title: 'Product Requirements Document',
      type: 'Technical Document',
      status: 'draft',
      lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      author: 'Alice Johnson'
    }
  ],
  
  '/api/features': {
    Sprint6AdvancedFeatures: {
      RealTimeCollaboration: false,
      DocumentLocking: false,
      PresenceAwareness: false,
      CollaborativeEditing: false,
      WorkflowAutomation: false,
      VisualWorkflowDesigner: false,
      WorkflowExecution: false,
      ApprovalProcesses: false
    },
    PWAFeatures: {
      PWACapabilities: true,
      OfflineSupport: true,
      ServiceWorker: true
    },
    CorePlatform: {
      BasicDocumentManagement: true,
      UserAuthentication: true,
      TenantIsolation: true,
      HealthMonitoring: true,
      DatabaseOperations: true
    },
    Sprint7Features: {
      SimplifiedAPI: true,
      FeatureFlagSystem: true,
      IncrementalDeployment: true
    }
  },
  
  '/api/features/all': {
    flags: {
      RealTimeCollaboration: false,
      DocumentLocking: false,
      PresenceAwareness: false,
      CollaborativeEditing: false,
      WorkflowAutomation: false,
      VisualWorkflowDesigner: false,
      WorkflowExecution: false,
      ApprovalProcesses: false,
      PWACapabilities: true,
      OfflineSupport: true,
      ServiceWorker: true,
      BasicDocumentManagement: true,
      UserAuthentication: true,
      TenantIsolation: true,
      HealthMonitoring: true,
      DatabaseOperations: true,
      SimplifiedAPI: true,
      FeatureFlagSystem: true,
      IncrementalDeployment: true
    },
    timestamp: new Date().toISOString(),
    sprint: 'Sprint 7 - Deployment Architecture Optimization'
  }
};

export function getMockResponse(endpoint: string): any {
  // Remove query parameters for matching
  const cleanEndpoint = endpoint.split('?')[0] || endpoint;
  
  // Direct match
  if (mockApiResponses[cleanEndpoint]) {
    return mockApiResponses[cleanEndpoint];
  }
  
  // Pattern matching for dynamic endpoints
  if (cleanEndpoint && cleanEndpoint.startsWith('/api/features/') && cleanEndpoint.includes('/enable')) {
    const parts = cleanEndpoint.split('/');
    const featureName = parts[3] || 'unknown';
    return {
      feature: featureName,
      enabled: true,
      timestamp: new Date().toISOString(),
      message: `Feature '${featureName}' has been enabled (mock)`
    };
  }
  
  if (cleanEndpoint && cleanEndpoint.startsWith('/api/features/') && cleanEndpoint.includes('/disable')) {
    const parts = cleanEndpoint.split('/');
    const featureName = parts[3] || 'unknown';
    return {
      feature: featureName,
      enabled: false,
      timestamp: new Date().toISOString(),
      message: `Feature '${featureName}' has been disabled (mock)`
    };
  }
  
  // Default fallback
  return {
    status: 'mock',
    message: 'Sprint 7 - Using frontend fallback data',
    endpoint: cleanEndpoint,
    timestamp: new Date().toISOString()
  };
}