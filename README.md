# Enterprise Documentation Platform - Spaghetti Platform

A comprehensive multi-level enterprise platform that enables large organizations to manage documentation across multiple subsidiaries, divisions, and business units. Built for enterprise clients who need to scale documentation processes across complex organizational structures while maintaining security, compliance, and centralized control.

## 🚀 Quick Start

**🌐 Live Application:** https://spaghetti-platform-drgev.ondigitalocean.app/

### Current Status
- **Version**: 0.0.15-alpha
- **Sprint**: 6 - Advanced Collaboration Infrastructure  
- **Status**: Active Development
- **Build Time**: ~966ms (target: <2s)
- **Uptime**: 99.9% production availability

For detailed status information, see `project-status.yaml`.

## 🏗️ Architecture Overview

### Technology Stack
- **Backend**: .NET Core 8 with ASP.NET Core Web API
- **Frontend**: React 18 with TypeScript and Vite
- **Database**: PostgreSQL with Entity Framework Core
- **Search**: Elasticsearch for advanced search capabilities
- **Cache**: Redis for session management and performance
- **Real-time**: SignalR for collaborative features
- **Containerization**: Docker with Docker Compose

### Key Features
- ✅ Multi-tenant architecture with row-level security
- ✅ AI-powered document generation (OpenAI, Anthropic, Azure)
- ✅ Real-time collaborative editing with presence awareness
- ✅ Advanced search with <100ms query response times
- ✅ Progressive Web App with offline capabilities
- ✅ Workflow automation with visual designer
- ✅ Enterprise-grade security and compliance (SOC 2, GDPR ready)

## 🚀 Getting Started

### Prerequisites
- Docker Desktop 4.15+ with Compose V2
- .NET 8 SDK
- Node.js 18+ with npm
- Git

### Quick Setup
```bash
# Clone repository
git clone <repository-url>
cd Spaghetti

# Start development environment
docker-compose up -d

# Run backend
cd src/core
dotnet ef database update --project infrastructure
dotnet run --project presentation

# Run frontend (new terminal)
cd src/frontend
npm install
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:3001 (Vite dev server)
- **API**: http://localhost:5001 (Swagger at /swagger)
- **Database**: PostgreSQL on localhost:5432
- **Redis**: localhost:6379
- **Elasticsearch**: http://localhost:9200

## 📊 Performance Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Build Time | ~966ms | <2s | ✅ |
| API Response | <200ms | <500ms | ✅ |
| Search Performance | <100ms | <200ms | ✅ |
| Frontend Load | <1s | <2s | ✅ |
| Uptime | 99.9% | >99% | ✅ |

## 🛡️ Security & Compliance

- **Multi-tenant Isolation**: Row-level security with tenant-specific data access
- **Authentication**: JWT with Azure AD/Auth0 SSO integration ready
- **Encryption**: AES-256 for data at rest and in transit
- **Compliance**: SOC 2, GDPR, HIPAA ready architecture
- **Audit Trails**: Comprehensive logging of all user actions
- **Access Controls**: Role-based permissions with fine-grained controls

## 📚 Documentation Structure

### Core Documentation
- **Project Instructions**: `INSTRUCTIONS.md` - Main project context and guidelines
- **Project Status**: `project-status.yaml` - Real-time project state and agent status
- **Development Guide**: `CLAUDE.md` - Development standards and workflow
- **Change History**: `CHANGELOG.md` - Release notes and version history

### Detailed Documentation (`docs/` directory)
- **📋 Documentation Guide**: `docs/README.md` - Documentation directory navigation
- **📝 Standards**: `docs/DOCUMENTATION-STANDARDS.md` - Complete documentation guidelines  
- **🗂️ Structure**: `docs/DOCUMENTATION-STRUCTURE.md` - Full documentation map
- **🎨 Design System**: `docs/ui-design-system.md` - Complete UI/UX specifications
- **🚀 Sprint Planning**: `docs/sprint-planning.md` - Sprint coordination framework
- **📊 Release Notes**: `docs/changelog-current.md` - Active release information

## 🚀 Development Workflow

1. **Planning**: Check `project-status.yaml` for current sprint and agent status
2. **Development**: Follow patterns established in existing codebase
3. **Testing**: Local verification required before commits (`npm run build`, `dotnet test`)
4. **Documentation**: Update relevant documentation files
5. **Deployment**: Automated via git push to DigitalOcean (~30-45s build time)

### Commit Standards
- Use conventional commit format: `type(scope): subject`
- Examples: `feat(ui): add collaborative editing`, `fix(api): resolve auth bug`
- All commits trigger automated deployment to production

## 🏢 Enterprise Capabilities

### Multi-Tenant Architecture
- **Database Isolation**: Row-level security ensuring tenant data separation
- **Deployment Options**: SaaS multi-tenant, single-tenant, on-premises, hybrid cloud
- **Scalability**: Designed for Fortune 500 deployment requirements
- **Compliance**: Enterprise security standards and regulatory compliance

### Professional Terminology ("Spaghetti Platform")
- **Noodles**: Individual documents within the platform
- **Plates**: Collections or groups of related documents  
- **The Kitchen**: Administrative interface for system management
- **Al Dente Editor**: Rich text editing component for document creation
- **Chefs/Sous Chefs**: Administrative roles with system management privileges
- **Diners**: End users who consume and interact with documents
- **Stewards**: Content maintainers and document managers

## 📈 Success Metrics

### User Experience
- Task completion rate: >95%
- Document creation time: <30 seconds
- Error rate: <2% for form submissions
- User satisfaction: >4.5/5 rating

### Business Impact
- Feature adoption: >80% within 30 days
- Feature discovery: >60% organic discovery
- Support tickets: <5% UI/UX related
- Customer retention: >95% correlation with interface satisfaction

## 🔧 API Overview

The platform provides 11+ comprehensive API endpoints covering:
- **Document CRUD**: Complete document lifecycle management
- **Version Management**: Document versioning and history
- **File Operations**: Upload, download, and metadata management
- **Search Integration**: Advanced search with filtering and faceting
- **Collaboration**: Real-time editing and presence awareness

For detailed API documentation, visit `/swagger` when running the application.

## 🚀 Recent Achievements

### Sprint 6: Advanced Collaboration Infrastructure
- Real-time collaborative editing with SignalR
- Workflow automation with visual designer
- Progressive Web App capabilities
- Enhanced security and performance optimization

### Sprint 5: AI-Powered Enterprise Features (130 points completed)
- AI document generation with multiple provider support
- Advanced search with Elasticsearch
- Enterprise-grade monitoring and compliance
- Production-ready infrastructure with 99.9% uptime

## 📞 Support & Contributing

For development standards, coding conventions, and contribution guidelines, see:
- `CLAUDE.md` - Development workflow and standards
- `INSTRUCTIONS.md` - Project context and agent coordination
- `docs/` directory - Detailed technical documentation

---

**Built with enterprise excellence for legal professionals and expanding to serve insurance, consulting, and professional service industries worldwide.**