

<!-- Source: .ruler/AGENTS.md -->

# Globber Project - AI Agent Instructions

## Overview
This directory contains centralized AI agent instructions for the **Globber** project - a 3D globe-based travel visualization application built with React 19 and Next.js 15.

## Purpose
Ruler concatenates all .md files in this directory (and subdirectories), starting with AGENTS.md (if present), then remaining files in sorted order. This ensures consistent behavior across all AI coding assistants (Claude Code, GitHub Copilot, Cursor, etc.).

## Quick Reference
- **Framework**: Next.js 15.5.2, React 19.1.0, TypeScript (strict mode)
- **Package Manager**: pnpm
- **Linting**: Biome (no ESLint/Prettier)
- **Styling**: TailwindCSS v4, CVA
- **State**: Zustand, TanStack React Query
- **3D Graphics**: Globe.gl, React-Globe.gl, Three.js

## Project-Specific Rules
See `GLOBBER.md` for detailed project instructions including:
- Environment variable patterns (CRITICAL)
- Code quality standards (NO console.log, NO TODO comments)
- Component patterns (dynamic imports, forwardRef)
- File organization structure
- Known technical debt and improvement priorities



<!-- Source: .ruler/CONVENTIONS.md -->

# Globber Project - Code Conventions

## Naming Conventions

### Constants
- **Pattern**: UPPER_SNAKE_CASE
- **Example**: `SERVER_KEY`, `MAX_RETRY_COUNT`, `API_BASE_URL`

### Variables
- **Pattern**: camelCase
- **Boolean prefix**: Start with `is`, `has`, `should`
- **Examples**:
  - General: `initialValue`, `userName`, `userList`
  - Boolean: `isModalActive`, `hasPermission`, `shouldRender`

### Functions
- **Pattern**: Arrow functions with camelCase
- **Example**: `const calculateTotal = () => {}`

### Event Handler Functions
- **Pattern**: `handle[Action][Target]` or `on[Action][Target]`
- **Examples**:
  - `handleClickAlert`
  - `handleSubmitForm`
  - `onClickAlert`
  - `onChangeInput`

### Callback Functions
- **Pattern**: Start with `on` + camelCase
- **Examples**:
  - `onSuccessCallback`
  - `onErrorCallback`
  - `onComplete`

### Folders and Files
- **Folders**: kebab-case
  - Example: `react-globe`, `image-metadata`, `api-routes`
- **Files**:
  - Pages: `page.tsx`
  - Components: PascalCase (e.g., `ReactGlobe.tsx`, `ImageMetadata.tsx`)
  - Utilities: camelCase (e.g., `processFile.ts`, `formatDate.ts`)
- **Component Declaration**: PascalCase
  - Example: `const ReactGlobe = () => {}`

### Types
- **Keyword**: `type` (prefer over `interface`)
- **Pattern**: PascalCase
- **Utility Types**: Use `Partial`, `Pick`, `Omit` when appropriate
- **Separation Rules**:
  - Separate into dedicated type file when 4+ properties
  - Always separate common/shared types regardless of property count
- **Naming Patterns**:
  - Parameter types: `[Name]Params`
    - Example: `HealthInfoParams`
  - Return types: `[Name]Res` or `[Name]Response`
    - Example: `HealthInfoRes`
  - API request types: `[Method][Name]Params`
    - Example: `PutHealthInfoParams`, `GetUserDataParams`

**Example**:
```typescript
// Good
type UserParams = {
  name: string;
  age: number;
  email: string;
  address: string;
};

type GetUserDataParams = Pick<UserParams, 'name' | 'email'>;
type UserResponse = Omit<UserParams, 'address'> & { id: string };

// Bad - should be separated
const processUser = (name: string, age: number, email: string, address: string) => {};
```

## Code Organization Order

Organize code within components/files in this specific order:

1. **Imports**
   - Follow Biome import sorting rules
   - See: https://po4tion.dev/biome

2. **Prop Types / Interface Definitions**
   ```typescript
   type ReactGlobeProps = {
     countries: CountryData[];
     onSelect: (item: ClusterData) => void;
   };
   ```

3. **React Hooks**
   - `useState`, `useRef`, `useMemo`, `useCallback` (in this order)

4. **Variables**
   - `const` declarations first
   - `let` declarations second

5. **Functions**
   - Helper functions
   - Event handlers

6. **Custom Hooks / Lifecycle Hooks**
   - Custom hooks usage
   - `useEffect` calls

**Example**:
```typescript
// 1. Imports
import { useState, useEffect, useCallback } from "react";
import type { CountryData } from "@/types/clustering";

// 2. Prop Types
type ComponentProps = {
  data: CountryData[];
};

// 3. Component
const Component = ({ data }: ComponentProps) => {
  // 3. React Hooks
  const [state, setState] = useState(0);
  const ref = useRef(null);

  // 4. Variables
  const MAX_COUNT = 100;
  let tempValue = 0;

  // 5. Functions
  const calculateValue = () => {};
  const handleClick = () => {};

  // 6. Custom Hooks / Lifecycle
  const { clusteredData } = useClustering({ countries: data });

  useEffect(() => {
    // lifecycle logic
  }, []);

  return <div />;
};
```

## JSDoc Comment Conventions

Use JSDoc annotations for documentation:

- **`@param`**: Describes function parameters
- **`@returns`** (or `@return`): Describes return value
- **`@typedef`**: Defines new type
- **`@example`**: Provides usage example
- **`@deprecated`**: Marks deprecated functions

**Example**:
```typescript
/**
 * 사용자 정보를 처리하는 함수입니다.
 *
 * @param {Object} user - 처리할 사용자 정보 객체
 * @param {string} user.name - 사용자의 이름
 * @param {number} user.age - 사용자의 나이
 * @returns {string} 처리된 사용자 정보 문자열
 *
 * @typedef {Object} User
 * @property {string} name - 사용자의 이름
 * @property {number} age - 사용자의 나이
 *
 * @example
 * const userInfo = processUser({ name: '홍길동', age: 30 });
 * console.log(userInfo); // "이름: 홍길동, 나이: 30"
 *
 * @deprecated 이 함수는 향후 버전에서 제거될 예정입니다. 대신 `newProcessUser`를 사용하세요.
 */
const processUser = (user: User): string => {
  return `이름: ${user.name}, 나이: ${user.age}`;
};
```

## General Code Style Rules

### Early Return Pattern
- Use early returns to reduce nesting and improve readability
- Reference: https://velog.io/@kimmoonju-102/JS-Early-Return

**Example**:
```typescript
// Good ✅
const processData = (data: Data | null) => {
  if (!data) return null;
  if (data.isEmpty) return [];

  return processValidData(data);
};

// Bad ❌
const processData = (data: Data | null) => {
  if (data) {
    if (!data.isEmpty) {
      return processValidData(data);
    } else {
      return [];
    }
  } else {
    return null;
  }
};
```

### Ternary Operator Limit
- **Maximum nesting**: 1 level only
- For complex conditions, use if-else or separate variables

**Example**:
```typescript
// Good ✅
const label = isActive ? "Active" : "Inactive";

// Acceptable ✅
const status = isActive
  ? (isPremium ? "Premium Active" : "Basic Active")
  : "Inactive";

// Bad ❌ - too complex
const status = isActive
  ? (isPremium
      ? (hasDiscount ? "Premium with Discount" : "Premium")
      : "Basic")
  : "Inactive";
```

### Positive Naming (Avoid Negatives)
- Use positive boolean names instead of negative ones
- Makes conditional logic easier to read

**Example**:
```typescript
// Good ✅
const isEmailUsed = true;
if (isEmailUsed) { /* handle used email */ }

const isValid = true;
if (isValid) { /* proceed */ }

// Bad ❌
const isEmailNotUsed = false;
if (!isEmailNotUsed) { /* confusing */ }

const isInvalid = false;
if (!isInvalid) { /* double negative */ }
```

### Destructuring Assignment
- Always use destructuring for objects and arrays when accessing multiple properties
- Improves readability and reduces repetition

**Example**:
```typescript
// Good ✅
const { name, age, email } = user;
const [first, second, ...rest] = array;

const Component = ({ data, onSelect, isLoading }: Props) => {
  const { lat, lng, flag } = data;
};

// Bad ❌
const name = user.name;
const age = user.age;
const email = user.email;

const Component = (props: Props) => {
  const data = props.data;
  const onSelect = props.onSelect;
};
```

## Project-Specific Conventions

### React Component Patterns
- Use arrow functions for components
- Prefer `forwardRef` for imperative API exposure
- Use dynamic imports for SSR-incompatible libraries

```typescript
// Good ✅
const ReactGlobe = forwardRef<ReactGlobeRef, ReactGlobeProps>((props, ref) => {
  // implementation
});

// Dynamic import for SSR compatibility
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
```

### State Management
- Zustand for global state
- TanStack React Query for server state
- Custom hooks for complex local state

### Styling
- TailwindCSS utility classes
- CVA (Class Variance Authority) for component variants
- Mobile-first design (max-width: 512px)

### Critical Rules (from GLOBBER.md)
- **NO console.log statements** - Use proper logging or remove
- **NO TODO comments** - Complete implementation or file issue
- **Always handle HEIC conversion** - Use heic2any integration
- **Environment variables**: Follow Next.js patterns (NEXT_PUBLIC_ prefix for client-side)

## Enforcement

These conventions are enforced through:
- **Biome**: Linting and formatting (replaces ESLint/Prettier)
- **TypeScript**: Strict mode enabled
- **Code Review**: Manual review for conventions not caught by tools
- **Ruler**: Consistent AI assistant behavior across tools

Run quality checks:
```bash
pnpm check    # Biome check with --write
pnpm lint     # Biome lint
pnpm format   # Biome format
```



<!-- Source: .ruler/GLOBBER.md -->

# Globber Project - Claude Assistant Instructions

## Project Overview
**Globber**는 React 19와 Next.js 15를 기반으로 한 3D 지구본 여행 시각화 애플리케이션입니다. 사진의 EXIF 위치 정보를 추출하여 지구본에 표시하는 현대적인 웹 애플리케이션입니다.

## Architecture Context
- **Framework**: Next.js 15.5.2, React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4, CVA, clsx
- **State**: Zustand, TanStack React Query
- **3D Graphics**: Globe.gl, React-Globe.gl, Three.js
- **Image Processing**: EXIFR, HEIC2ANY
- **External APIs**: Google Maps Services
- **Tools**: Biome (linting/formatting), pnpm
- **Deployment**: Docker (standalone output)

## Critical Project-Specific Rules

### Environment Variables (🔴 CRITICAL)
```bash
# Server-side only (API routes)
GOOGLE_MAPS_API_KEY=your_key_here

# Client-side (browser accessible)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```
**Never mix these two patterns. Always validate which context needs which key.**

### Code Quality Standards
- **NO console.log statements** - Use proper logging or remove entirely
- **NO TODO comments in production code** - Complete implementation or file issue
- **Always handle HEIC image conversion** - Use existing heic2any integration
- **Maintain mobile-first design** - Max width 512px constraint

### Component Patterns to Follow
```typescript
// Dynamic import for SSR-incompatible libraries
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Custom hooks for complex state
export const useGlobeState = (patterns: TravelPattern[]) => {
  // Complex zoom/selection stack logic
};

// Proper forwardRef for imperative APIs
const ReactGlobe = forwardRef<ReactGlobeRef, ReactGlobeProps>((props, ref) => {
  // Component implementation
});
```

### File Organization Rules
- **Globe components**: `/src/components/react-globe/`
- **Image metadata**: `/src/components/image-metadata/`
- **API routes**: `/src/app/api/`
- **Custom hooks**: `/src/hooks/`
- **Constants**: `/src/constants/` (watch for duplication!)
- **Utilities**: `/src/utils/`

## Known Technical Debt

### High Priority Fixes Needed
1. **Environment Variable Consistency**
   - Files affected: `layout.tsx:30`, `places/route.ts:27,79`, `geocode/route.ts:14`
   - Problem: Inconsistent GOOGLE_MAPS_API_KEY usage
   - Action: Standardize to proper Next.js patterns

2. **Debug Artifact Cleanup**
   - Files with console.log: `useGlobeState.ts`, `useClustering.ts`, `GoogleMapsModal.tsx`, `ImageMetadata.tsx`, `places/route.ts`
   - Action: Remove all debugging statements

3. **Complete API Integration**
   - File: `src/app/page.tsx:8`
   - Problem: Hardcoded `hasGlobe` state with TODO
   - Action: Implement real API endpoint

### Architecture Improvements
- **Add React Error Boundaries** - No error handling currently
- **Refactor Complex State** - `useGlobeState.ts` is 169 lines, needs splitting
- **Consolidate Constants** - Duplicate zoom configurations between files
- **Add Input Validation** - API routes lack proper Zod validation

## Development Commands
```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Code quality
pnpm lint      # Biome lint with --write
pnpm format    # Biome format with --write
pnpm check     # Biome check with --write
pnpm ci        # Biome CI mode

# Token building (custom)
pnpm tokens:build
```

## Testing Strategy
Currently **no tests implemented**. Priority areas for testing:
- Complex state management in `useGlobeState`
- EXIF data processing in `processFile.ts`
- API route error handling
- Globe interaction behaviors

## Performance Considerations
- Globe.gl requires dynamic import (SSR incompatible)
- HEIC conversion is CPU intensive - handle async properly
- Mobile-first design for 512px viewport
- Font preloading for Pretendard implemented

## Security Notes
- API keys properly segregated (when used correctly)
- No obvious XSS vulnerabilities
- Input validation missing on API endpoints
- Consider rate limiting for Google Maps API calls

## Common Issues & Solutions

### "Globe not rendering"
- Check dynamic import is used: `{ ssr: false }`
- Verify window object access guards
- Ensure proper container dimensions

### "HEIC images not processing"
- Verify heic2any import: `const { default: heic2any } = await import("heic2any")`
- Check file type detection: `file.type.toLowerCase().includes("heic")`
- Handle blob conversion properly

### "Google Maps API errors"
- Verify correct env var for context (client vs server)
- Check API key has required services enabled
- Validate lat/lng parameters

## Architectural Decision Records
- **Globe Library Choice**: React-Globe.gl chosen for React integration over raw Globe.gl
- **Image Processing**: Client-side HEIC conversion for better UX vs server processing
- **State Management**: Custom hooks over Redux for simpler travel pattern state
- **Styling**: TailwindCSS v4 for utility-first approach with design system
- **Build Tool**: Next.js standalone output for Docker containerization

## Future Roadmap
Based on architectural analysis, prioritize:
1. Production readiness (error handling, logging)
2. Testing implementation
3. Performance monitoring
4. Enhanced documentation
5. Advanced globe interactions

---

**Last Updated**: 2025-09-24
**Architecture Score**: 7.2/10 (Good foundation, needs production prep)

## Emergency Contacts & Resources
- **Architectural Report**: `claudedocs/architectural-analysis-report.md`
- **Main Globe Component**: `src/components/react-globe/ReactGlobe.tsx`
- **State Management**: `src/hooks/useGlobeState.ts`
- **Image Processing**: `src/lib/processFile.ts`
