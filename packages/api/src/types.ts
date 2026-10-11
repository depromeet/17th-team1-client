/** 인증 관련 저장소(쿠키, SecureStore 등)에서 읽은 값 */
export interface AuthInfo {
  token: string | null;
  memberId: string | null;
  uuid: string | null;
}

/**
 * 인증 정보를 지우는 사유
 * - logout: 사용자가 로그아웃함 (인증 관련 값만 삭제)
 * - invalid-token: 토큰이 없거나 만료되어 세션을 정리함 (저장된 값 전체 삭제)
 */
export type ClearAuthReason = "logout" | "invalid-token";

/** Next.js `cookies()` 등 서버 쿠키 스토어가 만족하는 최소 형태 */
export interface ServerCookies {
  get(name: string): { value: string } | undefined;
}

/**
 * 플랫폼(웹/앱)마다 다른 동작을 주입하기 위한 어댑터.
 * - 웹: 쿠키 + window.location + sessionStorage
 * - 앱: SecureStore + 네비게이션/딥링크
 */
export interface PlatformAdapter {
  /** 서버(SSR) 환경 여부. 서버에서는 전역 에러 리다이렉트를 하지 않습니다. */
  isServer(): boolean;
  /** 저장된 인증 정보를 반환합니다. (SecureStore 등 비동기 저장소를 위해 Promise 허용) */
  getAuthInfo(): AuthInfo | Promise<AuthInfo>;
  clearAuth(reason: ClearAuthReason): void | Promise<void>;
  /** 로그인 게이트 등 외부 URL 이동 */
  redirectTo(url: string): void;
  /** 클라이언트에서 401/500 응답을 받았을 때의 전역 처리 (에러 페이지 이동 등) */
  onGlobalError?(status: number): void;
  /** 사용자가 정렬한 사진 순서(photoCode -> index). 없으면 null */
  getSavedPhotoOrder?(diaryId: number): Record<string, number> | null;
}

export interface ApiConfig {
  baseUrl: string;
  /** 이미지 키(photoCode) 앞에 붙는 S3 베이스 URL (끝에 `/` 포함) */
  s3BaseUrl: string;
  platform: PlatformAdapter;
}
