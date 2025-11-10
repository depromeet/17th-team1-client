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
  cityThumbnailsArray?: Record<number, string[]>,
): TravelPattern[] => {
  if (!globeData.regions || globeData.regions.length === 0) {
    return [];
  }

  // 모든 지역의 도시들을 하나로 합치기
  const allCities: CountryData[] = [];
  let colorIndex = 0;

  for (const region of globeData.regions) {
    const regionColor = REGION_COLORS[colorIndex % REGION_COLORS.length];

    for (const { countryCode, cityId, name, lat, lng } of region.cities) {
      const countryName = getCountryName(countryCode);
      const thumbnailUrl = cityThumbnails?.[cityId];
      const thumbnails = cityThumbnailsArray?.[cityId];

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

  // 하나의 패턴으로 반환
  return [
    {
      title: "나의 여행 기록",
      subtitle: `${globeData.cityCount}개 도시, ${globeData.countryCount}개 국가`,
      countries: allCities,
    },
  ];
};
