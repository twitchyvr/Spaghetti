import React, { useState } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Search, 
  Settings, 
  Activity, 
  HardDrive,
  BarChart3,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import { DatabaseAdminDashboard } from '../components/database-admin/DatabaseAdminDashboard';
import { TableBrowser } from '../components/database-admin/TableBrowser';
import { QueryInterface } from '../components/database-admin/QueryInterface';

type DatabaseAdminSection = 
  | 'dashboard' 
  | 'tables' 
  | 'query' 
  | 'audit' 
  | 'backup' 
  | 'users' 
  | 'settings';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'tables', label: 'Browse Tables', icon: TableIcon },
  { id: 'query', label: 'SQL Query', icon: Search },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const;

export default function DatabaseAdmin() {
  const [activeSection, setActiveSection] = useState<DatabaseAdminSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DatabaseAdminDashboard onNavigateToSection={setActiveSection} />;
      case 'tables':
        return <TableBrowser />;
      case 'query':
        return <QueryInterface />;
      case 'audit':
        return <AuditLogViewer />;
      case 'backup':
        return <BackupManager />;
      case 'users':
        return <UserManager />;
      case 'settings':
        return <DatabaseSettings />;
      default:
        return <DatabaseAdminDashboard onNavigateToSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Database Admin</h1>
              <p className="text-sm text-gray-500">phpMyAdmin-style interface</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as DatabaseAdminSection)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Database connection active</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Placeholder components for remaining sections
function AuditLogViewer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Audit Log</h2>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Audit log viewer coming soon...</p>
      </div>
    </div>
  );
}

function BackupManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HardDrive className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Backup and restore functionality coming soon...</p>
      </div>
    </div>
  );
}

function UserManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">User management interface coming soon...</p>
      </div>
    </div>
  );
}

function DatabaseSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Database Settings</h2>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Database configuration settings coming soon...</p>
      </div>
    </div>
  );
}