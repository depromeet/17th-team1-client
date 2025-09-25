"use client";

import { getContinent, getContinentClusterName, getCountryName } from "@/constants/countryMapping";
import { CLUSTERING_DISTANCE_MAP, ZOOM_LEVELS } from "@/constants/zoomLevels";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

interface ClusterData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  items: CountryData[];
  count: number;
  clusterType?: "individual_city" | "country_cluster" | "continent_cluster";
  isExpanded?: boolean;
}

interface UseCountryBasedClusteringProps {
  countries: CountryData[];
  zoomLevel: number;
  selectedClusterData?: CountryData[];
}

interface ClusteringState {
  mode: "country" | "city" | "continent"; // 현재 표시 모드
  expandedCountry: string | null; // 확장된 국가 ID
  selectedCluster: string | null; // 선택된 클러스터 ID
  clusteredData: ClusterData[];
  isZoomed: boolean;
}

export const useCountryBasedClustering = ({ countries, zoomLevel, selectedClusterData }: UseCountryBasedClusteringProps) => {
  const [state, setState] = useState<ClusteringState>({
    mode: "continent",
    expandedCountry: null,
    selectedCluster: null,
    clusteredData: [],
    isZoomed: false,
  });

  const [zoomStack, setZoomStack] = useState<number[]>([]);
  const [selectionStack, setSelectionStack] = useState<(CountryData[] | null)[]>([]);

  // 줌 상태 감지
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < ZOOM_LEVELS.ZOOM_THRESHOLD;
    setState(prev => ({ ...prev, isZoomed: isCurrentlyZoomed }));
  }, [zoomLevel]);

  // 줌 레벨에 따른 클러스터링 거리 계산
  const getClusterDistance = useCallback((zoom: number): number => {
    if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_FAR];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.FAR) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.FAR];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.MEDIUM) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.MEDIUM];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.CLOSE];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.VERY_CLOSE) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.VERY_CLOSE];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.ZOOMED_IN) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.ZOOMED_IN];
    if (zoom >= ZOOM_LEVELS.CLUSTERING.DETAILED) return CLUSTERING_DISTANCE_MAP[ZOOM_LEVELS.CLUSTERING.DETAILED];
    return 1;
  }, []);

  // 거리 기반 클러스터링 함수
  const clusterLocations = useCallback(
    (locations: CountryData[], clusterDistance: number, currentZoomLevel: number): ClusterData[] => {
      // 매우 가까운 줌에서는 개별 도시 표시
      if (currentZoomLevel <= ZOOM_LEVELS.CLUSTERING.DETAILED || clusterDistance <= 0) {
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
      }

      const clusters: ClusterData[] = [];
      const processed = new Set<string>();

      locations.forEach((location) => {
        const locationKey = `${location.id}_${location.lat}_${location.lng}`;
        if (processed.has(locationKey)) return;

        const nearbyLocations: CountryData[] = [location];
        processed.add(locationKey);

        // 주변 위치들 찾기
        locations.forEach((otherLocation) => {
          const otherLocationKey = `${otherLocation.id}_${otherLocation.lat}_${otherLocation.lng}`;
          if (processed.has(otherLocationKey)) return;

          let shouldCluster = false;

          if (currentZoomLevel >= ZOOM_LEVELS.DEFAULT) {
            // 디폴트 줌: 같은 대륙끼리만 클러스터링
            const sameContinent = getContinent(location.id) === getContinent(otherLocation.id);
            shouldCluster = sameContinent;
          } else {
            // 줌인 상태: 같은 국가끼리만 클러스터링
            const sameCountry = location.id === otherLocation.id;
            shouldCluster = sameCountry;
          }

          if (!shouldCluster) return;

          const distance = Math.sqrt((location.lat - otherLocation.lat) ** 2 + (location.lng - otherLocation.lng) ** 2);

          if (distance <= clusterDistance) {
            nearbyLocations.push(otherLocation);
            processed.add(otherLocationKey);
          }
        });

        // 클러스터 생성
        const centerLat = nearbyLocations.reduce((sum, loc) => sum + loc.lat, 0) / nearbyLocations.length;
        const centerLng = nearbyLocations.reduce((sum, loc) => sum + loc.lng, 0) / nearbyLocations.length;

        let clusterName: string;
        if (currentZoomLevel >= ZOOM_LEVELS.DEFAULT) {
          const countryIds = nearbyLocations.map((loc) => loc.id);
          clusterName = getContinentClusterName(countryIds);
        } else {
          const countryName = getCountryName(location.id);
          clusterName = nearbyLocations.length > 1 ? `${countryName} +${nearbyLocations.length}` : countryName;
        }

        clusters.push({
          id: `cluster_${location.id}_${centerLat}_${centerLng}`,
          name: clusterName,
          flag: location.flag,
          lat: centerLat,
          lng: centerLng,
          color: location.color,
          items: nearbyLocations,
          count: nearbyLocations.length,
          clusterType: currentZoomLevel >= ZOOM_LEVELS.DEFAULT ? "continent_cluster" : "country_cluster",
        });
      });

      return clusters;
    },
    [getClusterDistance],
  );

  // 클러스터 데이터 계산
  const clusteredData = useMemo(() => {
    const dataToCluster = selectedClusterData && selectedClusterData.length > 0 ? selectedClusterData : countries;

    if (!dataToCluster || dataToCluster.length === 0) return [];

    const clusterDistance = getClusterDistance(zoomLevel);
    return clusterLocations(dataToCluster, clusterDistance, zoomLevel);
  }, [countries, zoomLevel, selectedClusterData, clusterLocations, getClusterDistance]);

  // 상태 업데이트
  useEffect(() => {
    setState(prev => ({ ...prev, clusteredData }));
  }, [clusteredData]);

  // 현재 표시할 아이템들 (클러스터된 데이터 그대로 사용)
  const visibleItems = useMemo(() => {
    return clusteredData;
  }, [clusteredData]);

  // 클러스터 선택 핸들러
  const handleClusterSelect = useCallback(
    (cluster: ClusterData) => {
      setZoomStack(prev => [...prev, zoomLevel]);
      setSelectionStack(stack => [...stack, selectedClusterData ? [...selectedClusterData] : null]);
      setState(prev => ({ ...prev, selectedCluster: cluster.id }));

      // 상위 컴포넌트에 클러스터 아이템들 전달
      return cluster.items;
    },
    [zoomLevel, selectedClusterData],
  );

  // 줌 변경 핸들러
  const handleZoomChange = useCallback(
    (newZoomLevel: number) => {
      const rounded = Number(newZoomLevel.toFixed(2));

      // 줌아웃 시작을 감지하면 직전 단계로 스냅
      if (rounded > zoomLevel + ZOOM_LEVELS.THRESHOLDS.ZOOM_DETECTION && zoomStack.length > 0) {
        const last = zoomStack[zoomStack.length - 1];
        setZoomStack(s => s.slice(0, -1));

        // 선택 경로도 한 단계 상위로 복원
        setSelectionStack(stack => {
          if (stack.length === 0) return stack;
          const newStack = stack.slice(0, -1);
          return newStack;
        });

        return { snapTo: last };
      }

      // 상위로 충분히 멀어지면 초기화
      if (rounded >= ZOOM_LEVELS.THRESHOLDS.COUNTRY_TO_ROOT_OUT && selectedClusterData) {
        setState(prev => ({ ...prev, selectedCluster: null }));
        setZoomStack([]);
        setSelectionStack([]);
        return { reset: true };
      }

      return { newZoom: rounded };
    },
    [zoomLevel, zoomStack, selectedClusterData],
  );

  // 현재 상태 리셋 (줌 아웃 등)
  const resetGlobe = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: "continent",
      expandedCountry: null,
      selectedCluster: null,
    }));
    setZoomStack([]);
    setSelectionStack([]);
  }, []);

  return {
    // 상태
    clusteredData: state.clusteredData,
    isZoomed: state.isZoomed,
    shouldShowClusters: true,

    // 데이터
    visibleItems,

    // 핸들러
    handleClusterSelect,
    handleZoomChange,
    resetGlobe,
  };
};

export type { ClusterData };