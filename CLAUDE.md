# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ambient AI work assistant that automatically generates documentation for legal professionals. The project is a **Proof of Concept mockup** targeting paralegals, associates, and partners in high-stakes legal environments.

## Critical Development Constraints

### Single File Architecture
- **ALL code must exist in a single `.html` file** - no external stylesheets, scripts, or dependencies
- Embed all CSS in `<style>` tags and all JavaScript in `<script>` tags within the HTML
- This constraint is non-negotiable for portability and stakeholder sharing

### No External Dependencies
- Use only vanilla JavaScript and modern CSS
- No frameworks, libraries, or CDN resources (jQuery, React, Bootstrap, Font Awesome, etc.)
- All functionality must be achieved with native web APIs

### Mock-Only Implementation
- This is a **mockup to demonstrate user experience**, not a functional system
- Simulate all "AI" processing with `setTimeout()` delays and hardcoded responses
- Use pre-canned content and example data for all generated documents
- No actual AI APIs, backend services, or real data processing

## Target User Persona

**Legal Professional** working with:
- Client calls and meetings
- Contract review sessions  
- Case strategy discussions
- Deposition preparation
- Legal research findings

All examples, templates, and generated content must be relevant to legal work.

## UI/UX Requirements

- **Professional appearance**: Conservative navy blue and gray color scheme suitable for top-tier law firms
- **Enterprise-grade trust**: UI must inspire confidence and security
- **Clean and modern**: SVG icons, consistent spacing, professional typography
- **Three-panel layout**: Live context feed, AI assistant controls, generated document output

## Architecture

The application follows a three-panel layout:
1. **Live Context Feed** - Shows real-time activity simulation
2. **AI Assistant Panel** - Controls for starting/stopping, document type selection
3. **Generated Document Panel** - Final output with edit/save/share functionality

Key features include:
- Interactive search bar simulating firm-wide knowledge base
- Document type templates (Client Call Summary, Contract Review Notes, etc.)
- In-place editing with `contenteditable` functionality
- Modal dialogs for sharing and settings

## Version Control Practices

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