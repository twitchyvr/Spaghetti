import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Building2, Mail, Lock, Globe, Activity } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-brand-light) 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xl)',
              border: '3px solid white'
            }}>
              <Activity style={{ 
                width: '36px', 
                height: '36px', 
                color: 'white'
              }} />
            </div>
          </div>
          <h1 style={{
            fontSize: 'var(--font-3xl)',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Enterprise Docs Platform
          </h1>
          <p style={{
            fontSize: 'var(--font-lg)',
            color: 'var(--color-text-secondary)',
            fontWeight: '500'
          }}>
            Secure Document Management & AI Analytics
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'linear-gradient(145deg, var(--color-bg-primary) 0%, var(--color-bg-tertiary) 100%)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border-primary)',
          backdropFilter: 'blur(10px)',
          padding: '32px'
        }}>
          <form style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }} onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div style={{
                background: 'var(--color-error-light)',
                border: '1px solid var(--color-error-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertCircle style={{
                  width: '20px',
                  height: '20px',
                  color: 'var(--color-error-primary)',
                  flexShrink: 0
                }} />
                <p style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: '500',
                  color: 'var(--color-error-primary)',
                  margin: 0
                }}>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: errors.email ? 'var(--color-error-primary)' : 'var(--color-text-tertiary)',
                  zIndex: 1
                }} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    border: `2px solid ${errors.email ? 'var(--color-error-primary)' : 'var(--color-border-primary)'}`,
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--font-base)',
                    background: errors.email ? 'var(--color-error-light)' : 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-base)',
                    outline: 'none',
                    opacity: isLoading ? '0.6' : '1',
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--color-brand-primary)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--color-border-primary)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {errors.email && (
                <p style={{
                  marginTop: '8px',
                  fontSize: 'var(--font-sm)',
                  color: 'var(--color-error-primary)',
                  fontWeight: '500'
                }}>
                  {errors.email}
                </p>
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