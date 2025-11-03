import { COUNTRY_CODE_TO_FLAG } from "@/constants/countryMapping";
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
export const mapGlobeDataToTravelPatterns = (globeData: GlobeData): TravelPattern[] => {
  if (!globeData.regions || globeData.regions.length === 0) {
    return [];
  }

  // 모든 지역의 도시들을 하나로 합치기
  const allCities: CountryData[] = [];
  let colorIndex = 0;

  for (const region of globeData.regions) {
    const regionColor = REGION_COLORS[colorIndex % REGION_COLORS.length];

    for (const city of region.cities) {
      allCities.push({
        id: city.countryCode,
        name: city.name,
        flag: COUNTRY_CODE_TO_FLAG[city.countryCode] || "🌍",
        lat: city.lat,
        lng: city.lng,
        color: regionColor,
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
