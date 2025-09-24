"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { BackButton } from "@/components/common/button";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
// Components
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import { PatternSelector } from "@/components/globe/PatternSelector";
import type { CountryBasedGlobeRef } from "@/components/react-globe/CountryBasedGlobe";
import { travelPatterns } from "@/data/travelPatterns";

// CountryBasedGlobe을 동적 import로 로드 (SSR 방지)
const CountryBasedGlobe = dynamic(() => import("@/components/react-globe/CountryBasedGlobe"), {
  ssr: false,
  loading: () => <div>🌍 지구본 생성 중...</div>,
});

const GlobePrototype = () => {
  const globeRef = useRef<CountryBasedGlobeRef>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentGlobeIndex, setCurrentGlobeIndex] = useState(0);

  // 현재 패턴의 국가들
  const currentPattern = travelPatterns[currentGlobeIndex];
  const countries = currentPattern.countries;

  // 패턴 변경 핸들러
  const handlePatternChange = (index: number) => {
    setCurrentGlobeIndex(index);
    setSelectedCountry(null);
  };

  // 국가 선택 핸들러
  const handleCountrySelect = (countryId: string | null) => {
    setSelectedCountry(countryId);
  };

  // 리셋 핸들러 (간단하게 선택 해제)
  const resetGlobe = () => {
    setSelectedCountry(null);
  };

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary flex flex-col min-w-[512px] mx-auto relative font-sans px-4"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 헤더 */}
      <GlobeHeader isZoomed={selectedCountry !== null} />

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
            countries={countries}
            onCountrySelect={handleCountrySelect}
          />
        </div>
      </div>

      {/* 하단 버튼들 */}
      <GlobeFooter isZoomed={selectedCountry !== null} />

      {/* 돌아가기 버튼 */}
      <BackButton isZoomed={selectedCountry !== null} globeRef={globeRef} onReset={resetGlobe} />
    </div>
  );
};

export default GlobePrototype;
