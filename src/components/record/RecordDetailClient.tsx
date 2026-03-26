"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HeadlessToastProvider } from "@/components/common/Toast";
import { RecordCard } from "@/components/record/RecordCard";
import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordScrollContainer } from "@/components/record/RecordScrollContainer";
import { RecordScrollHint } from "@/components/record/RecordScrollHint";
import { useDeleteDiaryMutation } from "@/hooks/mutation/useDiaryMutations";
import { useRecordScroll } from "@/hooks/useRecordScroll";
import type { ImageMetadataFromDiary } from "@/types/diary";
import type { Emoji } from "@/types/emoji";

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

type RecordDetailClientProps = {
  initialRecords: RecordData[];
  serverError: string | null;
  cityId: number;
  queryUuid: string | null;
  isOwner: boolean;
  initialScrollIndex: number;
};

const RecordDetailClient = ({
  initialRecords,
  serverError,
  cityId,
  queryUuid,
  isOwner,
  initialScrollIndex,
}: RecordDetailClientProps) => {
  const router = useRouter();
  const [countryRecords] = useState<RecordData[]>(initialRecords);
  const [hasShownScrollHint, setHasShownScrollHint] = useState(true);
  const { mutateAsync: deleteDiary } = useDeleteDiaryMutation();

  // 스크롤 상태 관리
  const { currentRecord, currentIndex, hasNext, hasPrevious, showScrollHint, onScroll } = useRecordScroll({
    countryRecords,
    shouldShowHint: hasShownScrollHint,
    initialIndex: initialScrollIndex,
  });

  const isLastRecord = currentIndex === countryRecords.length - 1;
  const shouldShowScrollHint = showScrollHint && !isLastRecord;

  const handleScroll = (index: number) => {
    if (index !== currentIndex) {
      setHasShownScrollHint(false);
    }
    onScroll(index);
  };

  const handleBack = () => {
    if (queryUuid) {
      router.push(`/globe/${queryUuid}`);
    } else {
      router.push("/globe");
    }
  };

  if (serverError) {
    return (
      <div className="w-full h-dvh flex flex-col items-center justify-center gap-4 bg-surface-secondary px-4">
        <div className="text-text-primary text-center">
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-text-secondary text-sm">{serverError}</p>
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

  if (!currentRecord) return null;
  const { city, country, id, images, imageMetadata, userName, userAvatar, description, reactions } = currentRecord;

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
        await deleteDiary({ diaryId: id });
        router.push("/");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "기록 삭제 중 오류가 발생했습니다";
        alert(errorMessage);
      }
    }
  };

  if (countryRecords.length === 1) {
    return (
      <HeadlessToastProvider viewportClassName="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[370px] max-w-[calc(100%-32px)]">
        <div className="w-full h-dvh bg-surface-secondary relative max-w-lg mx-auto">
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
            isFirstRecord={true}
          />
        </div>
      </HeadlessToastProvider>
    );
  }

  return (
    <HeadlessToastProvider viewportClassName="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[370px] max-w-[calc(100%-32px)]">
      <div className="w-full h-dvh bg-surface-secondary relative max-w-lg mx-auto">
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
        <RecordScrollHint show={shouldShowScrollHint} />
        <RecordScrollContainer
          currentIndex={currentIndex}
          onIndexChange={handleScroll}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        >
          {countryRecords.map(({ id, images, imageMetadata, userName, userAvatar, description, reactions }, index) => (
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
              isFirstRecord={index === 0}
            />
          ))}
        </RecordScrollContainer>
      </div>
    </HeadlessToastProvider>
  );
};

export default RecordDetailClient;
