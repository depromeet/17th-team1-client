import type { DiariesListResponse } from "@/types/diary";

const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || "https://globber-dev.s3.ap-northeast-2.amazonaws.com/";

type DiaryThumbnails = {
  cityThumbnails: Record<number, string>;
  countryThumbnails: Record<string, string>;
};

/**
 * 도시별, 국가별 최신 여행 기록의 썸네일을 찾습니다.
 *
 * @param diaryData - getDiariesByUuid로 가져온 원본 데이터
 * @returns {DiaryThumbnails} 도시별 썸네일과 국가별 썸네일
 *
 * @example
 * const { cityThumbnails, countryThumbnails } = getDiaryThumbnails(diaryData);
 * // cityThumbnails: { 123: "https://...photoCode1.jpg", 456: "https://...photoCode2.jpg" }
 * // countryThumbnails: { "KR": "https://...photoCode1.jpg", "JP": "https://...photoCode2.jpg" }
 */
export const getDiaryThumbnails = (
  diaryData: DiariesListResponse["data"]["diaryResponses"] | null,
): DiaryThumbnails => {
  if (!diaryData || !Array.isArray(diaryData)) {
    return {
      cityThumbnails: {},
      countryThumbnails: {},
    };
  }

  const cityThumbnailMap: Record<number, string> = {};
  const countryDiariesMap: Record<string, Array<{ thumbnailUrl: string; timestamp: number }>> = {};

  // 각 diaryResponse를 순회 (이미 city별로 그룹화되어 있음)
  for (const diaryResponse of diaryData) {
    const { city, diaries } = diaryResponse;

    if (!city || !diaries || !Array.isArray(diaries) || diaries.length === 0) {
      continue;
    }

    const cityId = city.cityId;
    const countryCode = city.countryCode;

    // diaries를 updatedAt 또는 createdAt 기준으로 정렬 (최신 순)
    const sortedDiaries = [...diaries].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // 내림차순 (최신 먼저)
    });

    // 사진이 있는 가장 최신 diary 찾기
    let thumbnailUrl: string | null = null;
    let latestTimestamp = 0;

    for (const diary of sortedDiaries) {
      if (diary.photos && Array.isArray(diary.photos) && diary.photos.length > 0) {
        const firstPhoto = diary.photos[0];
        if (firstPhoto.photoCode) {
          thumbnailUrl = `${S3_BASE_URL}${firstPhoto.photoCode}`;
          latestTimestamp = new Date(diary.updatedAt || diary.createdAt).getTime();
          break;
        }
      }
    }

    // 도시별 썸네일 저장
    if (thumbnailUrl) {
      cityThumbnailMap[cityId] = thumbnailUrl;

      // 국가별 diaries 수집
      if (!countryDiariesMap[countryCode]) {
        countryDiariesMap[countryCode] = [];
      }
      countryDiariesMap[countryCode].push({
        thumbnailUrl,
        timestamp: latestTimestamp,
      });
    }
  }

  // 국가별 최신 썸네일 선택
  const countryThumbnailMap: Record<string, string> = {};
  for (const [countryCode, diaries] of Object.entries(countryDiariesMap)) {
    // 타임스탬프 기준으로 정렬하여 가장 최신 것 선택
    const latest = diaries.sort((a, b) => b.timestamp - a.timestamp)[0];
    if (latest) {
      countryThumbnailMap[countryCode] = latest.thumbnailUrl;
    }
  }

  return {
    cityThumbnails: cityThumbnailMap,
    countryThumbnails: countryThumbnailMap,
  };
};
