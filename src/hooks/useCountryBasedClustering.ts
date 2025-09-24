"use client";

import { getCountryName } from "@/constants/countryMapping";
import { useCallback, useMemo, useState } from "react";

interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

interface CountryCluster {
  id: string; // 국가 코드
  name: string; // 국가명
  flag: string; // 국가 플래그
  lat: number; // 대표 위치 (첫 번째 도시)
  lng: number;
  cities: CountryData[]; // 해당 국가의 모든 도시들
  count: number; // 도시 개수
  isExpanded: boolean; // 확장 상태
}

interface UseCountryBasedClusteringProps {
  countries: CountryData[];
}

interface ClusteringState {
  mode: "country" | "city"; // 현재 표시 모드
  expandedCountry: string | null; // 확장된 국가 ID
  countryclusters: CountryCluster[]; // 국가별 클러스터
  visibleItems: (CountryCluster | CountryData)[]; // 현재 표시되는 아이템들
}

export const useCountryBasedClustering = ({ countries }: UseCountryBasedClusteringProps) => {
  const [state, setState] = useState<ClusteringState>({
    mode: "country",
    expandedCountry: null,
    countryclusters: [],
    visibleItems: [],
  });

  // 국가별로 도시들을 그룹핑
  const countryGroups = useMemo(() => {
    const groups = new Map<string, CountryData[]>();

    countries.forEach(city => {
      const countryId = city.id.split("_")[0] || city.id; // "KR_Seoul" → "KR"
      if (!groups.has(countryId)) {
        groups.set(countryId, []);
      }
      groups.get(countryId)!.push(city);
    });

    return groups;
  }, [countries]);

  // 국가 클러스터 생성
  const countryClusterData = useMemo((): CountryCluster[] => {
    return Array.from(countryGroups.entries()).map(([countryId, cities]) => {
      // 첫 번째 도시의 위치를 국가 대표 위치로 사용
      const representativeCity = cities[0];

      return {
        id: countryId,
        name: getCountryName(countryId) || countryId,
        flag: representativeCity.flag,
        lat: representativeCity.lat,
        lng: representativeCity.lng,
        cities,
        count: cities.length,
        isExpanded: state.expandedCountry === countryId,
      };
    });
  }, [countryGroups, state.expandedCountry]);

  // 현재 표시할 아이템들 계산
  const visibleItems = useMemo(() => {
    if (state.mode === "country") {
      // 국가 모드: 모든 국가 클러스터 표시
      return countryClusterData;
    } else {
      // 도시 모드: 확장된 국가의 도시들만 표시
      const expandedCountry = countryClusterData.find(c => c.id === state.expandedCountry);
      return expandedCountry ? expandedCountry.cities : [];
    }
  }, [state.mode, state.expandedCountry, countryClusterData]);

  // 국가 클러스터 클릭 핸들러
  const handleCountryClick = useCallback((countryId: string) => {
    setState(prev => {
      if (prev.expandedCountry === countryId && prev.mode === "city") {
        // 이미 확장된 국가를 다시 클릭하면 축소
        return {
          ...prev,
          mode: "country",
          expandedCountry: null,
        };
      } else {
        // 새로운 국가 확장
        return {
          ...prev,
          mode: "city",
          expandedCountry: countryId,
        };
      }
    });
  }, []);

  // 지구본 회전 감지를 위한 상태
  const [lastRotation, setLastRotation] = useState({ lat: 0, lng: 0 });

  // 지구본 회전 시 자동 재클러스터링
  const handleGlobeRotation = useCallback((lat: number, lng: number) => {
    const rotationThreshold = 10; // threshold만큼 회전 시 재클러스터링

    const latDiff = Math.abs(lat - lastRotation.lat);
    const lngDiff = Math.abs(lng - lastRotation.lng);

    if (latDiff > rotationThreshold || lngDiff > rotationThreshold) {
      // 충분히 회전했으면 국가 모드로 복귀
      setState(prev => ({
        ...prev,
        mode: "country",
        expandedCountry: null,
      }));

      setLastRotation({ lat, lng });
    }
  }, [lastRotation]);

  // 현재 상태 리셋 (줌 아웃 등)
  const resetToCountryView = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: "country",
      expandedCountry: null,
    }));
  }, []);

  return {
    // 상태
    mode: state.mode,
    expandedCountry: state.expandedCountry,
    countryClusterData,
    visibleItems,

    // 액션
    handleCountryClick,
    handleGlobeRotation,
    resetToCountryView,

    // 유틸리티
    isCountryExpanded: (countryId: string) => state.expandedCountry === countryId,
    getTotalCitiesCount: () => countries.length,
    getCountriesCount: () => countryGroups.size,
  };
};