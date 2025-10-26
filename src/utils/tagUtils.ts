import type { ImageTag } from "@/types/imageMetadata";

/**
 * 선택된 태그가 없을 때 기본값 "NONE"을 반환하는 함수
 * @param selectedTag - 사용자가 선택한 태그 (null이면 선택 안함)
 * @returns 서버에 전송할 태그 값 (선택 안함이면 "NONE")
 */
export const getTagValueForServer = (selectedTag: ImageTag | null): ImageTag => {
  return selectedTag || "NONE";
};

/**
 * 서버에서 받은 태그 값을 클라이언트 상태로 변환하는 함수
 * @param serverTag - 서버에서 받은 태그 값
 * @returns 클라이언트에서 사용할 태그 값 (NONE이면 null)
 */
export const getTagValueFromServer = (serverTag: ImageTag): ImageTag | null => {
  return serverTag === "NONE" ? null : serverTag;
};
