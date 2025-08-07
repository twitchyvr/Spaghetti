// Database Administration Types
// Centralized type definitions for database management functionality

export interface DatabaseStats {
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

export interface AuditEntry {
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

export interface TenantQuota {
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

export interface SystemHealth {
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

export interface DatabaseOperation {
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

export interface CustomQuery {
  id: string;
  name: string;
  sql: string;
  description: string;
  parameters: QueryParameter[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
  avgExecutionTime: number;
  category: 'reporting' | 'maintenance' | 'debugging' | 'analytics' | 'other';
}

export interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'uploading' | 'completed' | 'failed' | 'processing';
  progress: number;
  error?: string;
  processingResults?: {
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    warnings: string[];
  };
}

export interface QueryResult {
  columns: Array<{
    name: string;
    type: string;
  }>;
  rows: Array<Record<string, any>>;
  totalRows: number;
  executionTime: number;
  affectedRows?: number;
}

export interface TableInfo {
  tableName: string;
  rowCount: number;
  sizeKB: number;
  lastModified?: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    referencedTable?: string;
    referencedColumn?: string;
  }>;
  indexes: Array<{
    name: string;
    columns: string[];
    isUnique: boolean;
    type: string;
  }>;
}

export interface DatabaseBackup {
  id: string;
  name: string;
  createdAt: string;
  sizeKB: number;
  type: 'full' | 'incremental' | 'schema-only' | 'data-only';
  status: 'creating' | 'completed' | 'failed' | 'restoring';
  downloadUrl?: string;
  expiresAt?: string;
  metadata: {
    version: string;
    tables: number;
    rows: number;
    compressionRatio: number;
  };
}