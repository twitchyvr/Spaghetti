# Agent Instructions & Code Quality Standards

This document contains all agent-specific instructions, behaviors, and code quality enforcement rules. For general project information, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

## Table of Contents

1. [Available Agents](#available-agents)
2. [Code Quality Checklist - ALL AGENTS](#code-quality-checklist---all-agents)
3. [Agent-Specific Instructions](#agent-specific-instructions)
4. [Code Quality Enforcement Rules](#code-quality-enforcement-rules)
5. [Agent Coordination](#agent-coordination)

## Available Agents

### Phase-Based Workflow Agents (Execute in Order)

1. **team-p1-project-initializer** - Establishes project foundation
2. **team-p2-architecture-coordinator** - Orchestrates architectural design
3. **team-p3-sprint-planner** - Creates sprint plans and task assignments
4. **team-p4-development-coordinator** - Manages development execution
5. **team-p5-test-strategy-architect** - Defines testing strategies
6. **team-p6-deployment-orchestrator** - Handles deployment process
7. **team-p7-sprint-retrospective-facilitator** - Conducts sprint reviews
8. **team-p8-system-maintenance-coordinator** - Manages ongoing maintenance
9. **team-p9-workflow-termination-coordinator** - Handles project completion

### Supporting Agents

- **project-manager** - Overall project coordination
- **system-architect** - Technical architecture decisions
- **backend-lead** - Backend development guidance
- **frontend-lead** - Frontend development guidance
- **devops-lead** - Infrastructure and deployment
- **qa-lead** - Quality assurance leadership
- **scrum-master** - Sprint and team coordination
- **developer** - General development tasks
- **ui-designer** - UI/UX design specifications
- **qa-engineer** - Quality assurance execution
- **gitops-orchestrator** - Git workflow management
- **team-orchestrator** - Team activity coordination

## Code Quality Checklist - ALL AGENTS

### Before ANY Code Changes

1. ✅ Read existing code and understand current patterns
2. ✅ Check for existing type definitions before creating new ones
3. ✅ Search for similar functionality to avoid duplication
4. ✅ Review `project-architecture.yaml` for current standards
5. ✅ Adhere to all guidelines within this document (`AGENTS.md`).

### During Development

1. ✅ Use centralized type definitions from `src/frontend/src/types/`
2. ✅ Add null checks for all nullable state variables
3. ✅ Follow existing code patterns and conventions
4. ✅ Use TypeScript strict mode features (optional chaining, nullish coalescing)
5. ✅ Import from correct locations - no relative imports for shared code

### Before Committing

1. ✅ Run `npm run build` locally - NO EXCEPTIONS
2. ✅ Fix ALL TypeScript errors - NO WORKAROUNDS
3. ✅ Remove all console.log statements
4. ✅ Delete commented-out code
5. ✅ Check for duplicate functions or type definitions
6. ✅ Ensure all imports are from correct locations
7. ✅ Verify no temporary fixes remain
8. ✅ Update relevant documentation

## Agent-Specific Instructions

### Developer Agent Instructions

**Type Management Protocol:**
- NEVER create duplicate interfaces - search first in `src/frontend/src/types/`
- When types differ slightly, extend or compose existing types
- Use type aliases for backwards compatibility during refactors
- Document any type changes in commit messages

***Example: Fixing Type Fragmentation***

❌ **BAD** - Multiple definitions in different files:
```typescript
// File 1: components/Comment.tsx
interface Comment { id: string; text: string; timestamp: Date; resolved: boolean; }
// File 2: services/api.ts
interface CommentDTO { id: string; content: string; createdAt: string; isResolved: boolean; }
// File 3: types/models.ts
interface DocumentComment { commentId: string; message: string; dateCreated: Date; status: 'resolved' | 'open'; }
```

✅ **GOOD** - A single, centralized definition with compatibility aliases:
```typescript
// types/comments.ts
export interface Comment {
  id: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  userId: string;
  documentId: string;
}

// For API compatibility
export type CommentDTO = Omit<Comment, 'timestamp'> & { timestamp: string; };

// For legacy code compatibility (temporary)
export type LegacyComment = Comment & {
  /** @deprecated Use content instead */
  text?: string;
  /** @deprecated Use resolved instead */
  isResolved?: boolean;
};
```

**Refactoring Requirements:**
- Use TypeScript's built-in refactoring tools
- Update ALL usages when changing function signatures
- Update ALL imports when moving exports
- Search entire codebase when renaming types

**Code Organization:**
- Keep files under 300 lines when possible
- Extract reusable logic into utility functions
- Use barrel exports for clean imports

### Frontend-Lead Agent Instructions

**Component Development Standards:**
- Check existing components before creating new ones
- Use shared types from centralized location
- Implement proper error boundaries and loading states
- Add null safety checks for all data from APIs

**UI Consistency Requirements:**
- Follow Pantry Design System strictly
- Use Tailwind utility classes only - NO inline styles
- Maintain consistent patterns across similar components
- Ensure responsive design for all screen sizes

**Performance Guidelines:**
- Implement code splitting for large components
- Use React.memo for expensive renders
- Optimize bundle size with dynamic imports

### Backend-Lead Agent Instructions

**API Contract Management:**
- Define all DTOs in centralized location
- Keep frontend and backend types synchronized
- Version APIs when making breaking changes
- Document all endpoint changes

**Database Guidelines:**
- Use Entity Framework migrations for all schema changes
- Implement soft deletes for audit trails
- Add indexes for frequently queried fields
- Document complex queries

**Security Requirements:**
- Validate all inputs at API boundaries
- Use parameterized queries exclusively
- Implement rate limiting on all endpoints
- Log security events appropriately

### QA-Lead Agent Instructions

**Quality Gate Enforcement:**
- Verify TypeScript compilation passes
- Check for type consistency across files
- Ensure null safety in data handling
- Validate no duplicate code exists

**Test Coverage Requirements:**
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for key operations

**Review Process:**
- Check all items in code quality checklist
- Verify documentation is updated
- Ensure tests are comprehensive
- Validate accessibility compliance

### Scrum-Master Agent Instructions

**Sprint Planning Requirements:**
- Include "code cleanup" tasks in every sprint
- Allocate time for refactoring and consolidation
- Track technical debt explicitly
- Review type consistency in sprint retrospectives

**Team Coordination:**
- Ensure all agents follow quality standards
- Facilitate knowledge sharing sessions
- Track and resolve blockers quickly
- Maintain clear communication channels

**Documentation Management:**
- Keep INSTRUCTIONS.md updated
- Ensure sprint documentation is current
- Archive completed sprint documents
- Maintain team velocity metrics

### GitOps-Orchestrator Agent Instructions

**Pre-Commit Validation:**
- Block commits if TypeScript compilation fails
- Require successful local build before push
- Check for console.log and commented code
- Validate imports are from correct paths

**Branch Management:**
- Enforce branch naming conventions
- Require PR reviews before merging
- Automate changelog generation
- Tag releases appropriately

**CI/CD Pipeline:**
- Run all tests on every commit
- Deploy only from protected branches
- Maintain deployment rollback capability
- Monitor deployment success metrics

### UI-Designer Agent Instructions

**Design System Compliance:**
- All designs must use Pantry components
- Follow established color palette
- Maintain consistent spacing system
- Ensure accessibility in all designs

**Documentation Requirements:**
- Update `docs/ui-design-system.md` for new patterns
- Provide implementation notes for developers
- Include responsive design specifications
- Document interaction states

### Project-Manager Agent Instructions

**Project Oversight:**
- Ensure all agents follow established processes
- Monitor project health metrics
- Facilitate cross-team communication
- Maintain project documentation

**Risk Management:**
- Identify technical debt early
- Plan mitigation strategies
- Track dependency updates
- Monitor security vulnerabilities

## Code Quality Enforcement Rules

### 1. Zero Tolerance Policy

- NO commits with TypeScript errors
- NO duplicate type definitions
- NO console.log in production code
- NO commented-out code blocks
- NO TODOs without linked issues
- NO any types without justification

### 2. Type Safety Requirements

- ALL nullable states must have explicit checks
- ALL API responses must have type guards
- ALL component props must be strongly typed
- ALL shared types in centralized location
- ALL external data must be validated

### 3. Refactoring Protocol

- ALWAYS use IDE refactoring tools
- ALWAYS update all references
- ALWAYS test after refactoring
- ALWAYS document breaking changes
- ALWAYS clean up old code completely

### 4. Review Checklist

- ✅ Types are imported from central location
- ✅ No duplicate interfaces or types
- ✅ Null checks for nullable data
- ✅ Clean code with no debug statements
- ✅ All tests pass locally
- ✅ Build completes without errors
- ✅ Documentation is updated
- ✅ Commit message follows conventions

## Agent Coordination

### Communication Protocols

1. **Status Updates**: Use TODO system for task tracking
2. **Blockers**: Escalate immediately to appropriate lead
3. **Code Reviews**: Require approval from relevant lead agent
4. **Documentation**: Update after every significant change

### Handoff Requirements

When passing work between agents:
1. Ensure all code compiles without errors
2. Document any pending decisions
3. Update relevant tracking issues
4. Provide clear context for next steps

### Quality Gates Between Phases

Each phase must complete these before handoff:
1. All TypeScript errors resolved
2. All tests passing
3. Documentation updated
4. Code review completed
5. No outstanding TODOs

## Developer Tooling

Here are some useful scripts for maintaining code quality.

### Type Duplication Detector
```bash
#!/bin/bash
# find-duplicate-types.sh
echo "Searching for duplicate interface definitions..."
for type in $(grep -h "interface\s\+\w\+" -r src/ | sed 's/interface\s\+\(\w\+\).*/\1/' | sort | uniq -d); do
  echo "Duplicate interface: $type"
  grep -n "interface\s\+$type" -r src/
  echo "---"
done
```

### Import Validator
```bash
#!/bin/bash
# validate-imports.sh
echo "Checking for imports from non-centralized locations..."
grep -r "from.*types" src/ | grep -v "src/types" | grep -v "node_modules"
```