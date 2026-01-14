# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber - 핵심 개발 규칙

## 1. 일반
- 모든 상호작용은 한국어, 코드 주석/문서는 영어 사용
- git commit/push 자동 실행 금지, 명시적 요청 시만 스테이징

## 2. 코드 스타일
- 타입: `type`만 사용, `any` 금지
- 함수: 화살표 함수만 사용, 반환타입 명시 생략
- 컴포넌트: 화살표 함수, `'use client'` 필수, map key는 id, 구조분해 필수
- 네이밍: PascalCase(컴포넌트/타입), camelCase(함수/변수), UPPER_SNAKE_CASE(상수)
- import 경로: 같은 폴더는 `./`, 외부는 `@/` 사용

## 3. 품질/아키텍처
- 3회 이상 반복 전 추상화 금지
- 유효성 검사는 API/입력 경계에서만
- 불필요 코드/주석 즉시 제거
- Early return 패턴, const 우선, var 금지
- 옵셔널체이닝(`?.`)/nullish 병합(`??`) 적극 사용
- 모든 컴포넌트 셀프클로징

## 4. 프로젝트 특화 규칙 (🔴 CRITICAL)

### 환경변수
```bash
# Server-side only (API routes)
GOOGLE_MAPS_API_KEY=your_key_here

# Client-side (browser accessible)
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```
- 환경변수는 `config/env.ts`에서 중앙 관리
- 클라이언트/서버 패턴 혼용 금지

### SSR 호환성
- Globe.gl 등 SSR 비호환 라이브러리: `dynamic(() => import(...), { ssr: false })`
- `window` 객체 접근 전 가드 추가: `if (typeof window === "undefined") return;`

### 컴포넌트 패턴
- 명령형 API 필요 시 `forwardRef` + `useImperativeHandle` 사용
- HEIC 이미지: heic2any 통합 사용 필수

---

# Quick Reference

| 항목 | 값 |
| --- | --- |
| **Framework** | Next.js 15.5.2, React 19.1.0, TypeScript (strict) |
| **Package Manager** | pnpm |
| **Linting** | ESLint + Prettier |
| **Styling** | TailwindCSS v4, CVA, clsx |
| **State** | Zustand, TanStack React Query |
| **3D Graphics** | Globe.gl, React-Globe.gl, Three.js |
| **Image Processing** | EXIFR, HEIC2ANY |
| **Deployment** | Docker (standalone output) |

---

# Rule Files Structure

| 파일 | 설명 |
| --- | --- |
| `instructions.md` | 핵심 규칙 요약, 프로젝트 개요 |
| `code_conventions.md` | 네이밍, 코드 스타일, JSDoc 규칙 |
| `api_conventions.md` | API 호출, Service 레이어, 타입 규칙 |
| `hooks_guide.md` | 커스텀 훅 작성 및 최적화 규칙 |
| `project_structure.md` | 디렉토리 구조 및 파일 배치 규칙 |
| `design_system.md` | 색상, 간격, CVA 사용 규칙 |
| `tailwind_conventions.md` | Tailwind CSS 작성 규칙 |

---

# Development Commands

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Code quality
pnpm lint       # ESLint lint
pnpm lint:fix   # ESLint with --fix
pnpm format     # Prettier format

# Token building
pnpm tokens:build
```

---

# Known Technical Debt

### High Priority
1. **환경변수 일관성** - `layout.tsx`, `places/route.ts`, `geocode/route.ts` 파일 점검
2. **API 입력 검증** - API routes에 Zod validation 추가 필요
3. **Error Boundaries** - React Error Boundary 추가 필요

### Architecture Improvements
- `useGlobeState.ts` 리팩토링 (169줄, 분리 필요)
- 상수 파일 중복 제거 (zoom configurations)

---

# Common Issues & Solutions

### "Globe not rendering"
- `dynamic(() => import("react-globe.gl"), { ssr: false })` 확인
- window 객체 가드 확인
- 컨테이너 dimensions 확인

### "HEIC images not processing"
- heic2any import: `const { default: heic2any } = await import("heic2any")`
- file type 검사: `file.type.toLowerCase().includes("heic")`

### "Google Maps API errors"
- 환경변수 패턴 확인 (client vs server)
- API key 서비스 활성화 확인
- lat/lng 파라미터 검증
