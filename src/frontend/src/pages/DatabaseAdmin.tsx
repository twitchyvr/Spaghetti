import { useState, useEffect } from 'react';
import api from '../services/api';

// Import Pantry Design System components
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Alert } from '../components/pantry/Alert';
import { Badge } from '../components/pantry/Badge';
import { Input } from '../components/pantry/Input';
import { Table } from '../components/pantry/Table';
import { 
  Database, 
  Server, 
  Shield, 
  Activity, 
  Search, 
  Download, 
  Edit, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  HardDrive, 
  Cpu, 
  BarChart3,
  RefreshCw,
  X,
  AlertCircle,
  FileUp,
  Zap,
  Globe,
  XCircle,
  Info
} from 'lucide-react';

/**
 * Comprehensive Database Administration Interface
 * 
 * This component provides extensive database management capabilities including:
 * - Real-time database monitoring and health tracking
 * - Comprehensive audit trail viewing and analysis
 * - Tenant quota management and enforcement
 * - Custom query builder and execution
 * - Advanced database operations (backup, restore, migration)
 * - File upload and document management
 * - Data seeding and cleanup operations
 * - System configuration and customization
 */

interface DatabaseStats {
  totalUsers: number;
  totalDocuments: number;
  totalTenants: number;
  totalRoles: number;
  totalPermissions: number;
  totalAuditEntries: number;
  databaseSize: string;
  lastBackup: string | null;
  systemHealth: {
    database: boolean;
    redis: boolean;
    elasticsearch: boolean;
  };
}

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TenantQuota {
  tenantId: string;
  tenantName: string;
  tier: 'Trial' | 'Professional' | 'Enterprise' | 'Custom';
  maxUsers: number;
  currentUsers: number;
  maxDocuments: number;
  currentDocuments: number;
  maxStorageMB: number;
  currentStorageMB: number;
  allowedFileTypes: string[];
  maxFileSizeMB: number;
  status: 'Active' | 'Suspended' | 'Over Limit' | 'Warning';
  billingStatus: 'Current' | 'Overdue' | 'Suspended';
  lastBillingDate?: string;
  nextBillingDate?: string;
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    connections: number;
    maxConnections: number;
    diskUsage: number;
    diskTotal: number;
    lastBackup?: string;
    uptime: number;
  };
  cache: {
    status: 'healthy' | 'warning' | 'critical';
    memoryUsage: number;
    hitRate: number;
    connections: number;
    evictionRate: number;
  };
  search: {
    status: 'healthy' | 'warning' | 'critical';
    indexHealth: string;
    documents: number;
    shards: number;
    clusterHealth: string;
  };
  storage: {
    totalUsedGB: number;
    totalAvailableGB: number;
    documentsStorageGB: number;
    attachmentsStorageGB: number;
    backupsStorageGB: number;
  };
}

interface DatabaseOperation {
  id: string;
  type: 'backup' | 'restore' | 'migration' | 'cleanup' | 'seed' | 'clear' | 'reindex' | 'optimize';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  details: string;
  progress?: number;
  error?: string;
  userId: string;
  affectedRecords?: number;
  estimatedTimeRemaining?: string;
}

interface CustomQuery {
  id: string;
  name: string;
  description: string;
  sql: string;
  parameters: { name: string; type: string; required: boolean; defaultValue?: string }[];
  lastRun?: string;
  favorite: boolean;
  category: string;
  createdBy: string;
  executionCount: number;
  avgExecutionTime: number;
}

interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  tenantId?: string;
  userId?: string;
  documentId?: string;
  error?: string;
}

export default function DatabaseAdmin() {
  // Basic state
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'quotas' | 'health' | 'queries' | 'operations' | 'uploads'>('overview');
  const [error, setError] = useState<string | null>(null);
  
  // Advanced features state
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [tenantQuotas, setTenantQuotas] = useState<TenantQuota[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [operations, setOperations] = useState<DatabaseOperation[]>([]);
  const [customQueries, setCustomQueries] = useState<CustomQuery[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  
  // Search and filter state
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');
  // const [auditDateRange, setAuditDateRange] = useState({ start: '', end: '' });
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<AuditEntry | null>(null);
  
  // Query builder state - will be used in future implementations
  // const [selectedQuery, setSelectedQuery] = useState<CustomQuery | null>(null);
  // const [queryResults, setQueryResults] = useState<any>(null);
  // const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  // const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  // const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  
  // Operations state - will be used in future implementations
  // const [selectedOperation, setSelectedOperation] = useState<string>('');
  // const [operationConfig, setOperationConfig] = useState<any>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    loadAllData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        loadDatabaseStats(),
        loadAuditEntries(),
        loadTenantQuotas(),
        loadSystemHealth(),
        loadOperations(),
        loadCustomQueries(),
        loadFileUploads()
      ]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await api.admin.getDatabaseStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
      // Set mock data for development
      setDbStats({
        totalUsers: 156,
        totalDocuments: 2847,
        totalTenants: 3,
        totalRoles: 12,
        totalPermissions: 45,
        totalAuditEntries: 1247,
        databaseSize: '15.2 GB',
        lastBackup: new Date(Date.now() - 86400000).toISOString(),
        systemHealth: { database: true, redis: true, elasticsearch: true }
      });
    }
  };

  const loadAuditEntries = async () => {
    // TODO: Replace with real API call
    const mockAuditEntries: AuditEntry[] = [
      {
        id: '1',
        userId: 'admin-1',
        userName: 'Platform Administrator',
        action: 'CREATE_TENANT',
        entityType: 'Tenant',
        entityId: 'tenant-123',
        details: 'Created new enterprise tenant: Global Legal Solutions with 200 user limit',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        severity: 'medium'
      },
      {
        id: '2',
        userId: 'admin-1',
        userName: 'Platform Administrator', 
        action: 'BULK_DELETE',
        entityType: 'Document',
        details: 'Bulk deleted 47 expired documents from tenant: temp-trial-org',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        severity: 'high'
      },
      {
        id: '3',
        userId: 'user-456',
        userName: 'Sarah Johnson',
        action: 'FAILED_LOGIN',
        entityType: 'Authentication',
        details: 'Failed login attempt with invalid credentials - 5th attempt in 10 minutes',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        success: false,
        severity: 'critical'
      }
    ];
    setAuditEntries(mockAuditEntries);
  };

  const loadTenantQuotas = async () => {
    // TODO: Replace with real API call
    const mockQuotas: TenantQuota[] = [
      {
        tenantId: 'tenant-1',
        tenantName: 'Acme Legal Partners',
        tier: 'Enterprise',
        maxUsers: 200,
        currentUsers: 156,
        maxDocuments: 10000,
        currentDocuments: 8947,
        maxStorageMB: 5120,
        currentStorageMB: 4256,
        allowedFileTypes: ['pdf', 'docx', 'txt', 'md', 'xlsx', 'pptx', 'zip'],
        maxFileSizeMB: 100,
        status: 'Warning',
        billingStatus: 'Current',
        lastBillingDate: new Date(Date.now() - 2592000000).toISOString(),
        nextBillingDate: new Date(Date.now() + 604800000).toISOString()
      },
      {
        tenantId: 'tenant-2',
        tenantName: 'TechStart Innovation',
        tier: 'Professional',
        maxUsers: 50,
        currentUsers: 28,
        maxDocuments: 1000,
        currentDocuments: 445,
        maxStorageMB: 1024,
        currentStorageMB: 256,
        allowedFileTypes: ['pdf', 'docx', 'txt', 'md', 'xlsx'],
        maxFileSizeMB: 25,
        status: 'Active',
        billingStatus: 'Current',
        lastBillingDate: new Date(Date.now() - 1296000000).toISOString(),
        nextBillingDate: new Date(Date.now() + 1296000000).toISOString()
      },
      {
        tenantId: 'tenant-3',
        tenantName: 'Startup Law Group',
        tier: 'Trial',
        maxUsers: 5,
        currentUsers: 5,
        maxDocuments: 50,
        currentDocuments: 52,
        maxStorageMB: 100,
        currentStorageMB: 125,
        allowedFileTypes: ['pdf', 'docx', 'txt'],
        maxFileSizeMB: 5,
        status: 'Over Limit',
        billingStatus: 'Overdue',
        lastBillingDate: new Date(Date.now() - 3888000000).toISOString(),
        nextBillingDate: new Date(Date.now() - 1296000000).toISOString()
      }
    ];
    setTenantQuotas(mockQuotas);
  };

  const loadSystemHealth = async () => {
    // TODO: Replace with real API call
    const mockHealth: SystemHealth = {
      database: {
        status: 'healthy',
        responseTime: 23,
        connections: 15,
        maxConnections: 100,
        diskUsage: 15.2,
        diskTotal: 100,
        lastBackup: new Date(Date.now() - 86400000).toISOString(),
        uptime: 2547.5
      },
      cache: {
        status: 'healthy',
        memoryUsage: 512,
        hitRate: 96.8,
        connections: 8,
        evictionRate: 0.02
      },
      search: {
        status: 'warning',
        indexHealth: 'yellow',
        documents: 2847,
        shards: 3,
        clusterHealth: 'green'
      },
      storage: {
        totalUsedGB: 18.7,
        totalAvailableGB: 250,
        documentsStorageGB: 12.3,
        attachmentsStorageGB: 5.8,
        backupsStorageGB: 0.6
      }
    };
    setSystemHealth(mockHealth);
  };

  const loadOperations = async () => {
    // TODO: Replace with real API call
    const mockOperations: DatabaseOperation[] = [
      {
        id: 'op-1',
        type: 'backup',
        status: 'running',
        startTime: new Date(Date.now() - 300000).toISOString(),
        details: 'Full database backup with compression',
        progress: 67,
        userId: 'admin-1',
        estimatedTimeRemaining: '2 minutes'
      },
      {
        id: 'op-2',
        type: 'cleanup',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3300000).toISOString(),
        details: 'Cleaned expired audit entries and temporary files',
        progress: 100,
        userId: 'admin-1',
        affectedRecords: 1247
      },
      {
        id: 'op-3',
        type: 'reindex',
        status: 'failed',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 7000000).toISOString(),
        details: 'Elasticsearch index rebuild',
        progress: 45,
        userId: 'admin-1',
        error: 'Connection timeout to Elasticsearch cluster'
      }
    ];
    setOperations(mockOperations);
  };

  const loadCustomQueries = async () => {
    // TODO: Replace with real API call  
    const mockQueries: CustomQuery[] = [
      {
        id: 'query-1',
        name: 'Tenant Usage Analysis',
        description: 'Detailed breakdown of resource usage by tenant including storage, users, and documents',
        sql: `SELECT 
          t.Name as TenantName,
          t.SubscriptionTier,
          COUNT(DISTINCT u.Id) as UserCount,
          COUNT(DISTINCT d.Id) as DocumentCount,
          SUM(CASE WHEN d.Content IS NOT NULL THEN LENGTH(d.Content) ELSE 0 END) / 1024 / 1024 as StorageMB,
          MAX(d.CreatedAt) as LastActivity
        FROM Tenants t
        LEFT JOIN Users u ON t.Id = u.TenantId AND u.IsActive = 1
        LEFT JOIN Documents d ON t.Id = d.TenantId
        WHERE t.IsActive = 1
        GROUP BY t.Id, t.Name, t.SubscriptionTier
        ORDER BY StorageMB DESC`,
        parameters: [],
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        favorite: true,
        category: 'Analytics',
        createdBy: 'Platform Admin',
        executionCount: 47,
        avgExecutionTime: 1.2
      },
      {
        id: 'query-2',
        name: 'Failed Login Analysis',
        description: 'Security analysis of failed login attempts with geographic and temporal patterns',
        sql: `SELECT 
          DATE(ua.Timestamp) as Date,
          ua.IPAddress,
          u.Email,
          COUNT(*) as FailedAttempts,
          MIN(ua.Timestamp) as FirstAttempt,
          MAX(ua.Timestamp) as LastAttempt
        FROM UserAuditEntries ua
        JOIN Users u ON ua.UserId = u.Id
        WHERE ua.Action = 'FAILED_LOGIN'
          AND ua.Timestamp >= @startDate
          AND ua.Timestamp <= @endDate
        GROUP BY DATE(ua.Timestamp), ua.IPAddress, u.Email
        HAVING COUNT(*) >= @minAttempts
        ORDER BY Date DESC, FailedAttempts DESC`,
        parameters: [
          { name: 'startDate', type: 'datetime', required: true, defaultValue: new Date(Date.now() - 604800000).toISOString() },
          { name: 'endDate', type: 'datetime', required: true, defaultValue: new Date().toISOString() },
          { name: 'minAttempts', type: 'int', required: false, defaultValue: '3' }
        ],
        lastRun: new Date(Date.now() - 86400000).toISOString(),
        favorite: false,
        category: 'Security',
        createdBy: 'Security Admin',
        executionCount: 23,
        avgExecutionTime: 0.8
      }
    ];
    setCustomQueries(mockQueries);
  };

  const loadFileUploads = async () => {
    // TODO: Replace with real API call
    const mockUploads: FileUpload[] = [
      {
        id: 'upload-1',
        fileName: 'legal-contract-template.docx',
        fileSize: 2456789,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadProgress: 100,
        status: 'completed',
        tenantId: 'tenant-1',
        userId: 'user-123',
        documentId: 'doc-456'
      },
      {
        id: 'upload-2',
        fileName: 'quarterly-report.pdf',
        fileSize: 15678901,
        fileType: 'application/pdf',
        uploadProgress: 73,
        status: 'uploading',
        tenantId: 'tenant-2',
        userId: 'user-789'
      }
    ];
    setFileUploads(mockUploads);
  };

  // Helper functions for formatting and calculations
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy': case 'active': case 'completed': case 'current':
        return 'text-green-600 bg-green-100';
      case 'warning': case 'over limit': case 'overdue':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'failed': case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'running': case 'uploading': case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsagePercentage = (current: number, max: number): number => {
    return max > 0 ? Math.round((current / max) * 100) : 0;
  };

  // Loading state
  if (isLoading && (!dbStats && !systemHealth)) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comprehensive-database-admin p-6 space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Database className="admin-header-icon text-blue-600" />
            <span>Database Administration</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive database management, monitoring, and administration tools
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="flex items-center space-x-1">
              <CheckCircle size={14} className="text-green-500" />
              <span>Real-time monitoring active</span>
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadAllData} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">🏢</div>
          <div className="text-2xl font-bold text-gray-900">{dbStats?.totalTenants || 0}</div>
          <div className="text-sm text-gray-600">Tenants</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-2xl font-bold text-gray-900">{dbStats?.totalUsers || 0}</div>
          <div className="text-sm text-gray-600">Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-2xl font-bold text-gray-900">{dbStats?.totalDocuments || 0}</div>
          <div className="text-sm text-gray-600">Documents</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-2xl font-bold text-gray-900">{dbStats?.totalAuditEntries || 0}</div>
          <div className="text-sm text-gray-600">Audit Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">💾</div>
          <div className="text-2xl font-bold text-gray-900">{dbStats?.databaseSize || 'N/A'}</div>
          <div className="text-sm text-gray-600">DB Size</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-gray-900">{systemHealth?.database?.responseTime || 0}ms</div>
          <div className="text-sm text-gray-600">Response</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-2xl font-bold text-gray-900">{operations.filter(op => op.status === 'running').length}</div>
          <div className="text-sm text-gray-600">Running Ops</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-gray-900">{tenantQuotas.filter(q => q.status === 'Over Limit').length}</div>
          <div className="text-sm text-gray-600">Over Limits</div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-8">
        <nav className="flex gap-6 overflow-x-auto border-b border-gray-200">
          {[
            { id: 'overview', label: 'System Overview', icon: <BarChart3 size={16} /> },
            { id: 'audit', label: 'Audit Trail', icon: <Shield size={16} />, badge: auditEntries.length },
            { id: 'quotas', label: 'Tenant Quotas', icon: <HardDrive size={16} />, warning: tenantQuotas.filter(q => q.status === 'Over Limit').length > 0 },
            { id: 'health', label: 'System Health', icon: <Activity size={16} />, warning: systemHealth?.search?.status === 'warning' },
            { id: 'queries', label: 'Query Builder', icon: <Search size={16} />, badge: customQueries.length },
            { id: 'operations', label: 'Operations', icon: <Settings size={16} />, running: operations.filter(op => op.status === 'running').length > 0 },
            { id: 'uploads', label: 'File Management', icon: <FileUp size={16} />, badge: fileUploads.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {tab.badge}
                </span>
              )}
              {tab.warning && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  ⚠️
                </span>
              )}
              {tab.running && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  🔄
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Database Health</h3>
                <Database className={`${systemHealth?.database?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`} size={24} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth?.database?.status || 'unknown')}`}>
                    {systemHealth?.database?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">{systemHealth?.database?.responseTime || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-medium">{systemHealth?.database?.connections || 0}/{systemHealth?.database?.maxConnections || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">{formatDuration(systemHealth?.database?.uptime || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cache Performance</h3>
                <Cpu className={`${systemHealth?.cache?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`} size={24} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Rate</span>
                  <span className="font-medium">{systemHealth?.cache?.hitRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{systemHealth?.cache?.memoryUsage || 0} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-medium">{systemHealth?.cache?.connections || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search Engine</h3>
                <Search className={`${systemHealth?.search?.status === 'healthy' ? 'text-green-500' : systemHealth?.search?.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} size={24} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth?.search?.status || 'unknown')}`}>
                    {systemHealth?.search?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Indexed Docs</span>
                  <span className="font-medium">{systemHealth?.search?.documents?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shards</span>
                  <span className="font-medium">{systemHealth?.search?.shards || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Overview */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemHealth?.storage?.totalUsedGB?.toFixed(1) || 0} GB</div>
                <div className="text-sm text-gray-600">Total Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth?.storage?.documentsStorageGB?.toFixed(1) || 0} GB</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemHealth?.storage?.attachmentsStorageGB?.toFixed(1) || 0} GB</div>
                <div className="text-sm text-gray-600">Attachments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemHealth?.storage?.backupsStorageGB?.toFixed(1) || 0} GB</div>
                <div className="text-sm text-gray-600">Backups</div>
              </div>
            </div>
          </div>

          {/* Recent Operations */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
            <div className="space-y-3">
              {operations.slice(0, 5).map((operation) => (
                <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                      {operation.status}
                    </span>
                    <span className="font-medium">{operation.type.toUpperCase()}</span>
                    <span className="text-gray-600">{operation.details}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {operation.progress && operation.status === 'running' ? `${operation.progress}%` : new Date(operation.startTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Controls */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search audit entries..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE_TENANT">Create Tenant</option>
                  <option value="DELETE_DATA">Delete Operations</option>
                  <option value="FAILED_LOGIN">Failed Logins</option>
                  <option value="BULK_DELETE">Bulk Operations</option>
                </select>
                <button className="btn btn-secondary flex items-center space-x-2">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Entries */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Timestamp</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Action</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Entity</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Severity</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditEntries
                    .filter(entry => 
                      auditFilter === 'all' || entry.action === auditFilter
                    )
                    .filter(entry =>
                      auditSearchTerm === '' || 
                      entry.details.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                      entry.userName.toLowerCase().includes(auditSearchTerm.toLowerCase())
                    )
                    .map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                        <div className="text-xs text-gray-500">{entry.ipAddress}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{entry.entityType}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.success ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                          {entry.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          entry.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          entry.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedAuditEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Entry Detail Modal */}
          {selectedAuditEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Audit Entry Details</h3>
                  <button
                    onClick={() => setSelectedAuditEntry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAuditEntry.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAuditEntry.details}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAuditEntry.userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAuditEntry.ipAddress}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 truncate">{selectedAuditEntry.userAgent}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quotas' && (
        <div className="space-y-6">
          {/* Quota Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">{tenantQuotas.filter(q => q.status === 'Active').length}</div>
              <div className="text-sm text-gray-600">Active Tenants</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl font-bold text-yellow-600">{tenantQuotas.filter(q => q.status === 'Warning').length}</div>
              <div className="text-sm text-gray-600">Warning Status</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl font-bold text-red-600">{tenantQuotas.filter(q => q.status === 'Over Limit').length}</div>
              <div className="text-sm text-gray-600">Over Limits</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600">{tenantQuotas.reduce((sum, q) => sum + q.currentStorageMB, 0)} MB</div>
              <div className="text-sm text-gray-600">Total Storage Used</div>
            </div>
          </div>

          {/* Tenant Quotas Table */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Tenant Quota Management</h2>
              <p className="text-gray-600 text-sm mt-1">Monitor and manage resource limits for all tenant organizations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Tenant</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Tier</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Users</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Documents</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Storage</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenantQuotas.map((quota) => (
                    <tr key={quota.tenantId} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{quota.tenantName}</div>
                        <div className="text-sm text-gray-500">Billing: {quota.billingStatus}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quota.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                          quota.tier === 'Professional' ? 'bg-blue-100 text-blue-800' :
                          quota.tier === 'Trial' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quota.tier}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="font-medium">{quota.currentUsers}</span> / {quota.maxUsers}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(quota.currentUsers, quota.maxUsers) >= 90 ? 'bg-red-500' :
                              getUsagePercentage(quota.currentUsers, quota.maxUsers) >= 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${getUsagePercentage(quota.currentUsers, quota.maxUsers)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="font-medium">{quota.currentDocuments}</span> / {quota.maxDocuments}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(quota.currentDocuments, quota.maxDocuments) >= 90 ? 'bg-red-500' :
                              getUsagePercentage(quota.currentDocuments, quota.maxDocuments) >= 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${getUsagePercentage(quota.currentDocuments, quota.maxDocuments)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="font-medium">{formatBytes(quota.currentStorageMB * 1024 * 1024)}</span> / {formatBytes(quota.maxStorageMB * 1024 * 1024)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(quota.currentStorageMB, quota.maxStorageMB) >= 90 ? 'bg-red-500' :
                              getUsagePercentage(quota.currentStorageMB, quota.maxStorageMB) >= 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${getUsagePercentage(quota.currentStorageMB, quota.maxStorageMB)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quota.status)}`}>
                          {quota.status === 'Over Limit' && <AlertTriangle size={12} className="mr-1" />}
                          {quota.status === 'Warning' && <AlertCircle size={12} className="mr-1" />}
                          {quota.status === 'Active' && <CheckCircle size={12} className="mr-1" />}
                          {quota.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Settings size={16} />
                          </button>
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

      {/* System Health Monitoring Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Database size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected - Response: 15ms
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cache Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Redis - 98% hit rate
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Search Engine</p>
                  <p className="text-2xl font-bold text-yellow-600">Warning</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Search size={24} className="text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Elasticsearch - High memory usage
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Globe size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  127 requests/min
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="mr-2" size={20} />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm text-gray-500">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                    <span className="text-sm text-gray-500">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Network I/O</span>
                    <span className="text-sm text-gray-500">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '12%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Database Metrics
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Active Connections</span>
                  <span className="text-sm text-gray-900">24 / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Queries per Second</span>
                  <span className="text-sm text-gray-900">148</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Avg Query Time</span>
                  <span className="text-sm text-gray-900">23ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Cache Hit Rate</span>
                  <span className="text-sm text-gray-900">98.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Index Efficiency</span>
                  <span className="text-sm text-gray-900">94.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Table Size</span>
                  <span className="text-sm text-gray-900">2.4 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Server className="mr-2" size={20} />
                Service Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Check
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { name: 'PostgreSQL Database', status: 'Healthy', lastCheck: '30 seconds ago', responseTime: '15ms', uptime: '99.9%', color: 'green' },
                    { name: 'Redis Cache', status: 'Healthy', lastCheck: '30 seconds ago', responseTime: '2ms', uptime: '99.8%', color: 'green' },
                    { name: 'Elasticsearch', status: 'Warning', lastCheck: '30 seconds ago', responseTime: '125ms', uptime: '98.2%', color: 'yellow' },
                    { name: 'File Storage', status: 'Healthy', lastCheck: '1 minute ago', responseTime: '45ms', uptime: '99.5%', color: 'green' },
                    { name: 'Email Service', status: 'Healthy', lastCheck: '2 minutes ago', responseTime: '340ms', uptime: '97.8%', color: 'green' },
                    { name: 'Background Jobs', status: 'Healthy', lastCheck: '1 minute ago', responseTime: 'N/A', uptime: '99.1%', color: 'green' }
                  ].map((service, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Server size={16} className="text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.color === 'green' ? 'bg-green-100 text-green-800' : 
                          service.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            service.color === 'green' ? 'bg-green-500' : 
                            service.color === 'yellow' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}></div>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.lastCheck}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.responseTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.uptime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          <RefreshCw size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                System Alerts
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { 
                  severity: 'warning', 
                  message: 'Elasticsearch memory usage is at 85%', 
                  time: '5 minutes ago',
                  action: 'Consider scaling up the cluster'
                },
                { 
                  severity: 'info', 
                  message: 'Database backup completed successfully', 
                  time: '2 hours ago',
                  action: 'Backup stored in secure location'
                },
                { 
                  severity: 'warning', 
                  message: 'High number of failed login attempts detected', 
                  time: '6 hours ago',
                  action: 'IP addresses have been temporarily blocked'
                }
              ].map((alert, index) => (
                <div key={index} className="p-6 flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    alert.severity === 'warning' ? 'bg-yellow-100' : 
                    alert.severity === 'error' ? 'bg-red-100' : 
                    'bg-blue-100'
                  }`}>
                    {alert.severity === 'warning' && <AlertTriangle size={16} className="text-yellow-600" />}
                    {alert.severity === 'error' && <XCircle size={16} className="text-red-600" />}
                    {alert.severity === 'info' && <Info size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500">{alert.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Query Builder Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          {/* Query Selection and Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Search className="mr-2" size={20} />
                    Query Builder
                  </h3>
                </div>
                <div className="p-6">
                  {/* Query Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Query Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="select">SELECT - Retrieve Data</option>
                      <option value="update">UPDATE - Modify Records</option>
                      <option value="delete">DELETE - Remove Records</option>
                      <option value="count">COUNT - Count Records</option>
                      <option value="custom">Custom SQL Query</option>
                    </select>
                  </div>

                  {/* Table Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Table
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select a table...</option>
                      <option value="users">Users</option>
                      <option value="tenants">Tenants</option>
                      <option value="documents">Documents</option>
                      <option value="audit_logs">Audit Logs</option>
                      <option value="permissions">Permissions</option>
                      <option value="document_tags">Document Tags</option>
                    </select>
                  </div>

                  {/* Query Editor */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SQL Query
                    </label>
                    <textarea
                      className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="SELECT * FROM users WHERE..."
                      defaultValue="SELECT u.id, u.first_name, u.last_name, u.email, t.name as tenant_name 
FROM users u 
INNER JOIN tenants t ON u.tenant_id = t.id 
WHERE u.is_active = true 
LIMIT 100;"
                    />
                  </div>

                  {/* Query Parameters */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parameters (Optional)
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="Parameter name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Parameter value"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                      <Search size={16} className="mr-2" />
                      Execute Query
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                      Validate
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Save Query
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Queries */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Saved Queries</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { name: 'Active Users by Tenant', description: 'List all active users grouped by tenant', category: 'Users' },
                      { name: 'Document Statistics', description: 'Document counts and sizes by tenant', category: 'Analytics' },
                      { name: 'Failed Login Attempts', description: 'Recent failed authentication logs', category: 'Security' },
                      { name: 'Storage Usage Report', description: 'Storage consumption by tenant', category: 'Analytics' },
                      { name: 'Permission Audit', description: 'User permissions across all tenants', category: 'Security' }
                    ].map((query, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium text-sm text-gray-900">{query.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{query.description}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {query.category}
                          </span>
                          <div className="flex gap-1">
                            <button className="text-blue-600 hover:text-blue-800 text-xs">Load</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Query Results */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Query Results
              </h3>
            </div>
            <div className="p-6">
              {/* Sample Results Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@acmelegal.com', tenant: 'Acme Legal' },
                      { id: '2', firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@techstart.io', tenant: 'TechStart' },
                      { id: '3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@globalconsulting.com', tenant: 'Global Consulting' },
                      { id: '4', firstName: 'David', lastName: 'Smith', email: 'david.smith@acmelegal.com', tenant: 'Acme Legal' },
                      { id: '5', firstName: 'Lisa', lastName: 'Wang', email: 'lisa.wang@techstart.io', tenant: 'TechStart' }
                    ].map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.firstName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.tenant}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Query Execution Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Query executed successfully:</span> 5 rows returned in 23ms
                  </div>
                  <div className="flex gap-4">
                    <button className="text-blue-600 hover:text-blue-800">Export CSV</button>
                    <button className="text-blue-600 hover:text-blue-800">Export JSON</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Query History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Query History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { query: 'SELECT * FROM users WHERE is_active = true', timestamp: '2 minutes ago', status: 'Success', rows: 45 },
                { query: 'SELECT COUNT(*) FROM documents GROUP BY tenant_id', timestamp: '15 minutes ago', status: 'Success', rows: 3 },
                { query: 'UPDATE users SET last_login_at = NOW() WHERE id = 123', timestamp: '1 hour ago', status: 'Success', rows: 1 },
                { query: 'SELECT * FROM audit_logs WHERE severity = \'high\'', timestamp: '2 hours ago', status: 'Success', rows: 12 }
              ].map((item, index) => (
                <div key={index} className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-gray-900 mb-1">{item.query}</div>
                    <div className="text-xs text-gray-500">{item.timestamp}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">{item.rows} rows</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Rerun</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Database Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Operation Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database size={24} className="text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">5 operations</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Database</h3>
              <p className="text-sm text-gray-500 mt-1">Backup, restore, migration operations</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HardDrive size={24} className="text-green-600" />
                </div>
                <span className="text-sm text-gray-500">3 operations</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Maintenance</h3>
              <p className="text-sm text-gray-500 mt-1">Cleanup, optimization, indexing</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Shield size={24} className="text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">4 operations</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500 mt-1">Audit, permissions, encryption</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <span className="text-sm text-gray-500">2 operations</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Emergency</h3>
              <p className="text-sm text-gray-500 mt-1">Recovery, emergency procedures</p>
            </div>
          </div>

          {/* Available Operations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="mr-2" size={20} />
                Available Operations
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Full Database Backup',
                    description: 'Create a complete backup of all database tables and data',
                    category: 'Database',
                    severity: 'low',
                    estimated: '15-30 minutes',
                    icon: Download
                  },
                  {
                    name: 'Restore from Backup',
                    description: 'Restore database from a previous backup file',
                    category: 'Database',
                    severity: 'high',
                    estimated: '20-45 minutes',
                    icon: FileUp
                  },
                  {
                    name: 'Migrate Schema',
                    description: 'Apply pending database schema migrations',
                    category: 'Database',
                    severity: 'medium',
                    estimated: '5-15 minutes',
                    icon: RefreshCw
                  },
                  {
                    name: 'Optimize Database',
                    description: 'Rebuild indexes and optimize table performance',
                    category: 'Maintenance',
                    severity: 'low',
                    estimated: '10-20 minutes',
                    icon: Cpu
                  },
                  {
                    name: 'Clear Cache',
                    description: 'Clear all Redis cache entries and restart cache services',
                    category: 'Maintenance',
                    severity: 'low',
                    estimated: '1-2 minutes',
                    icon: X
                  },
                  {
                    name: 'Reindex Search',
                    description: 'Rebuild Elasticsearch indexes for all documents',
                    category: 'Maintenance',
                    severity: 'medium',
                    estimated: '30-60 minutes',
                    icon: Search
                  },
                  {
                    name: 'Security Audit',
                    description: 'Run comprehensive security scan on all system components',
                    category: 'Security',
                    severity: 'low',
                    estimated: '5-10 minutes',
                    icon: Shield
                  },
                  {
                    name: 'Emergency Shutdown',
                    description: 'Safely shutdown all services and database connections',
                    category: 'Emergency',
                    severity: 'critical',
                    estimated: '2-5 minutes',
                    icon: AlertTriangle
                  }
                ].map((operation, index) => {
                  const Icon = operation.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            operation.severity === 'critical' ? 'bg-red-100' :
                            operation.severity === 'high' ? 'bg-orange-100' :
                            operation.severity === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <Icon size={16} className={
                              operation.severity === 'critical' ? 'text-red-600' :
                              operation.severity === 'high' ? 'text-orange-600' :
                              operation.severity === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            } />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{operation.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{operation.description}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          operation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          operation.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          operation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {operation.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">Category: {operation.category}</span>
                          <span>Est. Time: {operation.estimated}</span>
                        </div>
                        <button 
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            operation.severity === 'critical' 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Running Operations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="mr-2" size={20} />
                Running Operations
              </h3>
            </div>
            <div className="p-6">
              {[
                {
                  name: 'Database Optimization',
                  status: 'running',
                  progress: 65,
                  startTime: '10:30 AM',
                  estimatedCompletion: '10:45 AM',
                  details: 'Rebuilding indexes on users table...'
                },
                {
                  name: 'Search Reindexing',
                  status: 'queued',
                  progress: 0,
                  startTime: '-',
                  estimatedCompletion: '11:15 AM',
                  details: 'Waiting for database optimization to complete'
                }
              ].map((operation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        operation.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{operation.name}</h4>
                        <p className="text-sm text-gray-500">{operation.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        operation.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {operation.status}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{operation.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${operation.progress}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Started: {operation.startTime}</span>
                    <span>ETA: {operation.estimatedCompletion}</span>
                    <button className="text-red-600 hover:text-red-800">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operation History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Operation History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Executed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { 
                      operation: 'Full Database Backup', 
                      status: 'Completed', 
                      started: '2 hours ago', 
                      duration: '18 minutes', 
                      user: 'admin@platform.com',
                      result: 'Success'
                    },
                    { 
                      operation: 'Clear Cache', 
                      status: 'Completed', 
                      started: '4 hours ago', 
                      duration: '45 seconds', 
                      user: 'admin@platform.com',
                      result: 'Success'
                    },
                    { 
                      operation: 'Security Audit', 
                      status: 'Failed', 
                      started: '1 day ago', 
                      duration: '3 minutes', 
                      user: 'admin@platform.com',
                      result: 'Error'
                    },
                    { 
                      operation: 'Optimize Database', 
                      status: 'Completed', 
                      started: '2 days ago', 
                      duration: '12 minutes', 
                      user: 'admin@platform.com',
                      result: 'Success'
                    }
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.operation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.result === 'Success' ? 'bg-green-100 text-green-800' : 
                          item.result === 'Error' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.started}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">View Logs</button>
                        <button className="text-gray-600 hover:text-gray-800">Repeat</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="text-center py-8 text-gray-500">
          <FileUp className="upload-icon mx-auto mb-4" />
          <p>File Management interface coming soon...</p>
        </div>
      )}
    </div>
  );
}