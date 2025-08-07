import React, { useState, useEffect } from 'react';
import { Database, Activity, Server, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../pantry/Card';
import { Button } from '../pantry/Button';
import { Badge } from '../pantry/Badge';
import { DatabaseStats, SystemHealth } from '../../types/database-admin';
import { databaseAdminApi } from '../../services/database-admin-api';

interface DatabaseAdminDashboardProps {
  onNavigateToSection: (section: 'dashboard' | 'tables' | 'query' | 'audit' | 'backup' | 'users' | 'settings') => void;
}

export function DatabaseAdminDashboard({ onNavigateToSection }: DatabaseAdminDashboardProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, health] = await Promise.all([
        databaseAdminApi.getDatabaseStats(),
        databaseAdminApi.getSystemHealth()
      ]);
      
      setStats(stats);
      setHealth(health);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (status: 'healthy' | 'warning' | 'critical') => {
    const variants = {
      healthy: { variant: 'success' as const, text: 'Healthy' },
      warning: { variant: 'warning' as const, text: 'Warning' },
      critical: { variant: 'error' as const, text: 'Critical' }
    };
    return variants[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{stats?.totalDocuments.toLocaleString()}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tenants</p>
                <p className="text-2xl font-bold">{stats?.totalTenants.toLocaleString()}</p>
              </div>
              <Server className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Database Size</p>
                <p className="text-2xl font-bold">{stats?.databaseSize}</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">System Health</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database</span>
                  <Badge {...getHealthBadge(health.database.status)}>
                    {getHealthBadge(health.database.status).text}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Response: {health.database.responseTime}ms</p>
                  <p>Connections: {health.database.connections}/{health.database.maxConnections}</p>
                  <p>Disk: {((health.database.diskUsage / health.database.diskTotal) * 100).toFixed(1)}% used</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cache</span>
                  <Badge {...getHealthBadge(health.cache.status)}>
                    {getHealthBadge(health.cache.status).text}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Memory: {health.cache.memoryUsage.toFixed(1)}%</p>
                  <p>Hit Rate: {health.cache.hitRate.toFixed(1)}%</p>
                  <p>Connections: {health.cache.connections}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Search</span>
                  <Badge {...getHealthBadge(health.search.status)}>
                    {getHealthBadge(health.search.status).text}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Documents: {health.search.documents.toLocaleString()}</p>
                  <p>Shards: {health.search.shards}</p>
                  <p>Cluster: {health.search.clusterHealth}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => onNavigateToSection('tables')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Database className="h-6 w-6" />
              <span>Browse Tables</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onNavigateToSection('query')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Activity className="h-6 w-6" />
              <span>Run Queries</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onNavigateToSection('audit')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Server className="h-6 w-6" />
              <span>View Audit Log</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onNavigateToSection('backup')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <HardDrive className="h-6 w-6" />
              <span>Backup & Restore</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}