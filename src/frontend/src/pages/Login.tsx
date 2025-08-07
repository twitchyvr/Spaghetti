import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Eye, EyeOff, Building2, Mail, Lock, Activity, AlertCircle } from 'lucide-react'
import { Input, Button } from '../components/pantry'

interface LoginFormData {
  email: string
  password: string
  tenantSubdomain: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  tenantSubdomain?: string
  general?: string
}

export default function Login() {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    tenantSubdomain: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.tenantSubdomain && !/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(formData.tenantSubdomain)) {
      newErrors.tenantSubdomain = 'Please enter a valid subdomain'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await login(formData.email, formData.password, formData.tenantSubdomain, formData.rememberMe)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setErrors({ general: message })
      toast.error(message)
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-brand-light)] p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] shadow-xl border-4 border-white">
            <Activity className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] bg-clip-text text-transparent">
            Enterprise Docs Platform
          </h1>
          <p className="text-lg font-medium text-[var(--color-text-secondary)]">
            Secure Document Management &amp; AI Analytics
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-bg-primary)] to-[var(--color-bg-tertiary)] rounded-xl shadow-xl border border-[var(--color-border-primary)] backdrop-blur-sm p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error-primary)] bg-[var(--color-error-light)] p-4">
                <AlertCircle className="h-5 w-5 text-[var(--color-error-primary)]" />
                <p className="text-sm font-medium text-[var(--color-error-primary)]">{errors.general}</p>
              </div>
            )}

            <Input
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange('email')}
              leftIcon={<Mail className="h-4 w-4" />}
              {...(errors.email ? { error: errors.email } : {})}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleInputChange('password')}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...(errors.password ? { error: errors.password } : {})}
            />

            <Input
              type="text"
              label="Organization (optional)"
              value={formData.tenantSubdomain}
              onChange={handleInputChange('tenantSubdomain')}
              leftIcon={<Building2 className="h-4 w-4" />}
              helperText="Leave empty to access your default organization"
              {...(errors.tenantSubdomain ? { error: errors.tenantSubdomain } : {})}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Keep me signed in</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth loading={isLoading}>
              Sign in
            </Button>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3 space-y-2 text-sm text-blue-700">
                  <h4 className="font-medium text-blue-800">Try the Demo</h4>
                  <p>Experience the platform with sample data:</p>
                  <div className="space-y-1 rounded border border-blue-200 bg-white p-3 font-mono text-xs">
                    <div><span className="font-semibold">Email:</span> demo@spaghetti-platform.com</div>
                    <div>
                      <span className="font-semibold">Password:</span> demo123{' '}
                      <span className="text-neutral-500">(or any password)</span>
                    </div>
                    <div>
                      <span className="font-semibold">Organization:</span> acme-legal{' '}
                      <span className="text-neutral-500">(optional)</span>
                    </div>
                  </div>
                  <p className="text-xs">Full-featured demo with AI document generation and analytics</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Need an account? Contact your administrator or
            <a
              href="#"
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              request access
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
