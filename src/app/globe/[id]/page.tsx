"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/common/Button";
import { Header } from "@/components/common/Header";
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

const GlobePage = () => {
  const router = useRouter();
  const { id: urlUuid } = useParams<{ id: string }>();
  const globeRef = useRef<GlobeRef | null>(null);
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([]);
  const [travelInsight, setTravelInsight] = useState<string>("");
  const [cityCount, setCityCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");
  const [isMyGlobe, setIsMyGlobe] = useState<boolean>(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [nickname, setNickname] = useState<string>("");

  // Globe 상태 관리
  const { isZoomed, selectedClusterData, handleClusterSelect, handleZoomChange, resetGlobe } =
    useGlobeState(travelPatterns);

  // Variables
  const listViewPaddingTop = isMyGlobe ? 12 : 28; // 80 - 68 or 80 - 52

  // 실제 API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { uuid: myUuid, memberId } = getAuthInfo();
        if (!urlUuid) {
          return;
        }

        // 내 지구본 여부 설정
        if (myUuid) {
          setIsMyGlobe(myUuid === urlUuid);
        }

        // URL의 uuid로 지구본 데이터 요청
        const globeResponse = await getGlobeData(urlUuid);
        let insightResponse: string | undefined;
        // 내 지구본일 때만 인사이트 요청 (필요 시 정책 변경 가능)
        if (memberId) {
          insightResponse = await getTravelInsight(parseInt(memberId, 10));
        }

        if (globeResponse?.data) {
          const mappedPatterns = mapGlobeDataToTravelPatterns(globeResponse.data);
          setTravelPatterns(mappedPatterns);

          // 도시와 국가 개수 설정
          setCityCount(globeResponse.data.cityCount);
          setCountryCount(globeResponse.data.countryCount);

          // 닉네임 설정 (내 지구본이 아닌 경우 사용)
          if (globeResponse.data.nickname) {
            setNickname(globeResponse.data.nickname);
          }
        }
        setTravelInsight(insightResponse || "");
      } catch {
        // 에러 처리
      } finally {
        setIsDataReady(true);
      }
    };

    // API 데이터 로드
    loadData();
  }, [urlUuid]);

  const hasBackButton = isZoomed || selectedClusterData !== null;

  // 데이터 또는 스플래시가 끝나기 전에는 로딩 유지
  if (!isDataReady || !isSplashDone) {
    return <GlobeLoading onComplete={() => setIsSplashDone(true)} />;
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
      <Header
        title={isMyGlobe ? "" : `${nickname}님의 지구본`}
        variant="navy"
        {...(isMyGlobe && {
          leftIcon: "menu",
          onLeftClick: () => router.push("/profile"),
          rightIcon: "people",
          onRightClick: () => console.log("people"),
        })}
        style={{
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 20,
        }}
      />
      {viewMode === "globe" ? (
        <div className="absolute inset-0">
          {/* 글로브 뷰 */}

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
              cityClickMode={isMyGlobe ? "default" : "other"}
            />
          </div>

          {/* 하단 버튼들 - position absolute */}
          <div className="absolute bottom-14 left-0 right-0 z-10 px-4">
            <GlobeFooter isZoomed={isZoomed} viewMode={viewMode} onViewModeChange={setViewMode} isMyGlobe={isMyGlobe} />
          </div>

          {/* 돌아가기 버튼 */}
          <BackButton isZoomed={hasBackButton} globeRef={globeRef} onReset={resetGlobe} />
        </div>
      ) : (
        <>
          {/* 리스트 뷰 */}

          {/* 상단 헤더 */}
          <div className="px-4" style={{ paddingTop: `${listViewPaddingTop}px` }}>
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
            <GlobeFooter isZoomed={false} viewMode={viewMode} onViewModeChange={setViewMode} isMyGlobe={isMyGlobe} />
          </div>
        </>
      )}
    </div>
  );
};

export default GlobePage;
