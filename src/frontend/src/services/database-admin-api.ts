// Database Admin API Service
import { fetchApi } from './api';
import { 
  DatabaseStats, 
  SystemHealth, 
  TableInfo, 
  QueryResult,
  CustomQuery,
  DatabaseOperation 
} from '../types/database-admin';

export const databaseAdminApi = {
  // Dashboard endpoints
  async getDatabaseStats(): Promise<DatabaseStats> {
    const response = await fetchApi<any>('/admin/database-stats');
    
    // Transform API response to match our interface
    return {
      totalUsers: response.totalUsers || 0,
      totalDocuments: response.totalDocuments || 0,
      totalTenants: response.totalTenants || 0,
      totalRoles: response.totalRoles || 0,
      totalPermissions: response.totalPermissions || 0,
      totalAuditEntries: response.totalAuditEntries || 0,
      databaseSize: response.storageUsed || '0 MB',
      lastBackup: response.lastBackup || null,
      systemHealth: {
        database: response.systemHealth === 'optimal',
        redis: true,
        elasticsearch: true
      }
    };
  },

  async getSystemHealth(): Promise<SystemHealth> {
    // Mock system health data since API doesn't provide this yet
    return {
      database: {
        status: 'healthy',
        responseTime: 25,
        connections: 15,
        maxConnections: 100,
        diskUsage: 2.3,
        diskTotal: 10,
        lastBackup: new Date().toISOString(),
        uptime: 86400
      },
      cache: {
        status: 'healthy',
        memoryUsage: 35.2,
        hitRate: 92.5,
        connections: 8,
        evictionRate: 0.1
      },
      search: {
        status: 'healthy',
        indexHealth: 'green',
        documents: 247,
        shards: 5,
        clusterHealth: 'green'
      },
      storage: {
        totalUsedGB: 2.3,
        totalAvailableGB: 10,
        documentsStorageGB: 1.8,
        attachmentsStorageGB: 0.4,
        backupsStorageGB: 0.1
      }
    };
  },

  // Table management endpoints
  async getTables(): Promise<TableInfo[]> {
    // Mock table data since API doesn't provide this yet
    return [
      {
        tableName: 'users',
        rowCount: 12,
        sizeKB: 256,
        lastModified: new Date().toISOString(),
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'email', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'first_name', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'last_name', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'tenant_id', type: 'uuid', nullable: true, isPrimaryKey: false, isForeignKey: true, referencedTable: 'tenants', referencedColumn: 'id' },
          { name: 'created_at', type: 'datetime', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'is_active', type: 'boolean', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], isUnique: true, type: 'BTREE' },
          { name: 'idx_users_email', columns: ['email'], isUnique: true, type: 'BTREE' },
          { name: 'idx_users_tenant_id', columns: ['tenant_id'], isUnique: false, type: 'BTREE' }
        ]
      },
      {
        tableName: 'tenants',
        rowCount: 3,
        sizeKB: 128,
        lastModified: new Date().toISOString(),
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'name', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'subdomain', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'status', type: 'int', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'created_at', type: 'datetime', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], isUnique: true, type: 'BTREE' },
          { name: 'idx_tenants_subdomain', columns: ['subdomain'], isUnique: true, type: 'BTREE' }
        ]
      },
      {
        tableName: 'documents',
        rowCount: 247,
        sizeKB: 1024,
        lastModified: new Date().toISOString(),
        columns: [
          { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'tenant_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'tenants', referencedColumn: 'id' },
          { name: 'title', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'content', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'created_by', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'users', referencedColumn: 'id' },
          { name: 'created_at', type: 'datetime', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'updated_at', type: 'datetime', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], isUnique: true, type: 'BTREE' },
          { name: 'idx_documents_tenant_id', columns: ['tenant_id'], isUnique: false, type: 'BTREE' },
          { name: 'idx_documents_created_by', columns: ['created_by'], isUnique: false, type: 'BTREE' }
        ]
      }
    ];
  },

  async getTableData(tableName: string, page: number = 1, pageSize: number = 50, search?: string): Promise<QueryResult> {
    // Mock table data
    const mockData = {
      users: {
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'email', type: 'varchar' },
          { name: 'first_name', type: 'varchar' },
          { name: 'last_name', type: 'varchar' },
          { name: 'tenant_id', type: 'uuid' },
          { name: 'created_at', type: 'datetime' },
          { name: 'is_active', type: 'boolean' }
        ],
        rows: [
          {
            id: 'u1-demo-uuid',
            email: 'admin@acme-legal.com',
            first_name: 'Sarah',
            last_name: 'Johnson',
            tenant_id: 't1-demo-uuid',
            created_at: '2025-07-01T10:00:00Z',
            is_active: true
          },
          {
            id: 'u2-demo-uuid',
            email: 'john@techstart.com',
            first_name: 'John',
            last_name: 'Smith',
            tenant_id: 't2-demo-uuid',
            created_at: '2025-07-15T14:30:00Z',
            is_active: true
          }
        ]
      },
      tenants: {
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'subdomain', type: 'varchar' },
          { name: 'status', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ],
        rows: [
          {
            id: 't1-demo-uuid',
            name: 'Acme Legal',
            subdomain: 'acme-legal',
            status: 1,
            created_at: '2025-07-01T09:00:00Z'
          },
          {
            id: 't2-demo-uuid',
            name: 'TechStart',
            subdomain: 'techstart',
            status: 1,
            created_at: '2025-07-15T11:00:00Z'
          }
        ]
      },
      documents: {
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'tenant_id', type: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'content', type: 'text' },
          { name: 'created_by', type: 'uuid' },
          { name: 'created_at', type: 'datetime' }
        ],
        rows: [
          {
            id: 'd1-demo-uuid',
            tenant_id: 't1-demo-uuid',
            title: 'Service Agreement Template',
            content: 'This is a comprehensive service agreement template...',
            created_by: 'u1-demo-uuid',
            created_at: '2025-07-02T15:30:00Z'
          }
        ]
      }
    };

    const tableData = mockData[tableName as keyof typeof mockData] || { columns: [], rows: [] };
    
    return {
      columns: tableData.columns,
      rows: tableData.rows,
      totalRows: tableData.rows.length,
      executionTime: Math.random() * 50 + 10 // 10-60ms
    };
  },

  async getTableStructure(tableName: string): Promise<TableInfo> {
    const tables = await this.getTables();
    const table = tables.find(t => t.tableName === tableName);
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }
    return table;
  },

  // Query execution
  async executeQuery(sql: string): Promise<QueryResult> {
    // Mock query execution for demonstration
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // Simulate execution time

    // Simple mock based on query type
    if (sql.toLowerCase().includes('select')) {
      return {
        columns: [
          { name: 'result', type: 'varchar' },
          { name: 'count', type: 'int' }
        ],
        rows: [
          { result: 'Mock Query Result', count: 42 },
          { result: 'Another Row', count: 123 }
        ],
        totalRows: 2,
        executionTime: Math.random() * 50 + 20
      };
    } else {
      return {
        columns: [],
        rows: [],
        totalRows: 0,
        executionTime: Math.random() * 30 + 10,
        affectedRows: Math.floor(Math.random() * 5) + 1
      };
    }
  },

  // Saved queries
  async getSavedQueries(): Promise<CustomQuery[]> {
    return [
      {
        id: 'q1',
        name: 'User Count by Tenant',
        sql: 'SELECT t.name, COUNT(u.id) as user_count FROM tenants t LEFT JOIN users u ON t.id = u.tenant_id GROUP BY t.id, t.name',
        description: 'Shows the number of users per tenant',
        parameters: [],
        isPublic: true,
        createdBy: 'admin',
        createdAt: '2025-07-01T10:00:00Z',
        executionCount: 15,
        avgExecutionTime: 25.5,
        category: 'reporting'
      }
    ];
  },

  async saveQuery(query: Omit<CustomQuery, 'id' | 'createdAt' | 'executionCount' | 'avgExecutionTime'>): Promise<void> {
    // Mock save operation
    console.log('Saving query:', query);
  },

  async getQueryHistory(): Promise<Array<{
    query: string;
    timestamp: string;
    executionTime: number;
    success: boolean;
    error?: string;
  }>> {
    return [
      {
        query: 'SELECT COUNT(*) FROM users',
        timestamp: '2025-08-07T14:30:00Z',
        executionTime: 25,
        success: true
      },
      {
        query: 'SELECT * FROM tenants WHERE status = 1',
        timestamp: '2025-08-07T14:25:00Z',
        executionTime: 18,
        success: true
      }
    ];
  }
};