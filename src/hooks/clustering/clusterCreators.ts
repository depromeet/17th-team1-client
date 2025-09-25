import { getContinent, getCountryName } from "@/constants/countryMapping";
import type { ClusterData, CountryData } from "./types";

/**
 * 기획 요구사항에 맞는 클러스터링 시스템:
 * 1. 국가별 클러스터: "몽골 5", "터키에 5" 형태
 * 2. 대륙별 클러스터: "유럽 +11" 형태
 * 3. 클릭으로만 확장/축소 제어 (줌 레벨 무관)
 */

// 대륙별 클러스터링 - 기획서에 맞게 수정: "유럽 +11" 형태
export const createContinentClusters = (locations: CountryData[]): ClusterData[] => {
  const continentGroups = new Map<string, CountryData[]>();

  // 대륙별로 그룹핑
  locations.forEach((location) => {
    const continent = getContinent(location.id);
    if (!continentGroups.has(continent)) {
      continentGroups.set(continent, []);
    }
    continentGroups.get(continent)!.push(location);
  });

  // 각 대륙을 하나의 클러스터로 생성
  return Array.from(continentGroups.entries()).map(([continent, items]) => {
    const centerLat = items.reduce((sum, item) => sum + item.lat, 0) / items.length;
    const centerLng = items.reduce((sum, item) => sum + item.lng, 0) / items.length;
    const countryIds = [...new Set(items.map((item) => item.id))];
    const countryCount = countryIds.length;

    return {
      id: `continent_${continent}`,
      name: countryCount > 1 ? `${continent} +${countryCount}` : continent,
      flag: items[0].flag,
      lat: centerLat,
      lng: centerLng,
      color: items[0].color,
      items,
      count: items.length,
      clusterType: "continent_cluster" as const,
    };
  });
};

// 국가별 클러스터링 - 기획서에 맞게 수정: "몽골 5", "터키에 5" 형태
export const createCountryClusters = (locations: CountryData[]): ClusterData[] => {
  const countryGroups = new Map<string, CountryData[]>();

  // 국가별로 그룹핑
  locations.forEach((location) => {
    const countryId = location.id;
    if (!countryGroups.has(countryId)) {
      countryGroups.set(countryId, []);
    }
    countryGroups.get(countryId)!.push(location);
  });

  // 각 국가를 하나의 클러스터로 생성
  return Array.from(countryGroups.entries()).map(([countryId, items]) => {
    const centerLat = items.reduce((sum, item) => sum + item.lat, 0) / items.length;
    const centerLng = items.reduce((sum, item) => sum + item.lng, 0) / items.length;
    const countryName = getCountryName(countryId);
    const cityCount = items.length;

    return {
      id: `country_${countryId}`,
      name: countryName,
      flag: items[0].flag,
      lat: centerLat,
      lng: centerLng,
      color: items[0].color,
      items,
      count: items.length,
      clusterType: "country_cluster" as const,
    };
  });
};

// 개별 도시 클러스터 생성
export const createIndividualCityClusters = (locations: CountryData[]): ClusterData[] => {
  return locations.map((location) => ({
    id: `${location.id}_${location.lat}_${location.lng}`,
    name: location.name,
    flag: location.flag,
    lat: location.lat,
    lng: location.lng,
    color: location.color,
    items: [location],
    count: 1,
    clusterType: "individual_city" as const,
  }));
};
