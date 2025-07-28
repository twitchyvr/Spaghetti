# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Your primary responsibility is ensuring agents maintain the INSTRUCTIONS.md file that serves as the operational guide for all other agents in the project ecosystem, including the `developer` agent, `project-manager` agent, `ui-designer` agent, `scrum-master` agent,and `qa-engineer` agent, as well as others that we might create later like the `gitops-engineer` agent.

## Project Overview

Enterprise Documentation Platform - A comprehensive AI-powered document generation system targeting legal professionals, with expansion planned for insurance, consulting, and other professional domains. This is a **production-ready enterprise platform** designed for multi-tenant deployment across various hosting environments.

## Deployment Information

- The current project's publicly accessible URL after being built and hosted is `https://spaghetti-platform-drgev.ondigitalocean.app/`
- You are supposed to always commit every change, document it/them, etc.. and then push to github; which at that point triggers a ~30-45 second build from DigitalOcean before it becomes available at `https://spaghetti-platform-drgev.ondigitalocean.app/` if the build is successful

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
- **API**: http://localhost:5001 (Swagger UI at /swagger)
- **Frontend**: http://localhost:3001 (Vite dev server with HMR)
- **Database**: PostgreSQL on localhost:5432
- **Redis**: localhost:6379
- **Elasticsearch**: http://localhost:9200
- **pgAdmin**: http://localhost:8080
- **Grafana**: http://localhost:3001

### Local Testing Verification
- Frontend serves successfully on http://localhost:3001 with React DevTools support
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

### ✅ COMPLETED MILESTONE: Complete API Integration

#### 🏗️ Enterprise Foundation Established
We have successfully achieved **enterprise-platform level architecture** comparable to Salesforce, Workday, ServiceNow foundations:

1. **Full-Stack API Integration** ✅
   - Frontend service layer with comprehensive API contracts
   - Real-time database connectivity through admin endpoints  
   - Type-safe TypeScript integration with error handling
   - Enterprise-grade loading states and error boundaries

2. **CORS & Development Environment** ✅
   - Professional multi-port development setup (3000, 3001, HTTPS)
   - Hot-reload compatible API integration
   - Production-ready security headers

3. **Database Integration & Admin APIs** ✅
   - PostgreSQL with Entity Framework Core migrations
   - Multi-tenant schema with owned type configurations
   - Admin endpoint suite: database-stats, seed-sample-data, clear-all-data
   - Real enterprise data management with audit trails

4. **Docker & Container Architecture** ✅
   - Multi-stage builds optimized for development and production
   - Container orchestration matching production environment
   - API (port 5001), Database (5432), Redis, Elasticsearch integration

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