"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { HeadlessToastProvider } from "@/components/common/Toast";
import { RecordCard } from "@/components/record/RecordCard";
import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordScrollContainer } from "@/components/record/RecordScrollContainer";
import { RecordScrollHint } from "@/components/record/RecordScrollHint";
import { useRecordScroll } from "@/hooks/useRecordScroll";
import { deleteDiary, getDiariesByUuid } from "@/services/diaryService";
import type { ImageMetadataFromDiary } from "@/types/diary";
import type { Emoji } from "@/types/emoji";
import { getAuthInfo } from "@/utils/cookies";
import { sortDiariesByCountryGrouping } from "@/utils/recordUtils";

type RecordData = {
  id: string;
  cityId: number;
  city: string;
  country: string;
  images: string[];
  imageMetadata?: ImageMetadataFromDiary[];
  userId: string;
  userName: string;
  userAvatar?: string;
  description?: string;
  reactions?: Emoji[];
};

const RecordDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryRecords, setCountryRecords] = useState<RecordData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasShownScrollHint, setHasShownScrollHint] = useState(true);

  const cityId = typeof params.id === "string" ? Number(params.id) : 0;

  // UUID 비교를 통한 소유자 확인
  const queryUuid = searchParams.get("uuid");
  const { uuid: cookieUuid } = getAuthInfo();
  const isOwner = queryUuid !== null && cookieUuid !== null && queryUuid === cookieUuid;

  // URL에서 스크롤 인덱스 읽기
  const scrollIndexParam = searchParams.get("scrollIndex");
  const initialScrollIndex = scrollIndexParam ? Number(scrollIndexParam) : 0;

  // 페이지 진입 시 cityId 유효성 검사
  useEffect(() => {
    if (!cityId || Number.isNaN(cityId) || cityId <= 0) {
      setError("유효하지 않은 도시 ID입니다");
    }
  }, [cityId]);

  // 스크롤 상태 관리
  const { currentRecord, currentIndex, hasNext, hasPrevious, showScrollHint, onScroll } = useRecordScroll({
    countryRecords,
    shouldShowHint: hasShownScrollHint,
    initialIndex: initialScrollIndex,
  });

  // 편집 후 돌아왔을 때 마지막 기록이면 스크롤 힌트를 띄우지 않음
  const isLastRecord = currentIndex === countryRecords.length - 1;
  const shouldShowScrollHint = showScrollHint && !isLastRecord;

  // 스크롤 발생 시 힌트 숨김 상태로 변경
  const handleScroll = (index: number) => {
    if (index !== currentIndex) {
      setHasShownScrollHint(false);
    }
    onScroll(index);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRecordData = async () => {
      if (!cityId || Number.isNaN(cityId) || cityId <= 0) return;
      if (!queryUuid) {
        setError("UUID가 필요합니다");
        return;
      }

      try {
        setError(null);

        const diaries = await getDiariesByUuid(queryUuid);

        if (diaries.length === 0) {
          if (isMounted) {
            setError("여행 기록이 없습니다");
          }
          return;
        }

        // 선택한 도시가 있는지 확인
        const selectedDiary = diaries.find((diary) => diary.cityId === cityId);
        if (!selectedDiary) {
          if (isMounted) {
            setError("해당 도시의 여행 기록을 찾을 수 없습니다");
          }
          return;
        }

        // 국가별로 그룹핑하여 정렬 (선택한 도시의 국가부터 시작)
        const sortedDiaries = sortDiariesByCountryGrouping(diaries, cityId);

        const recordsData: RecordData[] = sortedDiaries.map(
          ({
            id,
            cityId,
            city,
            country,
            images,
            imageMetadata,
            description,
            reactions,
            userId,
            userName,
            userAvatar,
          }) => ({
            id,
            cityId,
            city,
            country,
            images: images.length > 0 ? images : [],
            imageMetadata,
            userId,
            userName,
            userAvatar,
            description,
            reactions,
          }),
        );

        if (isMounted) {
          setCountryRecords(recordsData);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "기록을 불러오는 중 오류가 발생했습니다";
          setError(errorMessage);
        }
      }
    };

    loadRecordData();

    return () => {
      isMounted = false;
    };
  }, [cityId, queryUuid]);

  const handleBack = () => {
    if (queryUuid) {
      router.push(`/globe/${queryUuid}`);
    } else {
      router.push("/globe");
    }
  };

  if (!currentRecord) return null;
  const { city, country, id, images, imageMetadata, userName, userAvatar, description, reactions } =
    currentRecord;

  const handleEdit = () => {
    const params = new URLSearchParams();
    params.set("diaryId", id);
    params.set("cityId", String(cityId));
    params.set("country", country);
    params.set("city", city);
    params.set("scrollIndex", String(currentIndex));
    if (queryUuid) {
      params.set("uuid", queryUuid);
    }
    router.push(`/image-metadata?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!currentRecord) return;

    const confirmed = window.confirm("기록을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠어요?");

    if (confirmed) {
      try {
        await deleteDiary(id);
        router.push("/");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "기록 삭제 중 오류가 발생했습니다";
        alert(errorMessage);
      }
    }
  };

  if (error) {
    return (
      <div className="w-full h-dvh flex flex-col items-center justify-center gap-4 bg-surface-secondary px-4">
        <div className="text-text-primary text-center">
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-opacity-90 transition-opacity"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 단일 기록인 경우 (스크롤 없이 표시)
  if (countryRecords.length === 1) {
    return (
      <HeadlessToastProvider viewportClassName="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[370px] max-w-[calc(100%-32px)]">
        <div className="w-full h-dvh bg-surface-secondary relative max-w-lg mx-auto">
          {/* 헤더 */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <RecordDetailHeader
              city={city}
              country={country}
              onBack={handleBack}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwner={isOwner}
            />
          </div>

          {/* 기록 카드 */}
          <RecordCard
            id={id}
            images={images}
            imageMetadata={imageMetadata}
            userName={userName}
            userAvatar={userAvatar}
            description={description}
            reactions={reactions}
            isOwner={isOwner}
            showScrollHint={shouldShowScrollHint}
          />
        </div>
      </HeadlessToastProvider>
    );
  }

  // 여러 기록이 있는 경우 (스크롤 가능)
  return (
    <HeadlessToastProvider viewportClassName="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[370px] max-w-[calc(100%-32px)]">
      <div className="w-full h-dvh bg-surface-secondary relative max-w-lg mx-auto">
        {/* 고정 헤더 - 현재 기록의 도시/국가로 업데이트 */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <RecordDetailHeader
            city={city}
            country={country}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={isOwner}
          />
        </div>

        {/* 스크롤 힌트 */}
        <RecordScrollHint show={shouldShowScrollHint} />

        {/* 스크롤 컨테이너 */}
        <RecordScrollContainer
          currentIndex={currentIndex}
          onIndexChange={handleScroll}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        >
          {countryRecords.map(
            ({ id, images, imageMetadata, userName, userAvatar, description, reactions }, index) => {
              return (
                <RecordCard
                  key={`${id}-${index}`}
                  id={id}
                  images={images}
                  imageMetadata={imageMetadata}
                  userName={userName}
                  userAvatar={userAvatar}
                  description={description}
                  reactions={reactions}
                  isOwner={isOwner}
                  showScrollHint={shouldShowScrollHint && index === currentIndex}
                />
              );
            },
          )}
        </RecordScrollContainer>
      </div>
    </HeadlessToastProvider>
  );
};

export default RecordDetailPage;
