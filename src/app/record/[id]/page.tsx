"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RecordCard } from "@/components/record/RecordCard";
import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordScrollContainer } from "@/components/record/RecordScrollContainer";
import { RecordScrollHint } from "@/components/record/RecordScrollHint";
import { useRecordScroll } from "@/hooks/useRecordScroll";
import { getDiaryDetail } from "@/services/diaryService";
import { getMyProfile } from "@/services/profileService";
import type { Emoji } from "@/types/emoji";

type RecordData = {
  id: string;
  city: string;
  country: string;
  images: string[];
  category?: string;
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
  const [countryRecords, setCountryRecords] = useState<RecordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recordId = typeof params.id === "string" ? params.id : "";

  // 페이지 진입 시 recordId 유효성 검사
  useEffect(() => {
    if (!recordId || recordId.trim() === "") {
      setError("유효하지 않은 기록 ID입니다");
      setIsLoading(false);
    }
  }, [recordId]);

  // 스크롤 상태 관리
  const { currentRecord, currentIndex, hasNext, hasPrevious, showScrollHint, onScroll } = useRecordScroll({
    countryRecords,
  });

  useEffect(() => {
    let isMounted = true;

    const loadRecordData = async () => {
      if (!recordId || recordId.trim() === "") return;

      try {
        setError(null);

        const [diaryDetail, profile] = await Promise.all([getDiaryDetail(recordId), getMyProfile()]);

        const { id, city, country, images, date, location, description, reactions } = diaryDetail;
        const { memberId, nickname, profileImageUrl } = profile;

        const recordData: RecordData = {
          id,
          city,
          country,
          images,
          date,
          location,
          userId: String(memberId),
          userName: nickname,
          userAvatar: profileImageUrl,
          description,
          reactions,
        };

        if (isMounted) {
          setCountryRecords([recordData]);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "기록을 불러오는 중 오류가 발생했습니다";
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    loadRecordData();

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (!currentRecord) return;
    router.push(`/record/${currentRecord.id}/edit`);
  };

  const handleDelete = () => {
    if (!currentRecord) return;

    const confirmed = window.confirm("기록을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠어요?");

    if (confirmed) {
      // TODO: Call delete API
      // await deleteRecord(currentRecord.id);
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-text-primary">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-surface-secondary px-4">
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

  if (!currentRecord) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-text-primary">기록을 찾을 수 없습니다</div>
      </div>
    );
  }

  // 단일 기록인 경우 (스크롤 없이 표시)
  if (countryRecords.length === 1) {
    return (
      <div className="w-full h-screen bg-surface-secondary relative max-w-[512px] mx-auto">
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <RecordDetailHeader
            city={currentRecord.city}
            country={currentRecord.country}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner
          />
        </div>

        {/* 기록 카드 */}
        <RecordCard
          id={currentRecord.id}
          images={currentRecord.images}
          category={currentRecord.category}
          date={currentRecord.date}
          location={currentRecord.location}
          userName={currentRecord.userName}
          userAvatar={currentRecord.userAvatar}
          description={currentRecord.description}
          reactions={currentRecord.reactions}
        />
      </div>
    );
  }

  // 여러 기록이 있는 경우 (스크롤 가능)
  return (
    <div className="w-full h-screen bg-surface-secondary relative max-w-[512px] mx-auto">
      {/* 고정 헤더 - 현재 기록의 도시/국가로 업데이트 */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <RecordDetailHeader
          city={currentRecord.city}
          country={currentRecord.country}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isOwner
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
          ({ id, images, category, date, location, userName, userAvatar, description, reactions }) => (
            <RecordCard
              key={id}
              id={id}
              images={images}
              category={category}
              date={date}
              location={location}
              userName={userName}
              userAvatar={userAvatar}
              description={description}
              reactions={reactions}
            />
          ),
        )}
      </RecordScrollContainer>
    </div>
  );
};

export default RecordDetailPage;
