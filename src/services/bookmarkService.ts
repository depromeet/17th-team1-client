import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import type { BookmarkListResponse, BookmarkUser } from "@/types/bookmark";
import { getAuthInfo } from "@/utils/cookies";

/**
 * 북마크된 사용자 목록을 조회합니다.
 *
 * @param {string} [token] - 선택사항. 서버에서 전달받은 인증 토큰
 * @returns {Promise<BookmarkUser[]>} 북마크된 사용자 목록
 * @throws 데이터 조회 실패 시 에러 발생
 *
 * @example
 * // 서버 컴포넌트에서 사용
 * const bookmarks = await getBookmarks(token);
 *
 * // 클라이언트 컴포넌트에서 사용
 * const bookmarks = await getBookmarks();
 */
export const getBookmarks = async (token?: string): Promise<BookmarkUser[]> => {
  let authToken = token;

  if (!authToken) {
    const { token: clientToken } = getAuthInfo();
    authToken = clientToken || undefined;
  }

  if (!authToken) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  try {
    const data = await apiGet<BookmarkListResponse>(`/api/v1/bookmarks`, {}, authToken);
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`북마크 목록을 불러오는데 실패했습니다: ${error.message}`);
    }
    throw new Error("북마크 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};

/**
 * 사용자를 북마크에 추가합니다.
 *
 * @param {number} targetMemberId - 북마크할 멤버의 ID
 * @returns {Promise<void>}
 * @throws 북마크 추가 실패 시 에러 발생
 *
 * @example
 * await addBookmark(123);
 */
export const addBookmark = async (targetMemberId: number): Promise<void> => {
  const { token } = getAuthInfo();

  if (!token) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  try {
    await apiPost(`/api/v1/bookmarks`, { targetMemberId }, token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`북마크 추가에 실패했습니다: ${error.message}`);
    }
    throw new Error("북마크를 추가하는데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};

/**
 * 사용자를 북마크에서 제거합니다.
 *
 * @param {number} targetMemberId - 북마크 제거할 멤버의 ID
 * @returns {Promise<void>}
 * @throws 북마크 제거 실패 시 에러 발생
 *
 * @example
 * await removeBookmark(123);
 */
export const removeBookmark = async (targetMemberId: number): Promise<void> => {
  const { token } = getAuthInfo();

  if (!token) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  try {
    await apiDelete(`/api/v1/bookmarks/${targetMemberId}`, token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`북마크 제거에 실패했습니다: ${error.message}`);
    }
    throw new Error("북마크를 제거하는데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};
