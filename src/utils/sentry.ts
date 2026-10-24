import * as Sentry from "@sentry/nextjs";

import { ApiError } from "@/lib/apiClient";

type ReportContext = {
  /** Sentry 이슈 검색/필터에 쓰이는 태그 (예: { feature: "photo_upload" }) */
  tags?: Record<string, string>;
  /** 이벤트 상세에 함께 남길 부가 정보 */
  extra?: Record<string, unknown>;
};

// 같은 에러가 mutation 캐시와 호출부 catch에서 중복 보고되지 않도록 기록
const reportedErrors = new WeakSet<object>();

// 서비스 레이어가 토큰이 없을 때 던지는 에러 메시지 (ApiError가 아닌 일반 Error)
const AUTH_MISSING_MESSAGE = "인증 정보가 없습니다";

// 4xx(인증 만료 포함)와 토큰 없음은 화면에서 처리하는 정상 흐름이므로 보고하지 않음
const shouldIgnore = (error: unknown) => {
  if (error instanceof ApiError) return error.status >= 400 && error.status < 500;
  return error instanceof Error && error.message.includes(AUTH_MISSING_MESSAGE);
};

/**
 * catch로 처리한 에러를 Sentry에 보고합니다.
 * 처리되지 않은 에러는 SDK가 자동 수집하므로, 사용자에게 alert 등으로 안내하고 끝나는 에러에 사용합니다.
 */
export const reportError = (error: unknown, context: ReportContext = {}) => {
  if (shouldIgnore(error)) return;

  if (typeof error === "object" && error !== null) {
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
  }

  Sentry.withScope(scope => {
    if (error instanceof ApiError) {
      scope.setTag("api.status", String(error.status));
      scope.setTag("api.endpoint", error.endpoint);
    }
    if (context.tags) scope.setTags(context.tags);
    if (context.extra) scope.setExtras(context.extra);
    Sentry.captureException(error);
  });
};
