// Core entity types matching backend models
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  tenantId?: string;
  tenant?: Tenant;
  profile: UserProfile;
  settings: UserSettings;
  userRoles: UserRole[];
}

export interface UserProfile {
  jobTitle?: string;
  department?: string;
  industry?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  timeZone?: string;
  language?: string;
  customFields: Record<string, unknown>;
}

export interface UserSettings {
  // AI preferences
  enableAIAssistance: boolean;
  enableAutoDocumentation: boolean;
  enableVoiceCapture: boolean;
  enableScreenCapture: boolean;
  enableFileMonitoring: boolean;
  
  // Privacy settings
  privacyLevel: PrivacyLevel;
  allowDataRetention: boolean;
  dataRetentionDays: number;
  
  // Notification preferences
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSlackNotifications: boolean;
  enableTeamsNotifications: boolean;
  
  // UI preferences
  theme: 'light' | 'dark' | 'system';
  defaultDocumentType: string;
  favoriteAgents: string[];
  
  // Integration settings
  moduleSettings: Record<string, ModuleSettings>;
  customSettings: Record<string, unknown>;
}

export enum PrivacyLevel {
  Minimal = 'Minimal',
  Standard = 'Standard',
  Enhanced = 'Enhanced'
}

export interface ModuleSettings {
  enabled: boolean;
  configuration: Record<string, unknown>;
  lastConfiguredAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  status: TenantStatus;
  tier: TenantTier;
  createdAt: string;
  updatedAt: string;
  billing: TenantBilling;
  configuration: TenantConfiguration;
  quotas: TenantQuotas;
  branding: TenantBranding;
  modules: TenantModule[];
}

export enum TenantStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Inactive = 'Inactive',
  Trial = 'Trial',
  PendingActivation = 'PendingActivation',
  Archived = 'Archived'
}

export enum TenantTier {
  Trial = 'Trial',
  Starter = 'Starter',
  Standard = 'Standard',
  Professional = 'Professional',
  Enterprise = 'Enterprise',
  Custom = 'Custom'
}

export interface TenantBilling {
  subscriptionId?: string;
  planId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  nextBillingDate?: string;
  monthlyRate: number;
  currency: string;
  isTrialActive: boolean;
  trialEndDate?: string;
  paymentStatus: PaymentStatus;
  documentsCreatedThisMonth: number;
  apiCallsThisMonth: number;
  storageUsedBytes: number;
  billingMetadata: Record<string, unknown>;
}

export enum PaymentStatus {
  Current = 'Current',
  PastDue = 'PastDue',
  Canceled = 'Canceled',
  Suspended = 'Suspended',
  Failed = 'Failed'
}

export interface TenantConfiguration {
  // Security settings
  requireMFA: boolean;
  requireSSO: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  
  // Data retention policies
  documentRetentionDays: number;
  auditLogRetentionDays: number;
  enableDataExport: boolean;
  
  // AI and automation settings
  enableAIFeatures: boolean;
  enableAutoDocumentation: boolean;
  enableVoiceCapture: boolean;
  enableScreenCapture: boolean;
  
  // Integration settings
  enabledIntegrations: Record<string, boolean>;
  
  // Compliance settings
  complianceFrameworks: string[];
  enableAuditLogging: boolean;
  enableDataEncryption: boolean;
  
  // Regional settings
  defaultTimeZone: string;
  defaultLanguage: string;
  
  customSettings: Record<string, unknown>;
}

export interface TenantQuotas {
  maxStorageBytes: number;
  usedStorageBytes: number;
  maxUsers: number;
  activeUsers: number;
  maxDocumentsPerMonth: number;
  documentsCreatedThisMonth: number;
  maxAPICallsPerMonth: number;
  apiCallsThisMonth: number;
  maxAIProcessingMinutesPerMonth: number;
  aiProcessingMinutesUsedThisMonth: number;
  moduleQuotas: Record<string, number>;
  quotaResetDate: string;
}

export interface TenantBranding {
  companyName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  customCSS?: string;
  hidePlatformBranding: boolean;
  customDomain: boolean;
  customDomainName?: string;
  customLabels: Record<string, string>;
}

export interface TenantModule {
  id: string;
  tenantId: string;
  moduleName: string;
  isEnabled: boolean;
  enabledAt: string;
  enabledBy: string;
  configuration: Record<string, unknown>;
  additionalCost?: number;
  expiresAt?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  documentType: string;
  industry: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: User;
  tenantId?: string;
  tenant?: Tenant;
  metadata: DocumentMetadata;
  version: number;
  parentDocumentId?: string;
  parentDocument?: Document;
  childDocuments: Document[];
  aiMetadata?: AIMetadata;
  tags: DocumentTag[];
  attachments: DocumentAttachment[];
  permissions: DocumentPermission[];
  auditEntries: DocumentAuditEntry[];
}

export enum DocumentStatus {
  Draft = 'Draft',
  InReview = 'InReview',
  Approved = 'Approved',
  Published = 'Published',
  Archived = 'Archived',
  Deleted = 'Deleted'
}

export interface DocumentMetadata {
  properties: Record<string, unknown>;
  sourceModule?: string;
  sourceAgent?: string;
  sourceCaptureTime?: string;
  sourceLocation?: string;
  keywords: string[];
  summary?: string;
  wordCount: number;
  language?: string;
}

export interface AIMetadata {
  modelUsed?: string;
  confidenceScore: number;
  processedAt: string;
  processingResults: Record<string, unknown>;
  promptUsed?: string;
  suggestedTags: string[];
  autoGeneratedSummary?: string;
}

export interface DocumentTag {
  id: string;
  documentId: string;
  name: string;
  category: string;
  isSystemGenerated: boolean;
  confidence: number;
}

export interface DocumentAttachment {
  id: string;
  documentId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  type: AttachmentType;
}

export enum AttachmentType {
  File = 'File',
  Audio = 'Audio',
  Video = 'Video',
  Image = 'Image',
  Screenshot = 'Screenshot',
  SourceCode = 'SourceCode',
  Email = 'Email',
  Chat = 'Chat'
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId?: string;
  user?: User;
  roleId?: string;
  role?: Role;
  permission: PermissionType;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export enum PermissionType {
  Read = 'Read',
  Write = 'Write',
  Comment = 'Comment',
  Share = 'Share',
  Delete = 'Delete',
  Admin = 'Admin'
}

export interface DocumentAuditEntry {
  id: string;
  documentId: string;
  action: string;
  timestamp: string;
  userId: string;
  user?: User;
  details?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  tenantId?: string;
  tenant?: Tenant;
  rolePermissions: RolePermission[];
  userRoles: UserRole[];
  documentPermissions: DocumentPermission[];
}

export interface RolePermission {
  id: string;
  roleId: string;
  permission: string;
  resource?: string;
  isGranted: boolean;
}

export interface UserRole {
  id: string;
  userId: string;
  user?: User;
  roleId: string;
  role?: Role;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    pageSize?: number;
    totalPages?: number;
    totalItems?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

// Form types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantName?: string;
  industry?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  documentType: string;
  industry: string;
  tags?: string[];
  metadata?: Partial<DocumentMetadata>;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  documentType?: string;
  status?: DocumentStatus;
  tags?: string[];
  metadata?: Partial<DocumentMetadata>;
}

export interface DocumentFilter {
  search?: string;
  documentType?: string;
  industry?: string;
  status?: DocumentStatus;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Module system types
export interface Module {
  id: string;
  name: string;
  version: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  dependencies: string[];
  isEnabled: boolean;
  configuration: Record<string, unknown>;
  component?: React.ComponentType<ModuleComponentProps>;
}

export interface ModuleConfig {
  id: string;
  moduleId: string;
  tenantId?: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformModule {
  name: string;
  version: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  dependencies: string[];
  isEnabled: boolean;
  configuration: Record<string, unknown>;
  component?: React.ComponentType<ModuleComponentProps>;
}

export interface ModuleComponentProps {
  module: PlatformModule;
  configuration: Record<string, unknown>;
  onConfigurationChange: (config: Record<string, unknown>) => void;
}

// Agent system types
export interface DocumentationAgent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  industry: string;
  capabilities: string[];
  icon: string;
  isEnabled: boolean;
  configuration: Record<string, unknown>;
  templates: AgentTemplate[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  documentType: string;
  template: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  required: boolean;
  description: string;
  defaultValue?: unknown;
  options?: string[];
}

export interface ProcessDocumentRequest {
  agentId: string;
  templateId?: string;
  input: DocumentInput;
  configuration?: Record<string, unknown>;
}

export interface DocumentInput {
  type: 'text' | 'audio' | 'video' | 'file' | 'screen' | 'meeting';
  content: string | File;
  metadata?: Record<string, unknown>;
  context?: {
    participants?: string[];
    location?: string;
    duration?: number;
    tags?: string[];
  };
}

export interface DocumentOutput {
  title: string;
  content: string;
  summary: string;
  documentType: string;
  confidence: number;
  suggestedTags: string[];
  metadata: DocumentMetadata;
  actionItems?: ActionItem[];
  keyPoints?: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

// UI State types
export interface AppState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  modules: PlatformModule[];
  agents: DocumentationAgent[];
  currentDocument: Document | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  isCreating: boolean;
  isEditing: boolean;
  filter: DocumentFilter;
  searchResults: Document[];
  recentDocuments: Document[];
}

export interface ModuleState {
  availableModules: PlatformModule[];
  enabledModules: PlatformModule[];
  moduleConfigurations: Record<string, Record<string, unknown>>;
  isConfiguring: boolean;
  configuringModule: string | null;
}

export interface AgentState {
  availableAgents: DocumentationAgent[];
  activeAgent: DocumentationAgent | null;
  isProcessing: boolean;
  processingProgress: number;
  lastProcessedDocument: DocumentOutput | null;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableVoiceCapture: boolean;
    enableScreenCapture: boolean;
    enableFileMonitoring: boolean;
    enableBrowserExtension: boolean;
    enableMobileApp: boolean;
  };
  integrations: {
    sharepoint: boolean;
    teams: boolean;
    slack: boolean;
    email: boolean;
  };
  ai: {
    provider: 'openai' | 'azure' | 'local';
    models: string[];
    maxTokens: number;
  };
  storage: {
    provider: 'azure' | 'aws' | 'digitalocean' | 'local';
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}