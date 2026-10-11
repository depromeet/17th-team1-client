import { createApiClient } from "./client";
import type { ApiConfig, ClearAuthReason } from "./types";

/** 서비스들이 공유하는 의존성 묶음 (클라이언트 + 플랫폼 어댑터 기반 헬퍼) */
export const createApiContext = (config: ApiConfig) => {
  const { platform, s3BaseUrl } = config;
  const client = createApiClient({ baseUrl: config.baseUrl, platform });

  const getAuthInfo = async () => platform.getAuthInfo();

  /**
   * 인증 토큰을 검증하고 반환합니다.
   * 토큰이 제공되지 않으면 플랫폼 저장소에서 가져옵니다.
   *
   * @throws 인증 정보가 없을 경우
   */
  const getValidatedAuthToken = async (token?: string): Promise<string> => {
    let authToken = token;

    if (!authToken) {
      const { token: storedToken } = await getAuthInfo();
      authToken = storedToken || undefined;
    }

    if (!authToken) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    return authToken;
  };

  return {
    ...client,
    platform,
    s3BaseUrl,
    getAuthInfo,
    getValidatedAuthToken,
    clearAuth: async (reason: ClearAuthReason) => platform.clearAuth(reason),
    redirectTo: (url: string) => platform.redirectTo(url),
    isServer: () => platform.isServer(),
  };
};

export type ApiContext = ReturnType<typeof createApiContext>;
