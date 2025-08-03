import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

// Pantry Components
import { Card, CardHeader, CardContent } from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Input } from '../components/pantry/Input';
import { Alert } from '../components/pantry/Alert';

interface LoginFormData {
  email: string;
  password: string;
  tenantSubdomain: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  tenantSubdomain?: string;
  general?: string;
}

export default function Login() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    tenantSubdomain: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Tenant subdomain validation (optional but if provided, must be valid)
    if (formData.tenantSubdomain && !/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(formData.tenantSubdomain)) {
      newErrors.tenantSubdomain = 'Please enter a valid subdomain';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password, formData.tenantSubdomain, formData.rememberMe);
      // Navigation will be handled by AuthContext/App.tsx
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrors({ general: message });
      toast.error(message);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-neutral-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Spaghetti Platform
          </h2>
          <p className="text-neutral-600">
            AI-Powered Enterprise Documentation Platform
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to access your professional document workspace
          </p>
        </div>

        {/* Login Form */}
        <Card variant="elevated" className="shadow-xl">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* General Error */}
              {errors.general && (
                <Alert variant="error" className="mb-6">
                  {errors.general}
                </Alert>
              )}

              {/* Email Field */}
              <Input
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email address"
                disabled={isLoading}
                {...(errors.email && { error: errors.email })}
                state={errors.email ? 'error' : 'default'}
              />

              {/* Password Field */}
              <div className="relative">
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...(errors.password && { error: errors.password })}
                  state={errors.password ? 'error' : 'default'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Tenant Subdomain Field */}
              <Input
                label="Tenant Subdomain (Optional)"
                id="tenantSubdomain"
                type="text"
                value={formData.tenantSubdomain}
                onChange={handleInputChange('tenantSubdomain')}
                placeholder="Enter tenant subdomain (e.g., acme)"
                disabled={isLoading}
                {...(errors.tenantSubdomain && { error: errors.tenantSubdomain })}
                state={errors.tenantSubdomain ? 'error' : 'default'}
                helperText="Leave empty to access your default tenant"
              />

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-neutral-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-neutral-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              {/* Demo Access Note */}
              <Alert variant="info" title="🚀 Explore the Live Demo" className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <div className="text-sm text-orange-900">
                  <p className="mb-3 text-orange-700">Experience our AI-powered document platform with sample data:</p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 font-mono text-xs border border-orange-200">
                    <div className="grid grid-cols-1 gap-1">
                      <p><span className="text-orange-600 font-semibold">Email:</span> demo@spaghetti-platform.com</p>
                      <p><span className="text-orange-600 font-semibold">Password:</span> demo123 <span className="text-neutral-500">(or any password)</span></p>
                      <p><span className="text-orange-600 font-semibold">Organization:</span> acme-legal <span className="text-neutral-500">(optional)</span></p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-orange-600">✨ Full-featured demo with AI document generation, client management, and analytics</p>
                </div>
              </Alert>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Need an account? Contact your administrator or 
            <a href="#" className="font-medium text-orange-600 hover:text-orange-500 ml-1">
              request access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}