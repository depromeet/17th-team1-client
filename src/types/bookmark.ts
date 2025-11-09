import type { ApiResponse } from "@/types/api";

/**
 * 북마크된 사용자 정보
 *
 * @property {number} memberId - 멤버 ID
 * @property {string} nickname - 사용자 닉네임
 * @property {string | undefined} profileImageUrl - 프로필 이미지 URL
 * @property {boolean} bookmarked - 북마크 여부
 */
export interface BookmarkUser {
  memberId: number;
  nickname: string;
  profileImageUrl: string | undefined;
  bookmarked: boolean;
}

/**
 * 북마크 목록 조회 API 응답
 */
export interface BookmarkListResponse extends ApiResponse<BookmarkUser[]> {}
