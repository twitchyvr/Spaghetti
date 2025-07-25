import { useState, useEffect } from 'react';
import api from '../services/api';

interface DatabaseStats {
  tenants: number;
  users: number;
  documents: number;
  documentTags: number;
  documentPermissions: number;
  roles: number;
  userRoles: number;
  tenantModules: number;
  documentAudits: number;
  userAudits: number;
  tenantAudits: number;
  databaseStatus: string;
  lastChecked: string;
}

interface TableInfo {
  name: string;
  rowCount: number;
  description: string;
  primaryKey: string;
  relationships: string[];
}

interface SampleDataStatus {
  hasSampleData: boolean;
  hasDemoUser: boolean;
  sampleTenantsCount: number;
  totalUsers: number;
  totalDocuments: number;
  lastChecked: string;
}

export default function DatabaseAdmin() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [sampleStatus, setSampleStatus] = useState<SampleDataStatus | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'sample-data' | 'operations'>('overview');

  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        setIsLoading(true);
        
        // Fetch database statistics
        try {
          const stats = await api.admin.getDatabaseStats();
          setDbStats(stats);
        } catch (error) {
          console.error('Failed to fetch database stats:', error);
        }

        // Fetch sample data status
        try {
          const sample = await api.admin.getSampleDataStatus();
          setSampleStatus(sample);
        } catch (error) {
          console.error('Failed to fetch sample data status:', error);
        }

        // Mock table information (this would come from a real API endpoint)
        setTables([
          {
            name: 'Users',
            rowCount: dbStats?.users || 0,
            description: 'System users with authentication and profile data',
            primaryKey: 'Id (Guid)',
            relationships: ['Tenants', 'UserRoles', 'Documents', 'UserAuditEntries']
          },
          {
            name: 'Tenants',
            rowCount: dbStats?.tenants || 0,
            description: 'Multi-tenant organizations with billing and configuration',
            primaryKey: 'Id (Guid)',
            relationships: ['Users', 'Documents', 'TenantModules', 'Roles']
          },
          {
            name: 'Documents',
            rowCount: dbStats?.documents || 0,
            description: 'Core documents with content, metadata, and versioning',
            primaryKey: 'Id (Guid)',
            relationships: ['Users', 'Tenants', 'DocumentTags', 'DocumentPermissions', 'DocumentAuditEntries']
          },
          {
            name: 'Roles',
            rowCount: dbStats?.roles || 0,
            description: 'System and tenant-specific user roles',
            primaryKey: 'Id (Guid)',
            relationships: ['UserRoles', 'RolePermissions', 'DocumentPermissions']
          },
          {
            name: 'DocumentTags',
            rowCount: dbStats?.documentTags || 0,
            description: 'Document categorization and search tags',
            primaryKey: 'Id (Guid)',
            relationships: ['Documents']
          },
          {
            name: 'DocumentPermissions',
            rowCount: dbStats?.documentPermissions || 0,
            description: 'Access control for documents by user or role',
            primaryKey: 'Id (Guid)',
            relationships: ['Documents', 'Users', 'Roles']
          },
          {
            name: 'UserRoles',
            rowCount: dbStats?.userRoles || 0,
            description: 'User role assignments with expiration support',
            primaryKey: 'Id (Guid)',
            relationships: ['Users', 'Roles']
          },
          {
            name: 'TenantModules',
            rowCount: dbStats?.tenantModules || 0,
            description: 'Module configurations per tenant',
            primaryKey: 'Id (Guid)',
            relationships: ['Tenants']
          },
          {
            name: 'AuditEntries',
            rowCount: (dbStats?.documentAudits || 0) + (dbStats?.userAudits || 0) + (dbStats?.tenantAudits || 0),
            description: 'Comprehensive audit trail for all system activities',
            primaryKey: 'Id (Guid)',
            relationships: ['Documents', 'Users', 'Tenants']
          }
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch database info:', error);
        setIsLoading(false);
      }
    };

    fetchDatabaseInfo();
  }, [dbStats?.users, dbStats?.tenants, dbStats?.documents, dbStats?.roles, dbStats?.documentTags, dbStats?.documentPermissions, dbStats?.userRoles, dbStats?.tenantModules, dbStats?.documentAudits, dbStats?.userAudits, dbStats?.tenantAudits]);

  const handleSeedSampleData = async () => {
    try {
      await api.admin.seedSampleData();
      alert('Sample data seeded successfully!');
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to seed data: ${error.message || 'Unknown error'}`);
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear ALL data? This action cannot be undone.\n\n' +
      'This will delete:\n' +
      '- All tenants and users\n' +
      '- All documents and attachments\n' +
      '- All permissions and audit entries\n' +
      '- All tenant modules and configurations\n\n' +
      'System roles will be preserved.'
    );

    if (confirmed) {
      const doubleConfirm = window.prompt(
        'Type "CONFIRM_DELETE_ALL_DATA" to proceed:'
      );

      if (doubleConfirm === 'CONFIRM_DELETE_ALL_DATA') {
        try {
          await api.admin.clearAllData('CONFIRM_DELETE_ALL_DATA');
          alert('All data cleared successfully!');
          window.location.reload();
        } catch (error: any) {
          alert(`Failed to clear data: ${error.message || 'Unknown error'}`);
        }
      } else {
        alert('Confirmation text does not match. Operation cancelled.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Administration</h1>
          <p className="text-gray-600 mt-1">
            Monitor database health, manage sample data, and explore table structures
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'tables', label: 'Table Structure', icon: '🗂️' },
            { id: 'sample-data', label: 'Sample Data', icon: '🔍' },
            { id: 'operations', label: 'Operations', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Database Status */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Database Status</h2>
                <p className="text-green-100 mt-1">
                  PostgreSQL • {dbStats?.databaseStatus || 'Unknown'} • Last checked: {dbStats?.lastChecked ? new Date(dbStats.lastChecked).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">🏢</div>
              <div className="text-2xl font-bold text-gray-900">{dbStats?.tenants || 0}</div>
              <div className="text-sm text-gray-600">Tenants</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-900">{dbStats?.users || 0}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-2xl font-bold text-gray-900">{dbStats?.documents || 0}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">🏷️</div>
              <div className="text-2xl font-bold text-gray-900">{dbStats?.documentTags || 0}</div>
              <div className="text-sm text-gray-600">Tags</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-2xl font-bold text-gray-900">{dbStats?.documentPermissions || 0}</div>
              <div className="text-sm text-gray-600">Permissions</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-900">{(dbStats?.documentAudits || 0) + (dbStats?.userAudits || 0) + (dbStats?.tenantAudits || 0)}</div>
              <div className="text-sm text-gray-600">Audit Entries</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Database Tables</h2>
              <p className="text-gray-600 text-sm mt-1">Multi-tenant enterprise schema with comprehensive relationships</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationships
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tables.map((table) => (
                    <tr key={table.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{table.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {table.rowCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.primaryKey}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {table.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {table.relationships.map((rel) => (
                            <span key={rel} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                              {rel}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sample-data' && (
        <div className="space-y-6">
          {/* Sample Data Status */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Data Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-3xl mb-2 ${sampleStatus?.hasSampleData ? 'text-green-600' : 'text-red-600'}`}>
                  {sampleStatus?.hasSampleData ? '✅' : '❌'}
                </div>
                <div className="text-sm font-medium text-gray-900">Sample Data</div>
                <div className="text-xs text-gray-600">{sampleStatus?.hasSampleData ? 'Present' : 'Not Found'}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl mb-2 ${sampleStatus?.hasDemoUser ? 'text-green-600' : 'text-red-600'}`}>
                  {sampleStatus?.hasDemoUser ? '👤' : '❌'}
                </div>
                <div className="text-sm font-medium text-gray-900">Demo User</div>
                <div className="text-xs text-gray-600">{sampleStatus?.hasDemoUser ? 'Available' : 'Missing'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2 text-blue-600">🏢</div>
                <div className="text-sm font-medium text-gray-900">{sampleStatus?.sampleTenantsCount || 0}</div>
                <div className="text-xs text-gray-600">Sample Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2 text-purple-600">👥</div>
                <div className="text-sm font-medium text-gray-900">{sampleStatus?.totalUsers || 0}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2 text-orange-600">📄</div>
                <div className="text-sm font-medium text-gray-900">{sampleStatus?.totalDocuments || 0}</div>
                <div className="text-xs text-gray-600">Total Documents</div>
              </div>
            </div>
            {sampleStatus?.lastChecked && (
              <div className="mt-4 text-sm text-gray-500">
                Last checked: {new Date(sampleStatus.lastChecked).toLocaleString()}
              </div>
            )}
          </div>

          {/* Sample Data Details */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🏢 Demo Tenants</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Acme Legal Services</strong> - Professional tier</li>
                  <li>• <strong>TechStart Inc</strong> - Starter tier (trial)</li>
                  <li>• <strong>Global Consulting Group</strong> - Enterprise tier</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">👥 Sample Users</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Demo User (System Admin)</li>
                  <li>• Legal professionals (4 users)</li>
                  <li>• Tech startup team (2 users)</li>
                  <li>• Consulting experts (2 users)</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📄 Sample Documents</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Legal contracts & agreements</li>
                  <li>• Tech product requirements</li>
                  <li>• Consulting analysis reports</li>
                  <li>• Complete metadata & tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Data Operations */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="text-lg font-medium text-green-800 mb-2">Seed Sample Data</h3>
                <p className="text-green-700 text-sm mb-4">
                  Populate the database with comprehensive sample data including tenants, users, documents, and relationships.
                </p>
                <ul className="text-sm text-green-600 mb-4 space-y-1">
                  <li>• 3 multi-tenant organizations</li>
                  <li>• 8 professional users with roles</li>
                  <li>• 7 industry-specific documents</li>
                  <li>• Complete audit trails and permissions</li>
                </ul>
                <button
                  onClick={handleSeedSampleData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🌱 Seed Sample Data
                </button>
              </div>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-lg font-medium text-red-800 mb-2">Clear All Data</h3>
                <p className="text-red-700 text-sm mb-4">
                  Remove all data from the database for production deployment. System roles will be preserved.
                </p>
                <ul className="text-sm text-red-600 mb-4 space-y-1">
                  <li>• All tenants and users</li>
                  <li>• All documents and attachments</li>
                  <li>• All permissions and audit entries</li>
                  <li>• All tenant modules and configurations</li>
                </ul>
                <button
                  onClick={handleClearAllData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ Clear All Data
                </button>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available API Endpoints</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <code className="text-sm font-mono text-gray-800">GET /api/admin/database-stats</code>
                  <p className="text-xs text-gray-600 mt-1">Get database health and entity counts</p>
                </div>
                <span className="text-green-600 text-sm font-medium">PUBLIC</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <code className="text-sm font-mono text-gray-800">GET /api/admin/sample-data-status</code>
                  <p className="text-xs text-gray-600 mt-1">Check if sample data exists</p>
                </div>
                <span className="text-green-600 text-sm font-medium">PUBLIC</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <code className="text-sm font-mono text-gray-800">POST /api/admin/seed-sample-data</code>
                  <p className="text-xs text-gray-600 mt-1">Populate database with sample data</p>
                </div>
                <span className="text-orange-600 text-sm font-medium">ADMIN</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <code className="text-sm font-mono text-gray-800">DELETE /api/admin/clear-all-data</code>
                  <p className="text-xs text-gray-600 mt-1">Clear all data (requires confirmation)</p>
                </div>
                <span className="text-red-600 text-sm font-medium">ADMIN</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}