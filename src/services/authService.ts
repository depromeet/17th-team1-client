import { apiPost } from "@/lib/apiClient";
import { getValidatedAuthToken } from "@/utils/cookies";

type LogoutResponse = {
  status: string;
  data: string;
};

/**
 * 로그아웃을 진행합니다.
 * 서버 세션을 종료하고 클라이언트 쿠키를 삭제합니다.
 *
 * @param token - 선택사항. 인증 토큰
 * @throws 로그아웃 실패 시
 *
 * @example
 * await logout();
 */
export const logout = async (token?: string): Promise<void> => {
  try {
    const authToken = getValidatedAuthToken(token);

    // 서버에 로그아웃 요청
    await apiPost<LogoutResponse>("/logout", {}, authToken);

    // 클라이언트 쿠키 삭제
    clearAuthCookies();
  } catch (error) {
    // 로그아웃 실패 시에도 클라이언트 쿠키는 삭제
    clearAuthCookies();
    throw error;
  }
};

/**
 * 인증 관련 쿠키를 모두 삭제합니다.
 */
const clearAuthCookies = (): void => {
  if (typeof document === "undefined") return;

  const cookies = ["kakao_access_token", "member_id", "uuid"];
  const domain = window.location.hostname;

  for (const cookieName of cookies) {
    // 현재 도메인에서 삭제
    // biome-ignore lint/suspicious/noDocumentCookie: 쿠키 삭제를 위해 document.cookie에 직접 할당해야 합니다.
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // 상위 도메인에서 삭제
    // biome-ignore lint/suspicious/noDocumentCookie: 쿠키 삭제를 위해 document.cookie에 직접 할당해야 합니다.
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  }
};
