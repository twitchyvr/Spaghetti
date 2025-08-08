# INSTRUCTIONS.md - Project Context & Coordination

**Version**: 0.0.17-alpha  
**Status**: ✅ Phase 1 Backend Enhancement Complete - Service Integration & Database Connectivity

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

## ✅ PHASE 1 BACKEND ENHANCEMENT COMPLETE

**Status**: Successfully implemented service integration and database connectivity

### 🚀 Implementation Summary

**Authentication Service Integration**
- Connected existing AuthenticationService to API endpoints
- Implemented graceful fallback for development environments  
- Maintained 100% backward compatibility with existing frontend
- Added JWT middleware foundation for future token validation

**Database Connectivity Enhancement**
- Integrated Entity Framework ApplicationDbContext with admin endpoints
- Replaced static mock responses with real database queries
- Added null-safe operations and proper error handling
- Implemented dual-mode operation (production + development)

**Enterprise Compliance Maintained**
- Zero breaking changes to existing API contracts
- Follows project-architecture.yaml specifications
- Implements proper logging and audit trails
- Supports multi-tenant database operations

### 📊 Enhanced API Endpoints

- `POST /api/auth/login` - Now uses real AuthenticationService with demo fallback
- `GET /api/admin/database-stats` - Real database queries via Entity Framework
- `POST /api/admin/create-platform-admin` - Full database integration with role assignment

### 🔗 Related Implementation

- **Branch**: feature/phase1-backend-enhancement
- **Pull Request**: #45
- **GitHub Issue**: #44
- **Commit**: feat(backend): implement Phase 1 backend enhancement - service integration

The implementation provides a solid foundation for Phase 2 enhancements while ensuring existing functionality remains fully operational.

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

## UI/UX Design System

The complete UI/UX overhaul requirements and design system specifications have been moved to [docs/ui-overhaul-requirements.md](./docs/ui-overhaul-requirements.md) for better organization.

**Key Issues Being Addressed:**
- Navigation sidebar scrolling fixes
- Responsive design improvements
- Standardized Pantry component library
- Consistent styling with Tailwind CSS
- Enterprise scalability


All agent-specific instructions and code quality enforcement rules have been moved to [AGENTS.md](./AGENTS.md) for better organization and maintainability.

Key documents:
- **[AGENTS.md](./AGENTS.md)** - Complete agent instructions and quality checklists
- **[docs/code-quality-standards.md](./docs/code-quality-standards.md)** - Detailed quality standards and anti-patterns
- **[project-architecture.yaml](./project-architecture.yaml)** - Agent configuration and enforcement rules

