import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FileText, 
  Activity, 
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Settings,
  Eye,
  Calendar,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientData {
  id: string;
  name: string;
  subdomain: string;
  status: 'Active' | 'Inactive' | 'Trial';
  tier: 'Trial' | 'Professional' | 'Enterprise';
  userCount: number;
  documentCount: number;
  monthlyRevenue: number;
  storageUsed: string;
  lastActivity: Date;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
}

export default function ClientManage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents' | 'activity' | 'billing'>('overview');

  useEffect(() => {
    fetchClientData();
    fetchActivityLogs();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      
      // Sample client data - replace with actual API call
      const sampleClient: ClientData = {
        id: clientId || '1',
        name: 'Acme Legal Partners',
        subdomain: 'acme-legal',
        status: 'Active',
        tier: 'Professional',
        userCount: 25,
        documentCount: 342,
        monthlyRevenue: 2500,
        storageUsed: '2.4 GB',
        lastActivity: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      };
      
      setClient(sampleClient);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      toast.error('Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      // Sample activity logs - replace with actual API call
      const sampleLogs: ActivityLog[] = [
        {
          id: '1',
          action: 'Document Created',
          user: 'john.smith@acmelegal.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          details: 'Created "Contract Review Guidelines" document'
        },
        {
          id: '2',
          action: 'User Login',
          user: 'sarah.johnson@acmelegal.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          details: 'Logged in from IP: 192.168.1.100'
        },
        {
          id: '3',
          action: 'Document Shared',
          user: 'mike.wilson@acmelegal.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          details: 'Shared "Legal Brief Template" with 3 users'
        }
      ];
      
      setActivityLogs(sampleLogs);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The requested client could not be found.</p>
          <button
            onClick={() => navigate('/clients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Trial': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Client Management Dashboard</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/clients/${clientId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Edit Client
          </button>
        </div>
      </div>

      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Users</p>
              <p className="text-2xl font-bold text-gray-900">{client.userCount}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{client.documentCount}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${client.monthlyRevenue}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'billing', label: 'Billing', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Subdomain:</dt>
                      <dd className="text-sm font-medium text-gray-900">{client.subdomain}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Tier:</dt>
                      <dd className="text-sm font-medium text-gray-900">{client.tier}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Storage Used:</dt>
                      <dd className="text-sm font-medium text-gray-900">{client.storageUsed}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Last Activity:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatTimestamp(client.lastActivity)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Export Data</span>
                      </div>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Schedule Maintenance</span>
                      </div>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <span className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.user}</p>
                      <p className="text-sm text-gray-500">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-500 mb-4">User management interface will be available here</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-500 mb-4">Document management interface will be available here</p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
              <p className="text-gray-500 mb-4">Billing and subscription interface will be available here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}