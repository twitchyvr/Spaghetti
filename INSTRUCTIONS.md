# INSTRUCTIONS.md - Project Context & Coordination

**Version**: 0.0.17-alpha
**Status**: ✅ Sprint 6 Complete - Pantry Design System Integration & Production Deployment Ready

## ❗ CRITICAL UPDATE: Project Source of Truth

**All project stakeholders and agents MUST read this.**

To resolve inconsistencies and establish a definitive guide for all development, this project now uses a master YAML configuration file as its **single source of truth**.

### **Primary Reference: `project-architecture.yaml`**

This file, located in the root directory, contains the complete, up-to-date configuration for every aspect of the Spaghetti Platform, including:

- **Project Vision & Status**
- **Technology Stack & Architecture**
- **UI/UX Design System (The Pantry)**
- **Development Workflows & Quality Gates**
- **Security & Compliance Standards**
- **Active Sprint Goals & Lifecycle**

**Before starting any task, consult `project-architecture.yaml` first.**

### AI Agent Instructions

- **Developer Agents (Claude, Gemini, etc.)**: Your detailed operational instructions for implementing features based on the master YAML file are located in **`CLAUDE.md`** and **`GEMINI.md`**. You MUST adhere to the workflow defined in those files.
- **Orchestrator Agents**: You are to use `project-architecture.yaml` to generate context and instructions for all other agents.

### Team Coordination

Refer to the `teamAndRoles` and `sprintLifecycle` sections within `project-architecture.yaml` for current team assignments and sprint objectives. The `docs/` directory contains detailed supplementary documentation, but **`project-architecture.yaml` is the authoritative source in case of any conflict.**

## Project Overview

**Spaghetti Platform** - Enterprise Documentation Platform targeting legal professionals with expansion planned for insurance, consulting, and other domains. Production-ready multi-tenant platform designed for various hosting environments.

- **Live URL**: <https://spaghetti-platform-drgev.ondigitalocean.app/>
- **Repository**: Production-ready enterprise documentation system
- **Technology**: .NET Core 8 backend, React 18 TypeScript frontend
  - NOTE: Use the installed `shot-scraper` python command line tool (Documentation is at <https://shot-scraper.datasette.io/en/stable/>) to capture screenshots of the deployed platform when needed. You *MUST* use `--wait 5000` to ensure the page is fully loaded before capturing.


## Team of Agents (9-Phase Workflow)

1. team-p1-project-initializer
2. team-p2-architecture-coordinator  
3. team-p3-sprint-planner
4. team-p4-development-coordinator
5. team-p5-test-strategy-architect
6. team-p6-deployment-orchestrator
7. team-p7-sprint-retrospective-facilitator
8. team-p8-system-maintenance-coordinator
9. team-p9-workflow-termination-coordinator

## Supporting Agents

- project-manager
- system-architect
- backend-lead
- frontend-lead
- devops-lead
- qa-lead
- scrum-master
- developer
- ui-designer
- qa-engineer
- gitops-orchestrator
- team-orchestrator

## Project Context & Mission

### Core Product Identity
This is the **Spaghetti Platform** - a comprehensive enterprise documentation system that uses food-themed terminology throughout:

- **Noodles**: Individual documents
- **Plates**: Document collections
- **The Kitchen**: Admin interface
- **Al Dente Editor**: Rich text editing component
- **Chefs/Sous Chefs**: Admin roles
- **Diners**: End users
- **Stewards**: Content managers

### Target Users & Personas
See `/docs/ui-design-system.md` for detailed persona definitions including:
- Stella (Strategic Chef - Enterprise Admin)
- Carlos (Compliance Connoisseur)
- Tariq (Technical Writer Steward)
- Priya (Product Manager Steward)
- David (Developer Diner/Steward)
- Lauren (Learner Diner)

## 🎉 Recent Major Updates (August 2025)

### Pantry Design System Integration Complete

**Status**: ✅ Production Ready - Zero TypeScript Errors - Build Time: 5.14s

The platform has undergone a comprehensive design system overhaul with the following achievements:

#### **Enhanced Component Architecture**
- **Organized Structure**: Components now organized in logical directories (data/, feedback/, forms/, navigation/)
- **Advanced Button Component**: Supports icon, iconPosition, loading, fullWidth props with twMerge integration
- **Enhanced Badge System**: Added destructive and outline variants for comprehensive status representation
- **Professional Tooltip System**: Enhanced with title, description, status, and position support
- **Modern Tabs Integration**: Radix UI-based tabs component with proper accessibility

#### **Developer Experience Improvements**
- **Full TypeScript Compatibility**: Zero compilation errors across all components
- **Backward Compatibility Layer**: Complete UI compatibility layer ensures zero breaking changes
- **Enhanced Build Performance**: 5.14s build time with optimized bundle sizes
- **Class Composition**: Advanced CSS class merging with clsx and tailwind-merge

#### **Production Deployment Status**
- **Build Status**: ✅ Successful - All TypeScript compilation passes
- **Component Coverage**: 100% component compatibility maintained
- **Performance**: Optimized bundle sizes with tree-shaking
- **Accessibility**: Enhanced with Radix UI primitives

#### **GitOps Implementation**
- **8 Atomic Commits**: Professional commit history with conventional commit messages
- **Component Documentation**: Each commit includes detailed change descriptions
- **Deployment Ready**: All changes staged for production deployment

The platform is now ready for immediate production deployment with enhanced user experience, 
improved developer productivity, and enterprise-grade component architecture.

## Documentation Structure

Our documentation follows a three-tier system to ensure clarity for all agents and team members:

1.  **Tier 1: Living Core**: The essential, always-current files in the root directory. This is the default context for all operations. This includes:
    *   `project-architecture.yaml` (The Source of Truth)
    *   `README.md` (Project Overview)
    *   **Agent Definitions** (e.g., `backend-lead.md`, `documentation-strategist.md`, etc.)
    *   `INSTRUCTIONS.md` (This File) and `CLAUDE.md`/`GEMINI.md` (AI Manuals)

2.  **Tier 2: Working Sprint**: Documents related to the *current* sprint are located directly in `docs/`. These provide immediate context for ongoing work.

3.  **Tier 3: The Archive**: All historical documents from past sprints are preserved in `docs/archive/sprint-X/`. **This archive should only be referenced when historical context is explicitly requested.**

## Technical Architecture

### Backend (.NET Core 8)
- ASP.NET Core Web API with Swagger/OpenAPI
- PostgreSQL with Entity Framework Core
- Redis for caching and session management
- Elasticsearch for search and indexing
- JWT authentication with Azure AD/Auth0 SSO
- Repository Pattern with Unit of Work

### Frontend (React 18 + TypeScript)
- Vite build system (~966ms build time)
- Tailwind CSS for styling
- Context API for state management
- Professional dashboard with responsive design
- Component-based architecture ("The Pantry")

### UI Architecture: The Pantry Design System
- **Component Organization**: Modern pantry/ directory structure with categorized components
- **Layout System**: Microsoft-inspired clean design with fixed sidebar and responsive header
- **Component Variants**: Using class-variance-authority (cva) for type-safe component variations
- **Modern Components**: Simplified Card (CardHeader, CardContent, CardTitle) and Button architecture
- **Theme**: Light, professional theme replacing previous dark UI with improved accessibility
- **Navigation**: Centralized NavigationItems component with UserProfile integration
- **Responsive Design**: Mobile-first approach with collapsible sidebar and adaptive layouts

### Infrastructure
- Docker containerization
- Docker Compose for development
- Kubernetes for production
- Nginx reverse proxy
- Grafana + Prometheus monitoring

## Development Standards

### Code Quality
- TypeScript compilation must pass without errors
- >90% test coverage required
- <2s build times maintained
- Repository pattern implementation
- Clean architecture principles

### Version Control
- Conventional commit messages required
- Feature branches for development
- Atomic commits with documentation updates
- Git commit and push triggers DigitalOcean deployment

### Performance Requirements
- <2s initial page load
- <500ms navigation transitions
- <100ms API response times
- <300ms search query responses

### Security & Compliance
- Multi-tenant row-level security
- GDPR, SOC 2, HIPAA compliance ready
- AES-256 encryption
- Comprehensive audit trails

## Development Workflow

1. **Planning**: Use project-status.yaml for current state tracking
2. **Implementation**: Follow established patterns and conventions
3. **Testing**: Local testing required before commits
4. **Documentation**: Update relevant docs with changes
5. **Deployment**: Automated via git push to DigitalOcean

## Three-Tier Documentation Architecture

### TIER 1: Living Core (Root Directory) - Always Current
- **🏗️ Project Architecture**: `project-architecture.yaml` - **SINGLE SOURCE OF TRUTH**
- **📋 Project Instructions**: `INSTRUCTIONS.md` - This file - Project context and agent coordination
- **⚙️ Development Guide**: `CLAUDE.md` & `GEMINI.md` - Development standards and AI operational manual
- **📖 Project Overview**: `README.md` - Comprehensive project front door
- **📈 Change History**: `CHANGELOG.md` - Release notes and version history

### TIER 2: Working Sprint (`docs/` directory) - Current Sprint Only
- **📝 Documentation Standards**: Current documentation guidelines and maintenance procedures
- **🎨 UI Design System**: Active design specifications and component library  
- **🚀 Sprint Planning**: Current sprint coordination framework
- **📊 Active Release Notes**: Current release information and changes

### TIER 3: Archive (`docs/archive/` directory) - Historical Context
- **Sprint Archives**: Organized by sprint number for historical reference
- **General Archive**: Historical documentation and obsolete specifications
- **Access Pattern**: Only when explicitly requested for historical context

## Success Metrics

### Technical Performance
- Build times <2 seconds
- Test coverage >90%
- API response <100ms
- 99.9% uptime

### Business Impact
- >95% task completion rate
- <30s document creation time
- >4.5/5 user satisfaction
- >80% feature adoption within 30 days

## Critical UI/UX Overhaul Required - Design System Specifications

### 🚨 IMMEDIATE ACTION REQUIRED: Complete UI Redesign

Based on critical audit findings, the current UI has fundamental issues requiring immediate attention:

**CRITICAL ISSUES IDENTIFIED:**
- Navigation sidebar doesn't scroll (content hidden/inaccessible)
- Poor responsive design (users need 33% zoom to see content properly)
- No standardized component library
- Mixed styling approaches causing maintenance issues
- Not scalable or modular for enterprise use

### 📋 COMPREHENSIVE DESIGN SYSTEM OVERHAUL

#### 1. **Design System Architecture**

**Modern Component Library Structure:**
- **Framework**: React 18 + TypeScript + Tailwind CSS (eliminate mixed styling)
- **Component Library Name**: "The Pantry" (maintain existing branding)
- **Architecture Pattern**: Atomic Design with compound components
- **Styling Approach**: Pure Tailwind CSS utility classes (eliminate custom CSS mixing)

**Design Token System:**
```typescript
// Design Tokens - /src/design-tokens/index.ts
export const tokens = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px  
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  colors: {
    brand: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
  }
}
```

#### 2. **Layout System Redesign - CRITICAL FIX**

**FIXED SIDEBAR ARCHITECTURE:**
```typescript
// /src/components/layout/AppLayout.tsx - CORRECTED VERSION
const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* FIXED SIDEBAR - Proper Scrolling */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <Logo />
        </div>
        
        {/* SCROLLABLE NAVIGATION - KEY FIX */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
          <NavigationItems />
        </nav>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          <UserProfile />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Responsive Breakpoint Strategy:**
- **Mobile First**: 320px base
- **Tablet**: 768px (sidebar becomes overlay)  
- **Desktop**: 1024px (sidebar persistent)
- **Large Desktop**: 1440px+ (expanded content area)

#### 3. **Component Library Specifications - "The Pantry"**

**Core Navigation Components:**

```typescript
// /src/components/pantry/navigation/Sidebar.tsx
interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isCollapsed?: boolean
  variant?: 'default' | 'compact'
}

const Sidebar = ({ isOpen, onToggle, isCollapsed = false, variant = 'default' }: SidebarProps) => {
  const baseClasses = "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out"
  const widthClasses = isCollapsed ? "w-16" : "w-80"
  const transformClasses = isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
  
  return (
    <aside className={cn(baseClasses, widthClasses, transformClasses)}>
      <SidebarHeader collapsed={isCollapsed} />
      <SidebarNav collapsed={isCollapsed} />
      <SidebarFooter collapsed={isCollapsed} />
    </aside>
  )
}

// /src/components/pantry/navigation/SidebarNav.tsx  
const SidebarNav = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <SidebarNavItem 
            key={item.id} 
            item={item} 
            collapsed={collapsed}
          />
        ))}
      </div>
    </nav>
  )
}
```

**Modular Component Patterns:**

```typescript
// /src/components/pantry/forms/FormField.tsx
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  variant?: 'default' | 'floating' | 'inline'
}

// /src/components/pantry/data/DataTable.tsx  
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilteringConfig
  variant?: 'default' | 'compact' | 'cards'
}

// /src/components/pantry/feedback/Alert.tsx
interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error'
  title?: string
  action?: AlertAction
  dismissible?: boolean
  children: React.ReactNode
}
```

#### 4. **Accessibility Standards (WCAG 2.1 AA)**

**Mandatory Requirements:**
- **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **Keyboard Navigation**: Full tab sequence, arrow key navigation for menus
- **Screen Reader**: Semantic HTML, ARIA labels, live regions for dynamic content
- **Focus Management**: Visible focus indicators, focus trapping in modals
- **Text Scaling**: Support up to 200% zoom without horizontal scrolling

**Implementation Standards:**
```typescript
// Accessibility-first component design
const Button = ({ variant, size, disabled, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variant styles
        variants[variant],
        sizes[size]
      )}
      disabled={disabled}
      {...props}  // Includes aria-* attributes
    >
      {children}
    </button>
  )
}
```

#### 5. **Navigation Architecture - Complete Solution**

**Mobile Navigation Drawer:**
```typescript
// /src/components/pantry/navigation/MobileNav.tsx
const MobileNavDrawer = ({ isOpen, onClose }: MobileNavProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <MobileNavHeader onClose={onClose} />
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <MobileNavItems />
          </div>
          <MobileNavFooter />
        </div>
      </div>
    </>
  )
}
```

**Search & Favorites Integration:**
```typescript
// /src/components/pantry/navigation/NavSearch.tsx
const NavigationSearch = ({ collapsed }: { collapsed: boolean }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NavItem[]>([])
  
  return (
    <div className={cn("px-4 py-3", collapsed && "px-2")}>
      {!collapsed ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search navigation..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      ) : (
        <button className="w-full p-2 hover:bg-gray-100 rounded-lg">
          <Search className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
      )}
    </div>
  )
}
```

#### 6. **Enterprise Requirements**

**Multi-Tenant Theming System:**
```typescript
// /src/themes/enterprise.ts
interface EnterpriseThemeConfig {
  tenant: {
    id: string
    name: string
    domain: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    logoUrl: string
    faviconUrl: string
    customFonts?: FontConfig[]
  }
  layout: {
    sidebarStyle: 'default' | 'compact' | 'minimal'
    headerHeight: number
    sidebarWidth: number
    borderRadius: 'none' | 'small' | 'medium' | 'large'
  }
  features: {
    darkMode: boolean
    compactMode: boolean
    customCSS?: string
    advancedSearch: boolean
  }
}

// Theme application with validation
const applyEnterpriseTheme = (config: EnterpriseThemeConfig) => {
  // Validate theme colors for accessibility
  validateColorContrast(config.branding)
  
  // Apply CSS custom properties
  const root = document.documentElement
  root.style.setProperty('--color-primary', config.branding.primaryColor)
  root.style.setProperty('--color-secondary', config.branding.secondaryColor)
  root.style.setProperty('--sidebar-width', `${config.layout.sidebarWidth}px`)
  
  // Load custom fonts
  if (config.branding.customFonts) {
    loadCustomFonts(config.branding.customFonts)
  }
  
  // Apply layout modifications
  document.body.className = cn(
    document.body.className,
    `theme-${config.tenant.id}`,
    `layout-${config.layout.sidebarStyle}`
  )
}
```

**Configuration Management:**
```typescript
// /src/config/theme-manager.ts
class EnterpriseThemeManager {
  private themes: Map<string, EnterpriseThemeConfig> = new Map()
  
  async loadTenantTheme(tenantId: string): Promise<void> {
    const config = await fetchTenantTheme(tenantId)
    this.themes.set(tenantId, config)
    applyEnterpriseTheme(config)
  }
  
  getAvailableThemes(tenantId: string): ThemeVariant[] {
    const config = this.themes.get(tenantId)
    return config?.availableVariants || ['light', 'dark']
  }
  
  validateThemeCompliance(config: EnterpriseThemeConfig): ValidationResult {
    return {
      accessibility: validateAccessibility(config),
      performance: validatePerformance(config),
      branding: validateBranding(config)
    }
  }
}
```

**Performance & Scalability:**
- **Initial Load**: <2 seconds (including theme loading)
- **Component Render**: <100ms average
- **Navigation Transitions**: <300ms
- **Theme Switching**: <500ms
- **Bundle Size**: <500KB (gzipped, excluding tenant themes)
- **Memory Usage**: <50MB for component library
- **Concurrent Users**: Support 1000+ simultaneous theme loads

### 📋 IMPLEMENTATION PRIORITY (Sprint 7 Focus)

**Phase 1: Critical Fixes (Week 1)**
1. ✅ Fix sidebar scrolling issue completely
2. ✅ Implement proper responsive navigation
3. ✅ Standardize on Tailwind CSS only (eliminate mixed styling)
4. ✅ Add proper mobile navigation drawer

**Phase 2: Component Library (Week 2)**  
1. ✅ Build core Pantry components with TypeScript
2. ✅ Implement design token system
3. ✅ Add comprehensive accessibility features
4. ✅ Create component documentation

**Phase 3: Enterprise Features (Week 3-4)**
1. ✅ Multi-tenant theming system
2. ✅ Advanced responsive patterns
3. ✅ Performance optimization
4. ✅ Integration testing

### Current Status & Recent Updates

### Latest Deployment (August 3, 2025)
**Status**: 🚀 OPERATIONAL - Ready for UI Overhaul Implementation

#### Production Status
- **Frontend**: ✅ Operational (217ms load time) - Ready for UI updates
- **Backend API**: ✅ Fully operational with .NET Core backend
- **Health Checks**: ✅ All systems operational
- **SSL Certificate**: ✅ Valid until September 6, 2025
- **Overall Status**: ✅ STABLE - Ready for Sprint 7 UI overhaul

#### 7. **Error Handling & API Integration - CRITICAL FIXES**

Based on current console errors, implement robust error handling and API fallback mechanisms:

**API Error Management System:**
```typescript
// /src/services/api-error-handler.ts
class APIErrorHandler {
  private retryAttempts = 3
  private backoffDelay = 1000
  
  async handleAPICall<T>(
    apiCall: () => Promise<T>,
    fallbackData?: T,
    errorContext?: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await apiCall()
        // Check if result is HTML (indicates routing error)
        if (typeof result === 'string' && result.includes('<!DOCTYPE html>')) {
          throw new APIRoutingError('Received HTML instead of JSON')
        }
        return result
      } catch (error) {
        if (attempt === this.retryAttempts) {
          // Log error with context
          console.error(`API Error (${errorContext}):`, error)
          
          // Return fallback data if available
          if (fallbackData !== undefined) {
            console.warn(`Using fallback data for ${errorContext}`)
            return fallbackData
          }
          
          // Throw enhanced error
          throw new EnhancedAPIError(error, errorContext, attempt)
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.backoffDelay * attempt))
      }
    }
    
    throw new Error('Unreachable code')
  }
}
```

**Graceful Degradation Components:**
```typescript
// /src/components/pantry/feedback/ErrorFallback.tsx
interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  context?: string
  showRetry?: boolean
  fallbackContent?: React.ReactNode
}

const ErrorFallback = ({ 
  error, 
  resetError, 
  context = 'component',
  showRetry = true,
  fallbackContent 
}: ErrorFallbackProps) => {
  const isAPIError = error.message.includes('API') || error.message.includes('HTTP')
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {isAPIError ? 'Connection Issue' : 'Something went wrong'}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {isAPIError 
              ? 'Unable to connect to the server. Using cached data where available.'
              : `An error occurred in the ${context}.`
            }
          </p>
          
          {fallbackContent && (
            <div className="mt-4 p-3 bg-white rounded border border-red-200">
              {fallbackContent}
            </div>
          )}
          
          {showRetry && (
            <button
              onClick={resetError}
              className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Data Validation & Type Safety:**
```typescript
// /src/utils/data-validation.ts
export const validateAPIResponse = <T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  fallback: T
): T => {
  if (validator(data)) {
    return data
  }
  
  console.warn('Invalid API response, using fallback data:', data)
  return fallback
}

// Specific validators for common data types
export const isValidMetrics = (data: unknown): data is PlatformMetrics => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'totalUsers' in data &&
    'activeUsers' in data &&
    typeof (data as any).totalUsers === 'number'
  )
}

export const isValidClientArray = (data: unknown): data is Client[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'id' in item && 
    'name' in item
  )
}
```

#### 8. **Accessibility Implementation Guide**

**WCAG 2.1 AA Compliance Requirements:**
```typescript
// /src/utils/accessibility.ts
export const a11yProps = {
  // Form accessibility
  formField: (id: string, label: string, required?: boolean) => ({
    id,
    'aria-labelledby': `${id}-label`,
    'aria-required': required,
    'aria-invalid': false, // Update based on validation
  }),
  
  // Navigation accessibility
  navItem: (label: string, current?: boolean) => ({
    role: 'menuitem',
    'aria-label': label,
    'aria-current': current ? 'page' : undefined,
    tabIndex: current ? 0 : -1,
  }),
  
  // Interactive elements
  button: (label: string, pressed?: boolean) => ({
    'aria-label': label,
    'aria-pressed': pressed,
    type: 'button',
  }),
  
  // Data tables
  table: () => ({
    role: 'table',
    'aria-label': 'Data table',
  }),
  
  // Live regions for dynamic content
  liveRegion: (polite: boolean = true) => ({
    'aria-live': polite ? 'polite' : 'assertive',
    'aria-atomic': true,
  }),
}

// Color contrast validation
export const validateColorContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  // Implementation of WCAG color contrast algorithm
  const ratio = calculateContrastRatio(foreground, background)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}
```

**Keyboard Navigation System:**
```typescript
// /src/hooks/useKeyboardNavigation.ts
export const useKeyboardNavigation = (
  items: NavItem[],
  onSelect: (item: NavItem) => void
) => {
  const [focusedIndex, setFocusedIndex] = useState(0)
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(items[focusedIndex])
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }, [items, focusedIndex, onSelect])
  
  return { focusedIndex, handleKeyDown }
}
```

### 🚨 IMMEDIATE IMPLEMENTATION REQUIREMENTS

#### Critical Issues to Address First:

1. **API Routing Problems (HTTP 405 Errors)**
   - Backend API endpoints returning HTML instead of JSON
   - Method Not Allowed errors on POST requests
   - API service startup and routing configuration issues

2. **Frontend Error Handling**
   - Implement comprehensive error boundaries
   - Add fallback UI for failed API calls
   - Fix data validation errors (undefined properties, non-iterable arrays)

3. **Accessibility Compliance**
   - Add missing autocomplete attributes to form inputs
   - Implement proper ARIA labels and roles
   - Ensure keyboard navigation works throughout the application

4. **Navigation Scrolling Fix**
   - Implement proper overflow handling in sidebar
   - Add scrollable navigation container
   - Fix responsive mobile navigation

#### Development Priorities:

**Week 1: Foundation Fixes**
- Fix all API routing and backend connectivity issues
- Implement error handling and fallback mechanisms
- Add proper data validation and type safety
- Fix sidebar scrolling with overflow-y-auto implementation

**Week 2: Component Library**
- Build standardized Pantry components using Tailwind CSS only
- Implement design token system
- Add comprehensive accessibility features
- Create mobile-responsive navigation patterns

**Week 3: Enterprise Features**
- Multi-tenant theming system implementation
- Advanced responsive design patterns
- Performance optimization and bundle size reduction
- Integration testing and quality assurance

**Week 4: Polish & Documentation**
- Component documentation and usage examples
- Accessibility testing and compliance verification
- Performance benchmarking and optimization
- User experience testing and refinement

### Current Focus Areas
The platform is now focused on:
- **PRIORITY 1**: Fix API connectivity and routing issues (HTTP 405 errors)
- **PRIORITY 2**: Complete UI/UX overhaul with proper navigation scrolling
- **PRIORITY 3**: Implement comprehensive error handling and fallback mechanisms
- **PRIORITY 4**: Standardized component library ("The Pantry") with TypeScript + Tailwind
- **PRIORITY 5**: Accessibility compliance (WCAG 2.1 AA) and keyboard navigation
- **PRIORITY 6**: Multi-tenant theming system and enterprise responsive patterns

For current sprint status and agent assignments, refer to `project-architecture.yaml`.

