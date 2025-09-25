"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ZOOM_LEVELS } from "@/constants/zoomLevels";

/**
 * 기획 요구사항에 맞는 새로운 클러스터링 시스템:
 * 1. 대륙 ↔ 국가: 줌 레벨에 따라 동적 변경
 * 2. 국가 → 도시: 클릭으로만 제어 (줌 레벨 무관)
 * 3. 지구본 회전 시: 도시 모드에서 국가 모드로 자동 복귀
 */
import {
  createClusterSelectHandler,
  createGlobeRotationHandler,
  createZoomChangeHandler,
} from "./clustering/clusterHandlers";
import { clusterLocations, getClusterDistance } from "./clustering/clusterLogic";
import { withErrorHandling } from "./clustering/errorHandling";
import type { ClusterData, ClusteringState, CountryData, UseCountryBasedClusteringProps } from "./clustering/types";

export const useCountryBasedClustering = ({
  countries,
  zoomLevel,
  selectedClusterData,
  globeRef,
}: UseCountryBasedClusteringProps) => {
  // State management - 기획에 맞게 업데이트
  const [state, setState] = useState<ClusteringState>({
    mode: "country", // 기획: 기본은 국가별 클러스터링
    expandedCountry: null,
    selectedCluster: null,
    clusteredData: [],
    isZoomed: false,
    lastInteraction: Date.now(),
    clickBasedExpansion: false,
    rotationPosition: { lat: 0, lng: 0 },
    lastSignificantRotation: Date.now(),
  });

  const [zoomStack, setZoomStack] = useState<number[]>([]);
  const [selectionStack, setSelectionStack] = useState<(CountryData[] | null)[]>([]);
  const [lastRotation, setLastRotation] = useState({ lat: 0, lng: 0 });

  // 줌 상태 감지
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < ZOOM_LEVELS.ZOOM_THRESHOLD;
    setState((prev) => ({ ...prev, isZoomed: isCurrentlyZoomed }));
  }, [zoomLevel]);

  // 기획 요구사항에 맞는 클러스터 데이터 계산
  const clusteredData = useMemo(() => {
    try {
      const dataToCluster = selectedClusterData && selectedClusterData.length > 0 ? selectedClusterData : countries;

      if (!dataToCluster || dataToCluster.length === 0) return [];

      const clusterDistance = getClusterDistance(zoomLevel);
      return withErrorHandling(clusterLocations, "Failed to cluster locations")(
        dataToCluster,
        clusterDistance,
        zoomLevel,
        globeRef, // globeRef 전달
        state.mode, // 모드를 포함하여 호출
        state.expandedCountry, // 확장된 국가 정보 포함
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Clustering calculation failed:", error);
      }
      return [];
    }
  }, [countries, zoomLevel, selectedClusterData, state.mode, state.expandedCountry, globeRef]);

  // 상태 업데이트
  useEffect(() => {
    setState((prev) => ({ ...prev, clusteredData }));
  }, [clusteredData]);

  // 현재 표시할 아이템들
  const visibleItems = useMemo(() => clusteredData, [clusteredData]);

  // 핸들러 생성 - 기획 요구사항에 맞게 업데이트
  const handleClusterSelect = useCallback(
    createClusterSelectHandler(setState, setSelectionStack, setLastRotation, selectedClusterData),
    [],
  );

  const handleZoomChange = useCallback(
    createZoomChangeHandler(setState, setZoomStack, setSelectionStack, state.mode),
    [],
  );

  const handleGlobeRotation = useCallback(
    createGlobeRotationHandler(
      setState,
      setSelectionStack,
      setLastRotation,
      state.mode,
      state.selectedCluster,
      lastRotation,
      selectionStack.length,
    ),
    [],
  );

  const resetGlobe = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: "country", // 기획: 기본은 국가별 클러스터링
      expandedCountry: null,
      selectedCluster: null,
      clickBasedExpansion: false,
      rotationPosition: { lat: 0, lng: 0 },
      lastSignificantRotation: Date.now(),
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
