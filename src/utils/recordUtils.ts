import type { Continent, RecordRegion } from "@/types/record";
import { getContinent as getKoreanContinent } from "@/constants/countryMapping";

export const getContinentFromCountryCode = (countryCode: string): Continent => {
  const korean = getKoreanContinent(countryCode);
  if (korean === "북아메리카") return "북미";
  if (korean === "남아메리카") return "남미";
  if (
    korean === "아시아" ||
    korean === "유럽" ||
    korean === "아프리카" ||
    korean === "오세아니아"
  ) {
    return korean as Continent;
  }
  return "아시아";
};

export const calculateContinentStats = (
  regions: RecordRegion[]
): Record<Continent, number> => {
  const stats: Record<Continent, number> = {
    전체: 0,
    아시아: 0,
    유럽: 0,
    북미: 0,
    남미: 0,
    아프리카: 0,
    오세아니아: 0,
  };

  // 전체 도시 수 계산
  stats["전체"] = regions.reduce(
    (total, region) => total + region.cities.length,
    0
  );

  // 대륙별 도시 수 계산
  regions.forEach((region) => {
    region.cities.forEach((city) => {
      const continent = getContinentFromCountryCode(city.countryCode);
      if (continent in stats) {
        stats[continent] = (stats[continent] || 0) + 1;
      }
    });
  });

  return stats;
};

export const filterRegionsByContinent = (
  regions: RecordRegion[],
  selectedContinent: Continent
): RecordRegion[] => {
  if (selectedContinent === "전체") {
    return regions;
  }

  return regions
    .map((region) => ({
      ...region,
      cities: region.cities.filter(
        (city) =>
          getContinentFromCountryCode(city.countryCode) === selectedContinent
      ),
      cityCount: 0, // 필터링 후 다시 계산
    }))
    .map((region) => ({
      ...region,
      cityCount: region.cities.length,
    }))
    .filter((region) => region.cities.length > 0);
};

export const sortContinentsByCount = (
  continentStats: Record<Continent, number>
): Continent[] => {
  const allContinents: Continent[] = [
    "전체",
    "아시아",
    "유럽",
    "북미",
    "남미",
    "아프리카",
    "오세아니아",
  ];

  return allContinents.sort((a, b) => continentStats[b] - continentStats[a]);
};
