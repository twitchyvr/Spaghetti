# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Documentation Platform - A comprehensive AI-powered document generation system targeting legal professionals, with expansion planned for insurance, consulting, and other professional domains. This is a **production-ready enterprise platform** designed for multi-tenant deployment across various hosting environments.

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

# GitHub Copilot in the CLI

GitHub Copilot in the CLI is an extension for [GitHub CLI](https://cli.github.com/) which provides a chat-like interface in the terminal that allows you to ask questions about the command line. You can ask Copilot in the CLI to suggest a command for your use case with `gh copilot suggest`, or to explain a command you're curious about with `gh copilot explain`.

For use cases, enabling, and limitations, see "[GitHub Copilot in the CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli)".

For what data is collected, used, and shared, see "[Privacy Policies](https://docs.github.com/en/site-policy/privacy-policies/)".

For help troubleshooting connectivity, see "[Troubleshooting network errors for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-network-errors-for-github-copilot)".

## Quickstart

> [!NOTE]
> To use and install GitHub Copilot in the CLI, you must have an active [GitHub Copilot](https://github.com/features/copilot) subscription, have [GitHub CLI](https://cli.github.com/) installed, and authenticate using the GitHub CLI OAuth app.
>
> Classic and fine-grained PATs are currently unsupported and might require clearing the `GITHUB_TOKEN` and `GH_TOKEN` environment variables.

> [!IMPORTANT]
> GitHub Copilot in the CLI does not currently have plans to support 32-bit Android distributions.
>
> For more information, see https://github.com/github/gh-copilot/issues/122.

1. Authenticate with GitHub CLI OAuth app
   ```shell
   gh auth login --web
   ```
1. Install / upgrade extension
   ```shell
   gh extension install github/gh-copilot --force
   ```
1. Suggest a command
   ```shell
   gh copilot suggest "Install and configure git lfs"
   ```
1. Explain a command
   ```shell
   gh copilot explain 'git lfs migrate import --everything --include="*.gz,*.png,*.jar"'
   ```

## Usage

```shell
$ gh copilot --help
Your AI command line copilot.

Usage:
  copilot [command]

Examples:

$ gh copilot suggest "Install git"
$ gh copilot explain "traceroute github.com"


Available Commands:
  alias       Generate shell-specific aliases for convenience
  config      Configure options
  explain     Explain a command
  suggest     Suggest a command

Flags:
  -h, --help              help for copilot
      --hostname string   The GitHub host to use for authentication
  -v, --version           version for copilot

Use "copilot [command] --help" for more information about a command.
```

### Multi-account notes

Multi-account users can use `--hostname` flag or `GH_HOST` environment variable to specify the GitHub hostname for commands that would otherwise assume the `github.com` host.

## Set up optional helpers

**Is `gh copilot suggest ...` too many keystrokes?  Do you want support for executing suggestions and keeping them in history?**

[`v1.0.0`](https://github.com/github/gh-copilot/releases/tag/v1.0.0) introduces `gh copilot alias`, which generates shell configuration for `ghcs` and `ghce` aliases that wrap `gh copilot suggest` and `gh copilot explain`.  These aliases provide faster invocation and support executing suggested commands if applicable.  Executed suggestions are added to your shell history for reuse later.

```shell
$ ghcs print "Hello world"

Welcome to GitHub Copilot in the CLI!
version 1.0.0 (2024-03-21)

I'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve. For more information, see https://gh.io/gh-copilot-transparency

Suggestion:

  echo "Hello world"

? Select an option
> Execute command

? Are you sure you want to execute the suggested command?
> Yes

Hello world
```

To setup these optional helpers, see below for setup instructions for supported shells:

- [bash](#bash)
- [powershell](#powershell)
- [zsh](#zsh)

For more information, run `gh copilot alias --help`.

For changing the execute command confirmation behavior, run `gh copilot config` to change `Default value for confirming command execution`.

### Bash

```bash
echo 'eval "$(gh copilot alias -- bash)"' >> ~/.bashrc
```

### PowerShell

> [!NOTE]
> PowerShell users might need to update the file containing `gh-copilot` helpers after updating the extension.

```pwsh
$GH_COPILOT_PROFILE = Join-Path -Path $(Split-Path -Path $PROFILE -Parent) -ChildPath "gh-copilot.ps1"
gh copilot alias -- pwsh | Out-File ( New-Item -Path $GH_COPILOT_PROFILE -Force )
echo ". `"$GH_COPILOT_PROFILE`"" >> $PROFILE
```

### Zsh

```zsh
echo 'eval "$(gh copilot alias -- zsh)"' >> ~/.zshrc
```

## Metrics sent to GitHub

GitHub Copilot in the CLI sends certain metrics to our analytics system. We want you to understand what is being
sent and why it's important to our ability to continue to improve the product and provide you with a better experience
over time.

### Why do we need usage stats?

Our team uses metrics to prioritize our work and evaluate whether we are successful in solving real user problems after
we've released something. For example, when we release a new version and see a spike in exceptions and response ratings,
we want to understand if there is a regression or a platform issue causing problems.

The more people who opt in to send usage stats, the more information we have to base our decision-making on. And if you
want us to take your use cases into consideration, we hope you'll opt in so we get a better idea of how you use the app
and whether or not it's meeting your needs. GitHub Copilot in the CLI will send a payload in the format below to our
analytics system unless you've opted out. We are very sensitive to the privacy of our users and we never look at the data
of specific individuals, but rather only examine aggregate data and trends to inform our product decisions.

You can change your opt-in setting at any time in `gh copilot config`:

```
$ gh copilot config

Welcome to GitHub Copilot CLI!
version 0.3.0-beta (2023-10-31)

I'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.

? What would you like to configure?
> Optional Usage Analytics

? Allow GitHub to collect optional usage data to help us improve? This data does not include your queries.  [Use arrows to move, type to filter]
> Yes
  No
```

### Example usage stats

```json
{
	"platform": "darwin",
	"architecture": "arm64",
	"version": "1.1.0",
	"custom_event": "true",
	"event_parent_command": "explain",
	"event_name": "Explain",
	"sha": "089a53215fc4383179869f7f6132ce9d6e58754a",
	"thread_id": "e61d0d08-f6ba-465b-81cf-c30fd9127d70",
	"host": "github.com"
}
```

