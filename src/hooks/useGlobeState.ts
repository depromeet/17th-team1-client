import { useCallback, useEffect, useMemo, useState } from "react";
import { COUNTRY_CODE_TO_FLAG } from "@/constants/countryMapping";
import { ZOOM_LEVELS } from "@/constants/zoomLevels";
import type { ClusterData } from "@/hooks/useClustering";
import type { CountryData, TravelPattern } from "@/types/travelPatterns";

export const useGlobeState = (patterns: TravelPattern[]) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const currentGlobeIndex = 0; // 항상 첫 번째 패턴만 사용
  const [zoomLevel, setZoomLevel] = useState<number>(ZOOM_LEVELS.DEFAULT);
  const [selectedClusterData, setSelectedClusterData] = useState<CountryData[] | null>(null);
  const [zoomStack, setZoomStack] = useState<number[]>([]);
  const [snapZoomTo, setSnapZoomTo] = useState<number | null>(ZOOM_LEVELS.DEFAULT);
  const [_selectionStack, setSelectionStack] = useState<(CountryData[] | null)[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);

  // 줌 상태 감지 (초기 줌 레벨 2.5에서 줌 인 했을 때 줌된 것으로 간주)
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < ZOOM_LEVELS.ZOOM_THRESHOLD; // 기본값보다 작으면 줌 인 된 것
    setIsZoomed(isCurrentlyZoomed);
  }, [zoomLevel]);

  // 여행 패턴에 플래그 추가
  const travelPatternsWithFlags: TravelPattern[] = useMemo(
    () =>
      patterns.map((pattern) => ({
        ...pattern,
        countries: pattern.countries.map((c) => ({
          ...c,
          flag: COUNTRY_CODE_TO_FLAG[c.id] || "",
        })),
      })),
    [patterns],
  );

  const currentPattern = useMemo(() => travelPatternsWithFlags[currentGlobeIndex], [travelPatternsWithFlags]);

  /**
   * Top 1 국가 선택 로직:
   * 1. city_count가 가장 많은 국가(Top 1)를 선택
   * 2. 동률 발생 시 최근에 기록(updatedAt)된 도시가 포함된 국가를 우선 선정
   *
   * mapper에서 이미 cityCount와 updatedAt을 준비했으므로,
   * 국가별 유일한 데이터 하나를 선택하여 정렬만 수행합니다.
   */
  const topCountry = useMemo(() => {
    if (!currentPattern?.countries || currentPattern.countries.length === 0) {
      return null;
    }

    // 국가별로 유일한 데이터 추출 (각 국가당 1개만 필요 - cityCount는 동일)
    const uniqueCountries = Array.from(new Map(currentPattern.countries.map((c) => [c.id, c])).values());

    // 예외 처리: 1개 국가만 있으면 해당 국가 반환
    if (uniqueCountries.length === 1) {
      return uniqueCountries[0];
    }

    // mapper에서 준비한 cityCount와 updatedAt으로 정렬
    // NOTE: updatedAt은 백엔드에서 도시별 기록 시간을 제공할 때까지 설정되지 않음
    // 현재는 cityCount 기준으로만 Top 1을 선정하며, updatedAt이 추가되면 동률 처리도 적용됨
    const countryStats = uniqueCountries.map((country) => ({
      country,
      cityCount: country.cityCount ?? 1,
      latestTime: country.updatedAt ? new Date(country.updatedAt).getTime() : 0,
    }));

    // city_count로 정렬하여 Top 1 찾기
    countryStats.sort((a, b) => {
      // city_count 내림차순 (기획: 가장 많은 도시 기록 국가)
      if (b.cityCount !== a.cityCount) {
        return b.cityCount - a.cityCount;
      }
      // 동률 시 최근 기록 시간 (내림차순, 기획: 최근에 기록된 도시)
      // updatedAt이 없으면 latestTime = 0이므로 자동으로 이 기준은 미적용됨
      return b.latestTime - a.latestTime;
    });

    return countryStats[0]?.country ?? null;
  }, [currentPattern]);

  /**
   * Top 1 국가의 모든 도시 데이터 (초기 앵커링 시 사용)
   */
  const topCountryCities = useMemo(() => {
    if (!topCountry || !currentPattern?.countries) {
      return null;
    }
    return currentPattern.countries.filter((city) => city.id === topCountry.id);
  }, [topCountry, currentPattern]);

  // 핸들러 함수들
  const handleCountrySelect = useCallback((countryId: string | null) => {
    setSelectedCountry(countryId);
  }, []);

  // 히스테리시스 임계값 (줌인/줌아웃 다르게)
  const CITY_TO_COUNTRY_OUT = ZOOM_LEVELS.THRESHOLDS.CITY_TO_COUNTRY_OUT; // 도시→나라 (줌아웃 시 이탈 기준)
  const COUNTRY_TO_ROOT_OUT = ZOOM_LEVELS.THRESHOLDS.COUNTRY_TO_ROOT_OUT; // 나라→루트 (줌아웃 시 이탈 기준)

  const handleZoomChange = useCallback(
    (newZoomLevel: number) => {
      setZoomLevel((prev) => {
        const rounded = Number(newZoomLevel.toFixed(2));

        // 클릭으로 인한 줌인인 경우 즉시 반영 (부드러운 애니메이션을 위해)
        if (rounded < prev - ZOOM_LEVELS.THRESHOLDS.SMOOTH_ZOOM_JUMP) {
          return rounded;
        }

        // 줌아웃 시작을 감지하면 직전 단계로 스냅
        if (rounded > prev + ZOOM_LEVELS.THRESHOLDS.ZOOM_DETECTION && zoomStack.length > 0) {
          const last = zoomStack[zoomStack.length - 1];

          setSnapZoomTo(last);
          setZoomStack((s) => s.slice(0, -1));

          // 선택 경로도 한 단계 상위로 복원
          setSelectionStack((stack) => {
            if (stack.length === 0) {
              setSelectedClusterData(null);

              return stack;
            }
            const newStack = stack.slice(0, -1);
            const parent = newStack.length > 0 ? newStack[newStack.length - 1] : null;

            setSelectedClusterData(parent || null);

            return newStack;
          });
          return prev;
        }

        // 상위로 충분히 멀어지면 초기화
        if (rounded >= COUNTRY_TO_ROOT_OUT && selectedClusterData) {
          setSelectedClusterData(null);
          setZoomStack([]);
          setSnapZoomTo(null);
          setSelectionStack([]);
        }

        // 스냅 스택이 없는 일반 줌아웃 경로에서 임계값 교차 시 상위로 복원
        if (rounded > prev + ZOOM_LEVELS.THRESHOLDS.ZOOM_DETECTION && zoomStack.length === 0) {
          // 도시 → 나라 경계 상향 교차
          if (prev <= CITY_TO_COUNTRY_OUT && rounded >= CITY_TO_COUNTRY_OUT) {
            setSelectionStack((stack) => {
              if (stack.length === 0) return stack;

              const newStack = stack.slice(0, -1);
              const parent = newStack.length > 0 ? newStack[newStack.length - 1] : null;

              setSelectedClusterData(parent || null);

              return newStack;
            });
          }
        }

        // 작은 변화도 반영 (더 부드러운 줌)
        if (Math.abs(prev - rounded) >= ZOOM_LEVELS.THRESHOLDS.SMOOTH_ZOOM_THRESHOLD) {
          return rounded;
        }

        return prev;
      });
    },
    [selectedClusterData, zoomStack, CITY_TO_COUNTRY_OUT, COUNTRY_TO_ROOT_OUT],
  );

  // 클러스터 선택 핸들러
  const handleClusterSelect = useCallback(
    (cluster: ClusterData) => {
      // 현재 줌/선택을 스택에 저장하고 선택 갱신
      setZoomStack((prev) => [...prev, zoomLevel]);
      setSelectionStack((stack) => [...stack, selectedClusterData ? [...selectedClusterData] : null]);
      setSelectedClusterData(cluster.items);
    },
    [zoomLevel, selectedClusterData],
  );

  // 휠로 줌아웃 시, 가까운 스냅 지점으로 자동 복귀 (직전 스택 단계)
  useEffect(() => {
    if (typeof snapZoomTo === "number") {
      const t = setTimeout(() => setSnapZoomTo(null), 120);
      return () => clearTimeout(t);
    }
  }, [snapZoomTo]);

  const resetGlobe = useCallback(() => {
    setSelectedClusterData(null);
    setZoomStack([]);
    setSelectionStack([]);
    setZoomLevel(ZOOM_LEVELS.DEFAULT);
    setSnapZoomTo(null);
  }, []);

  return {
    // State
    selectedCountry,
    currentGlobeIndex,
    zoomLevel,
    selectedClusterData,
    snapZoomTo,
    isZoomed,
    travelPatternsWithFlags,
    currentPattern,
    topCountry,
    topCountryCities,

    // Handlers
    handleCountrySelect,
    handleZoomChange,
    handleClusterSelect,
    resetGlobe,
  };
};
