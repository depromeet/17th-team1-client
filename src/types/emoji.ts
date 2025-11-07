import type { ApiResponse } from "@/types/api";

/**
 * 이모지 정보
 *
 * @property {string} code - 이모지 유니코드 (예: "1f600")
 * @property {string} glyph - 이모지 글리프 (예: "😀")
 * @property {number} count - 이모지 등록 횟수
 */
export type Emoji = {
  code: string;
  glyph: string;
  count: number;
};

/**
 * 이모지 등록 API 요청 파라미터
 *
 * @property {string} diaryId - 다이어리 ID
 * @property {string} code - 이모지 유니코드 (예: "1f600")
 * @property {string} glyph - 이모지 글리프 (예: "😀")
 */
export type RegisterEmojiParams = {
  diaryId: string;
  code: string;
  glyph: string;
};

/**
 * 이모지 등록 API 응답
 */
export type RegisterEmojiResponse = ApiResponse<Emoji>;
