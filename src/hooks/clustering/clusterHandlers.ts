import { ZOOM_LEVELS } from "@/constants/zoomLevels";
import { AUTO_CLUSTER_DELAY, getContinentZoomTarget, isSignificantRotation } from "./clusterLogic";
import type { ClusterData, ClusteringState, CountryData } from "./types";

/**
 * 기획 요구사항에 맞는 새로운 클러스터 핸들러들:
 * 1. 대륙 클러스터 클릭 → 줌인하여 국가 클러스터 표시
 * 2. 국가 클러스터 클릭 → 줌 레벨 변경 없이 도시 개별 표시
 * 3. 지구본 회전 시 → 도시 모드에서 국가 모드로 자동 복귀
 */

// 클러스터 선택 핸들러 - 기획 요구사항에 맞게 새로 작성
export const createClusterSelectHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  selectedClusterData: CountryData[] | undefined,
  onZoomTo?: (targetZoom: number, lat?: number, lng?: number) => void,
) => {
  return (cluster: ClusterData) => {
    if (cluster.clusterType === "continent_cluster") {
      // 기획 요구사항: 대륙 클릭 → 줌인하여 국가 클러스터 표시
      const targetZoom = getContinentZoomTarget(cluster);

      // 줌인 실행
      if (onZoomTo) {
        onZoomTo(targetZoom, cluster.lat, cluster.lng);
      }

      return cluster.items;
    }

    if (cluster.clusterType === "country_cluster") {
      // 기획 요구사항: 국가 클릭 → 줌 레벨 변경 없이 도시들 개별 표시

      // 현재 위치를 기록 (지구본 회전 감지용)
      setLastRotation((prev) => ({ ...prev }));

      // 상태 업데이트: 도시 모드로 전환
      setState((prev) => ({
        ...prev,
        mode: "city",
        expandedCountry: cluster.id.replace("country_", ""),
        selectedCluster: cluster.id,
        clickBasedExpansion: true,
        lastInteraction: Date.now(),
      }));

      // 선택 스택에 현재 클러스터 데이터 저장
      setSelectionStack((stack) => [...stack, selectedClusterData || null]);

      return cluster.items;
    }

    // 개별 도시 클릭은 그대로 반환
    return cluster.items;
  };
};

// 지구본 회전 핸들러 - 기획 요구사항: 회전 시 자동 재클러스터링
export const createGlobeRotationHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  setLastRotation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
  mode: string,
  selectedCluster: string | null,
  lastRotation: { lat: number; lng: number },
  selectionStackLength: number,
) => {
  return (lat: number, lng: number) => {
    // 도시 모드에서만 회전 감지하여 국가 클러스터로 복귀
    if (mode === "city" && selectedCluster) {
      const isRotated = isSignificantRotation(lat, lng, lastRotation.lat, lastRotation.lng);

      if (isRotated) {
        // 기획 요구사항: 지구본 회전 시 자동으로 국가 클러스터 상태로 복귀
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            mode: "country",
            expandedCountry: null,
            selectedCluster: null,
            clickBasedExpansion: false,
            lastInteraction: Date.now(),
          }));

          // 선택 스택을 한 단계 복원
          if (selectionStackLength > 0) {
            setSelectionStack((stack) => stack.slice(0, -1));
          }
        }, AUTO_CLUSTER_DELAY);

        // 회전 위치 업데이트
        setLastRotation({ lat, lng });
      }
    } else {
      // 점진적 위치 업데이트 (노이즈 필터링)
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

// 줌 변경 핸들러 - 기획: 대륙-국가는 줌에 따라, 국가-도시는 클릭에 따라
export const createZoomChangeHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setZoomStack: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
  mode: string,
) => {
  return (newZoomLevel: number) => {
    const rounded = Number(newZoomLevel.toFixed(2));

    // 기획 요구사항: 도시 모드에서는 줌으로 대륙/국가 전환 안함 (클릭/회전으로만)
    if (mode === "city") {
      return { newZoom: rounded };
    }

    // 기획 요구사항: 대륙-국가 전환은 줌 레벨에 따라 자동 처리됨
    // 대륙 ↔ 국가 전환 로직을 여기서 처리하지 않고,
    // useCountryBasedClustering에서 clusterLocations 함수가 줌 레벨에 따라 자동 처리

    // 매우 큰 줌아웃 시에만 초기 상태로 복원
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

// 수동 클러스터 리셋 핸들러
export const createResetHandler = (
  setState: React.Dispatch<React.SetStateAction<ClusteringState>>,
  setZoomStack: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectionStack: React.Dispatch<React.SetStateAction<(CountryData[] | null)[]>>,
) => {
  return () => {
    setState((prev) => ({
      ...prev,
      mode: "country",
      expandedCountry: null,
      selectedCluster: null,
      clickBasedExpansion: false,
      lastInteraction: Date.now(),
    }));
    setZoomStack([]);
    setSelectionStack([]);
  };
};
