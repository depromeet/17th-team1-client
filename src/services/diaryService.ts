import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import type {
  CreateDiaryParams,
  CreateDiaryResponse,
  DiariesByUuidResponse,
  DiaryData,
  DiaryDetail,
  DiaryDetailResponse,
} from "@/types/diary";
import { getAuthInfo } from "@/utils/cookies";
import { getS3UploadUrl } from "./profileService";

/**
 * API 응답을 클라이언트 타입으로 변환합니다.
 *
 * @param {DiaryDetailResponse} response - API 응답 데이터
 * @returns {DiaryDetail} 변환된 diary 데이터
 */
const transformDiaryResponse = (response: DiaryDetailResponse): DiaryDetail => {
  const { data } = response;
  const { diaryId, city, text, createdAt, photos, emojis } = data;
  const { cityId, cityName, countryName, countryCode, lat, lng } = city;

  return {
    id: String(diaryId),
    cityId,
    city: cityName,
    country: countryName,
    countryCode,
    lat,
    lng,
    description: text,
    images: photos.map(({ photoCode }) => photoCode),
    reactions: emojis.map(({ code, glyph, count }) => ({
      code,
      glyph,
      count,
    })),
    date: new Date(createdAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
    }),
    location: `${cityName}, ${countryName}`,
  };
};

/**
 * DiaryData를 DiaryDetail로 변환합니다.
 *
 * @param {DiaryData} data - 변환할 diary 데이터
 * @returns {DiaryDetail} 변환된 diary 상세 정보
 */
const transformDiaryData = (data: DiaryData): DiaryDetail => {
  const { diaryId, city, text, createdAt, photos, emojis } = data;
  const { cityId, cityName, countryName, countryCode, lat, lng } = city;

  return {
    id: String(diaryId),
    cityId,
    city: cityName,
    country: countryName,
    countryCode,
    lat,
    lng,
    description: text,
<<<<<<< HEAD
    images: photos.map(({ photoCode }) => photoCode),
=======
    images: filterValidImageUrls(photos.map(({ photoCode }) => process.env.NEXT_PUBLIC_S3_BASE_URL + photoCode)),
>>>>>>> d1e2a25 (fix: 여행기록 조회 변경된 엔드포인트 적용)
    reactions: emojis.map(({ code, glyph, count }) => ({
      code,
      glyph,
      count,
    })),
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

/**
 * 단일 이미지를 S3에 업로드합니다.
 *
 * @param file - 업로드할 이미지 파일
 * @param metadata - 이미지 메타데이터
 * @param token - 인증 토큰 (선택)
 * @returns S3 키(photoCode)
 * @throws S3 업로드 실패 시
 *
 * @example
 * const photoCode = await uploadPhotoToS3(file, metadata);
 */
export const uploadTravelPhoto = async (file: File, token?: string): Promise<string> => {
  let authToken = token;

  if (!authToken) {
    const { token: clientToken } = getAuthInfo();
    authToken = clientToken || undefined;
  }

  if (!authToken) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  const { presignedUrl, s3Key } = await getS3UploadUrl(
    {
      uploadType: "TRAVEL",
      resourceId: 0,
      fileName: file.name,
      contentType: file.type,
    },
    authToken,
  );

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
  }

  return s3Key;
};

/**
 * 여행기록을 생성합니다.
 *
 * @param params - 여행기록 생성 파라미터 (cityId, text, photos)
 * @param token - 인증 토큰 (선택)
 * @returns 생성된 여행기록 ID
 * @throws API 요청 실패 시
 *
 * @example
 * const diaryId = await createDiary({
 *   cityId: 123,
 *   text: "즐거운 여행이었습니다!",
 *   photos: [...]
 * });
 */
export const createDiary = async (params: CreateDiaryParams, token?: string): Promise<number> => {
  let authToken = token;

  if (!authToken) {
    const { token: clientToken } = getAuthInfo();
    authToken = clientToken || undefined;
  }

  if (!authToken) {
    throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
  }

  const response = await apiPost<CreateDiaryResponse>("/api/v1/diaries", params, authToken);

  return response.data.diaryId;
};

/**
 * UUID로 특정 사용자의 모든 여행기록을 조회합니다.
 *
 * @param {string} uuid - 조회할 사용자의 UUID
 * @param {string} [token] - 선택사항. 서버에서 전달받은 인증 토큰
 * @returns {Promise<DiaryDetail[]>} diary 목록
 * @throws 데이터 조회 실패 시 에러 발생
 *
 * @example
 * // 서버 컴포넌트에서 사용
 * const diaries = await getDiariesByUuid(uuid, token);
 *
 * // 클라이언트 컴포넌트에서 사용
 * const diaries = await getDiariesByUuid(uuid);
 */
export const getDiariesByUuid = async (uuid: string, token?: string): Promise<DiaryDetail[]> => {
  try {
<<<<<<< HEAD
    const response = await apiGet<DiariesByUuidResponse>(`/api/v1/diaries?uuid=${uuid}`, {}, token);
    return response.data.diaryResponses.map((diaryData) => transformDiaryData(diaryData));
=======
    const response = await apiGet<DiariesByUuidResponse>(`/api/v1/diaries?uuid=${uuid}`, {}, authToken);
    // 각 DiaryResponse의 diaries 배열을 순회하며 변환
    return response.data.diaryResponses.flatMap((diaryResponse) =>
      diaryResponse.diaries.map((diaryData) => transformDiaryData(diaryData)),
    );
>>>>>>> d1e2a25 (fix: 여행기록 조회 변경된 엔드포인트 적용)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`여행 기록을 불러오는데 실패했습니다: ${error.message}`);
    }
    throw new Error("여행 기록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};

/**
 * 여행기록을 삭제합니다.
 *
 * @param {string | number} diaryId - 삭제할 diary의 ID
 * @param {string} [token] - 선택사항. 서버에서 전달받은 인증 토큰
 * @returns {Promise<void>}
 * @throws 데이터 삭제 실패 시 에러 발생
 *
 * @example
 * // 클라이언트 컴포넌트에서 사용
 * await deleteDiary(1);
 */
export const deleteDiary = async (diaryId: string | number, token?: string): Promise<void> => {
  try {
    await apiDelete(`/api/v1/diaries/${diaryId}`, undefined, token);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`여행 기록 삭제에 실패했습니다: ${error.message}`);
    }
    throw new Error("여행 기록 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};
