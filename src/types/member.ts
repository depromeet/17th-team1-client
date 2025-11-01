// 멤버 ID 조회 응답
export interface MemberIdResponse {
  status: string;
  data: number;
}

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
  data: {};
}

// 여행 기록 생성 API 응답
export interface CreateTravelRecordsResponse {
  status: string;
  message: string;
  data?: {
    recordsCreated?: number;
    [key: string]: unknown;
  };
}

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

export interface GlobeResponse {
  status: string;
  data: GlobeData;
}

// AI 인사이트 응답
export interface TravelInsightResponse {
  status: string;
  data: {
    title: string;
  };
}

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

export interface MemberTravelsResponse {
  status: string;
  data: MemberTravelsData;
}
