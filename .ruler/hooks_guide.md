# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber Hooks 핵심 규칙

1. 복잡한 상태 로직은 커스텀 훅으로 분리 (예: useGlobeState, useClustering)
2. 훅 네이밍: `use[Feature]` 패턴 (camelCase)
3. 훅 내부 코드 순서: useState -> useRef -> useMemo -> useCallback -> useEffect
4. 의존성 배열 명시, 불필요한 리렌더링 방지
5. 복잡한 계산은 useMemo로 최적화

## 주요 커스텀 훅

| 훅 이름 | 용도 | 위치 |
| --- | --- | --- |
| `useGlobeState` | 지구본 줌/선택 상태 관리 | `hooks/useGlobeState.ts` |
| `useClustering` | 국가/도시 클러스터링 로직 | `hooks/useClustering.ts` |
| `useImage` | 이미지 업로드/관리 | `hooks/useImage.ts` |
| `useCitySearch` | 도시 검색 기능 | `hooks/useCitySearch.ts` |
| `useGoogleMapsScript` | Google Maps 스크립트 로드 | `hooks/useGoogleMapsScript.ts` |

## 훅 작성 패턴

| 항목 | ✅ 허용 (Good) | ❌ 금지 (Bad) |
| --- | --- | --- |
| **상태 초기화** | `useState<Type>(initialValue)` | `useState<any>(...)` |
| **콜백 최적화** | `useCallback(() => {}, [deps])` | 매번 새로운 함수 생성 |
| **계산 최적화** | `useMemo(() => compute(), [deps])` | 렌더마다 재계산 |
| **부수효과** | `useEffect(() => { cleanup }, [deps])` | 클린업 함수 누락 |

## 반환 패턴

```typescript
// Good - 명확한 구조 반환
return {
  // State
  selectedCountry,
  zoomLevel,
  // Handlers
  handleCountrySelect,
  handleZoomChange,
};
```
