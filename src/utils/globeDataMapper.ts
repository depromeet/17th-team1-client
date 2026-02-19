import { COUNTRY_CODE_TO_FLAG, getCountryName } from "@/constants/countryMapping";
import type { GlobeData } from "@/types/member";
import type { CountryData, TravelPattern } from "@/types/travelPatterns";

// 색상 팔레트 - 지역별 색상 할당
const REGION_COLORS = [
  "#e91e63", // 핑크
  "#9c27b0", // 퍼플
  "#673ab7", // 딥퍼플
  "#3f51b5", // 인디고
  "#2196f3", // 블루
  "#00bcd4", // 시안
  "#4caf50", // 그린
  "#ff9800", // 오렌지
  "#f44336", // 레드
  "#795548", // 브라운
];

// GlobeData를 하나의 TravelPattern으로 변환 (모든 국가를 한번에 표시)
export const mapGlobeDataToTravelPatterns = (
  globeData: GlobeData,
  cityThumbnails?: Record<number, string>,
  cityThumbnailsArray?: Record<number, string[]>
): TravelPattern[] => {
  if (!globeData.regions || globeData.regions.length === 0) return [];

  // 모든 지역의 도시들을 하나로 합치기
  const allCities: CountryData[] = [];
  // 국가별 도시 정보 집계 (city_count 계산용)
  // TODO: 백엔드에서 도시별 updatedAt이 추가되면 countryStats에도 updatedAt 포함시켜야 함
  const countryStats = new Map<
    string,
    {
      cityCount: number;
    }
  >();

  let colorIndex = 0;

  for (const region of globeData.regions) {
    const regionColor = REGION_COLORS[colorIndex % REGION_COLORS.length];

    for (const { countryCode, cityId, name, lat, lng } of region.cities) {
      const countryName = getCountryName(countryCode);
      const thumbnailUrl = cityThumbnails?.[cityId];
      const thumbnails = cityThumbnailsArray?.[cityId];

      // 국가별 도시 수 집계
      if (!countryStats.has(countryCode)) {
        countryStats.set(countryCode, { cityCount: 0 });
      }
      const stats = countryStats.get(countryCode);
      if (stats) {
        stats.cityCount += 1;
      }

      allCities.push({
        id: countryCode,
        name: `${name}, ${countryName}`, // "도시명, 국가명" 형식으로 저장
        flag: COUNTRY_CODE_TO_FLAG[countryCode] || "🌍",
        lat,
        lng,
        color: regionColor,
        hasRecords: !!thumbnailUrl, // 썸네일이 있으면 기록이 있는 것으로 간주
        thumbnailUrl, // 도시별 최신 사진 썸네일 (없으면 undefined)
        thumbnails, // 도시별 썸네일 배열 (최대 2개, 최신순)
        cityId, // API에서 제공하는 도시 ID
      });
    }

    colorIndex++;
  }

  // 국가별로 city_count를 추가
  // NOTE: updatedAt은 백엔드에서 도시별 기록 시간이 제공될 때까지 설정하지 않음
  // 현재 각 도시의 updatedAt이 없으므로, 동률 처리 시 updatedAt 기준이 적용되지 않음
  const countriesWithStats = allCities.map(city => {
    const countryCode = city.id;
    const countryInfo = countryStats.get(countryCode);

    return {
      ...city,
      cityCount: countryInfo?.cityCount || 1,
      // TODO: 백엔드에서 GlobeCity에 updatedAt 필드가 추가되면
      // 여기서 "국가별 최신 updatedAt"을 계산하여 설정해야 함
      // 예: updatedAt: city.updatedAt || new Date().toISOString()
    };
  });

  // 하나의 패턴으로 반환
  return [
    {
      title: "나의 여행 기록",
      subtitle: `${globeData.cityCount}개 도시, ${globeData.countryCount}개 국가`,
      countries: countriesWithStats,
    },
  ];
};
