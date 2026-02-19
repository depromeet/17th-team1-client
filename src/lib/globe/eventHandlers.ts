/**
 * @file eventHandlers.ts
 * @description Globe 이벤트 핸들러 팩토리 함수들
 * @responsibility 클러스터 선택, 회전, 줌 이벤트 핸들러 생성 로직 제공
 */

import type React from "react";
import {
  AUTO_CLUSTER_DELAY,
  CONTINENT_MODE_ZOOM_MULTIPLIER,
  ROTATION_SMOOTHING_FACTOR,
  ROTATION_UPDATE_THRESHOLD,
  ZOOM_ANIMATION_DURATION,
  ZOOM_LEVELS,
} from "@/constants/clusteringConstants";
import type { ClusterData, ClusteringState, CountryData } from "@/types/clustering";
import { isSignificantRotation } from "./calculations";

/**
 * 클러스터 선택 핸들러 생성
 * @param setState - 클러스터링 상태 업데이트 함수
 * @param setSelectionStack - 선택 스택 업데이트 함수
 * @param setLastRotation - 마지막 회전 위치 업데이트 함수
 * @param selectedClusterData - 현재 선택된 클러스터 데이터
 * @returns 클러스터 선택 핸들러 함수
 * @responsibility 클러스터 클릭 시 적절한 모드 전환 및 상태 업데이트
 *
 * @description
 * - continent_cluster 클릭: 국가 모드로 전환하고 스택에 추가
 * - country_cluster 클릭: 도시 모드로 전환하고 줌 애니메이션 실행
 * - individual_city 클릭: 해당 도시의 items 반환
 */
export const createClusterSelectHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  selectedClusterData: CountryData[] | undefined
) => {
  return (cluster: ClusterData) => {
    const { clusterType, items, id } = cluster;

    // 대륙 클러스터 클릭 시
    if (clusterType === "continent_cluster") {
      setState(prev => ({
        ...prev,
        mode: "country",
        expandedCountry: null,
        selectedCluster: null,
        clickBasedExpansion: false,
        lastInteraction: Date.now(),
      }));

      setSelectionStack(stack => [...stack, selectedClusterData || null]);

      return items;
    }

    // 국가 클러스터 클릭 시
    if (clusterType === "country_cluster") {
      // 회전 추적 초기화
      setLastRotation(prev => ({ ...prev }));

      setState(prev => ({
        ...prev,
        mode: "city",
        expandedCountry: id.replace("country_", ""),
        selectedCluster: id,
        clickBasedExpansion: true,
        lastInteraction: Date.now(),
        isZoomAnimating: true,
      }));

      // 줌 애니메이션 완료 후 isZoomAnimating false로 설정
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isZoomAnimating: false,
        }));
      }, ZOOM_ANIMATION_DURATION);

      setSelectionStack(stack => [...stack, selectedClusterData || null]);

      return items;
    }

    return items;
  };
};

type GlobeRotationRefs = {
  modeRef: React.RefObject<string>;
  selectedClusterRef: React.RefObject<string | null>;
  lastRotationRef: React.RefObject<{ lat: number; lng: number }>;
  isZoomAnimatingRef: React.RefObject<boolean>;
};

/**
 * 지구본 회전 핸들러 생성
 * @param setState - 클러스터링 상태 업데이트 함수
 * @param setSelectionStack - 선택 스택 업데이트 함수
 * @param setLastRotation - 마지막 회전 위치 업데이트 함수
 * @param refs - 최신 상태를 읽기 위한 ref 객체 묶음
 * @param onSelectionStackChange - 선택 스택 변경 콜백 (선택)
 * @returns 회전 핸들러 함수
 * @responsibility 지구본 회전 감지 및 모드 전환 처리
 *
 * @description
 * - 줌 애니메이션 중에는 회전 무시
 * - 도시 모드에서 의미있는 회전 감지 시 국가 모드로 복귀
 * - 일반 모드에서는 부드러운 회전 추적만 수행
 * - refs를 통해 항상 최신 상태값을 읽어 stale closure 방지
 */
export const createGlobeRotationHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  refs: GlobeRotationRefs,
  onSelectionStackChange?: (newStack: (CountryData[] | null)[]) => void
) => {
  return (lat: number, lng: number) => {
    const { modeRef, selectedClusterRef, lastRotationRef, isZoomAnimatingRef } = refs;
    const mode = modeRef.current;
    const selectedCluster = selectedClusterRef.current;
    const { lat: lastLat, lng: lastLng } = lastRotationRef.current;
    const isZoomAnimating = isZoomAnimatingRef.current;

    // 줌 애니메이션 중에는 회전 이벤트 무시
    if (isZoomAnimating) return;

    // 도시 모드에서 회전 감지
    if (mode === "city" && selectedCluster) {
      const isRotated = isSignificantRotation(lat, lng, lastLat, lastLng);

      if (isRotated) {
        setTimeout(() => {
          // 모드를 국가로 변경
          setState(prev => ({
            ...prev,
            mode: "country",
            expandedCountry: null,
            selectedCluster: null,
            clickBasedExpansion: false,
            lastInteraction: Date.now(),
          }));

          // 선택 스택 되돌리기
          setSelectionStack(stack => {
            const newStack = stack.length === 0 ? stack : stack.slice(0, -1);

            if (onSelectionStackChange) onSelectionStackChange(newStack);
            return newStack;
          });
        }, AUTO_CLUSTER_DELAY);

        setLastRotation({ lat, lng });
      }
    } else {
      // 일반 모드에서는 부드러운 회전 추적
      const latDiff = Math.abs(lat - lastLat);
      const lngDiff = Math.abs(lng - lastLng);

      if (latDiff > ROTATION_UPDATE_THRESHOLD || lngDiff > ROTATION_UPDATE_THRESHOLD) {
        setLastRotation(prev => ({
          lat: prev.lat + (lat - prev.lat) * ROTATION_SMOOTHING_FACTOR,
          lng: prev.lng + (lng - prev.lng) * ROTATION_SMOOTHING_FACTOR,
        }));
      }
    }
  };
};

/**
 * 줌 변경 핸들러 생성
 * @param setState - 클러스터링 상태 업데이트 함수
 * @param setZoomStack - 줌 스택 업데이트 함수
 * @param setSelectionStack - 선택 스택 업데이트 함수
 * @param mode - 현재 클러스터링 모드
 * @returns 줌 변경 핸들러 함수
 * @responsibility 줌 레벨에 따른 모드 전환 처리
 *
 * @description
 * - 도시 모드에서는 줌 변경 무시 (클릭으로만 제어)
 * - 일정 줌 레벨 이상이면 대륙 모드로 전환 및 스택 초기화
 * - 그 외에는 현재 줌 레벨만 반환
 */
export const createZoomChangeHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setZoomStack: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  mode: string
) => {
  return (newZoomLevel: number) => {
    const rounded = Number(newZoomLevel.toFixed(2));

    // 도시 모드에서는 줌 변경 무시
    if (mode === "city") return { newZoom: rounded };

    // 일정 줌 레벨 이상이면 대륙 모드로 전환
    if (rounded >= ZOOM_LEVELS.DEFAULT * CONTINENT_MODE_ZOOM_MULTIPLIER) {
      setState(prev => ({
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
// DOM 클릭 핸들러
// ============================================

/**
 * 클러스터 클릭 핸들러 생성
 * @param clusterId - 클릭된 클러스터 ID
 * @param onClusterClick - 클러스터 클릭 콜백
 * @returns 클릭 이벤트 핸들러
 * @responsibility 클러스터 DOM 클릭 이벤트 처리
 */
export const createClusterClickHandler = (clusterId: string, onClusterClick: (clusterId: string) => void) => {
  return (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onClusterClick(clusterId);
  };
};

/**
 * 도시 클릭 핸들러 생성
 * @param cityName - 도시명 (형식: "도시명, 국가명")
 * @param cityId - 도시 ID
 * @param hasRecords - 기록 존재 여부
 * @param onNavigate - 네비게이션 콜백
 * @param disableCityClick - 도시 클릭 비활성화 여부
 * @param uuid - 사용자 UUID (선택)
 * @returns 클릭 이벤트 핸들러
 * @responsibility 도시 DOM 클릭 이벤트 처리 및 페이지 이동
 *
 * @description
 * - 기록 있음: 상세 기록 뷰로 이동
 * - 기록 없음: 기록하기 페이지로 이동
 * - disableCityClick이 true면 클릭 무시
 */
export const createCityClickHandler = (
  cityName: string,
  cityId?: number,
  hasRecords: boolean = true,
  onNavigate?: (path: string) => void,
  disableCityClick?: boolean,
  uuid?: string
) => {
  return (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (disableCityClick) return;

    const parts = cityName.split(",").map(s => s.trim());
    const cityNameOnly = parts[0];
    const countryName = parts[1] || "";

    let path: string;

    if (hasRecords && cityId) path = uuid ? `/record/${cityId}?uuid=${uuid}` : `/record/${cityId}`;
    else {
      const params = new URLSearchParams();
      if (cityId) params.set("cityId", String(cityId));
      params.set("city", cityNameOnly);
      params.set("country", countryName);
      path = `/image-metadata?${params.toString()}`;
    }

    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };
};
