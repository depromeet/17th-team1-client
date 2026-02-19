/**
 * @file useClustering.ts
 * @description 클러스터링 상태 관리 훅
 * @responsibility Globe의 클러스터링 모드 및 상태 관리, 이벤트 핸들러 제공
 *
 * @description
 * 클러스터링 시스템:
 * 1. 대륙 ↔ 국가: 줌 레벨에 따라 동적 변경
 * 2. 국가 → 도시: 클릭으로만 제어 (줌 레벨 무관)
 * 3. 지구본 회전 시: 도시 모드에서 국가 모드로 자동 복귀
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZOOM_LEVELS } from "@/constants/clusteringConstants";
import type { ClusterData, ClusteringState, CountryData, UseClusteringProps } from "@/types/clustering";
import { clusterLocations, getClusterDistance } from "@/lib/globe/clustering/clusteringAlgorithm";
import {
  createClusterSelectHandler,
  createGlobeRotationHandler,
  createZoomChangeHandler,
} from "@/lib/globe/eventHandlers";

/**
 * 클러스터링 훅
 * @param countries - 국가 데이터 배열
 * @param zoomLevel - 현재 줌 레벨
 * @param selectedClusterData - 선택된 클러스터 데이터
 * @param globeRef - Globe 인스턴스 참조
 * @param onSelectionStackChange - 선택 스택 변경 콜백
 * @param countryThumbnails - 국가별 썸네일 URL 맵
 * @returns 클러스터링 상태 및 핸들러
 * @responsibility 클러스터링 모드 관리 및 사용자 상호작용 처리
 *
 * @description
 * - 클러스터링 데이터 계산 및 캐싱
 * - 모드 전환 (continent/country/city) 관리
 * - 이벤트 핸들러 생성 및 제공
 * - 줌, 회전, 클릭 이벤트 처리
 */
export const useClustering = ({
  countries,
  zoomLevel,
  selectedClusterData,
  globeRef,
  onSelectionStackChange,
  countryThumbnails,
}: UseClusteringProps) => {
  // ============================================
  // 상태 관리
  // ============================================

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

  const {
    mode,
    selectedCluster,
    isZoomAnimating,
    expandedCountry,
    clickBasedExpansion,
    clusteredData: stateClustered,
    isZoomed,
    rotationPosition,
    lastSignificantRotation,
  } = state;

  const modeRef = useRef<string>(mode);
  const selectedClusterRef = useRef<string | null>(selectedCluster);
  const lastRotationRef = useRef<{ lat: number; lng: number }>(lastRotation);
  const isZoomAnimatingRef = useRef<boolean>(isZoomAnimating);

  modeRef.current = mode;
  selectedClusterRef.current = selectedCluster;
  lastRotationRef.current = lastRotation;
  isZoomAnimatingRef.current = isZoomAnimating;

  // ============================================
  // 클러스터 데이터 계산
  // ============================================

  /**
   * 현재 상태에 따른 클러스터 데이터 계산
   * @responsibility 줌 레벨, 모드, 선택 상태에 따라 최적의 클러스터링 수행
   */
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
        mode,
        expandedCountry,
        countryThumbnails
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Clustering calculation failed:", error);

      return [];
    }
  }, [countries, zoomLevel, selectedClusterData, mode, expandedCountry, globeRef, countryThumbnails]);

  /**
   * 화면에 표시할 클러스터 아이템 (캐싱)
   */
  const visibleItems = useMemo(() => clusteredData, [clusteredData]);

  // ============================================
  // 이벤트 핸들러 생성
  // ============================================

  /**
   * 클러스터 선택 핸들러
   * @responsibility 클러스터 클릭 시 모드 전환 및 상태 업데이트
   */
  const handleClusterSelect = useMemo(
    () => createClusterSelectHandler(setState, setSelectionStack, setLastRotation, selectedClusterData),
    [selectedClusterData]
  );

  /**
   * 줌 변경 핸들러
   * @responsibility 줌 레벨에 따른 모드 전환 처리
   */
  const handleZoomChange = useMemo(
    () => createZoomChangeHandler(setState, setZoomStack, setSelectionStack, mode),
    [mode]
  );

  /**
   * 지구본 회전 핸들러
   * @responsibility 회전 감지 및 자동 모드 복귀 처리
   */
  const handleGlobeRotation = useMemo(
    () =>
      createGlobeRotationHandler(
        setState,
        setSelectionStack,
        setLastRotation,
        { modeRef, selectedClusterRef, lastRotationRef, isZoomAnimatingRef },
        onSelectionStackChange
      ),
    [onSelectionStackChange]
  );

  /**
   * Globe 리셋 핸들러
   * @responsibility 모든 상태를 초기값으로 리셋
   */
  const resetGlobe = useCallback(() => {
    setState(prev => ({
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

  // ============================================
  // 부수 효과 (Side Effects)
  // ============================================

  /**
   * 줌 상태 감지 및 업데이트
   */
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < ZOOM_LEVELS.ZOOM_THRESHOLD;
    setState(prev => ({ ...prev, isZoomed: isCurrentlyZoomed }));
  }, [zoomLevel]);

  // ============================================
  // 반환값
  // ============================================

  return {
    // 상태
    clusteredData: stateClustered,
    isZoomed,
    shouldShowClusters: true,
    mode,
    expandedCountry,
    clickBasedExpansion,

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
      rotationPosition,
      lastSignificantRotation,
    },
  };
};

export type { ClusterData };
