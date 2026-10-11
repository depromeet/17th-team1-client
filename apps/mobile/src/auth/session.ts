import { useSyncExternalStore } from "react";

import type { AuthInfo } from "@globber/api";
import * as SecureStore from "expo-secure-store";

// 웹 쿠키 이름과 동일하게 유지해 두 플랫폼의 개념을 맞춥니다.
const KEYS = {
  token: "kakao_access_token",
  memberId: "member_id",
  uuid: "uuid",
} as const;

type SessionState = {
  /** SecureStore에서 저장된 세션을 읽는 초기화가 끝났는지 */
  ready: boolean;
  token: string | null;
};

let state: SessionState = { ready: false, token: null };
const listeners = new Set<() => void>();

const setState = (next: SessionState) => {
  state = next;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** SecureStore에서 인증 정보를 읽습니다. (API 어댑터의 getAuthInfo 구현) */
export const loadAuthInfo = async (): Promise<AuthInfo> => {
  const [token, memberId, uuid] = await Promise.all([
    SecureStore.getItemAsync(KEYS.token),
    SecureStore.getItemAsync(KEYS.memberId),
    SecureStore.getItemAsync(KEYS.uuid),
  ]);

  return { token, memberId, uuid };
};

/** 앱 시작 시 한 번 호출해 저장된 세션을 복원합니다. */
export const restoreSession = async () => {
  try {
    const { token } = await loadAuthInfo();
    setState({ ready: true, token });
  } catch {
    setState({ ready: true, token: null });
  }
};

export const saveSession = async ({ token, memberId, uuid }: AuthInfo) => {
  if (!token) return;

  await SecureStore.setItemAsync(KEYS.token, token);
  if (memberId) await SecureStore.setItemAsync(KEYS.memberId, memberId);
  if (uuid) await SecureStore.setItemAsync(KEYS.uuid, uuid);

  setState({ ready: true, token });
};

export const clearSession = async () => {
  await Promise.all(Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key)));
  setState({ ready: true, token: null });
};

export const useSession = (): SessionState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );
