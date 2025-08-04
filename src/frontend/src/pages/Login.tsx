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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white border border-neutral-200 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Spaghetti Platform
          </h2>
          <p className="text-neutral-600 text-base">
            Sign in to your account
          </p>
        </div>

        {/* Login Form - Microsoft Style Card */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className={`w-full px-3 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                  } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={`w-full px-3 py-3 pr-10 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                    } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Tenant Subdomain Field */}
              <div>
                <label htmlFor="tenantSubdomain" className="block text-sm font-medium text-neutral-700 mb-2">
                  Organization <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  id="tenantSubdomain"
                  type="text"
                  value={formData.tenantSubdomain}
                  onChange={handleInputChange('tenantSubdomain')}
                  placeholder="e.g., acme-legal"
                  disabled={isLoading}
                  className={`w-full px-3 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tenantSubdomain ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                  } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                />
                {errors.tenantSubdomain ? (
                  <p className="mt-2 text-sm text-red-600">{errors.tenantSubdomain}</p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">Leave empty to access your default organization</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-neutral-700">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Demo Access Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Try the Demo</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>Experience the platform with sample data:</p>
                      <div className="bg-white rounded border border-blue-200 p-3 font-mono text-xs space-y-1">
                        <div><span className="font-semibold">Email:</span> demo@spaghetti-platform.com</div>
                        <div><span className="font-semibold">Password:</span> demo123 <span className="text-neutral-500">(or any password)</span></div>
                        <div><span className="font-semibold">Organization:</span> acme-legal <span className="text-neutral-500">(optional)</span></div>
                      </div>
                      <p className="text-xs">Full-featured demo with AI document generation and analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Need an account? Contact your administrator or 
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 ml-1 focus:outline-none focus:underline">
              request access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}