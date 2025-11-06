"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { BackButton } from "@/components/common/Button";
import type { GlobeRef } from "@/components/globe/Globe";
import { GlobeFooter } from "@/components/globe/GlobeFooter";
import { GlobeHeader } from "@/components/globe/GlobeHeader";
import ListView from "@/components/listview/ListView";
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
  const searchParams = useSearchParams();
  const sharedUuid = searchParams.get("uuid");

  const globeRef = useRef<GlobeRef | null>(null);
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelInsight, setTravelInsight] = useState<string>("");
  const [cityCount, setCityCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");
  const [isSharedView, setIsSharedView] = useState(false);

  // Globe 상태 관리
  const { isZoomed, selectedClusterData, handleClusterSelect, handleZoomChange, resetGlobe } =
    useGlobeState(travelPatterns);

  // 실제 API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        let targetUuid: string | null = null;
        let targetMemberId: string | null = null;

        // 공유 링크로 접근한 경우 (uuid 쿼리 파라미터가 있는 경우)
        if (sharedUuid) {
          targetUuid = sharedUuid;
          setIsSharedView(true);
        } else {
          // 일반 로그인 사용자
          const { uuid, memberId } = getAuthInfo();
          targetUuid = uuid;
          targetMemberId = memberId;
        }

        if (!targetUuid) {
          return;
        }

        // 공유 뷰에서는 insight를 가져오지 않음 (memberId가 없기 때문)
        const globeResponse = await getGlobeData(targetUuid);

        let insightResponse = "";
        if (targetMemberId) {
          insightResponse = await getTravelInsight(parseInt(targetMemberId, 10));
        }

        if (globeResponse?.data) {
          const mappedPatterns = mapGlobeDataToTravelPatterns(globeResponse.data);
          setTravelPatterns(mappedPatterns);

          // 도시와 국가 개수 설정
          setCityCount(globeResponse.data.cityCount);
          setCountryCount(globeResponse.data.countryCount);
        }

        setTravelInsight(insightResponse || "");
      } catch {
        // 에러 처리
      }
    };

    // API 데이터 로드
    loadData();
  }, [sharedUuid]);

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
      {viewMode === "globe" ? (
        <div className="absolute inset-0">
          {/* 글로브 뷰 */}

          {/* 상단 헤더 - position absolute */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4">
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
            />
          </div>

          {/* 하단 버튼들 - position absolute */}
          <div className="absolute bottom-14 left-0 right-0 z-10 px-4">
            <GlobeFooter
              isZoomed={isZoomed}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isSharedView={isSharedView}
            />
          </div>

          {/* 돌아가기 버튼 */}
          <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
        </div>
      ) : (
        <>
          {/* 리스트 뷰 */}

          {/* 상단 헤더 */}
          <div className="px-4">
            <GlobeHeader
              isZoomed={false}
              travelInsight={travelInsight}
              cityCount={cityCount}
              countryCount={countryCount}
            />
          </div>

          {/* 리스트뷰 콘텐츠 - 헤더 아래, 푸터 위 */}
          <div className="flex-1 flex flex-col items-center overflow-hidden pb-[120px]">
            <div className="max-w-[512px] w-full h-full mt-4">
              <ListView travelPatterns={travelPatterns} />
            </div>
          </div>

          {/* 하단 버튼들 - 푸터 영역 (absolute 제거) */}
          <div
            className="fixed bottom-0 left-0 right-0 z-10 h-[156px]"
            style={{
              background: "linear-gradient(180deg, rgba(13, 13, 20, 0.00) 0%, #0D0D14 16.35%)",
            }}
          >
            <GlobeFooter
              isZoomed={false}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isSharedView={isSharedView}
            />
          </div>
        </>
      )}
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
