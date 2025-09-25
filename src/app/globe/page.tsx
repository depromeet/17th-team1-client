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
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary flex flex-col min-w-[512px] mx-auto relative font-sans px-4"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 헤더 */}
      <GlobeHeader isZoomed={isZoomed || selectedClusterData !== null} />

      {/* Country Based Globe 컴포넌트 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 패턴 선택 버튼들 - 테스트용 */}
        <PatternSelector
          patterns={travelPatterns}
          currentIndex={currentGlobeIndex}
          onPatternChange={handlePatternChange}
        />

        <div className="w-full h-full flex items-center justify-center">
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

      {/* 하단 버튼들 */}
      <GlobeFooter isZoomed={isZoomed} />

      {/* 돌아가기 버튼 */}
      <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
    </div>
  );
};

export default GlobePrototype;
