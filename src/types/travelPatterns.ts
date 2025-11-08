export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  cityId?: number; // API에서 제공하는 도시 ID
  hasRecords?: boolean; // 해당 국가 내 1개 이상의 도시 기록 여부
  thumbnailUrl?: string; // 가장 최근에 기록된 사진 (대표 이미지)
}

export interface TravelPattern {
  title: string;
  subtitle: string;
  countries: CountryData[];
}
