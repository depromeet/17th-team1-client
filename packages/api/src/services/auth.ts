import type { ApiContext } from "../context";

type LogoutResponse = {
  status: string;
  data: string;
};

export const createAuthService = ({ apiPost, getValidatedAuthToken, clearAuth }: ApiContext) => {
  /**
   * 로그아웃을 진행합니다.
   * 서버 세션을 종료하고 클라이언트에 저장된 인증 정보를 삭제합니다.
   *
   * @param token - 선택사항. 인증 토큰
   * @throws 로그아웃 실패 시
   *
   * @example
   * await logout();
   */
  const logout = async (token?: string): Promise<void> => {
    try {
      const authToken = await getValidatedAuthToken(token);

      // 서버에 로그아웃 요청
      await apiPost<LogoutResponse>("/logout", {}, authToken);

      // 클라이언트 인증 정보 삭제
      await clearAuth("logout");
    } catch (error) {
      // 로그아웃 실패 시에도 클라이언트 인증 정보는 삭제
      await clearAuth("logout");
      throw error;
    }
  };

  return { logout };
};

export type AuthService = ReturnType<typeof createAuthService>;
