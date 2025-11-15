"use client";

import type { GlobeInstance } from "globe.gl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getContinent, getCountryName } from "@/constants/countryMapping";
import { CLUSTERING_DISTANCE_MAP, ZOOM_LEVELS } from "@/constants/zoomLevels";
import type { ClusterData, ClusteringState, CountryData, UseClusteringProps } from "@/types/clustering";

/**
 * 기획 요구사항에 맞는 클러스터링 시스템:
 * 1. 대륙 ↔ 국가: 줌 레벨에 따라 동적 변경
 * 2. 국가 → 도시: 클릭으로만 제어 (줌 레벨 무관)
 * 3. 지구본 회전 시: 도시 모드에서 국가 모드로 자동 복귀
 */

// ============================================
// 유틸리티 함수들
// ============================================

/**
 * 회전 감지를 위한 거리 계산
 */
const calculateRotationDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const latDiff = Math.abs(lat1 - lat2);
  const lngDiff = Math.abs(lng1 - lng2);
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

const ROTATION_THRESHOLD = 10;
const AUTO_CLUSTER_DELAY = 0;

/**
 * 의미 있는 회전인지 판단
 */
const isSignificantRotation = (currentLat: number, currentLng: number, lastLat: number, lastLng: number): boolean => {
  const rotationDistance = calculateRotationDistance(currentLat, currentLng, lastLat, lastLng);
  return rotationDistance > ROTATION_THRESHOLD;
};

/**
 * 동적 텍스트 너비 계산 (한글/영문 구분)
 */
const calculateDynamicTextWidth = (text: string, fontSize: number): number => {
  let totalWidth = 0;
  const koreanCharRegex = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]/;
  const koreanWidth = fontSize;
  const asciiWidth = fontSize * 0.6;

  for (const char of text) {
    if (koreanCharRegex.test(char)) {
      totalWidth += koreanWidth;
    } else {
      totalWidth += asciiWidth;
    }
  }
  return totalWidth;
};

/**
 * 버블 너비 추정 (클러스터 타입별)
 */
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

  // individual_city
  const fontSize = 15;
  const textWidth = calculateDynamicTextWidth(cluster.name, fontSize);
  const padding = 6 * 2;

  return textWidth + flagWidth + padding + gap;
};

// ============================================
// 클러스터 생성 함수들
// ============================================

/**
 * 국가별 클러스터링 - "몽골 5", "터키에 5" 형태
 */
const createCountryClusters = (locations: CountryData[], countryThumbnails?: Record<string, string>): ClusterData[] => {
  const countryGroups = new Map<string, CountryData[]>();

  locations.forEach((location) => {
    const countryId = location.id;
    if (!countryGroups.has(countryId)) {
      countryGroups.set(countryId, []);
    }
    countryGroups.get(countryId)?.push(location);
  });

  return Array.from(countryGroups.entries()).map(([countryId, items]) => {
    const centerLat = items.reduce((sum, item) => sum + item.lat, 0) / items.length;
    const centerLng = items.reduce((sum, item) => sum + item.lng, 0) / items.length;
    const countryName = getCountryName(countryId);

    // 국가별 최신 썸네일 조회
    const thumbnailUrl = countryThumbnails?.[countryId];
    const hasRecords = !!thumbnailUrl;

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
      hasRecords,
      thumbnailUrl,
    };
  });
};

/**
 * 개별 도시 클러스터 생성
 */
const createIndividualCityClusters = (locations: CountryData[]): ClusterData[] => {
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
    hasRecords: location.hasRecords,
    thumbnailUrl: location.thumbnailUrl,
  }));
};

// ============================================
// 메인 클러스터링 로직
// ============================================

const clusterLocations = (
  locations: CountryData[],
  _clusterDistance: number,
  _currentZoomLevel: number,
  globeRef: React.RefObject<GlobeInstance | null>,
  mode: "country" | "city" | "continent" = "country",
  expandedCountry: string | null = null,
  countryThumbnails?: Record<string, string>,
): ClusterData[] => {
  if (!locations || locations.length === 0) {
    return [];
  }

  // 도시 모드: 클릭된 국가의 도시들만 개별 표시
  if (mode === "city" && expandedCountry) {
    const countryLocations = locations.filter((loc) => loc.id === expandedCountry);
    return createIndividualCityClusters(countryLocations);
  }

  // Globe 준비 확인
  if (!globeRef.current || typeof globeRef.current.getScreenCoords !== "function") {
    return createCountryClusters(locations, countryThumbnails);
  }

  try {
    const testPos = globeRef.current.getScreenCoords(0, 0);
    if (!testPos || typeof testPos.x !== "number" || typeof testPos.y !== "number") {
      return createCountryClusters(locations, countryThumbnails);
    }
  } catch {
    return createCountryClusters(locations, countryThumbnails);
  }

  const globe = globeRef.current;
  const countryClusters = createCountryClusters(locations, countryThumbnails);

  const clustersWithPos = countryClusters.map((cluster) => {
    const screenPos = globe.getScreenCoords(cluster.lat, cluster.lng);
    const bubbleWidth = estimateBubbleWidth(cluster);

    return {
      ...cluster,
      screenPos,
      width: bubbleWidth,
      effectiveWidth: bubbleWidth * 0.8,
    };
  });

  const processedIds = new Set<string>();
  const finalClusters: ClusterData[] = [];

  // BFS로 겹치는 클러스터 찾기 및 대륙 클러스터링
  for (let i = 0; i < clustersWithPos.length; i++) {
    const startCluster = clustersWithPos[i];
    if (processedIds.has(startCluster.id)) {
      continue;
    }

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

        const distance = Math.hypot(
          currentCluster.screenPos.x - candidateCluster.screenPos.x,
          currentCluster.screenPos.y - candidateCluster.screenPos.y,
        );

        const overlapThreshold = (currentCluster.effectiveWidth + candidateCluster.effectiveWidth) * 0.4;

        if (distance < overlapThreshold) {
          processedIds.add(candidateCluster.id);
          queue.push(candidateCluster);
          overlappingClusters.push(candidateCluster);
        }
      }
    }

    // 겹치는 클러스터가 2개 이상이면 지리적 거리 기반으로 서브클러스터링
    if (overlappingClusters.length > 1) {
      // 거리 기반 서브클러스터링
      const subClusters: ClusterData[][] = [];
      const processedInSubCluster = new Set<string>();

      // 하버신 공식으로 실제 거리 계산 (km 단위)
      const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // 지구 반지름 (km)
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // 지리적 거리 임계값 (1500km 정도)
      const GEO_DISTANCE_THRESHOLD = 3000;

      for (const cluster of overlappingClusters) {
        if (processedInSubCluster.has(cluster.id)) {
          continue;
        }

        const subCluster = [cluster];
        processedInSubCluster.add(cluster.id);

        // 현재 클러스터와 지리적으로 가까운 다른 클러스터 찾기
        for (const candidate of overlappingClusters) {
          if (processedInSubCluster.has(candidate.id)) {
            continue;
          }

          // 하버신 공식으로 실제 거리 계산
          const distance = haversineDistance(cluster.lat, cluster.lng, candidate.lat, candidate.lng);

          if (distance < GEO_DISTANCE_THRESHOLD) {
            subCluster.push(candidate);
            processedInSubCluster.add(candidate.id);
          }
        }

        subClusters.push(subCluster);
      }

      // 각 서브클러스터를 처리
      subClusters.forEach((subCluster) => {
        if (subCluster.length > 1) {
          // 대륙별로 그룹핑 (근접한 국가들끼리만)
          const continentGroups = new Map<string, typeof subCluster>();

          subCluster.forEach((cluster) => {
            const continent = getContinent(cluster.items[0].id);
            if (!continentGroups.has(continent)) {
              continentGroups.set(continent, []);
            }
            (continentGroups.get(continent) as ClusterData[]).push(cluster);
          });

          continentGroups.forEach((group, continent) => {
            if (group.length > 1) {
              const allItems = group.flatMap((cluster) => cluster.items);
              const uniqueCountries = [...new Set(allItems.map(({ id }) => id))];

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

              const representativeCluster = group.reduce((prev, current) =>
                prev.count > current.count ? prev : current,
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
              finalClusters.push(group[0]);
            }
          });
        } else {
          finalClusters.push(subCluster[0]);
        }
      });
    } else {
      finalClusters.push(startCluster);
    }
  }

  return finalClusters;
};

/**
 * 줌 레벨에 따른 클러스터링 거리 계산
 */
const getClusterDistance = (zoom: number): number => {
  if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_FAR];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.FAR];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.MEDIUM) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.MEDIUM];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.CLOSE];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_CLOSE];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.ZOOMED_IN) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.ZOOMED_IN];
  if (zoom >= ZOOM_LEVELS.CLUSTERING.DETAILED) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.DETAILED];
  return 1;
};

// ============================================
// 이벤트 핸들러 팩토리 함수들
// ============================================

/**
 * 클러스터 선택 핸들러 생성
 */
const createClusterSelectHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  selectedClusterData: CountryData[] | undefined,
) => {
  return (cluster: ClusterData) => {
    if (cluster.clusterType === "continent_cluster") {
      // 대륙 클러스터 클릭 시 국가 모드로 전환하고 스택에 추가
      setState((prev) => ({
        ...prev,
        mode: "country",
        expandedCountry: null,
        selectedCluster: null,
        clickBasedExpansion: false,
        lastInteraction: Date.now(),
      }));

      setSelectionStack((stack) => [...stack, selectedClusterData || null]);

      return cluster.items;
    }

    if (cluster.clusterType === "country_cluster") {
      setLastRotation((prev) => ({ ...prev }));

      setState((prev) => ({
        ...prev,
        mode: "city",
        expandedCountry: cluster.id.replace("country_", ""),
        selectedCluster: cluster.id,
        clickBasedExpansion: true,
        lastInteraction: Date.now(),
        isZoomAnimating: true,
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isZoomAnimating: false,
        }));
      }, 3000);

      setSelectionStack((stack) => [...stack, selectedClusterData || null]);

      return cluster.items;
    }

    return cluster.items;
  };
};

/**
 * 지구본 회전 핸들러 생성
 */
const createGlobeRotationHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  mode: string,
  selectedCluster: string | null,
  lastRotation: { lat: number; lng: number },
  isZoomAnimating: boolean,
  onSelectionStackChange?: (newStack: (CountryData[] | null)[]) => void,
) => {
  return (lat: number, lng: number) => {
    if (isZoomAnimating) {
      return;
    }

    if (mode === "city" && selectedCluster) {
      const isRotated = isSignificantRotation(lat, lng, lastRotation.lat, lastRotation.lng);

      if (isRotated) {
        setTimeout(() => {
          // 모드를 국가로 변경
          setState((prev) => ({
            ...prev,
            mode: "country",
            expandedCountry: null,
            selectedCluster: null,
            clickBasedExpansion: false,
            lastInteraction: Date.now(),
          }));

          // 선택 스택 되돌리기
          setSelectionStack((stack) => {
            const newStack = stack.length === 0 ? stack : stack.slice(0, -1);

            if (onSelectionStackChange) {
              onSelectionStackChange(newStack);
            }

            return newStack;
          });
        }, AUTO_CLUSTER_DELAY);

        setLastRotation({ lat, lng });
      }
    } else {
      const latDiff = Math.abs(lat - lastRotation.lat);
      const lngDiff = Math.abs(lng - lastRotation.lng);

      if (latDiff > 5 || lngDiff > 5) {
        setLastRotation((prev) => ({
          lat: prev.lat + (lat - prev.lat) * 0.3,
          lng: prev.lng + (lng - prev.lng) * 0.3,
        }));
      }
    }
  };
};

/**
 * 줌 변경 핸들러 생성
 */
const createZoomChangeHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setZoomStack: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  mode: string,
) => {
  return (newZoomLevel: number) => {
    const rounded = Number(newZoomLevel.toFixed(2));

    if (mode === "city") {
      return { newZoom: rounded };
    }

    if (rounded >= ZOOM_LEVELS.DEFAULT * 1.5) {
      setState((prev) => ({
        ...prev,
        mode: "continent",
        expandedCountry: null,
        selectedCluster: null,
        clickBasedExpansion: false,
      }));
      setZoomStack([]);
      setSelectionStack([]);
      return { reset: true };
    }

    return { newZoom: rounded };
  };
};

// ============================================
// 메인 훅
// ============================================

export const useClustering = ({
  countries,
  zoomLevel,
  selectedClusterData,
  globeRef,
  onSelectionStackChange,
  countryThumbnails,
}: UseClusteringProps) => {
  const [state, setState] = useState<ClusteringState>({
    mode: "country",
    expandedCountry: null,
    selectedCluster: null,
    clusteredData: [],
    isZoomed: false,
    lastInteraction: Date.now(),
    clickBasedExpansion: false,
    rotationPosition: { lat: 0, lng: 0 },
    lastSignificantRotation: Date.now(),
    isZoomAnimating: false,
  });

  const [zoomStack, setZoomStack] = useState<number[]>([]);
  const [selectionStack, setSelectionStack] = useState<(CountryData[] | null)[]>([]);
  const [lastRotation, setLastRotation] = useState({ lat: 0, lng: 0 });

  // 줌 상태 감지
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < ZOOM_LEVELS.ZOOM_THRESHOLD;
    setState((prev) => ({ ...prev, isZoomed: isCurrentlyZoomed }));
  }, [zoomLevel]);

  // 클러스터 데이터 계산
  const clusteredData = useMemo(() => {
    try {
      const dataToCluster = selectedClusterData && selectedClusterData.length > 0 ? selectedClusterData : countries;

      if (!dataToCluster || dataToCluster.length === 0) return [];

      const clusterDistance = getClusterDistance(zoomLevel);
      return clusterLocations(
        dataToCluster,
        clusterDistance,
        zoomLevel,
        globeRef,
        state.mode,
        state.expandedCountry,
        countryThumbnails,
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Clustering calculation failed:", error);
      }

      return [];
    }
  }, [countries, zoomLevel, selectedClusterData, state.mode, state.expandedCountry, globeRef, countryThumbnails]);

  // 상태 업데이트
  useEffect(() => {
    setState((prev) => ({ ...prev, clusteredData }));
  }, [clusteredData]);

  const visibleItems = useMemo(() => clusteredData, [clusteredData]);

  // 핸들러 생성
  // biome-ignore lint/correctness/useExhaustiveDependencies: setState는 안정적인 함수이므로 의존성에서 제외
  const handleClusterSelect = useCallback(
    createClusterSelectHandler(setState, setSelectionStack, setLastRotation, selectedClusterData),
    [selectedClusterData],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState는 안정적인 함수이므로 의존성에서 제외
  const handleZoomChange = useCallback(createZoomChangeHandler(setState, setZoomStack, setSelectionStack, state.mode), [
    state.mode,
  ]);

  const handleGlobeRotation = useCallback(
    (lat: number, lng: number) => {
      const rotationHandler = createGlobeRotationHandler(
        setState,
        setSelectionStack,
        setLastRotation,
        state.mode,
        state.selectedCluster,
        lastRotation,
        state.isZoomAnimating,
        onSelectionStackChange,
      );
      rotationHandler(lat, lng);
    },
    [state.mode, state.selectedCluster, state.isZoomAnimating, lastRotation, onSelectionStackChange],
  );

  const resetGlobe = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: "country",
      expandedCountry: null,
      selectedCluster: null,
      clickBasedExpansion: false,
      rotationPosition: { lat: 0, lng: 0 },
      lastSignificantRotation: Date.now(),
      isZoomAnimating: false,
    }));
    setZoomStack([]);
    setSelectionStack([]);
  }, []);

  return {
    // 상태
    clusteredData: state.clusteredData,
    isZoomed: state.isZoomed,
    shouldShowClusters: true,
    mode: state.mode,
    expandedCountry: state.expandedCountry,
    clickBasedExpansion: state.clickBasedExpansion,

    // 데이터
    visibleItems,

    // 핸들러
    handleClusterSelect,
    handleZoomChange,
    handleGlobeRotation,
    resetGlobe,

    // 디버깅
    debug: {
      zoomStack: zoomStack.length,
      selectionStack: selectionStack.length,
      lastRotation,
      rotationPosition: state.rotationPosition,
      lastSignificantRotation: state.lastSignificantRotation,
    },
  };
};

export type { ClusterData };
