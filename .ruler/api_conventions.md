# 자세한 예시/배경 설명은 src/docs/detailed-rules.md를 참고하세요.
# Globber API 핵심 규칙

1. 모든 API 요청은 `lib/apiClient.ts`의 함수 사용 (apiGet, apiPost, apiPut, apiPatch, apiDelete)
2. Service 함수는 `services/` 디렉토리에 분리, 순수 데이터만 반환
3. 환경변수는 `config/env.ts`에서 중앙 관리
4. 인증 토큰: 서버는 파라미터로 전달, 클라이언트는 `getAuthInfo()` 사용
5. 에러 처리: ApiError 클래스 사용, 401/500은 전역 리다이렉트
6. API 응답 타입: `[Name]Response` 형식, status/data 구조

## Service Layer 규칙

| 항목 | ✅ 허용 (Good) | ❌ 금지 (Bad) |
| --- | --- | --- |
| **Service 함수** | `const response = await apiGet<DiaryResponse>(...)` | `const response = await fetch(...)` |
| **데이터 반환** | `return response.data;` | `return response;` |
| **토큰 처리** | `getAuthInfo()` 또는 파라미터 | 하드코딩된 토큰 |
| **에러 메시지** | 한국어 사용자 친화적 메시지 | 기술적 에러 메시지 |

## 타입 네이밍 규칙

| 용도 | 패턴 | 예시 |
| --- | --- | --- |
| **요청 파라미터** | `[Name]Params` | `CreateDiaryParams`, `UpdateDiaryParams` |
| **API 응답** | `[Name]Response` | `DiaryDetailResponse`, `DiariesListResponse` |
| **변환된 데이터** | `[Name]Detail` | `DiaryDetail`, `CityDetail` |
