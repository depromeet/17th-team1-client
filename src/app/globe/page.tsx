"use client";

import dynamic from "next/dynamic";

import { Suspense, useEffect, useRef, useState } from "react";

import { BackButton } from "@/components/common/Button";
import type { GlobeRef } from "@/components/globe/Globe";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import { GlobeLoading } from "@/components/loading/GlobeLoading";
import { useGlobeState } from "@/hooks/useGlobeState";
import { getGlobeData, getTravelInsight } from "@/services/memberService";
import type { TravelPattern } from "@/types/travelPatterns";
import { getAuthInfo } from "@/utils/cookies";
import { mapGlobeDataToTravelPatterns } from "@/utils/globeDataMapper";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => <div></div>,
});

const GlobeContent = () => {
  const globeRef = useRef<GlobeRef | null>(null);
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelInsight, setTravelInsight] = useState<string>("");
  const [cityCount, setCityCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);

  // Globe 상태 관리
  const { isZoomed, selectedClusterData, handleClusterSelect, handleZoomChange, resetGlobe } =
    useGlobeState(travelPatterns);

  // 로그인한 사용자의 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { uuid, memberId } = getAuthInfo();

        if (!uuid || !memberId) {
          return;
        }

        const globeResponse = await getGlobeData(uuid);
        const insightResponse = await getTravelInsight(parseInt(memberId, 10));

        if (globeResponse?.data) {
          const mappedPatterns = mapGlobeDataToTravelPatterns(globeResponse.data);
          setTravelPatterns(mappedPatterns);

          setCityCount(globeResponse.data.cityCount);
          setCountryCount(globeResponse.data.countryCount);
        }

        setTravelInsight(insightResponse || "");
      } catch {
        // 에러 처리
      }
    };

    loadData();
  }, []);

  const hasBackButton = isZoomed || selectedClusterData !== null;

  // 로딩 완료 콜백
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // 로딩 중이거나 데이터가 없는 경우
  if (isLoading) {
    return <GlobeLoading onComplete={handleLoadingComplete} />;
  }

  if (travelPatterns.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-white text-xl text-center">
          <div>🌍 여행 데이터가 없습니다</div>
          <div className="text-sm text-gray-400 mt-2">사진을 업로드하여 여행 기록을 만들어보세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden text-text-primary relative font-sans flex flex-col h-screen">
      <div className="absolute inset-0">
        {/* 상단 헤더 - position absolute */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-20">
          <GlobeHeader
            isZoomed={isZoomed || selectedClusterData !== null}
            travelInsight={travelInsight}
            cityCount={cityCount}
            countryCount={countryCount}
          />
        </div>

        {/* Country Based Globe 컴포넌트 - 전체 화면 사용 */}
        <div className="w-full h-full">
          <Globe
            ref={globeRef}
            travelPatterns={travelPatterns}
            currentGlobeIndex={0}
            onClusterSelect={handleClusterSelect}
            onZoomChange={handleZoomChange}
            disableCityClick={true}
          />
        </div>

        {/* 하단 버튼들 - position absolute */}
        <div className="absolute bottom-14 left-0 right-0 z-10 px-4">
          <GlobeFooter isZoomed={isZoomed} isFirstGlobe={true} />
        </div>

        {/* 돌아가기 버튼 */}
        <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
      </div>
    </div>
  );
};

const GlobePrototype = () => {
  return (
    <Suspense fallback={<GlobeLoading onComplete={() => {}} />}>
      <GlobeContent />
    </Suspense>
  );
};

export default GlobePrototype;
