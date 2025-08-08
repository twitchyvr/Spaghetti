# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dual admin endpoint strategy for reliable admin user creation (/api/admin/create-platform-admin and /api/admin/create-admin-user).
- PostCSS configuration for proper Tailwind CSS processing in production builds.
- Frontend graceful fallback mechanism for admin creation API calls.

### Fixed
- **CRITICAL**: Resolved persistent 405 Method Not Allowed errors for admin user creation.
- **CRITICAL**: Fixed Tailwind CSS styling not rendering in production - UI now displays professional styling instead of plain HTML.
- Enhanced PostCSS configuration comments for better deployment debugging.
- Corrected login page syntax error and restyled screen using Pantry design system components.
- Configured database connection via environment variables with health check endpoint.

### Security
- Removed hardcoded database credentials, using environment variables only.
- Compliance with GitHub security policies and industry best practices.

## [0.0.15-alpha] - 2025-08-01

### Added
- Real-time collaborative editing with SignalR hub integration.
- Multi-user presence system with typing indicators.
- Workflow automation system with a visual designer.
- Progressive Web App (PWA) capabilities with offline support.
- Advanced security enhancements for enterprise deployment.

### Changed
- Enhanced UI components for better user experience.
- Improved performance optimization across the platform.
- Updated authentication system for better security.

### Fixed
- Resolved multiple TypeScript compilation issues.
- Fixed sidebar visibility and PWA notification problems.
- Addressed mobile responsiveness issues.

## [0.0.14-alpha] - 2025-07-31

### Added
- Enterprise-grade AI service abstraction layer supporting OpenAI, Anthropic, and Azure.
- Advanced prompt engineering for context-aware document generation.
- AI provider failover and load balancing.
- Professional React components for the AI document generation interface.
- Production-ready Elasticsearch cluster for search (<100ms query performance).
- Advanced search indexing, faceting, filtering, and ranking algorithms.
- Enhanced production monitoring with comprehensive health checks.
- Zero-downtime automated deployment pipeline.

### Changed
- Event-driven architecture now utilizes SignalR for real-time capabilities.
- Optimized container orchestration for better scalability.

### Security
- Implemented enterprise security patterns including JWT and RBAC.
- Ensured SOC 2 ready architecture with comprehensive audit trails.
- Verified and tested multi-tenant data isolation.
