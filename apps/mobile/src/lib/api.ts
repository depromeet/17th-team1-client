import { createApi, type PlatformAdapter } from "@globber/api";
import * as Linking from "expo-linking";

import { clearSession, loadAuthInfo } from "@/auth/session";
import { env } from "@/config/env";

/**
 * 모바일 플랫폼 어댑터
 * - 인증 정보: SecureStore (Keychain/Keystore)
 * - 401 응답: 세션을 지워 로그인 화면으로 돌아가게 함
 */
const mobilePlatform: PlatformAdapter = {
  isServer: () => false,
  getAuthInfo: loadAuthInfo,
  clearAuth: () => clearSession(),
  redirectTo: url => {
    Linking.openURL(url).catch(() => undefined);
  },
  onGlobalError: status => {
    if (status === 401) {
      clearSession().catch(() => undefined);
    }
  },
};

export const api = createApi({
  baseUrl: env.API_BASE_URL,
  s3BaseUrl: env.S3_BASE_URL,
  platform: mobilePlatform,
});
