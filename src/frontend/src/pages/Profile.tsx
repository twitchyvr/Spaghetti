import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Input } from '../components/pantry/Input';
import { Alert } from '../components/pantry/Alert';
import { Tabs, TabItem } from '../components/pantry/Navigation';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    organization: user?.tenant?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Update user profile data
      const updatedUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        organization: formData.organization
      };
      
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      
      // Here you would call the API to update the password
      // For now, just show success message
      toast.success('Password updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabItems: TabItem[] = [
    {
      id: 'profile',
      label: 'Profile Information',
      content: (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              placeholder="Enter your first name"
              disabled={isLoading}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Enter your last name"
              disabled={isLoading}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Enter your email address"
            leftIcon={<Mail className="w-5 h-5" />}
            disabled={isLoading}
          />

          <Input
            label="Organization"
            value={formData.organization}
            onChange={handleInputChange('organization')}
            placeholder="Enter your organization name"
            leftIcon={<Building2 className="w-5 h-5" />}
            disabled={isLoading}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
              icon={<Save className="w-4 h-4" />}
              iconPosition="left"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      )
    },
    {
      id: 'security',
      label: 'Security Settings',
      content: (
        <div className="space-y-6">
          <Alert
            variant="info"
            title="Password Security"
            icon={<Shield className="w-5 h-5" />}
          >
            Use a strong password with at least 8 characters including numbers and special characters.
          </Alert>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                placeholder="Enter your current password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                placeholder="Enter your new password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Confirm your new password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
                icon={<Save className="w-4 h-4" />}
                iconPosition="left"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
                <Camera className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-neutral-600">{user?.email}</p>
              <div className="flex items-center mt-2">
                <Building2 className="w-4 h-4 text-neutral-400 mr-2" />
                <span className="text-sm text-neutral-600">
                  {user?.tenant?.name || 'Enterprise Docs Platform'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Management Tabs */}
      <Card>
        <Tabs
          items={tabItems}
          defaultActiveTab="profile"
          variant="underline"
          className="p-0"
        />
      </Card>
    </div>
  );
}