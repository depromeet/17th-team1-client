"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RecordCard } from "@/components/record/RecordCard";
import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordScrollContainer } from "@/components/record/RecordScrollContainer";
import { RecordScrollHint } from "@/components/record/RecordScrollHint";
import { useRecordScroll } from "@/hooks/useRecordScroll";
import { deleteDiary, getDiariesByUuid } from "@/services/diaryService";
import type { ImageMetadataFromDiary } from "@/types/diary";
import type { Emoji } from "@/types/emoji";
import { getAuthInfo } from "@/utils/cookies";

type RecordData = {
  id: string;
  cityId: number;
  city: string;
  country: string;
  images: string[];
  imageMetadata?: ImageMetadataFromDiary[];
  date?: string;
  location?: string;
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

  const cityId = typeof params.id === "string" ? Number(params.id) : 0;

  // UUID 비교를 통한 소유자 확인
  const queryUuid = searchParams.get("uuid");
  const { uuid: cookieUuid } = getAuthInfo();
  const isOwner = queryUuid !== null && cookieUuid !== null && queryUuid === cookieUuid;

  // 페이지 진입 시 cityId 유효성 검사
  useEffect(() => {
    if (!cityId || Number.isNaN(cityId) || cityId <= 0) {
      setError("유효하지 않은 도시 ID입니다");
    }
  }, [cityId]);

  // 스크롤 상태 관리
  const { currentRecord, currentIndex, hasNext, hasPrevious, showScrollHint, onScroll } = useRecordScroll({
    countryRecords,
  });

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

        // cityId와 일치하는 다이어리들과 나머지 분리
        const matchingDiaries = diaries.filter((diary) => diary.cityId === cityId);
        const otherDiaries = diaries.filter((diary) => diary.cityId !== cityId);

        // cityId와 일치하는 다이어리가 없으면 에러
        if (matchingDiaries.length === 0) {
          if (isMounted) {
            setError("해당 도시의 여행 기록을 찾을 수 없습니다");
          }
          return;
        }

        // 정렬: 일치하는 다이어리들 먼저 → 나머지 다이어리들
        const sortedDiaries = [...matchingDiaries, ...otherDiaries];

        const recordsData: RecordData[] = sortedDiaries.map(
          ({
            id,
            cityId,
            city,
            country,
            images,
            imageMetadata,
            date,
            location,
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
            date,
            location,
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
    if (cookieUuid) {
      router.push(`/globe/${cookieUuid}`);
    } else {
      router.push("/globe");
    }
  };

  if (!currentRecord) return null;
  const { city, country, id, images, imageMetadata, date, location, userName, userAvatar, description, reactions } =
    currentRecord;

  const handleEdit = () => {
    const params = new URLSearchParams();
    params.set("diaryId", id);
    params.set("cityId", String(cityId));
    params.set("country", country);
    params.set("city", city);
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
          date={date}
          location={location}
          userName={userName}
          userAvatar={userAvatar}
          description={description}
          reactions={reactions}
          isOwner={isOwner}
        />
      </div>
    );
  }

  // 여러 기록이 있는 경우 (스크롤 가능)
  return (
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
      <RecordScrollHint show={showScrollHint} />

      {/* 스크롤 컨테이너 */}
      <RecordScrollContainer
        currentIndex={currentIndex}
        onIndexChange={onScroll}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      >
        {countryRecords.map(
          ({ id, images, imageMetadata, date, location, userName, userAvatar, description, reactions }, index) => (
            <RecordCard
              key={`${id}-${index}`}
              id={id}
              images={images}
              imageMetadata={imageMetadata}
              date={date}
              location={location}
              userName={userName}
              userAvatar={userAvatar}
              description={description}
              reactions={reactions}
              isOwner={isOwner}
            />
          ),
        )}
      </RecordScrollContainer>
    </div>
  );
};

export default RecordDetailPage;
