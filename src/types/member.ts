// 공통 Response 타입
export interface ApiResponse<T> {
  status: string;
  data: T;
}

// 멤버 ID 조회 응답
export interface MemberIdResponse extends ApiResponse<number> {}

// 여행 기록 생성 API
export interface TravelRecord {
  countryName: string;
  cityName: string;
  lat: number;
  lng: number;
  countryCode: string;
}

// 여행 기록 삭제 API 요청
export interface DeleteTravelRecord {
  countryCode: string;
  cityName: string;
  lat: number;
  lng: number;
}

// 여행 기록 삭제 API 응답
export interface DeleteTravelRecordsResponse {
  status: string;
  data: Record<string, never>;
}

// 여행 기록 생성 API 응답
export interface CreateTravelRecordsData {
  recordsCreated: number;
  message: string;
}

export interface CreateTravelRecordsResponse extends ApiResponse<CreateTravelRecordsData> {}

// 지구본 조회 API 응답
export interface GlobeData {
  cityCount: number;
  countryCount: number;
  regions: Region[];
}

export interface Region {
  regionName: string;
  cityCount: number;
  cities: GlobeCity[];
}

export interface GlobeCity {
  name: string;
  lat: number;
  lng: number;
  countryCode: string;
}

export interface GlobeResponse extends ApiResponse<GlobeData> {}

// AI 인사이트 응답
export interface TravelInsightData {
  title: string;
}

export interface TravelInsightResponse extends ApiResponse<TravelInsightData> {}

// 멤버 여행 데이터 조회 응답
export interface MemberTravelCity {
  cityId: number;
  cityName: string;
  countryName: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export interface MemberTravel {
  cities: MemberTravelCity[];
}

export interface MemberTravelsData {
  memberId: number;
  travels: MemberTravel[];
}

export interface MemberTravelsResponse extends ApiResponse<MemberTravelsData> {}

// 프로필 정보 타입
export interface ProfileData {
  memberId: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  authProvider: string;
}

// 프로필 조회 API 응답
export interface ProfileResponse extends ApiResponse<ProfileData> {}

// S3 업로드 URL 요청 데이터
export interface S3UploadUrlParams {
  uploadType: string;
  resourceId: number;
  fileName: string;
  contentType: string;
}

// S3 업로드 URL 응답 데이터
export interface S3UploadUrlData {
  presignedUrl: string;
  s3Key: string;
}

export interface S3UploadUrlResponse extends ApiResponse<S3UploadUrlData> {}
