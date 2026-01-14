# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber 디자인 시스템 핵심 규칙

1. 색상, 간격, 형태는 반드시 Tailwind 토큰/유틸리티 클래스 사용 (임의 값 최소화)
2. 폰트: Pretendard Variable 사용
3. 모바일 퍼스트 디자인: 최대 너비 512px 기준
4. 컴포넌트 변형: CVA (Class Variance Authority) 사용
5. className 병합: `cn()` 유틸리티 사용 (clsx + tailwind-merge)

## 색상 토큰

| 역할 | 클래스 | 용도 |
| --- | --- | --- |
| **브랜드** | `bg-blue-theme`, `text-blue-theme` | 주요 액션, 강조 |
| **배경** | `bg-surface-primary`, `bg-surface-secondary`, `bg-surface-button-gray` | 페이지/카드/버튼 배경 |
| **텍스트** | `text-text-primary`, `text-text-secondary` | 본문, 보조 텍스트 |
| **상태** | `text-gray-400`, `text-gray-700` | 비활성/활성 상태 |

## 간격 규칙

- 기본 단위: 4px (Tailwind 기준 1)
- 컴포넌트 내부 패딩: `p-4`, `p-8`, `p-16` 등
- 컴포넌트 간 간격: `gap-4`, `gap-8`, `space-y-4` 등

## 형태 규칙

| 요소 | 클래스 | 값 |
| --- | --- | --- |
| **버튼 둥글기** | `rounded-2xl` | 16px |
| **카드 둥글기** | `rounded-lg`, `rounded-xl` | 12px, 16px |
| **입력 둥글기** | `rounded-md`, `rounded-lg` | 8px, 12px |

## CVA 사용 패턴

```typescript
// Good - CVA로 변형 관리
export const buttonVariants = cva(
  "inline-flex justify-center items-center rounded-2xl disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-blue-theme text-black",
        gray: "bg-surface-button-gray text-white",
      },
      size: {
        sm: "px-2 py-1.5 h-[30px] text-xs",
        md: "px-2.5 py-2 h-9 text-sm",
        lg: "px-3 py-4.5 h-14 text-lg font-bold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```
