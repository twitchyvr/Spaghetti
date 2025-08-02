# INSTRUCTIONS.md - Project Context

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

## Key Documentation References

- **📋 Documentation Guide**: `docs/README.md` - Complete documentation navigation
- **📝 Documentation Standards**: `docs/DOCUMENTATION-STANDARDS.md` - Guidelines and standards
- **🗂️ Documentation Structure**: `docs/DOCUMENTATION-STRUCTURE.md` - Full documentation map
- **🎨 UI/UX Design**: `docs/ui-design-system.md` - Complete design system
- **🚀 Sprint Planning**: `docs/sprint-planning.md` - Sprint coordination framework
- **📊 Project State**: `project-status.yaml` - Real-time project status
- **⚙️ Development Guide**: `CLAUDE.md` - Development workflow and standards
- **📈 Change History**: `CHANGELOG.md` - Release notes and version history

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
**Status**: ✅ PRODUCTION HEALTHY - API Routing Successfully Configured

#### Critical Issues Resolved
1. **Backend API Deployment** ✅ RESOLVED
   - Fixed Program.cs compilation errors (duplicate else clauses)
   - Re-enabled database migrations with proper error handling
   - Updated JWT configuration structure in appsettings.DigitalOcean.json
   - Fixed DigitalOcean PostgreSQL connection string format

2. **API Routing Configuration** ✅ RESOLVED (Latest Fix)
   - Added explicit route paths for API services in `.do/app.yaml`
   - API endpoints now properly accessible at `/api/*`
   - Health checks available at `/health`
   - Swagger documentation at `/swagger`
   - Frontend continues to serve all other routes

#### Production Deployment Status
- **Frontend**: ✅ Operational (158ms load time)
- **Backend API**: ✅ Deployed and routing correctly
- **Health Checks**: ✅ 100% success rate
- **SSL Certificate**: ✅ Valid until September 6, 2025
- **Performance**: ✅ <200ms API response times

#### Technical Architecture Status
- **Multi-tenant isolation**: ✅ Implemented
- **Authentication system**: ✅ JWT with proper security
- **Database operations**: ✅ PostgreSQL with migrations
- **Build pipeline**: ✅ Automated deployment on git push

### Current Focus Areas
The platform has completed Sprint 6 with advanced collaboration features and is now focused on:
- API service reliability and proper routing
- Real-time collaborative editing enhancement
- Workflow automation expansion
- Enterprise-grade security hardening
- Performance optimization

For current sprint status and agent assignments, refer to `project-status.yaml`.