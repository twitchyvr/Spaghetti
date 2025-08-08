import React, { useState, useEffect } from 'react';
import { User, Shield, Database, Key, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Input } from '../components/pantry/Input';
import { Badge } from '../components/pantry/Badge';
import { Alert } from '../components/pantry/Alert';
import { adminApi } from '../services/api';

interface AdminAccount {
  email: string;
  role: string;
  status: string;
}

interface SampleDataStatus {
  hasSampleData: boolean;
  hasDemoUser: boolean;
  demoCredentials?: {
    email: string;
    password: string;
    organization: string;
  };
  adminAccounts?: AdminAccount[];
}

export default function AdminSetup() {
  const [sampleDataStatus, setSampleDataStatus] = useState<SampleDataStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSampleDataStatus();
  }, []);

  const loadSampleDataStatus = async () => {
    try {
      const status = await adminApi.getSampleDataStatus();
      // Transform the API response to match our interface
      const transformedStatus: SampleDataStatus = {
        hasSampleData: status.hasSampleData,
        hasDemoUser: (status as any).hasDemoUser || status.hasSampleData, // If has sample data, assume has demo user
        demoCredentials: (status as any).demoCredentials || {
          email: "demo@spaghetti-platform.com",
          password: "demo123", 
          organization: "acme-legal"
        },
        adminAccounts: (status as any).adminAccounts || []
      };
      setSampleDataStatus(transformedStatus);
    } catch (error) {
      console.error('Failed to load sample data status:', error);
      setMessage({ type: 'error', text: 'Failed to load admin setup information' });
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    if (!newAdmin.email || !newAdmin.firstName || !newAdmin.lastName) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setCreating(true);
    try {
      const result = await adminApi.createAdminUser(newAdmin);
      setMessage({ 
        type: 'success', 
        text: `Admin user created successfully! Check the console for login credentials.` 
      });
      console.log('Admin User Created:', result);
      setNewAdmin({ email: '', firstName: '', lastName: '' });
      loadSampleDataStatus(); // Refresh the status
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create admin user' });
    } finally {
      setCreating(false);
    }
  };

  const seedSampleData = async () => {
    setSeeding(true);
    try {
      const result = await adminApi.seedSampleData();
      setMessage({ 
        type: 'success', 
        text: `Sample data seeded successfully! ${JSON.stringify(result.seededCounts)}` 
      });
      loadSampleDataStatus(); // Refresh the status
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to seed sample data' });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 animate-spin" />
              Loading admin setup...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Setup & Management
          </h1>
          <p className="text-gray-600 mt-2">Configure admin accounts and manage platform data</p>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'error' : 'success'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <div>
              <h4 className="font-medium">
                {message.type === 'error' ? 'Error' : 'Success'}
              </h4>
              <p className="text-sm">{message.text}</p>
            </div>
          </Alert>
        )}

        {/* Current Status */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Platform Status
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sampleDataStatus?.hasSampleData ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  Sample Data: {sampleDataStatus?.hasSampleData ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sampleDataStatus?.hasDemoUser ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  Demo User: {sampleDataStatus?.hasDemoUser ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sampleDataStatus?.adminAccounts?.length ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm">
                  Admin Accounts: {sampleDataStatus?.adminAccounts?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {sampleDataStatus?.demoCredentials && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Demo Account Access
              </h3>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Use these credentials to access the demo:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {sampleDataStatus.demoCredentials.email}</div>
                  <div><strong>Password:</strong> {sampleDataStatus.demoCredentials.password}</div>
                  <div><strong>Organization:</strong> {sampleDataStatus.demoCredentials.organization} (optional)</div>
                </div>
                <Button 
                  className="mt-3" 
                  onClick={() => window.location.href = '/login'}
                  size="sm"
                >
                  Go to Login Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Admin Accounts */}
        {sampleDataStatus?.adminAccounts && sampleDataStatus.adminAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Existing Admin Accounts
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleDataStatus.adminAccounts.map((admin, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-sm text-gray-500">{admin.role}</p>
                    </div>
                    <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                      {admin.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Admin */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Create New Admin User
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={newAdmin.firstName}
                onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name"
                value={newAdmin.lastName}
                onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="admin@yourcompany.com"
              required
            />
            <Button 
              onClick={createAdminUser}
              disabled={creating}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Create Admin User'}
            </Button>
          </CardContent>
        </Card>

        {/* Sample Data Management */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sample Data Management
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Initialize the platform with sample tenants, users, and documents for testing and demonstration.
            </p>
            <Button 
              onClick={seedSampleData}
              disabled={seeding}
              variant="outline"
              className="w-full"
            >
              {seeding ? 'Seeding Sample Data...' : 'Seed Sample Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">Ready to use the platform?</p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/database-admin'}
              >
                Database Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}