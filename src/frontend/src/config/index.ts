import type { AppConfig } from '../types';

// Environment variables with defaults
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Main configuration object
export const config: AppConfig = {
  // Basic app configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  environment: getEnvVar('VITE_ENVIRONMENT', 'development') as 'development' | 'staging' | 'production',
  
  // Feature flags
  features: {
    enableVoiceCapture: getEnvBool('VITE_ENABLE_VOICE_CAPTURE', false),
    enableScreenCapture: getEnvBool('VITE_ENABLE_SCREEN_CAPTURE', false),
    enableFileMonitoring: getEnvBool('VITE_ENABLE_FILE_MONITORING', false),
    enableBrowserExtension: getEnvBool('VITE_ENABLE_BROWSER_EXTENSION', true),
    enableMobileApp: getEnvBool('VITE_ENABLE_MOBILE_APP', false),
  },
  
  // Integration settings
  integrations: {
    sharepoint: getEnvBool('VITE_INTEGRATION_SHAREPOINT', false),
    teams: getEnvBool('VITE_INTEGRATION_TEAMS', false),
    slack: getEnvBool('VITE_INTEGRATION_SLACK', true),
    email: getEnvBool('VITE_INTEGRATION_EMAIL', true),
  },
  
  // AI configuration
  ai: {
    provider: getEnvVar('VITE_AI_PROVIDER', 'openai') as 'openai' | 'azure' | 'local',
    models: getEnvVar('VITE_AI_MODELS', 'gpt-4,gpt-3.5-turbo').split(','),
    maxTokens: getEnvNumber('VITE_AI_MAX_TOKENS', 4000),
  },
  
  // Storage configuration
  storage: {
    provider: getEnvVar('VITE_STORAGE_PROVIDER', 'digitalocean') as 'azure' | 'aws' | 'digitalocean' | 'local',
    maxFileSize: getEnvNumber('VITE_STORAGE_MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
    allowedFileTypes: getEnvVar(
      'VITE_STORAGE_ALLOWED_FILE_TYPES',
      'pdf,doc,docx,txt,md,png,jpg,jpeg,gif,mp3,mp4,wav,m4a'
    ).split(','),
  },
};

// Deployment-specific configurations
export const deploymentConfigs = {
  // DigitalOcean deployment
  digitalocean: {
    apiBaseUrl: 'https://api.enterprisedocs.app/api',
    features: {
      enableVoiceCapture: true,
      enableScreenCapture: true,
      enableFileMonitoring: true,
      enableBrowserExtension: true,
      enableMobileApp: true,
    },
    integrations: {
      sharepoint: false,
      teams: false,
      slack: true,
      email: true,
    },
    ai: {
      provider: 'openai' as const,
      models: ['gpt-4', 'gpt-3.5-turbo'],
      maxTokens: 4000,
    },
    storage: {
      provider: 'digitalocean' as const,
      maxFileSize: 500 * 1024 * 1024, // 500MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav', 'm4a'],
    },
  },
  
  // Azure enterprise deployment
  azure: {
    apiBaseUrl: 'https://enterprisedocs.azurewebsites.net/api',
    features: {
      enableVoiceCapture: true,
      enableScreenCapture: true,
      enableFileMonitoring: true,
      enableBrowserExtension: true,
      enableMobileApp: true,
    },
    integrations: {
      sharepoint: true,
      teams: true,
      slack: true,
      email: true,
    },
    ai: {
      provider: 'azure' as const,
      models: ['gpt-4', 'gpt-35-turbo'],
      maxTokens: 8000,
    },
    storage: {
      provider: 'azure' as const,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav', 'm4a', 'xlsx', 'pptx'],
    },
  },
  
  // SharePoint add-in deployment
  sharepoint: {
    apiBaseUrl: '/api', // Relative to SharePoint site
    features: {
      enableVoiceCapture: false,
      enableScreenCapture: false,
      enableFileMonitoring: true,
      enableBrowserExtension: false,
      enableMobileApp: false,
    },
    integrations: {
      sharepoint: true,
      teams: true,
      slack: false,
      email: true,
    },
    ai: {
      provider: 'azure' as const,
      models: ['gpt-35-turbo'],
      maxTokens: 2000,
    },
    storage: {
      provider: 'azure' as const,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'],
    },
  },
  
  // On-premises deployment
  onpremises: {
    apiBaseUrl: 'https://docs.company.local/api',
    features: {
      enableVoiceCapture: true,
      enableScreenCapture: true,
      enableFileMonitoring: true,
      enableBrowserExtension: true,
      enableMobileApp: false,
    },
    integrations: {
      sharepoint: true,
      teams: true,
      slack: false,
      email: true,
    },
    ai: {
      provider: 'local' as const,
      models: ['llama2', 'codellama'],
      maxTokens: 4000,
    },
    storage: {
      provider: 'local' as const,
      maxFileSize: 2048 * 1024 * 1024, // 2GB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav', 'm4a', 'xlsx', 'pptx'],
    },
  },
};

// Auto-detect deployment type based on hostname or environment variables
export const getDeploymentType = (): keyof typeof deploymentConfigs => {
  const hostname = window.location.hostname;
  const deploymentType = getEnvVar('VITE_DEPLOYMENT_TYPE', '');
  
  if (deploymentType) {
    return deploymentType as keyof typeof deploymentConfigs;
  }
  
  if (hostname.includes('sharepoint.com') || hostname.includes('.sharepoint.')) {
    return 'sharepoint';
  }
  
  if (hostname.includes('azurewebsites.net') || hostname.includes('azure.')) {
    return 'azure';
  }
  
  if (hostname.includes('.local') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return 'onpremises';
  }
  
  return 'digitalocean';
};

// Get the active configuration based on deployment type
export const getActiveConfig = (): AppConfig => {
  const deploymentType = getDeploymentType();
  const deploymentConfig = deploymentConfigs[deploymentType];
  
  // Merge deployment config with base config
  return {
    ...config,
    ...deploymentConfig,
    environment: config.environment,
  };
};

// Industry-specific configurations
export const industryConfigs = {
  legal: {
    documentTypes: [
      'Client Call Summary',
      'Contract Review Notes',
      'Case Strategy Document',
      'Deposition Summary',
      'Legal Research Notes',
      'Court Filing Summary',
      'Client Meeting Minutes',
      'Discovery Review',
      'Settlement Agreement Summary',
      'Compliance Report',
    ],
    complianceFrameworks: ['Attorney-Client Privilege', 'GDPR', 'CCPA', 'SOC 2'],
    requiredFields: ['client', 'matter', 'attorney', 'confidentiality'],
    dataRetentionYears: 7,
  },
  
  insurance: {
    documentTypes: [
      'Claim Investigation Report',
      'Policy Review Summary',
      'Adjuster Call Notes',
      'Medical Review Summary',
      'Fraud Investigation Report',
      'Settlement Negotiation Notes',
      'Underwriting Decision',
      'Risk Assessment Report',
      'Customer Service Call Summary',
      'Regulatory Compliance Report',
    ],
    complianceFrameworks: ['HIPAA', 'SOX', 'GDPR', 'SOC 2'],
    requiredFields: ['claimNumber', 'policyNumber', 'adjuster', 'claimant'],
    dataRetentionYears: 7,
  },
  
  development: {
    documentTypes: [
      'Code Review Summary',
      'Sprint Planning Notes',
      'Technical Design Document',
      'Bug Investigation Report',
      'Architecture Decision Record',
      'API Documentation',
      'Deployment Notes',
      'Performance Analysis',
      'Security Review Report',
      'User Story Analysis',
    ],
    complianceFrameworks: ['SOC 2', 'ISO 27001', 'GDPR'],
    requiredFields: ['project', 'repository', 'developer', 'version'],
    dataRetentionYears: 3,
  },
  
  general: {
    documentTypes: [
      'Meeting Minutes',
      'Project Status Report',
      'Client Communication',
      'Process Documentation',
      'Training Notes',
      'Decision Record',
      'Status Update',
      'Analysis Report',
      'Planning Document',
      'Review Summary',
    ],
    complianceFrameworks: ['GDPR', 'SOC 2'],
    requiredFields: ['department', 'owner', 'date'],
    dataRetentionYears: 3,
  },
};

// Get industry configuration
export const getIndustryConfig = (industry: keyof typeof industryConfigs) => {
  return industryConfigs[industry] || industryConfigs.general;
};

// API endpoints configuration
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  
  users: {
    list: '/users',
    create: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    roles: (id: string) => `/users/${id}/roles`,
    settings: (id: string) => `/users/${id}/settings`,
  },
  
  tenants: {
    list: '/tenants',
    create: '/tenants',
    get: (id: string) => `/tenants/${id}`,
    update: (id: string) => `/tenants/${id}`,
    delete: (id: string) => `/tenants/${id}`,
    modules: (id: string) => `/tenants/${id}/modules`,
    settings: (id: string) => `/tenants/${id}/settings`,
    billing: (id: string) => `/tenants/${id}/billing`,
  },
  
  documents: {
    list: '/documents',
    create: '/documents',
    get: (id: string) => `/documents/${id}`,
    update: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
    versions: (id: string) => `/documents/${id}/versions`,
    share: (id: string) => `/documents/${id}/share`,
    permissions: (id: string) => `/documents/${id}/permissions`,
    attachments: (id: string) => `/documents/${id}/attachments`,
    export: (id: string) => `/documents/${id}/export`,
    search: '/documents/search',
  },
  
  agents: {
    list: '/agents',
    get: (id: string) => `/agents/${id}`,
    process: '/agents/process',
    templates: (id: string) => `/agents/${id}/templates`,
    configure: (id: string) => `/agents/${id}/configure`,
  },
  
  modules: {
    list: '/modules',
    get: (name: string) => `/modules/${name}`,
    configure: (name: string) => `/modules/${name}/configure`,
    enable: (name: string) => `/modules/${name}/enable`,
    disable: (name: string) => `/modules/${name}/disable`,
  },
  
  files: {
    upload: '/files/upload',
    download: (id: string) => `/files/${id}/download`,
    delete: (id: string) => `/files/${id}`,
    metadata: (id: string) => `/files/${id}/metadata`,
  },
  
  analytics: {
    dashboard: '/analytics/dashboard',
    usage: '/analytics/usage',
    performance: '/analytics/performance',
    compliance: '/analytics/compliance',
  },
  
  integrations: {
    sharepoint: {
      sites: '/integrations/sharepoint/sites',
      authenticate: '/integrations/sharepoint/auth',
      sync: '/integrations/sharepoint/sync',
    },
    teams: {
      authenticate: '/integrations/teams/auth',
      channels: '/integrations/teams/channels',
      messages: '/integrations/teams/messages',
    },
    slack: {
      authenticate: '/integrations/slack/auth',
      channels: '/integrations/slack/channels',
      messages: '/integrations/slack/messages',
    },
    email: {
      configure: '/integrations/email/configure',
      sync: '/integrations/email/sync',
    },
  },
};

// WebSocket configuration
export const wsConfig = {
  url: config.apiBaseUrl.replace('/api', '/hub'),
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  timeout: 30000,
};

// Development tools configuration
export const devConfig = {
  showDevTools: config.environment === 'development',
  enableMocking: getEnvBool('VITE_ENABLE_MOCKING', false),
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'info'),
  enablePerformanceMonitoring: getEnvBool('VITE_ENABLE_PERFORMANCE_MONITORING', true),
};

// Export the active configuration as default
export default getActiveConfig();