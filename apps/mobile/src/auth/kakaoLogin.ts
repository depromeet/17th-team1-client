import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { saveSession } from "./session";

import { env } from "@/config/env";
import { api } from "@/lib/api";

type KakaoLoginResult = { ok: true; firstLogin: boolean } | { ok: false; reason: "cancel" | "invalid-response" };

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * 카카오 로그인 (백엔드 OAuth + 딥링크 방식)
 *
 * 1. 시스템 인앱 브라우저로 백엔드 OAuth 시작 URL을 연다
 * 2. 백엔드가 `redirect_uri`(앱 딥링크)에 accessToken 등을 붙여 되돌려 준다
 * 3. 토큰을 SecureStore에 저장한다 (웹의 /login/oauth/success route와 같은 역할)
 *
 * ⚠️ 백엔드가 앱 스킴(`globber://`)을 redirect_uri로 허용해야 동작합니다.
 *    (docs/mobile/backend-questions.md 1-1 참고)
 */
export const loginWithKakao = async (): Promise<KakaoLoginResult> => {
  const redirectUri = Linking.createURL("oauth/success");
  const authUrl = `${env.API_BASE_URL}/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success") {
    return { ok: false, reason: "cancel" };
  }

  const { queryParams } = Linking.parse(result.url);
  const rawToken = firstParam(queryParams?.accessToken as string | string[] | undefined);

  if (!rawToken) {
    return { ok: false, reason: "invalid-response" };
  }

  const token = rawToken.startsWith("Bearer ") ? rawToken.substring(7) : rawToken;
  const uuid = firstParam(queryParams?.uuid as string | string[] | undefined) ?? null;
  const firstLogin = firstParam(queryParams?.firstLogin as string | string[] | undefined) === "true";

  // 멤버 ID 조회에 실패해도 토큰은 저장하고 진행 (웹과 동일한 동작)
  let memberId: string | null = null;
  try {
    memberId = String(await api.member.getMemberId(token));
  } catch {
    memberId = null;
  }

  await saveSession({ token, memberId, uuid });

  return { ok: true, firstLogin };
};
