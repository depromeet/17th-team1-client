import type { GlobeInstance } from "globe.gl";
import { getContinent } from "@/constants/countryMapping";
import { CLUSTERING_DISTANCE_MAP, CONTINENT_CLUSTERING, ZOOM_LEVELS } from "@/constants/zoomLevels";
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
 * - 국가 클릭: "이스탄불", "앙카라" 개별 표시
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

const calculateDynamicTextWidth = (text: string, fontSize: number): number => {
  let totalWidth = 0;
  const koreanCharRegex = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]/;
  const koreanWidth = fontSize; // 한글은 폰트 크기와 거의 동일한 너비
  const asciiWidth = fontSize * 0.6; // 숫자, 특수문자, 공백 등은 너비가 더 좁음

  for (const char of text) {
    if (koreanCharRegex.test(char)) {
      totalWidth += koreanWidth;
    } else {
      totalWidth += asciiWidth;
    }
  }
  return totalWidth;
};

const estimateBubbleWidth = (cluster: ClusterData): number => {
  const flagWidth = 24;
  const gap = 5;

  if (cluster.clusterType === "continent_cluster") {
    const fontSize = 16;
    const textWidth = calculateDynamicTextWidth(cluster.name, fontSize);
    const padding = 16 * 2;
    return textWidth + flagWidth + padding + gap;
  }

  if (cluster.clusterType === "country_cluster") {
    const fontSize = 15;
    const textWidth = calculateDynamicTextWidth(cluster.name, fontSize);
    const padding = 12 * 2;
    const countBadgeWidth = cluster.count > 1 ? 20 : 0;
    const badgeGap = cluster.count > 1 ? gap : 0;
    return textWidth + flagWidth + padding + countBadgeWidth + badgeGap;
  }

  // Default/individual_city
  const fontSize = 15;
  const textWidth = calculateDynamicTextWidth(cluster.name, fontSize);
  const padding = 6 * 2;
  return textWidth + flagWidth + padding + gap;
};

// 기획 요구사항에 맞는 새로운 클러스터링 시스템
export const clusterLocations = (
  locations: CountryData[],
  _clusterDistance: number,
  _currentZoomLevel: number,
  globeRef: React.RefObject<GlobeInstance | null>,
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

  // globeRef가 없거나 getScreenCoords 함수가 준비되지 않았으면 기본 클러스터링
  if (!globeRef.current || typeof globeRef.current.getScreenCoords !== 'function') {
    return createCountryClusters(locations);
  }

  // Globe가 준비되었지만 첫 번째 좌표 변환이 실패하면 잠시 대기
  try {
    const testPos = globeRef.current.getScreenCoords(0, 0);
    if (!testPos || typeof testPos.x !== 'number' || typeof testPos.y !== 'number') {
      return createCountryClusters(locations);
    }
  } catch (error) {
    return createCountryClusters(locations);
  }

  const globe = globeRef.current;
  const countryClusters = createCountryClusters(locations);
  

  const clustersWithPos = countryClusters.map((cluster) => {
    const screenPos = globe.getScreenCoords(cluster.lat, cluster.lng);
    const bubbleWidth = estimateBubbleWidth(cluster);
    
    return {
      ...cluster,
      screenPos,
      width: bubbleWidth,
      // 실제 버블 크기만 사용 (패딩 제거로 더 엄격한 겹침 감지)
      effectiveWidth: bubbleWidth * 0.8, // 버블 크기의 80%만 사용해서 더 엄격하게
    };
  });


  const processedIds = new Set<string>();
  const finalClusters: ClusterData[] = [];
  let overlappingGroupsFound = 0;

  // 향상된 겹침 감지 및 대륙 클러스터링 로직
  for (let i = 0; i < clustersWithPos.length; i++) {
    const startCluster = clustersWithPos[i];
    if (processedIds.has(startCluster.id)) {
      continue;
    }

    // BFS로 겹치는 모든 클러스터 찾기
    const overlappingClusters = [startCluster];
    const queue = [startCluster];
    processedIds.add(startCluster.id);

    let head = 0;
    while (head < queue.length) {
      const currentCluster = queue[head++];

      for (let j = 0; j < clustersWithPos.length; j++) {
        const candidateCluster = clustersWithPos[j];
        if (processedIds.has(candidateCluster.id)) {
          continue;
        }

        // 개선된 겹침 감지 로직
        const distance = Math.hypot(
          currentCluster.screenPos.x - candidateCluster.screenPos.x,
          currentCluster.screenPos.y - candidateCluster.screenPos.y,
        );
        
        // 더 엄격한 겹침 판단: 두 버블이 실제로 많이 겹칠 때만 클러스터링
        const overlapThreshold = (currentCluster.effectiveWidth + candidateCluster.effectiveWidth) * 0.4;

        if (distance < overlapThreshold) {
          
          processedIds.add(candidateCluster.id);
          queue.push(candidateCluster);
          overlappingClusters.push(candidateCluster);
        }
      }
    }

    // 겹치는 클러스터가 2개 이상이면 대륙별로 그룹핑
    if (overlappingClusters.length > 1) {
      overlappingGroupsFound++;
      
      const continentGroups = new Map<string, typeof overlappingClusters>();

      // 겹치는 국가들을 대륙별로 분류
      overlappingClusters.forEach((cluster) => {
        // 국가 클러스터에 여러 도시가 있을 수 있으므로 첫 번째 항목의 대륙을 기준으로 함
        const continent = getContinent(cluster.items[0].id);
        if (!continentGroups.has(continent)) {
          continentGroups.set(continent, []);
        }
        continentGroups.get(continent)!.push(cluster);
      });


      // 각 대륙 그룹에 대해 클러스터 생성
      continentGroups.forEach((group, continent) => {
        if (group.length > 1) {
          // 같은 대륙의 여러 국가가 겹치는 경우 → 대륙 클러스터 생성
          const allItems = group.flatMap((cluster) => cluster.items);
          const uniqueCountries = [...new Set(allItems.map((item) => item.id))];
          
          // 대륙 클러스터의 중심점 계산 (가중평균)
          let totalWeight = 0;
          let weightedLat = 0;
          let weightedLng = 0;
          
          group.forEach((cluster) => {
            const weight = cluster.count;
            weightedLat += cluster.lat * weight;
            weightedLng += cluster.lng * weight;
            totalWeight += weight;
          });
          
          const centerLat = weightedLat / totalWeight;
          const centerLng = weightedLng / totalWeight;

          // 대륙의 대표 플래그 선정 (가장 많은 아이템을 가진 국가의 플래그)
          const representativeCluster = group.reduce((prev, current) => 
            prev.count > current.count ? prev : current
          );

          const continentCluster = {
            id: `continent_${continent}_${Date.now()}_${i}`,
            name: `${continent} +${uniqueCountries.length}`,
            flag: representativeCluster.flag,
            lat: centerLat,
            lng: centerLng,
            color: representativeCluster.color,
            items: allItems,
            count: allItems.length,
            clusterType: "continent_cluster" as const,
          };


          finalClusters.push(continentCluster);
        } else {
          // 대륙에 국가가 1개만 있으면 원래 클러스터 유지
          finalClusters.push(group[0]);
        }
      });
    } else {
      // 겹치지 않는 단일 클러스터는 그대로 유지
      finalClusters.push(startCluster);
    }
  }


  return finalClusters;
};;

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
  if (zoomLevel >= CONTINENT_CLUSTERING.CONTINENT_TO_COUNTRY_THRESHOLD) {
    return "continent";
  } else {
    return "country";
  }
};

// 대륙 클러스터 클릭 시 줌 타겟 계산
export const getContinentZoomTarget = (_cluster: ClusterData): number => {
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
