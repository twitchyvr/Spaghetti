# Working Sprint Documentation (TIER 2)

This directory contains **current sprint planning and active decisions only**. Historical documentation has been moved to `docs/archive/` for cleaner AI context and improved navigation.

## 🎯 TIER 2: Current Working Documents
- **📝 Standards**: `DOCUMENTATION-STANDARDS.md` - Current documentation guidelines
- **🗂️ Structure**: `DOCUMENTATION-STRUCTURE.md` - Active documentation structure  
- **🔧 Maintenance**: `DOCUMENTATION-MAINTENANCE.md` - Current maintenance procedures
- **🎨 Design System**: `ui-design-system.md` - Active UI/UX design specifications
- **🚀 Sprint Planning**: `sprint-planning.md` - Current sprint coordination framework
- **📊 Release Notes**: `changelog-current.md` - Active release information

## 📁 Active Subdirectories
- **📡 API Documentation**: `api/` - Current API specifications and integration guides
- **🏗️ Architecture**: `architecture/` - Current active architecture decisions
- **🚀 Deployment**: `deployment/` - Current deployment procedures and configurations
- **📦 Archive**: `archive/` - Historical documentation organized by sprint

## 🗂️ Three-Tier Architecture Overview

### TIER 1: Living Core (Root Directory)
**Always current, default AI context**
- `project-architecture.yaml` - Single source of truth
- `INSTRUCTIONS.md`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`

### TIER 2: Working Sprint (This Directory)
**Current sprint only - active decisions and planning**
- Documentation standards and maintenance procedures
- Active UI design specifications and component library
- Current sprint coordination framework and release notes

### TIER 3: Archive (`archive/` subdirectory)
**Historical context accessed only when requested**
- Sprint-based archives organized by number
- General historical documentation
- Obsolete specifications and deprecated features

## 🎯 Usage Guidelines

### For Current Work
1. **UI/UX Development**: Use `ui-design-system.md` for active design specifications
2. **Sprint Planning**: Reference `sprint-planning.md` for current coordination framework
3. **Release Information**: Check `changelog-current.md` for active release details
4. **Architecture**: Use `architecture/` for current system design decisions

### For Historical Context
- Access `archive/sprint-X/` for specific sprint historical documentation
- Use `archive/general/` for general historical context
- **Important**: Historical documentation is only accessed when explicitly needed

### Cross-References to Tier 1
- **Project Source of Truth**: `../project-architecture.yaml`
- **Project Context**: `../INSTRUCTIONS.md`
- **Development Standards**: `../CLAUDE.md`
- **Project Overview**: `../README.md`

## 📋 Documentation Standards

### Content Guidelines
- **Current Focus**: Only include information relevant to active sprint
- **Historical Separation**: Move completed sprint content to appropriate archive
- **Clear Headers**: Use descriptive section headings for easy navigation
- **Consistent Terminology**: Follow definitions in `ui-design-system.md`

### File Management
- **Size Limit**: Keep files under 25KB for optimal AI processing
- **Focused Scope**: Each file covers specific aspects of current work
- **Regular Archival**: Move historical content to maintain clean working context
- **Cross-References**: Link to Tier 1 documents for authoritative information