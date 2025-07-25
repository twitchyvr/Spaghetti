# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Build**: Vite for fast development and optimized production builds
- **Styling**: CSS Modules with enterprise-grade design system
- **State Management**: Context API with custom hooks
- **Authentication**: JWT token management with automatic refresh

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
cd EnterpriseDocsCore
docker-compose up -d

# Run database migrations
dotnet ef database update --project src/core/infrastructure

# Start frontend development server
cd src/frontend
npm install
npm run dev
```

### Development Services
- **API**: http://localhost:5000 (Swagger UI at /swagger)
- **Frontend**: http://localhost:3000
- **Database**: PostgreSQL on localhost:5432
- **Redis**: localhost:6379
- **Elasticsearch**: http://localhost:9200
- **pgAdmin**: http://localhost:8080
- **Grafana**: http://localhost:3001

## Version Control Practices

- Git is used for version control
- Follow conventional commit messages for clarity and consistency
- Use the format: `type(scope): subject` (e.g., `feat(ui): add live context feed`)
- Types include: `feat` (feature), `fix` (bug fix), `docs` (documentation), `style` (formatting), `refactor` (code change that neither fixes a bug nor adds a feature), `test` (adding missing tests), `chore` (maintenance tasks)
- Each commit should be atomic, focusing on a single change
- Use branches for new features or bug fixes, merging into `main` when complete
- Ensure all code is well-documented and follows best practices for readability and maintainability
- Document all new features in the Version History section of README.md
- Use clear, descriptive commit messages following the established pattern
- Each commit should include the Claude Code attribution footer

## Development Workflow

### Code Quality Standards
1. **Before Coding**: Update todo list and mark tasks as in_progress
2. **During Development**: Follow repository patterns and clean architecture
3. **Testing**: Write unit tests for all business logic and repository methods
4. **Code Review**: Ensure proper error handling and logging
5. **Documentation**: Update CLAUDE.md and README.md for significant changes
6. **Commit**: Use conventional commit messages with frequent commits

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