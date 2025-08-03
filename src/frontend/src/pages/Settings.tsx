
import { useState } from 'react';
import { Card } from '../components/pantry/Card';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Database,
  Save,
  Volume2,
  Mail,
  AlertCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'integrations'>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      defaultView: 'grid'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      documentUpdates: true,
      systemAlerts: true,
      marketingEmails: false,
      weeklyReports: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    integrations: {
      googleDrive: false,
      microsoftOffice: false,
      slack: false,
      zapier: false
    }
  });

  const handleSave = async (category: keyof typeof settings) => {
    setIsLoading(true);
    try {
      // Here you would save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h3>
        
        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme Preference
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  disabled
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    value === 'light'
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="CET">Central European Time</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Document View
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'grid', label: 'Grid View' },
                { value: 'list', label: 'List View' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('general', 'defaultView', value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.general.defaultView === value
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSave('general')}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} className="mr-2" />
            Save General Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser and mobile push notifications', icon: Bell },
            { key: 'documentUpdates', label: 'Document Updates', description: 'Notifications when documents are updated', icon: AlertCircle },
            { key: 'systemAlerts', label: 'System Alerts', description: 'Important system maintenance and security alerts', icon: Shield },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotional content', icon: Volume2 },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of your document activity', icon: Database }
          ].map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon size={20} className="text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof typeof settings.notifications]}
                  onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSave('notifications')}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} className="mr-2" />
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
        
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Session Timeout */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Session Timeout</h4>
            <p className="text-sm text-gray-600 mb-4">Automatically log out after period of inactivity</p>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          {/* Login Alerts */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Login Alerts</h4>
                <p className="text-sm text-gray-600 mt-1">Get notified of new login attempts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.loginAlerts}
                  onChange={(e) => updateSetting('security', 'loginAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSave('security')}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} className="mr-2" />
            Save Security Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
        
        <div className="space-y-4">
          {[
            { key: 'googleDrive', label: 'Google Drive', description: 'Sync documents with Google Drive', status: 'Available' },
            { key: 'microsoftOffice', label: 'Microsoft Office 365', description: 'Integration with Office 365 suite', status: 'Available' },
            { key: 'slack', label: 'Slack', description: 'Send notifications to Slack channels', status: 'Coming Soon' },
            { key: 'zapier', label: 'Zapier', description: 'Automate workflows with Zapier', status: 'Coming Soon' }
          ].map(({ key, label, description, status }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-600">{description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    status === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
              {status === 'Available' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.integrations[key as keyof typeof settings.integrations]}
                    onChange={(e) => updateSetting('integrations', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSave('integrations')}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} className="mr-2" />
            Save Integration Settings
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and platform configuration
        </p>
      </div>

      {/* Settings Panel */}
      <Card className="shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'integrations' && renderIntegrationsSettings()}
        </div>
      </Card>
    </div>
  );
}