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
import { useGlobeState } from "@/hooks/useGlobeState";
import { getBookmarks } from "@/services/bookmarkService";
import { getDiariesList } from "@/services/diaryService";
import { getGlobeData, getTravelInsight } from "@/services/memberService";
import type { TravelPattern } from "@/types/travelPatterns";
import { getAuthInfo } from "@/utils/cookies";
import { getDiaryThumbnails } from "@/utils/diaryThumbnailMapper";
import { mapGlobeDataToTravelPatterns } from "@/utils/globeDataMapper";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => <div></div>,
});

const GlobePage = () => {
  const router = useRouter();
  const { id: urlUuid } = useParams<{ id: string }>();
  const { uuid: cookieUuid } = getAuthInfo();
  const globeRef = useRef<GlobeRef | null>(null);
  const [travelPatterns, setTravelPatterns] = useState<TravelPattern[]>([]);
  const [travelInsight, setTravelInsight] = useState<string>("");
  const [cityCount, setCityCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");
  const [isMyGlobe, setIsMyGlobe] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string>("");
  const [targetMemberId, setTargetMemberId] = useState<number | undefined>(undefined);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [countryThumbnails, setCountryThumbnails] = useState<Record<string, string>>({});
  const [fromSavedGlobe, setFromSavedGlobe] = useState<boolean>(false);

  // Globe 상태 관리
  const { isZoomed, selectedClusterData, handleClusterSelect, handleZoomChange, resetGlobe } =
    useGlobeState(travelPatterns);

  // 이전 경로 확인 (sessionStorage 사용)
  useEffect(() => {
    const fromPage = sessionStorage.getItem("fromSavedGlobe");
    if (fromPage === "true") {
      setFromSavedGlobe(true);
    }
  }, []);

  // Variables
  const listViewPaddingTop = isMyGlobe ? 12 : 28; // 80 - 68 or 80 - 52

  // 실제 API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { uuid: myUuid, memberId } = getAuthInfo();
        if (!urlUuid) {
          router.push("/error?type=404");
          return;
        }

        // 내 지구본 여부 설정
        const isMyGlobeCheck = myUuid === urlUuid;
        setIsMyGlobe(isMyGlobeCheck);

        // URL의 uuid로 지구본 데이터 요청 (토큰 없이)
        const globeResponse = await getGlobeData(urlUuid, undefined, false);
        let insightResponse: string | undefined;
        // 내 지구본일 때만 인사이트 요청 (필요 시 정책 변경 가능, 토큰 없이)
        if (memberId) {
          insightResponse = await getTravelInsight(parseInt(memberId, 10), false);
        }

        // 여행 기록 데이터를 가져와서 도시별/국가별 썸네일 생성
        const diaryData = await getDiariesList(urlUuid);
        const {
          cityThumbnails,
          countryThumbnails: countryThumbMap,
          cityThumbnailsArray,
        } = getDiaryThumbnails(diaryData);

        // 국가 썸네일 state 설정
        setCountryThumbnails(countryThumbMap);

        if (globeResponse?.data) {
          const mappedPatterns = mapGlobeDataToTravelPatterns(globeResponse.data, cityThumbnails, cityThumbnailsArray);
          setTravelPatterns(mappedPatterns);

          // 도시와 국가 개수 설정
          setCityCount(globeResponse.data.cityCount);
          setCountryCount(globeResponse.data.countryCount);

          // 닉네임 설정 (내 지구본이 아닌 경우 사용)
          if (globeResponse.data.nickname) {
            setNickname(globeResponse.data.nickname);
          }

          // 타인의 지구본인 경우 memberId 저장
          if (!isMyGlobeCheck && globeResponse.data.memberId) {
            setTargetMemberId(globeResponse.data.memberId);

            // 북마크 상태 확인
            try {
              const bookmarks = await getBookmarks();
              const isAlreadyBookmarked = bookmarks.some(
                (bookmark) => bookmark.memberId === globeResponse.data.memberId,
              );
              setIsBookmarked(isAlreadyBookmarked);
            } catch {
              // 북마크 목록 조회 실패 시 기본값 유지
            }
          }
        }
        setTravelInsight(insightResponse || "");
      } catch {
        // TODO: 에러 처리 로직 추가
      }
    };

    // API 데이터 로드
    loadData();
  }, [urlUuid, router]);

  const hasBackButton = isZoomed || selectedClusterData !== null;

  if (travelPatterns.length === 0) {
    return (
      <div></div>
      // <div className="w-full h-dvh flex items-center justify-center">
      //   <div className="text-white text-xl text-center">
      //     <div>🌍 여행 데이터가 없습니다</div>
      //     <div className="text-sm text-gray-400 mt-2">사진을 업로드하여 여행 기록을 만들어보세요</div>
      //   </div>
      // </div>
    );
  }

  return (
    <div className="overflow-hidden text-text-primary relative flex flex-col h-dvh">
      <div className="max-w-[512px] mx-auto w-full">
        <Header
          title={`${nickname}님의 지구본`}
          variant="navy"
          {...(isMyGlobe && {
            leftIcon: "menu",
            onLeftClick: () => router.push("/profile"),
            rightIcon: "people",
            onRightClick: () => router.push("/saved-globe"),
          })}
          {...(!isMyGlobe &&
            fromSavedGlobe && {
              leftIcon: "back",
              onLeftClick: () => {
                sessionStorage.removeItem("fromSavedGlobe");
                router.push(`/globe/${cookieUuid}`);
              },
            })}
          style={{
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 20,
          }}
        />
      </div>
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
              countryThumbnails={countryThumbnails}
              isMyGlobe={isMyGlobe}
              uuid={urlUuid}
            />
          </div>

          {/* 하단 버튼들 - position absolute */}
          <div className="absolute bottom-14 left-0 right-0 z-10 px-4">
            <GlobeFooter
              isZoomed={isZoomed}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isMyGlobe={isMyGlobe}
              memberId={targetMemberId}
              isBookmarked={isBookmarked}
              onBookmarkChange={setIsBookmarked}
            />
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
              <ListView travelPatterns={travelPatterns} uuid={urlUuid} />
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
              isMyGlobe={isMyGlobe}
              memberId={targetMemberId}
              isBookmarked={isBookmarked}
              onBookmarkChange={setIsBookmarked}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GlobePage;
