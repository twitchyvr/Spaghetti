# AI Development Guide: Adhering to the Single Source of Truth

##  Core Directive: Your Primary Source of Truth

Your primary responsibility is to generate code and documentation that **strictly adheres** to the specifications defined in the **`project-architecture.yaml`** file, located in the project root. This file is the definitive source of truth for the entire platform.

**ALWAYS consult this YAML file before generating any code or making any technical decisions.**

## Why This File Exists

The project previously faced challenges with UI/UX inconsistency, unpolished interfaces, and unclear API contracts. The `project-architecture.yaml` file was created to solve these problems by providing a clear, structured, and authoritative specification for all development. Your goal is to use it to build a polished, professional, and consistent enterprise-level application.

## Your Development Workflow

On every task you are assigned, you MUST follow this sequence:

1.  **Consult the YAML**: Before writing any code, locate the relevant sections in `project-architecture.yaml`.
    -   For **UI/UX tasks**, review the `designSystem` section. Pay close attention to `componentLibrary`, `principles`, and `terminology`.
    -   For **Backend/API tasks**, review the `technologyStack` and `architecture` sections.
    -   To understand the current context, review the active sprint under `sprintLifecycle`.

2.  **Verify & Ask for Clarification**: If a user request is ambiguous or contradicts the YAML, you MUST state the conflict and ask for clarification. Do NOT infer requirements that are not specified.

3.  **Implement to Specification**: Generate code that perfectly matches the specifications.
    -   Use the exact component names and purposes defined in `designSystem.componentLibrary`.
    -   Follow the styling philosophy and use the correct product vernacular (e.g., "Noodles", "The Kitchen").
    -   Ensure API endpoints and data structures match the defined architecture.

4.  **Adhere to Project Standards**: All generated code must follow the standards defined in the YAML under `developmentWorkflow` and `qualityAssurance`. This includes commit message formats, testing coverage, and performance targets.

5.  **Propose Architectural Changes**: If a user request requires a change to the established architecture (e.g., adding a new core component to the design system, changing a key technology), your primary output should be a **proposal to update `project-architecture.yaml`**. Do not implement the code until the architectural change is approved and merged into the source of truth.

## How to Use `project-architecture.yaml`

-   **To fix the "horrendous" UI**: Use the `designSystem` section as your guide. The `principles` should inform your design choices. The `componentLibrary` provides the building blocks. Generate beautiful, responsive, and accessible components that match the "Aesthetic Professionalism" principle.
-   **To clarify the API**: Use the `architecture.keyPatterns` and `technologyStack.backend` sections to understand how the API should be structured. All new endpoints should follow these established patterns.
-   **To build new features**: Look at the `sprintLifecycle` to find the current sprint's goals. Then, build the feature according to the `architecture` and `designSystem` specifications.

## Critical Rules of Engagement

-   **ALWAYS** use `project-architecture.yaml` as your primary reference.
-   **NEVER** invent new design patterns or components that are not defined in the `designSystem`. Propose them as an update to the YAML first.
-   **ALWAYS** write code that meets the `performanceMetrics` and `qualityAssurance` targets.
-   **NEVER** generate code that violates the `securityAndCompliance` standards.
-   **YOUR GOAL** is to translate the enterprise-level vision and architecture defined in the YAML into high-quality, production-ready code.

## 🚨 CRITICAL: UI/UX Protection Guidelines

### The "Simplification Trap" - Never Fall Into This

After a major UI transformation in Sprint 6, we identified a critical anti-pattern: **NEVER sacrifice functionality for aesthetics**. The following rules are non-negotiable:

#### Functionality-First Development
1. **ALWAYS** verify existing functionality before making UI changes
2. **NEVER** replace working navigation with placeholder code (`console.log`)
3. **ALWAYS** test complete user flows, not just individual components
4. **NEVER** commit non-functional code to main branch

#### Protected Components (DO NOT BREAK)
- **Navigation**: `src/components/navigation/NavigationItems.tsx`
  - All Link components must remain functional
  - `onNavigate` prop must be properly handled
  - Test: Click every nav item, verify mobile auto-close works
  
- **Sidebar**: `src/components/pantry/layout/AppLayout.tsx`
  - `setSidebarOpen` prop must be passed correctly
  - Mobile overlay must close on backdrop click
  - Critical CSS: `minHeight: 0` required for flex scrolling
  - Test: Verify scrolling works on all screen sizes
  
- **Header**: `src/components/pantry/layout/Header.tsx`
  - Settings button must navigate to `/settings`
  - Profile button must navigate to `/profile`
  - Never replace `useNavigate` with `console.log`
  - Test: Click all buttons, verify they navigate correctly

#### UI Development Checklist
Before committing ANY UI changes:
- [ ] All navigation links work correctly
- [ ] Mobile responsiveness functions properly
- [ ] Scrolling works in all containers
- [ ] Authentication flows remain intact
- [ ] All buttons perform their intended actions
- [ ] End-to-end user flows are tested

#### Emergency Procedures
If functionality is accidentally broken:
1. **Immediately** create hotfix branch
2. **Restore** working functionality before aesthetic improvements
3. **Test** entire user flows before deployment
4. **Document** what was broken and how it was fixed

### Reference Documents
- **Lessons Learned**: `docs/ui-transformation-lessons-learned.md`
- **Protection Guidelines**: `project-architecture.yaml` → `designSystem.uiuxProtectionGuidelines`

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Your Primary Responsibility: Three-Tier Documentation System

You are responsible for maintaining the **Three-Tier Documentation Architecture** that provides optimal context for all agents:

### TIER 1: Living Core (Always Accessible)
Your default context includes these root directory files:
- `project-architecture.yaml` - **SINGLE SOURCE OF TRUTH** for all project configuration
- `INSTRUCTIONS.md` - Project context and agent coordination
- `CLAUDE.md` - This file - Your operational manual
- `README.md` - Project front door and comprehensive overview  
- `CHANGELOG.md` - Release notes and version history

### TIER 2: Working Sprint (`docs/` directory)
Current sprint planning and active decisions only - included in default context:
- Documentation standards and maintenance procedures
- Active UI design specifications and component library
- Current sprint coordination framework
- Active release information

### TIER 3: Archive (`docs/archive/` directory)
Historical documentation accessed only when explicitly requested:
- Sprint-based archives (`sprint-2/`, `sprint-3/`, `sprint-5/`, `sprint-6/`, `sprint-8/`, `sprint-9/`)
- General historical documentation
- Obsolete specifications and deprecated features

## Project Overview

Enterprise Documentation Platform - A comprehensive AI-powered document generation system targeting legal professionals, with expansion planned for insurance, consulting, and other professional domains. This is a **production-ready enterprise platform** designed for multi-tenant deployment across various hosting environments.

## Deployment Information

- The current project's publicly accessible URL after being built and hosted is <https://spaghetti-platform-drgev.ondigitalocean.app/>
    - NOTE: Use the installed `shot-scraper` python command line tool (Documentation is at <https://shot-scraper.datasette.io/en/stable/>) to capture screenshots of the deployed platform when needed. You *MUST* use `--wait 5000` to ensure the page is fully loaded before capturing.
- You are supposed to always commit every change, document it/them, etc.. and then push to github; which at that point triggers a ~30-45 second build from DigitalOcean before it becomes available at <https://spaghetti-platform-drgev.ondigitalocean.app/> if the build is successful

## Technology Stack

### Backend (.NET Core 8)

- **API**: ASP.NET Core Web API with Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Entity Framework Core
- **Caching**: Redis for session management and performance
- **Search**: Elasticsearch for document indexing and full-text search
- **Authentication**: JWT with Azure AD/Auth0 SSO integration
- **Architecture**: Repository Pattern with Unit of Work, Clean Architecture principles

### Frontend (React 18 + TypeScript)

- **Framework**: React 18 with TypeScript for type safety
- **Build**: Vite for fast development and optimized production builds (966ms build time)
- **Styling**: Tailwind CSS with modern enterprise design patterns
- **State Management**: Context API with custom hooks (AuthContext, ThemeContext)
- **Authentication**: JWT token management with automatic refresh
- **UI/UX**: Professional dashboard with collapsible sidebar, modern cards, and responsive design
- **Database Admin**: Comprehensive admin interface with tabbed navigation for database management

### Infrastructure

- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development, Kubernetes for production
- **Reverse Proxy**: Nginx with SSL termination and load balancing
- **Monitoring**: Grafana + Prometheus for metrics and alerting
- **Database Admin**: pgAdmin for PostgreSQL management

### Testing & Quality

- **Unit Testing**: xUnit with FluentAssertions and Moq
- **Integration Testing**: In-memory database testing with realistic data
- **Test Data**: AutoFixture and Bogus for comprehensive test scenarios
- **Coverage**: Coverlet for code coverage analysis

## Multi-Tenant Architecture

### Tenant Isolation

- **Database**: Row-level security with tenant-specific data isolation
- **Authentication**: Tenant-aware JWT tokens with role-based permissions
- **File Storage**: Tenant-specific blob storage containers
- **Caching**: Tenant-prefixed cache keys for data isolation

### Deployment Scenarios

1. **SaaS Multi-Tenant**: Single deployment serving multiple organizations
2. **Enterprise Single-Tenant**: Dedicated instance for large organizations
3. **On-Premises**: Air-gapped deployment for high-security environments
4. **Hybrid Cloud**: Mix of cloud and on-premises components

### Security & Compliance

- **Data Encryption**: AES-256 encryption at rest and in transit
- **Compliance**: SOC 2, GDPR, HIPAA, ISO 27001 ready
- **Audit Trails**: Comprehensive logging of all user actions
- **Access Controls**: Role-based permissions with fine-grained controls

## Development Environment Setup

### Prerequisites

- Docker Desktop 4.15+ with Compose V2
- .NET 8 SDK
- Node.js 18+ with npm
- Git with conventional commit practices

### Quick Start

```bash
# Clone and start development environment
git clone <repository-url>
cd Spaghetti
docker-compose up -d

# Run database migrations
dotnet ef database update --project src/core/infrastructure

# Start frontend development server
cd src/frontend
npm install
npm run dev
```

### Development Services

- **API**: <http://localhost:5001> (Swagger UI at /swagger)
- **Frontend**: <http://localhost:3001> (Vite dev server with HMR)
- **Database**: PostgreSQL on localhost:5432
- **Redis**: localhost:6379
- **Elasticsearch**: <http://localhost:9200>
- **pgAdmin**: <http://localhost:8080>
- **Grafana**: <http://localhost:3001>

### Local Testing Verification

- Frontend serves successfully on <http://localhost:3001> with React DevTools support
- Professional dashboard displays with sample data and modern UI components
- All TypeScript compilation passes without errors
- Build completes in ~966ms with optimized output

## Version Control Practices

- Git is used for version control with continuous deployment to DigitalOcean
- Follow conventional commit messages for clarity and consistency
- Use the format: `type(scope): subject` (e.g., `feat(ui): add live context feed`)
- Types include: `feat` (feature), `fix` (bug fix), `docs` (documentation), `style` (formatting), `refactor` (code change that neither fixes a bug nor adds a feature), `test` (adding missing tests), `chore` (maintenance tasks)
- Each commit should be atomic, focusing on a single change
- **CRITICAL**: Always build and test Docker locally before committing to prevent deployment failures
- Use branches for new features or bug fixes, merging into `master` when complete
- Ensure all code is well-documented and follows best practices for readability and maintainability
- Document all new features in CLAUDE.md and Version History section of README.md
- Use clear, descriptive commit messages following the established pattern
- Each commit should include the Claude Code attribution footer

## Current Implementation Status

### ✅ COMPLETED MILESTONE: Sprint 6 - Advanced Collaboration & Workflow Automation

#### 🚀 Enterprise-Grade Collaboration Platform Complete

We have successfully achieved **Sprint 6 completion** with full enterprise collaboration capabilities:

1. **Advanced Collaboration Features** ✅
   - Real-time collaborative editing with SignalR hub integration
   - Multi-user presence system with typing indicators and cursor tracking
   - Operational transformation for conflict-free concurrent editing
   - User avatar system with status indicators (active, idle, away, typing)
   - Document comments and annotation system

2. **Workflow Automation System** ✅
   - Visual workflow designer with ReactFlow integration
   - Custom node types: Start, Task, Decision, End nodes
   - Workflow validation with error/warning reporting
   - Node palette with drag-and-drop functionality
   - Workflow testing and execution capabilities
   - Approval process automation

3. **PWA & Performance Enhancements** ✅
   - Progressive Web App capabilities with offline support
   - Service worker implementation for caching strategies
   - App manifest for mobile installation
   - Performance optimizations with <200ms response times
   - SSL certificate validation and security headers

4. **Production Deployment & Monitoring** ✅
   - Zero-error TypeScript compilation and build process
   - 100% health check validation on production environment
   - Automated deployment pipeline with DigitalOcean integration
   - Production monitoring with comprehensive health reporting
   - Enterprise security with multi-tenant isolation

### 🎯 Available API Endpoints (Production Ready)

#### Database Management APIs

```bash
# Get database statistics and health
GET /api/admin/database-stats

# Check if sample data exists  
GET /api/admin/sample-data-status

# Populate database with comprehensive sample data
POST /api/admin/seed-sample-data

# Clear ALL data for production deployment (requires confirmation)
DELETE /api/admin/clear-all-data?confirmationToken=CONFIRM_DELETE_ALL_DATA

# Create initial admin user (only works on empty database)
POST /api/admin/create-admin-user
```

#### Sample Data Content

When seeded, creates:

- **3 Demo Tenants**: Acme Legal (Professional), TechStart (Trial), Global Consulting (Enterprise)
- **8 Realistic Users**: Legal professionals, tech founders, consulting directors
- **7 Sample Documents**: Contracts, PRDs, strategy docs with industry-specific content
- **20+ Document Tags**: Categorization and search optimization
- **15+ Permission Entries**: Role-based access control demonstration
- **25+ Audit Entries**: Complete activity history and change tracking

### 📊 Technical Metrics & Performance

| Component | Status | Coverage | Performance | Scalability |
|-----------|--------|----------|-------------|-------------|
| API Endpoints | ✅ 5/5 Working | 100% | ~200ms response | Multi-tenant ready |
| Database Schema | ✅ Complete | 9 Core Tables | Optimized queries | Row-level security |
| Frontend Integration | ✅ Complete | Real data flow | <1s load time | Component-based |
| Docker Environment | ✅ Ready | All services | <30s startup | Production-matching |

### 🚀 Enterprise Platform Capabilities Now Available

1. **Rapid Feature Development**: Solid API foundation for new features
2. **Enterprise Sales Readiness**: Professional demo with real data
3. **Multi-tenant Scalability**: Architecture ready for enterprise deployment  
4. **Developer Productivity**: Hot-reload development environment
5. **Production Deployment**: Container-based deployment operational

## Development Best Practices

### Critical Workflow Requirements

- **MANDATORY**: For ANY changes, including desktop app window updates:
  - Always git commit changes with conventional commit messages
  - Create necessary feature branches
  - Create corresponding GitHub issues with proper labels
  - Open pull requests with comprehensive descriptions
  - Fully document all changes in relevant documentation
  - Create project milestones for significant features
  - Add tasks to the GitHub project board
  - Update the project wiki with technical details
  - Update all relevant files in the `docs/` directory
  - **Execute these steps EVERY SINGLE TIME you make updates**

### Code Quality Standards

1. **Before Coding**: Update todo list and mark tasks as in_progress
2. **During Development**: Follow repository patterns and clean architecture
3. **Local Testing**: ALWAYS test locally (npm run dev, docker-compose up) before committing
4. **Build Verification**: Ensure TypeScript compilation passes (npm run build)
5. **Code Review**: Ensure proper error handling and logging
6. **Documentation**: Update CLAUDE.md and README.md for significant changes
7. **Commit**: Use conventional commit messages with frequent commits

### CSS and Styling Guidelines

**CRITICAL**: Use consistent styling approaches - DO NOT mix inline styles with CSS classes

1. **Primary Approach**: Use Tailwind CSS utility classes for all styling
2. **Custom Styles**: Only use custom CSS classes when Tailwind utilities are insufficient
3. **NO INLINE STYLES**: Never mix inline style objects with className-based styling
4. **Consistency**: All components should follow the same styling methodology
5. **Variables**: Use CSS custom properties (variables) only in dedicated CSS files, not inline
6. **Theme System**: Respect the existing theme.css variable system when using custom CSS

### Testing Strategy

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Frontend tests
npm run test

# Integration tests with Docker
docker-compose -f docker-compose.test.yml up --build
```

### Database Migrations

```bash
# Add new migration
dotnet ef migrations add MigrationName --project src/core/infrastructure

# Update database
dotnet ef database update --project src/core/infrastructure

# Generate SQL script
dotnet ef migrations script --project src/core/infrastructure
```

### Performance & Security

- All database queries use parameterized statements
- Implement caching strategies for frequently accessed data
- Use async/await patterns for all I/O operations
- Validate all inputs and sanitize outputs
- Implement rate limiting on API endpoints
- Use HTTPS in all environments

## Repository Pattern Implementation

### Core Interfaces

- `IRepository<TEntity, TKey>`: Generic CRUD operations with pagination
- `IUnitOfWork`: Transaction management and repository coordination
- Domain-specific repositories: `IDocumentRepository`, `IUserRepository`, etc.

### Testing Approach

- In-memory database for unit tests
- Realistic test data using AutoFixture and Bogus
- Comprehensive coverage of repository methods
- Transaction rollback testing
- Concurrent access scenarios

### Error Handling

- Structured logging with Serilog
- Custom exceptions for business logic violations
- Automatic retry policies for transient failures
- Circuit breaker patterns for external service calls
- Graceful degradation for non-critical features

## Development Best Practices

- Every change needs a git commit and a matching doc update. Leave a clear trail for code, reviews, tests, and all enhancements.
- Use feature flags for incomplete features to avoid breaking changes
- Regularly update dependencies and monitor for security vulnerabilities
- Use semantic versioning for releases
- Maintain a clean and organized codebase with consistent formatting
- Use pull requests for all changes, with at least one reviewer
- Keep the codebase modular and decoupled to facilitate testing and maintenance
- Use environment variables for configuration to avoid hardcoding sensitive data
- Regularly back up critical data and configurations
- Always build and test the docker build locally before committing to git and pushing to origin, but do that every single time.

## Version History Tracking

- Maintain a `CHANGELOG.md` file to track all changes, features, and bug fixes
- Use the following format for entries:

```markdown
## [Unreleased] 
### Added
- New feature description
### Changed
- Description of changes made
### Fixed
- Description of bug fixes
```

- Ensure each entry is linked to a specific commit or pull request for traceability

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
