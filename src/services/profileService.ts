import { apiGet } from "@/lib/apiClient";
import type { ProfileData, ProfileResponse } from "@/types/member";
import { getAuthInfo } from "@/utils/cookies";

/**
 * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
 *
 * @param token - 선택사항. 인증 토큰. 클라이언트 컴포넌트에서는 제공되지 않으면 쿠키에서 가져옵니다.
 * @returns 프로필 정보 객체
 * @throws 인증 정보가 없거나 API 요청이 실패할 경우
 *
 * @example
 * // 클라이언트 컴포넌트에서 (자동으로 쿠키에서 토큰 가져옴)
 * const profile = await getMyProfile();
 * console.log(profile.nickname); // "이승현"
 *
 * @example
 * // 서버 컴포넌트에서 토큰을 명시적으로 전달하는 경우
 * const token = await getServerAuthToken();
 * const profile = await getMyProfile(token);
 */
export const getMyProfile = async (token?: string): Promise<ProfileData> => {
  try {
    let authToken = token;

    // 토큰이 없을 경우, 클라이언트 환경에서만 쿠키에서 가져오기
    if (!authToken && typeof document !== "undefined") {
      const { token: clientToken } = getAuthInfo();
      authToken = clientToken || undefined;
    }

    if (!authToken) {
      throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const data = await apiGet<ProfileResponse>("/api/v1/profiles/me", {}, authToken);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};
