# Documentation Index & Navigation

This document provides a complete overview of the project documentation structure after modularization for better maintainability and readability.

## 🎯 Quick Start Documents

| File | Purpose | When to Use |
|------|---------|-------------|
| **[README.md](./README.md)** | Project overview and quick start | First time learning about the project |
| **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** | Project context and team coordination | Understanding current project status |
| **[AGENTS.md](./AGENTS.md)** | Complete agent instructions | Working as or with AI agents |

## 📋 Core Configuration

| File | Purpose | Size | Content |
|------|---------|------|---------|
| **[project-architecture.yaml](./project-architecture.yaml)** | Single source of truth configuration | 375 lines | Architecture, agents, quality standards |
| **[CLAUDE.md](./CLAUDE.md)** | Anthropic Claude development guide | 450+ lines | Detailed development practices |
| **[GEMINI.md](./GEMINI.md)** | Google Gemini development guide | Medium | Alternative AI agent instructions |

## 🎨 Design & UI Documentation

| File | Purpose | Size | Focus |
|------|---------|------|-------|
| **[docs/ui-design-system.md](./docs/ui-design-system.md)** | Component library specs | ~400 lines | "The Pantry" components |
| **[docs/ui-overhaul-requirements.md](./docs/ui-overhaul-requirements.md)** | UI improvement requirements | 720 lines | Critical UI fixes needed |

## ⚙️ Development Standards

| File | Purpose | Size | Audience |
|------|---------|------|----------|
| **[docs/code-quality-standards.md](./docs/code-quality-standards.md)** | Anti-rapid-iteration guidelines | 292 lines | All developers and agents |
| **[docs/sprint-planning.md](./docs/sprint-planning.md)** | Sprint coordination framework | Medium | Scrum masters and leads |

## 🏗️ Architecture Documentation

| Directory | Contents | Purpose |
|-----------|----------|---------|
| **[docs/architecture/](./docs/architecture/)** | Technical architecture docs | System design specs |
| **[docs/deployment/](./docs/deployment/)** | Deployment guides | Production setup |
| **[docs/security/](./docs/security/)** | Security and compliance | Enterprise requirements |

## 📚 Sprint Archives

| Directory | Purpose | Size Warning |
|-----------|---------|--------------|
| **[docs/archive/sprint-2/](./docs/archive/sprint-2/)** | Sprint 2 historical docs | Large files (1000+ lines) |
| **[docs/archive/sprint-3/](./docs/archive/sprint-3/)** | Sprint 3 historical docs | Very large files (2000+ lines) |
| **[docs/archive/sprint-5/](./docs/archive/sprint-5/)** | Sprint 5 historical docs | Extremely large (1700+ lines) |
| **[docs/archive/sprint-8/](./docs/archive/sprint-8/)** | Sprint 8 historical docs | Large files (700+ lines) |

> **Note**: Archive files may need further splitting if accessed frequently.

## 📖 How to Navigate This Documentation

### For New Team Members
1. Start with [README.md](./README.md) for project overview
2. Read [INSTRUCTIONS.md](./INSTRUCTIONS.md) for current status
3. Review [AGENTS.md](./AGENTS.md) for development practices
4. Check [project-architecture.yaml](./project-architecture.yaml) for technical details

### For Developers
1. **Code Quality**: [docs/code-quality-standards.md](./docs/code-quality-standards.md)
2. **Agent Instructions**: [AGENTS.md](./AGENTS.md)
3. **UI Components**: [docs/ui-design-system.md](./docs/ui-design-system.md)
4. **Architecture**: [docs/architecture/](./docs/architecture/)

### For Project Managers
1. **Current Status**: [INSTRUCTIONS.md](./INSTRUCTIONS.md)
2. **Sprint Planning**: [docs/sprint-planning.md](./docs/sprint-planning.md)
3. **Architecture Config**: [project-architecture.yaml](./project-architecture.yaml)

### For DevOps/Deployment
1. **Deployment Guides**: [docs/deployment/](./docs/deployment/)
2. **Architecture**: [docs/architecture/Multi-Cloud-Integration.md](./docs/architecture/Multi-Cloud-Integration.md)
3. **Security**: [docs/security/](./docs/security/)

## 📊 File Size Guidelines

To maintain readability and digestibility:

- ✅ **Ideal**: Under 300 lines
- ⚠️ **Acceptable**: 300-500 lines  
- 🚨 **Consider Splitting**: Over 500 lines
- ❌ **Too Large**: Over 800 lines

## 🔄 Maintenance Schedule

| Document Type | Update Frequency | Responsibility |
|---------------|------------------|----------------|
| Core config files | Every sprint | Scrum Master |
| Agent instructions | When processes change | All leads |
| Architecture docs | Major changes only | System Architect |
| Sprint archives | End of sprint | Documentation Technician |

## 🚀 Recent Modularization Changes

**Date**: August 2025  
**Reason**: INSTRUCTIONS.md was 1071 lines - too large for easy navigation

**Changes Made**:
- ✅ Created [AGENTS.md](./AGENTS.md) - Extracted all agent instructions (150+ lines)
- ✅ Created [docs/ui-overhaul-requirements.md](./docs/ui-overhaul-requirements.md) - Extracted UI specs (700+ lines)
- ✅ Reduced [INSTRUCTIONS.md](./INSTRUCTIONS.md) from 1071 to 262 lines
- ✅ Updated all cross-references
- ✅ Updated [project-architecture.yaml](./project-architecture.yaml) with new structure

**Result**: Better organization, easier navigation, focused content in each file.

---

For questions about documentation structure or to suggest improvements, see [AGENTS.md](./AGENTS.md) for agent coordination guidelines.