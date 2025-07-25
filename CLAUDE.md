# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ambient AI work assistant that automatically generates documentation for enterprise professionals, with a focus on legal use cases to start with before expanding to other domains. The project is a **Real Professional Production-Ready** product. We will start by targeting paralegals, associates, and partners in high-stakes legal environments and want to expand to other professional fields such as insurance.

## Critical Development Constraints

### No External Dependencies
- Use only vanilla JavaScript and modern CSS until the project is fully functional
- No frameworks, libraries, or CDN resources (jQuery, React, Bootstrap, Font Awesome, etc.)
- All functionality must be achieved with native web APIs

### Production-Ready Implementation
- This is a **production-level implementation**, not a functional system
- Use AI content and real data for all generated documents
- Use actual AI APIs, backend services, and real data processing

## Target User Persona

**Legal Professional** working with:
- Client calls and meetings
- Contract review sessions  
- Case strategy discussions
- Deposition preparation
- Legal research findings

All examples, templates, and generated content must be relevant to the target user persona. We will start with legal use cases and expand to other professional domains later.

## UI/UX Requirements

- **Professional appearance**: Conservative navy blue and gray color scheme suitable for top-tier law firms
- **Enterprise-grade trust**: UI must inspire confidence and security
- **Clean and modern**: SVG icons, consistent spacing, professional typography
- **Three-panel main layout**: Live context feed, AI assistant controls, generated document output

## Architecture

The application follows a three-panel layout for the main interface:
1. **Live Context Feed** - Shows real-time activity simulation
2. **AI Assistant Panel** - Controls for starting/stopping, document type selection
3. **Generated Document Panel** - Final output with edit/save/share functionality

Key features include:
- Interactive search bar simulating firm-wide knowledge base
- Document type templates (Client Call Summary, Contract Review Notes, etc.)
- In-place editing with `contenteditable` functionality
- Modal dialogs for sharing and settings

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

Since this is a single-file project:
1. Make changes directly to the main HTML file
2. Test functionality in browser
3. Update version history in README.md if adding features
4. Commit changes with descriptive messages

No build process, testing framework, or package management is needed due to the single-file constraint.

## Testing and Quality Assurance
- Manual testing in modern browsers (Chrome, Firefox, Edge)
- Ensure all features work as expected
- Validate UI/UX against design requirements
- Check for cross-browser compatibility 
- Ensure no console errors or warnings
- Test responsiveness on different screen sizes
- Validate accessibility features (ARIA roles, keyboard navigation) 
