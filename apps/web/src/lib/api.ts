import { createApi, type PlatformAdapter } from "@globber/api";
import { buildErrorPagePath, toErrorTypeFromStatus } from "@globber/shared/utils/errorType";

import { env } from "@/config/env";
import { clearAllCookies, clearAuthCookies, getAuthInfo } from "@/utils/cookies";

/**
 * 웹(Next.js) 플랫폼 어댑터
 * - 인증 정보: 쿠키
 * - 전역 에러: 클라이언트에서 에러 페이지로 이동
 * - 사진 순서: sessionStorage
 */
const webPlatform: PlatformAdapter = {
  isServer: () => typeof window === "undefined",
  getAuthInfo,
  clearAuth: reason => {
    if (reason === "logout") clearAuthCookies();
    else clearAllCookies();
  },
  redirectTo: url => {
    window.location.href = url;
  },
  onGlobalError: status => {
    const errorType = toErrorTypeFromStatus(status);

    if (errorType === "401" || errorType === "500") {
      window.location.href = buildErrorPagePath(errorType);
    }
  },
  getSavedPhotoOrder: diaryId => {
    if (typeof window === "undefined") return null;

    try {
      const savedOrder = sessionStorage.getItem(`diary-${diaryId}-photo-order`);
      return savedOrder ? (JSON.parse(savedOrder) as Record<string, number>) : null;
    } catch {
      // sessionStorage 접근 실패 시 기본 정렬 사용
      return null;
    }
  },
};

// NEXT_PUBLIC_* 는 빌드 타임에 인라인되어야 하므로 반드시 웹 앱 코드에서 직접 참조합니다.
export const api = createApi({
  baseUrl: env.API_BASE_URL,
  s3BaseUrl: process.env.NEXT_PUBLIC_S3_BASE_URL || "https://globber-dev.s3.ap-northeast-2.amazonaws.com/",
  platform: webPlatform,
});
