# Code Quality Standards & Anti-Rapid-Iteration Guidelines

## Executive Summary

This document establishes mandatory code quality standards to prevent the technical debt that accumulates from rapid iteration without proper cleanup. These standards are **non-negotiable** and must be followed by all agents and developers.

## The Problem: Rapid Iteration Without Cleanup

### Symptoms We've Observed

1. **Type Fragmentation**
   - Multiple `DocumentComment` interfaces with different properties
   - `timestamp` vs `createdAt`, `resolved` vs `isResolved`
   - Same conceptual types defined in 3+ different files

2. **Code Duplication**
   - Two `getConnectionState` functions in the same file
   - Similar functionality implemented multiple times
   - Old implementations left behind after refactoring

3. **Incomplete Refactoring**
   - Functions converted from methods to exports without updating imports
   - Type changes not propagated to all usage sites
   - Breaking changes committed without fixing dependent code

4. **Missing Safety Checks**
   - Nullable states accessed without null checks
   - Optional properties treated as required
   - No type guards for API responses

## The Solution: Mandatory Quality Gates

### 1. Pre-Development Checklist

Before writing ANY new code:

```bash
# Check for existing types
grep -r "interface.*YourTypeName" src/
grep -r "type.*YourTypeName" src/

# Check for existing functions
grep -r "function.*yourFunction" src/
grep -r "const.*yourFunction" src/

# Check for existing components
find src/ -name "*YourComponent*"
```

### 2. Type Management Protocol

#### Centralized Type Definitions

All shared types MUST be defined in:
```
src/frontend/src/types/
├── api.ts          # API request/response types
├── auth.ts         # Authentication types
├── collaboration.ts # Real-time collaboration types
├── common.ts       # Common utility types
├── documents.ts    # Document-related types
└── index.ts        # Re-exports for convenience
```

#### Type Creation Rules

1. **Search First**: Always search for existing types before creating new ones
2. **Extend, Don't Duplicate**: If a similar type exists, extend it
3. **Single Source**: Each type should have ONE definition
4. **Consistent Naming**: Use consistent property names across types

#### Example: Fixing Type Fragmentation

❌ **BAD** - Multiple definitions:
```typescript
// File 1: components/Comment.tsx
interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}

// File 2: services/api.ts
interface CommentDTO {
  id: string;
  content: string;
  createdAt: string;
  isResolved: boolean;
}

// File 3: types/models.ts
interface DocumentComment {
  commentId: string;
  message: string;
  dateCreated: Date;
  status: 'resolved' | 'open';
}
```

✅ **GOOD** - Single definition with aliases:
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
export type CommentDTO = Omit<Comment, 'timestamp'> & {
  timestamp: string; // ISO string for JSON
};

// For legacy code compatibility (temporary)
export type LegacyComment = Comment & {
  /** @deprecated Use content instead */
  text?: string;
  /** @deprecated Use resolved instead */
  isResolved?: boolean;
};
```

### 3. Refactoring Requirements

#### Safe Refactoring Process

1. **Use IDE Tools**
   - VSCode: "Rename Symbol" (F2)
   - VSCode: "Find All References" (Shift+F12)
   - VSCode: "Go to Type Definition" (F12)

2. **Update Everything**
   ```bash
   # After renaming a type/function
   npm run build  # Must pass
   npm test       # Must pass
   ```

3. **Clean Up Completely**
   - Delete old implementations
   - Remove temporary aliases after migration
   - Update all documentation

### 4. Build-Time Enforcement

#### Pre-Commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run pre-commit-checks"
    }
  },
  "scripts": {
    "pre-commit-checks": "npm run lint && npm run typecheck && npm run test:types"
  }
}
```

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 5. Code Review Checklist

Every PR must pass:

- [ ] **Type Consistency**
  - No duplicate type definitions
  - All types imported from central location
  - Consistent property naming

- [ ] **Null Safety**
  - All nullable values have checks
  - Optional chaining used appropriately
  - No unchecked array access

- [ ] **Clean Code**
  - No console.log statements
  - No commented-out code
  - No TODO without issue number

- [ ] **Complete Refactoring**
  - Old code removed
  - All imports updated
  - All tests passing

- [ ] **Build Success**
  - TypeScript compiles with zero errors
  - All linters pass
  - All tests pass

### 6. Sprint-Level Quality Gates

#### Sprint Planning
- Allocate 20% of sprint capacity for technical debt
- Create explicit "cleanup" tasks
- Track type consolidation progress

#### Sprint Review
- Review code quality metrics
- Identify duplication patterns
- Plan consolidation for next sprint

## Enforcement & Accountability

### Automated Enforcement

1. **CI/CD Pipeline**
   - Build fails on TypeScript errors
   - Deploy blocked without passing builds
   - Automated type duplication detection

2. **Git Hooks**
   - Pre-commit: TypeScript compilation
   - Pre-push: Full test suite
   - Commit-msg: Conventional format

### Manual Enforcement

1. **Code Review**
   - Two approvals required
   - Quality checklist must be completed
   - Architecture review for new patterns

2. **Sprint Retrospectives**
   - Review quality metrics
   - Discuss process improvements
   - Update standards as needed

## Migration Strategy

### Phase 1: Stop the Bleeding (Immediate)
- Enforce build checks on all new code
- Document all existing duplications
- Prevent new duplications

### Phase 2: Consolidate Types (Sprint 7)
- Audit all type definitions
- Create migration plan
- Implement centralized types

### Phase 3: Clean Technical Debt (Sprint 8)
- Remove all duplicate code
- Consolidate similar functions
- Update all documentation

## Tools & Scripts

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

## Conclusion

Quality is not optional. These standards prevent the accumulation of technical debt that makes projects unmaintainable. By following these guidelines, we ensure that our codebase remains clean, consistent, and scalable.

Remember: **It's faster to do it right the first time than to fix it later.**