"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { BackButton } from "@/components/common/button";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
// Components
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import { PatternSelector } from "@/components/globe/PatternSelector";
import type { ReactGlobeRef } from "@/components/react-globe/ReactGlobe";
import { travelPatterns } from "@/data/travelPatterns";
import { useClustering } from "@/hooks/useClustering";
import { useGlobeState } from "@/hooks/useGlobeState";

// ReactGlobe을 동적 import로 로드 (SSR 방지)
const ReactGlobe = dynamic(() => import("@/components/react-globe/ReactGlobe"), {
  ssr: false,
  loading: () => <div>🌍 지구본 생성 중...</div>,
});

const GlobePrototype = () => {
  const globeRef = useRef<ReactGlobeRef>(null);

  // 커스텀 훅으로 지구본 상태 관리
  const {
    selectedCountry,
    currentGlobeIndex,
    zoomLevel,
    selectedClusterData,
    snapZoomTo,
    isZoomed,
    travelPatternsWithFlags,
    currentPattern,
    handleCountrySelect,
    handleZoomChange,
    handleClusterSelect,
    handlePatternChange,
    resetGlobe,
  } = useGlobeState(travelPatterns);

  // 클러스터링 훅 사용
  const { clusteredData, shouldShowClusters } = useClustering({
    countries: currentPattern.countries,
    zoomLevel,
    selectedClusterData: selectedClusterData || undefined,
  });

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary flex flex-col min-w-[512px] mx-auto relative font-sans px-4"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 헤더 */}
      <GlobeHeader isZoomed={isZoomed} />

      {/* React Globe 컴포넌트 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 패턴 선택 버튼들 - 테스트용 */}
        <PatternSelector
          patterns={travelPatterns}
          currentIndex={currentGlobeIndex}
          onPatternChange={handlePatternChange}
        />

        <div className="w-full h-full flex items-center justify-center">
          <ReactGlobe
            ref={globeRef}
            travelPatterns={travelPatternsWithFlags}
            currentGlobeIndex={currentGlobeIndex}
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
            onZoomChange={handleZoomChange}
            onClusterSelect={handleClusterSelect}
            clusteredData={clusteredData}
            shouldShowClusters={shouldShowClusters}
            zoomLevel={zoomLevel}
            selectedClusterData={selectedClusterData || undefined}
            snapZoomTo={snapZoomTo}
          />
        </div>
      </div>

      {/* 하단 버튼들 */}
      <GlobeFooter isZoomed={isZoomed} />

      {/* 돌아가기 버튼 */}
      <BackButton isZoomed={isZoomed} globeRef={globeRef} onReset={resetGlobe} />
    </div>
  );
};

export default GlobePrototype;
