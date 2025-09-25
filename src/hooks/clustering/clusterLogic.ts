import { CLUSTERING_DISTANCE_MAP, ZOOM_LEVELS } from "@/constants/zoomLevels";
import { createContinentClusters, createCountryClusters, createIndividualCityClusters } from "./clusterCreators";
import type { ClusterData, CountryData } from "./types";

/**
 * 기획 요구사항 정리:
 * 1. 대륙 ↔ 국가 클러스터링: 줌 레벨에 따라 동적 변경
 * 2. 국가 → 도시 확장: 클릭으로만 제어 (줌 레벨 무관)
 * 3. 지구본 회전 시: 도시 모드에서 국가 모드로 자동 복귀
 *
 * 예시:
 * - 줌아웃: "유럽 +11" 대륙 클러스터 표시
 * - 줌인: "몽골 5", "터키에 5" 국가 클러스터 표시
 * - 국가 클릭: "이스탄불", "앙카라" 도시 개별 표시
 * - 지구본 회전: 도시 → 국가 자동 복귀
 */

// 회전 감지를 위한 유틸리티 함수
export const calculateRotationDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const latDiff = Math.abs(lat1 - lat2);
  const lngDiff = Math.abs(lng1 - lng2);
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

// 지구본 회전 감지 임계값
export const ROTATION_THRESHOLD = 10; // 더 안정적인 회전 감지
export const AUTO_CLUSTER_DELAY = 0; // 회전 후 재클러스터링 지연 시간

// 대륙-국가 전환 줌 레벨 기준
export const CONTINENT_TO_COUNTRY_THRESHOLD = ZOOM_LEVELS.DEFAULT;
export const COUNTRY_TO_CONTINENT_THRESHOLD = ZOOM_LEVELS.DEFAULT * 1.2;

// 기획 요구사항에 맞는 새로운 클러스터링 시스템
export const clusterLocations = (
  locations: CountryData[],
  clusterDistance: number,
  currentZoomLevel: number,
  mode: "country" | "city" | "continent" = "country",
  expandedCountry: string | null = null,
): ClusterData[] => {
  if (!locations || locations.length === 0) {
    return [];
  }

  // 기획 요구사항 1: 도시 모드일 때는 클릭된 국가의 도시들만 개별 표시
  if (mode === "city" && expandedCountry) {
    const countryLocations = locations.filter((loc) => loc.id === expandedCountry);
    return createIndividualCityClusters(countryLocations);
  }

  // 기획 요구사항 2: 대륙 ↔ 국가 클러스터링은 줌 레벨에 따라 동적 변경
  if (currentZoomLevel >= ZOOM_LEVELS.DEFAULT) {
    // 디폴트 줌 이상: 대륙별 클러스터링
    return createContinentClusters(locations);
  } else {
    // 줌인 상태: 국가별 클러스터링
    return createCountryClusters(locations);
  }
};

// 현재 선택된 국가의 도시들을 개별로 표시하는 함수
export const expandCountryCities = (locations: CountryData[], countryId: string): ClusterData[] => {
  const countryLocations = locations.filter((loc) => loc.id === countryId);
  return createIndividualCityClusters(countryLocations);
};

// 국가별 클러스터링 강제 (도시 모드에서 회전 후 국가 모드로 복귀 시 사용)
export const forceCountryClustering = (locations: CountryData[]): ClusterData[] => {
  return createCountryClusters(locations);
};

// 대륙별 클러스터링 강제 (줌아웃 시 사용)
export const forceContinentClustering = (locations: CountryData[]): ClusterData[] => {
  return createContinentClusters(locations);
};

// 줌 레벨에 따른 적절한 클러스터링 타입 결정
export const getClusteringType = (
  zoomLevel: number,
  mode: "country" | "city" | "continent",
): "continent" | "country" | "city" => {
  if (mode === "city") {
    return "city"; // 도시 모드는 클릭으로만 제어
  }

  // 대륙-국가 전환은 줌 레벨에 따라 결정
  if (zoomLevel >= CONTINENT_TO_COUNTRY_THRESHOLD) {
    return "continent";
  } else {
    return "country";
  }
};

// 대륙 클러스터 클릭 시 줌 타겟 계산
export const getContinentZoomTarget = (cluster: ClusterData): number => {
  // 대륙 클릭 시 국가 레벨로 줌인
  return ZOOM_LEVELS.DEFAULT * 0.8; // 국가별 클러스터링 레벨
};

// 국가 클러스터 클릭 시 도시 모드로 전환 (줌 레벨 변경 없음)
export const expandToCountryCities = (
  locations: CountryData[],
  countryId: string,
): { cities: ClusterData[]; shouldZoom: boolean } => {
  const countryLocations = locations.filter((loc) => loc.id === countryId);
  return {
    cities: createIndividualCityClusters(countryLocations),
    shouldZoom: false, // 기획: 국가 클릭 시 줌 변경 없이 도시들만 표시
  };
};

// 줌 레벨에 따른 클러스터링 거리 계산
export const getClusterDistance = (zoom: number): number => {
  // 기획: 대륙-국가 클러스터링은 줌 레벨에 따라 동적 변경
  // 국가-도시 확장만 클릭으로 제어
  if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_FAR];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.FAR];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.MEDIUM) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.MEDIUM];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.CLOSE];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_CLOSE];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.ZOOMED_IN) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.ZOOMED_IN];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.DETAILED) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.DETAILED];
  return 1;
};

// 기획 요구사항에 맞는 클릭 기반 확장 로직
export const shouldExpandCluster = (cluster: ClusterData): boolean => {
  // 국가 클러스터만 클릭으로 확장 가능 (대륙 클러스터는 줌으로만 확장)
  return cluster.clusterType === "country_cluster" && cluster.count > 1;
};

// 대륙 클러스터 클릭 시 줌 레벨 기반 확장 로직
export const shouldZoomToCountries = (cluster: ClusterData): boolean => {
  return cluster.clusterType === "continent_cluster";
};

// 자동 재클러스터링을 위한 회전 감지
export const isSignificantRotation = (
  currentLat: number,
  currentLng: number,
  lastLat: number,
  lastLng: number,
): boolean => {
  const rotationDistance = calculateRotationDistance(currentLat, currentLng, lastLat, lastLng);
  return rotationDistance > ROTATION_THRESHOLD;
};
