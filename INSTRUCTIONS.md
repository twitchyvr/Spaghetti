# INSTRUCTIONS.md - Project Context & Coordination

**Version**: 0.0.16-alpha
**Status**: 🚀 Sprint 6 Active - Source of Truth Migrated to YAML

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

- **Live URL**: https://spaghetti-platform-drgev.ondigitalocean.app/
- **Repository**: Production-ready enterprise documentation system
- **Technology**: .NET Core 8 backend, React 18 TypeScript frontend

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
- **⚙️ Development Guide**: `CLAUDE.md` - Development standards and AI operational manual
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

## Current Status & Recent Updates

### Latest Deployment (August 2, 2025)
**Status**: ⚠️ DEGRADED - API Service Startup Issues Identified

#### Recently Applied Backend Fixes
1. **Backend API Compilation** ✅ RESOLVED
   - Fixed missing domain interface type definitions
   - Updated DigitalOcean configuration to use Production environment
   - Fixed build command in app.yaml for correct .NET project path
   - Enhanced database connection handling with proper error logging
   - Resolved compilation issues with ambiguous references

2. **Deployment Configuration** ✅ APPLIED
   - Global routing configuration correctly set in `.do/app.yaml`
   - API endpoints properly mapped to `/api/*`, `/health`, `/swagger`, `/hubs`
   - Build commands updated for correct project paths
   - Environment variables configured for Production deployment

#### Current Production Status
- **Frontend**: ✅ Operational (217ms load time)
- **Backend API**: 🔧 DEPLOYMENT IN PROGRESS - Updated to full .NET Core backend
- **Health Checks**: 🔧 PENDING - Awaiting deployment of full API service
- **SSL Certificate**: ✅ Valid until September 6, 2025
- **Overall Status**: 🔧 DEPLOYMENT UPDATES APPLIED - Ready for testing

#### Technical Architecture Status
- **Multi-tenant isolation**: ✅ Implemented
- **Authentication system**: ✅ JWT with proper security
- **Database operations**: ✅ PostgreSQL with migrations
- **Build pipeline**: ✅ Automated deployment on git push

#### Applied Emergency Fixes (August 3, 2025)
**DEPLOYMENT CONFIGURATION CORRECTED**
1. ✅ **API Service Updated**: Changed from test-api to full .NET Core backend (src/core/api)
2. ✅ **Build Configuration**: Added proper dotnet build/publish commands
3. ✅ **Environment Variables**: Added database and Redis connection strings
4. ✅ **Health Check Path**: Updated to /api/health (matches backend implementation)
5. ✅ **Missing Assets**: Added favicon-dark.svg and favicon-light.svg
6. ✅ **PWA Service Worker**: Removed duplicate registration to prevent conflicts
7. ✅ **Accessibility**: Added autocomplete attributes to password inputs

#### Root Cause Resolution
**IDENTIFIED**: Deployment was using simple test API instead of full .NET Core backend
**FIXED**: Updated `.do/app.yaml` to deploy comprehensive backend with monitoring endpoints

### Current Focus Areas
The platform has completed Sprint 6 with advanced collaboration features and is now focused on:
- **CRITICAL**: API service startup and routing resolution
- Real-time collaborative editing enhancement
- Workflow automation expansion
- Enterprise-grade security hardening
- Performance optimization

For current sprint status and agent assignments, refer to `project-status.yaml`.

