// 쿠키에서 값을 가져오는 유틸 함수
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value || null;
};

// 쿠키에서 토큰과 멤버 ID를 가져오는 함수
export const getAuthInfo = () => {
  const token = getCookie("kakao_access_token");
  const memberId = getCookie("member_id");
  const uuid = getCookie("uuid");

  return { token, memberId, uuid };
};

/**
 * 인증 토큰을 검증하고 반환합니다.
 * 토큰이 제공되지 않으면 클라이언트 환경에서 쿠키에서 가져옵니다.
 *
 * @param token - 선택사항. 인증 토큰
 * @returns 검증된 인증 토큰
 * @throws 인증 정보가 없을 경우
 */
export const getValidatedAuthToken = (token?: string): string => {
  let authToken = token;

  // 토큰이 없을 경우, 클라이언트 환경에서만 쿠키에서 가져오기
  if (!authToken && typeof document !== "undefined") {
    const { token: clientToken } = getAuthInfo();
    authToken = clientToken || undefined;
  }

  if (!authToken) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  return authToken;
};
