# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber Code Conventions

## 1. Naming Conventions

| 타입 | 컨벤션 | 예시 |
| --- | --- | --- |
| **상수** | `UPPER_SNAKE_CASE` | `SERVER_KEY`, `ZOOM_LEVELS`, `API_BASE_URL` |
| **변수** | `camelCase` | `initialValue`, `userName`, `userList` |
| **Boolean** | `is/has/should` + camelCase | `isModalActive`, `hasPermission`, `shouldRender` |
| **함수** | 화살표 함수 + camelCase | `const calculateTotal = () => {}` |
| **이벤트 핸들러** | `handle[Action][Target]` | `handleClickAlert`, `handleSubmitForm` |
| **콜백** | `on` + camelCase | `onSuccessCallback`, `onComplete` |
| **폴더** | `kebab-case` | `react-globe`, `image-metadata` |
| **컴포넌트 파일** | `PascalCase` | `ReactGlobe.tsx`, `ImageMetadata.tsx` |
| **유틸 파일** | `camelCase` | `processFile.ts`, `formatDate.ts` |
| **타입** | `PascalCase` | `UserParams`, `DiaryResponse` |

## 2. Type Naming Patterns

| 용도 | 패턴 | 예시 |
| --- | --- | --- |
| **파라미터** | `[Name]Params` | `CreateDiaryParams`, `GetUserDataParams` |
| **API 응답** | `[Name]Response` | `DiaryDetailResponse`, `DiariesListResponse` |
| **변환 데이터** | `[Name]Detail` | `DiaryDetail`, `CityDetail` |

## 3. Code Organization Order

컴포넌트/파일 내 코드 순서:

1. **Imports** - ESLint import sorting 규칙 준수
2. **Prop Types** - `type ComponentProps = { ... }`
3. **React Hooks** - useState → useRef → useMemo → useCallback 순서
4. **Variables** - const 먼저, let 나중
5. **Functions** - 헬퍼 함수 → 이벤트 핸들러
6. **Custom Hooks / useEffect** - 커스텀 훅 → useEffect

## 4. Code Style Rules

### TypeScript
| 항목 | ✅ 허용 | ❌ 금지 |
| --- | --- | --- |
| 타입 선언 | `type User = { ... }` | `interface User { ... }` |
| any 사용 | `const data: KnownType` | `const data: any` |
| 함수 | `const fn = () => {}` | `function fn() {}` |

### React
| 항목 | ✅ 허용 | ❌ 금지 |
| --- | --- | --- |
| 컴포넌트 | `const MyComponent = () => {}` | `function MyComponent() {}` |
| map key | `key={item.id}` | `key={index}` |
| Props | `({ id, name }: Props)` | `(props: Props)` |

### Import 경로
| 상황 | ✅ 허용 | ❌ 금지 |
| --- | --- | --- |
| 같은 폴더 | `import A from './ComponentA'` | `import A from '@/components/ComponentA'` |
| 다른 폴더 | `import cn from '@/utils/cn'` | `import cn from '../../utils/cn'` |

## 5. General Patterns

### Early Return
```typescript
// ✅ Good
const processData = (data: Data | null) => {
  if (!data) return null;
  if (data.isEmpty) return [];
  return processValidData(data);
};
```

### Ternary Operator (1단계 중첩까지만)
```typescript
// ✅ Good
const status = isActive ? (isPremium ? "Premium" : "Basic") : "Inactive";

// ❌ Bad - 2단계 이상 중첩
const status = isActive ? (isPremium ? (hasDiscount ? "..." : "...") : "...") : "...";
```

### Destructuring
```typescript
// ✅ Good
const { name, age, email } = user;
const Component = ({ data, onSelect }: Props) => {};

// ❌ Bad
const name = user.name;
const Component = (props: Props) => { props.data };
```

## 6. Component Patterns

### Dynamic Import (SSR 비호환)
```typescript
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
```

### forwardRef (명령형 API)
```typescript
const Globe = forwardRef<GlobeRef, GlobeProps>((props, ref) => {
  useImperativeHandle(ref, () => ({ resetGlobe: () => {} }));
  return <GlobeComponent />;
});
Globe.displayName = "Globe";
```

## 7. JSDoc Conventions

```typescript
/**
 * 사용자 정보를 처리합니다.
 *
 * @param user - 처리할 사용자 정보 객체
 * @returns 처리된 사용자 정보 문자열
 * @example
 * const info = processUser({ name: '홍길동', age: 30 });
 */
const processUser = (user: User): string => {
  return `이름: ${user.name}, 나이: ${user.age}`;
};
```

## 8. Enforcement

```bash
pnpm lint       # ESLint lint
pnpm lint:fix   # ESLint with --fix
pnpm format     # Prettier format
```
