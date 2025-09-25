"use client";

import type { GlobeInstance } from "globe.gl";
import dynamic from "next/dynamic";
import type React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ANIMATION_DURATION, COLORS, EXTERNAL_URLS, GLOBE_CONFIG } from "@/constants/globe";
import { GLOBE_SIZE_LIMITS, VIEWPORT_DEFAULTS } from "@/constants/zoomLevels";
import { type ClusterData, useCountryBasedClustering } from "@/hooks/useCountryBasedClustering";
import { useGlobeState } from "@/hooks/useGlobeState";
import {
  createContinentClusterStyles,
  createCountryClusterStyles,
  createSingleLabelStyles,
} from "@/styles/globeStyles";
import { createGlobeImageUrl } from "@/utils/globeImageGenerator";
import { createZoomPreventListeners, getISOCode, getPolygonColor, getPolygonLabel } from "@/utils/globeUtils";
import {
  calculateClampedDistance,
  calculateLabelPosition,
  createCityClickHandler,
  createCityHTML,
  createClusterClickHandler,
  createContinentClusterHTML,
  createCountryClusterHTML,
} from "./htmlElementRenderer";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

interface CountryBasedGlobeProps {
  travelPatterns: any[];
  currentGlobeIndex: number;
  onCountrySelect: (countryId: string | null) => void;
  onClusterSelect?: (cluster: ClusterData) => void;
  onZoomChange?: (zoom: number) => void;
}

export interface CountryBasedGlobeRef {
  globeRef: React.RefObject<any>;
}

const CountryBasedGlobe = forwardRef<CountryBasedGlobeRef, CountryBasedGlobeProps>(
  ({ travelPatterns, currentGlobeIndex, onCountrySelect, onClusterSelect, onZoomChange }, ref) => {
    const globeRef = useRef<GlobeInstance | null>(null);
    const [globeLoading, setGlobeLoading] = useState(true);
    const [globeError, setGlobeError] = useState<string | null>(null);
    const [countriesData, setCountriesData] = useState<any[]>([]);
    const [windowSize, setWindowSize] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : VIEWPORT_DEFAULTS.WIDTH,
      height: typeof window !== "undefined" ? window.innerHeight : VIEWPORT_DEFAULTS.HEIGHT,
    });

    // Globe state 관리
    const {
      selectedCountry,
      zoomLevel,
      selectedClusterData,
      snapZoomTo,
      isZoomed,
      travelPatternsWithFlags,
      currentPattern,
      handleCountrySelect: globalHandleCountrySelect,
      handleZoomChange: globalHandleZoomChange,
      handleClusterSelect: globalHandleClusterSelect,
      handlePatternChange: localHandlePatternChange, // 이름 변경
      resetGlobe,
    } = useGlobeState(travelPatterns);

    // 부모로부터 받은 currentGlobeIndex를 내부 상태에 동기화
    useEffect(() => {
      localHandlePatternChange(currentGlobeIndex);
    }, [currentGlobeIndex, localHandlePatternChange]);

    // 클러스터링 시스템 사용
    const {
      clusteredData,
      visibleItems,
      mode,
      handleClusterSelect: localHandleClusterSelect,
      handleZoomChange: localHandleZoomChange,
      handleGlobeRotation,
    } = useCountryBasedClustering({
      countries: currentPattern?.countries || [],
      zoomLevel,
      selectedClusterData: selectedClusterData || undefined,
      globeRef,
    });

    // 부모 컴포넌트에 globeRef 노출
    useImperativeHandle(ref, () => ({
      globeRef,
    }));

    const globeImageUrl = createGlobeImageUrl();

    // 국가 데이터 로드
    useEffect(() => {
      const loadCountries = async () => {
        try {
          setGlobeLoading(true);
          setGlobeError(null);

          const response = await fetch(EXTERNAL_URLS.WORLD_GEOJSON);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const countriesData = await response.json();
          const features = countriesData?.features || [];
          setCountriesData(features);
          setGlobeLoading(false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setGlobeError(`국가 데이터 로드 실패: ${errorMessage}`);
          setGlobeLoading(false);
          setCountriesData([]);
        }
      };

      loadCountries();
    }, []);

    // HTML 요소 렌더링
    const getHtmlElement = useCallback(
      (d: any) => {
        if (typeof window === "undefined" || !document) {
          const el = document.createElement("div");
          el.style.display = "none";
          return el;
        }

        const el = document.createElement("div");
        // HTML 컨테이너는 정확히 지구본의 좌표에 위치 (0,0 기준점)
        el.style.position = "absolute";
        el.style.top = "0px";
        el.style.left = "0px";
        el.style.width = "0px";
        el.style.height = "0px";
        el.style.overflow = "visible";
        el.style.pointerEvents = "none"; // 컨테이너는 이벤트 차단
        el.style.zIndex = "999";

        const { angleOffset, dynamicDistance } = calculateLabelPosition(d, visibleItems, zoomLevel, globeRef);

        const clampedDistance = calculateClampedDistance(
          dynamicDistance,
          angleOffset,
          { x: 0, y: 0 },
          d.count === 1,
          globeRef,
        );

        // 기획에 맞는 스타일 선택
        let styles;
        if (d.clusterType === "continent_cluster") {
          styles = createContinentClusterStyles(0, angleOffset, clampedDistance);
        } else if (d.clusterType === "country_cluster") {
          styles = createCountryClusterStyles(0, angleOffset, clampedDistance);
        } else {
          // 개별 도시는 기존 스타일 유지
          styles = createSingleLabelStyles(0, angleOffset, clampedDistance);
        }

        if (d.clusterType === "individual_city") {
          // 개별 도시 표시
          const cityName = d.name.split(",")[0];
          el.innerHTML = createCityHTML(styles, d.flag, cityName);

          const clickHandler = createCityClickHandler(d.name);
          el.addEventListener("click", clickHandler);
        } else if (d.clusterType === "continent_cluster") {
          // 대륙 클러스터 표시 (텍스트로 +숫자) - 클릭 불가능
          el.innerHTML = createContinentClusterHTML(styles, d.name, d.count, d.flag);
          // 대륙 클러스터는 클릭 핸들러를 추가하지 않음 (클릭 불가능)
        } else if (d.clusterType === "country_cluster") {
          // 국가 클러스터 표시 (원 안의 숫자)
          el.innerHTML = createCountryClusterHTML(
            styles,
            d.name,
            d.count,
            d.flag,
            mode === "city" && selectedClusterData !== null, // 도시 모드에서 확장된 것으로 표시
          );

          const clickHandler = createClusterClickHandler(d.id, (clusterId: string) => {
            const cluster = clusteredData.find((c) => c.id === clusterId);
            if (cluster && localHandleClusterSelect) {
              const clusterItems = localHandleClusterSelect(cluster);
              globalHandleClusterSelect({ ...cluster, items: clusterItems });
              onClusterSelect?.(cluster);
            }
          });
          el.addEventListener("click", clickHandler);
        }

        return el;
      },
      [
        clusteredData,
        visibleItems,
        zoomLevel,
        mode,
        selectedClusterData,
        localHandleClusterSelect,
        globalHandleClusterSelect,
        onClusterSelect,
      ],
    );

    // 줌 변경 핸들러
    const handleZoomChangeInternal = useCallback(
      (pov: any) => {
        if (pov && typeof pov.altitude === "number") {
          let newZoom = pov.altitude;

          // 줌 범위 제한
          if (newZoom < GLOBE_CONFIG.MIN_ZOOM) {
            newZoom = GLOBE_CONFIG.MIN_ZOOM;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.MIN_ZOOM }, 0);
            }
          } else if (newZoom > GLOBE_CONFIG.MAX_ZOOM) {
            newZoom = GLOBE_CONFIG.MAX_ZOOM;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.MAX_ZOOM }, 0);
            }
          }

          // 외부에서 스냅 지시가 있으면 해당 값으로 고정
          if (typeof snapZoomTo === "number") {
            newZoom = snapZoomTo;
            if (globeRef.current) {
              globeRef.current.pointOfView({ altitude: newZoom }, 0);
            }
          }

          // 글로벌 줌 핸들러 호출
          globalHandleZoomChange(newZoom);
          onZoomChange?.(newZoom);
        }

        // 지구본 회전 감지
        if (pov && typeof pov.lat === "number" && typeof pov.lng === "number") {
          handleGlobeRotation(pov.lat, pov.lng);
        }
      },
      [globalHandleZoomChange, snapZoomTo, onZoomChange, handleGlobeRotation],
    );

    // 윈도우 리사이즈 감지
    useEffect(() => {
      if (typeof window === "undefined") return;

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Globe 초기 설정
    useEffect(() => {
      if (typeof window === "undefined") return;

      // Timer 변수들을 배열로 관리
      const timers: NodeJS.Timeout[] = [];

      // Globe가 완전히 로드될 때까지 반복적으로 시도
      let attempts = 0;
      const maxAttempts = 50; // 최대 5초까지 시도 (100ms * 50)

      const trySetupControls = () => {
        if (globeRef.current && !globeLoading) {
          // 초기 시점 설정
          globeRef.current.pointOfView({ altitude: GLOBE_CONFIG.INITIAL_ALTITUDE }, ANIMATION_DURATION.INITIAL_SETUP);

          // 줌 제한 설정
          try {
            const controls = globeRef.current.controls();
            if (controls) {
              controls.minDistance = GLOBE_CONFIG.MIN_DISTANCE;
              controls.maxDistance = GLOBE_CONFIG.MAX_DISTANCE;
              controls.enableZoom = true;
              controls.zoomSpeed = 0.5;
              return; // 성공, 더 이상 시도하지 않음
            }
          } catch (error) {
            console.error("Error accessing controls:", error);
          }
        }

        // Globe가 준비되지 않았으면 다시 시도
        attempts++;
        if (attempts < maxAttempts) {
          const nextTimer = setTimeout(trySetupControls, 100);
          timers.push(nextTimer);
        }
      };

      // 첫 번째 시도
      const initialTimer = setTimeout(trySetupControls, ANIMATION_DURATION.SETUP_DELAY);
      timers.push(initialTimer);

      const { preventZoom, preventKeyboardZoom, preventTouchZoom } = createZoomPreventListeners();

      document.addEventListener("wheel", preventZoom, { passive: false });
      document.addEventListener("keydown", preventKeyboardZoom);
      document.addEventListener("touchstart", preventTouchZoom, { passive: false });

      return () => {
        document.removeEventListener("wheel", preventZoom);
        document.removeEventListener("keydown", preventKeyboardZoom);
        document.removeEventListener("touchstart", preventTouchZoom);
        // 모든 타이머 정리
        timers.forEach((timer) => clearTimeout(timer));
      };
    }, [globeLoading]);

    if (globeLoading) {
      return <div className="text-text-secondary text-sm">🌍 지구본 로딩 중...</div>;
    }

    if (globeError) {
      return (
        <div
          style={{
            width: GLOBE_CONFIG.WIDTH,
            height: GLOBE_CONFIG.HEIGHT,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "14px",
            textAlign: "center",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div>⚠️ 지구본 로딩 실패</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>인터넷 연결을 확인해주세요</div>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Globe
          ref={globeRef as any}
          width={windowSize.width}
          // height={Math.min(512, windowSize.width)}
          height={windowSize.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={globeImageUrl}
          showAtmosphere={true}
          atmosphereColor={COLORS.ATMOSPHERE}
          atmosphereAltitude={GLOBE_CONFIG.ATMOSPHERE_ALTITUDE}
          polygonsData={countriesData}
          polygonCapColor={(feature: any) => getPolygonColor(feature, currentPattern?.countries || [], getISOCode)}
          polygonSideColor={() => COLORS.POLYGON_SIDE}
          polygonStrokeColor={() => COLORS.POLYGON_STROKE}
          polygonAltitude={GLOBE_CONFIG.POLYGON_ALTITUDE}
          polygonLabel={(feature: any) => getPolygonLabel(feature, currentPattern?.countries || [], getISOCode)}
          htmlElementsData={visibleItems}
          htmlElement={getHtmlElement}
          htmlAltitude={() => 0}
          enablePointerInteraction={true}
          onZoom={handleZoomChangeInternal}
          // 지구본 회전 감지도 여기서 처리됨
        />
      </div>
    );
  },
);

CountryBasedGlobe.displayName = "CountryBasedGlobe";

export default CountryBasedGlobe;
