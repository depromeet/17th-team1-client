import { apiGet } from "@/lib/apiClient";
import type { DiaryDetail, DiaryDetailResponse } from "@/types/diary";
import { getAuthInfo } from "@/utils/cookies";

/**
 * API 응답을 클라이언트 타입으로 변환합니다.
 *
 * @param {DiaryDetailResponse} response - API 응답 데이터
 * @returns {DiaryDetail} 변환된 diary 데이터
 */
const transformDiaryResponse = (response: DiaryDetailResponse): DiaryDetail => {
  const { data } = response;
  const { diaryId, city, text, createdAt, photos, emojis } = data;
  const { cityName, countryName, countryCode, lat, lng } = city;

  return {
    id: String(diaryId),
    city: cityName,
    country: countryName,
    countryCode,
    lat,
    lng,
    description: text,
    images: photos.map((({ url }) => url)),
    reactions: emojis.map((({ emoji, count }) => ({
      emoji,
      count,
    }))),
    date: new Date(createdAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
    }),
    location: `${cityName}, ${countryName}`,
  };
};

/**
 * 특정 여행기록의 상세 정보를 조회합니다.
 *
 * @param {string | number} diaryId - 조회할 diary의 ID
 * @param {string} [token] - 선택사항. 서버에서 전달받은 인증 토큰
 * @returns {Promise<DiaryDetail>} diary 상세 정보
 * @throws 데이터 조회 실패 시 에러 발생
 *
 * @example
 * // 서버 컴포넌트에서 사용
 * const diary = await getDiaryDetail(1, token);
 *
 * // 클라이언트 컴포넌트에서 사용
 * const diary = await getDiaryDetail(1);
 */
export const getDiaryDetail = async (diaryId: string | number, token?: string): Promise<DiaryDetail> => {
  let authToken = token;

  if (!authToken) {
    const { token: clientToken } = getAuthInfo();
    authToken = clientToken || undefined;
  }

  if (!authToken) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  try {
    const data = await apiGet<DiaryDetailResponse>(`/api/v1/diaries/${diaryId}`, {}, authToken);
    return transformDiaryResponse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`여행 기록을 불러오는데 실패했습니다: ${error.message}`);
    }
    throw new Error("여행 기록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};
