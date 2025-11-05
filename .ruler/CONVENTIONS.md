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
