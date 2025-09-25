"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { BackButton } from "@/components/common/button";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
// Components
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import { PatternSelector } from "@/components/globe/PatternSelector";
import type { CountryBasedGlobeRef } from "@/components/react-globe/CountryBasedGlobe";
import { travelPatterns } from "@/data/travelPatterns";
import { useGlobeState } from "@/hooks/useGlobeState";

// CountryBasedGlobe을 동적 import로 로드 (SSR 방지)
const CountryBasedGlobe = dynamic(() => import("@/components/react-globe/CountryBasedGlobe"), {
  ssr: false,
  loading: () => <div>🌍 지구본 생성 중...</div>,
});

const GlobePrototype = () => {
  const globeRef = useRef<CountryBasedGlobeRef>(null);

  // Globe 상태 관리
  const {
    currentGlobeIndex,
    isZoomed,
    selectedClusterData,
    handleCountrySelect,
    handleClusterSelect,
    handleZoomChange,
    handlePatternChange,
    resetGlobe,
  } = useGlobeState(travelPatterns);

  const hasBackButton = isZoomed || selectedClusterData !== null;

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary relative font-sans"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 헤더 - position absolute */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4">
        <GlobeHeader isZoomed={isZoomed || selectedClusterData !== null} />
      </div>

      {/* Country Based Globe 컴포넌트 - 전체 화면 사용 */}
      <div className="w-full h-full relative">
        {/* 패턴 선택 버튼들 - 테스트용 */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 max-w-[512px] mx-auto">
          <PatternSelector
            patterns={travelPatterns}
            currentIndex={currentGlobeIndex}
            onPatternChange={handlePatternChange}
          />
        </div>

        <div className="w-full h-full">
          <CountryBasedGlobe
            ref={globeRef}
            travelPatterns={travelPatterns}
            currentGlobeIndex={currentGlobeIndex}
            onCountrySelect={handleCountrySelect}
            onClusterSelect={handleClusterSelect}
            onZoomChange={handleZoomChange}
          />
        </div>
      </div>

      {/* 하단 버튼들 - position absolute */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4">
        <GlobeFooter isZoomed={isZoomed} />
      </div>

      {/* 돌아가기 버튼 */}
      <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
    </div>
  );
};

export default GlobePrototype;
