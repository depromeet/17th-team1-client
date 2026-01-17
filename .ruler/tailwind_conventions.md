# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber Tailwind CSS 핵심 규칙

1. 표준 Tailwind 클래스 우선 사용, 임의 값 `[]` 최소화
2. `cn()` 유틸리티로 조건부 클래스 병합
3. CVA로 컴포넌트 변형 관리
4. 모바일 퍼스트: 기본 스타일 -> `sm:`, `md:`, `lg:` 순서

## 표준 문법 규칙

| 항목 | ✅ 허용 (Good) | ❌ 금지 (Bad) |
| --- | --- | --- |
| **크기** | `w-36`, `h-20`, `p-4` | `w-[36px]`, `h-[20px]` |
| **색상** | `bg-gray-800`, `text-white` | `bg-[#1f2937]` (토큰 있을 때) |
| **둥글기** | `rounded-lg`, `rounded-2xl` | `rounded-[12px]` |
| **그림자** | `shadow-lg`, `shadow-card` | `shadow-[0_0_10px]` |

## cn 사용 규칙

```typescript
// Good - 조건부 클래스에만 cn 사용
<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-blue-500",
  disabled && "opacity-40 cursor-not-allowed",
  className
)} />

// Bad - 단순 문자열에 cn 불필요
<div className={cn("flex items-center gap-2")} />

// Good - 직접 문자열 사용
<div className="flex items-center gap-2" />
```

## CVA 사용 규칙

1. `cva()` 첫 인자: 일반 문자열 (백틱 금지)
2. 변형(variants): 명확한 이름 사용
3. 기본값(defaultVariants): 항상 설정

```typescript
// Good
const styles = cva("base-class here", {
  variants: { variant: { primary: "..." } },
  defaultVariants: { variant: "primary" },
});

// Bad - 백틱 사용
const styles = cva(`base-class here`, { ... });
```

## 예외 허용 케이스

임의 값 `[]` 사용이 허용되는 경우:
1. 디자인 명세의 정확한 값 필요 시
2. Tailwind에 사전 정의되지 않은 값
3. 외부 라이브러리 CSS 변수 사용 시
