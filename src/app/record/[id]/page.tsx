"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RecordCard } from "@/components/record/RecordCard";
import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordScrollContainer } from "@/components/record/RecordScrollContainer";
import { RecordScrollHint } from "@/components/record/RecordScrollHint";
import { useRecordScroll } from "@/hooks/useRecordScroll";

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
  reactions?: Array<{ emoji: string; count: number }>;
};

const RecordDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [countryRecords, setCountryRecords] = useState<RecordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const recordId = params.id as string;

  // 스크롤 상태 관리
  const { currentRecord, currentIndex, hasNext, hasPrevious, showScrollHint, onScroll } = useRecordScroll({
    countryRecords,
  });

  useEffect(() => {
    const loadRecordData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await getCountryRecords(recordId);
        // 서버에서 이미 초기 레코드를 첫 번째로, 나머지는 랜덤 순서로 정렬하여 반환

        // Mock data - 독일의 여러 도시 기록들 (서버에서 정렬된 상태로 반환됨)
        const mockCountryRecords: RecordData[] = [
          {
            id: recordId,
            city: "하이델베르크",
            country: "독일",
            images: [
              "https://picsum.photos/seed/heidelberg1/800/1200",
              "https://picsum.photos/seed/hamburg1/800/1200",
              "https://picsum.photos/seed/berlin1/800/1200",
            ],
            category: "풍경 🌳",
            date: "2024.10",
            location: "하이델베르크, 독일",
            userId: "1",
            userName: "김지구",
            userAvatar: "https://picsum.photos/seed/avatar/100/100",
            description:
              "너무 좋았던 하이델베르크에서의 사진! 처음 갔을 때 설레기도하고 이 사진 찍을 때의 감정을 아직도 못 잊어",
            reactions: [
              { emoji: "😍", count: 234 },
              { emoji: "🥹", count: 234 },
              { emoji: "😀", count: 233 },
            ],
          },
          {
            id: "2",
            city: "함부르크",
            country: "독일",
            images: ["https://picsum.photos/seed/hamburg1/800/1200", "https://picsum.photos/seed/hamburg2/800/1200"],
            category: "음식 🍕",
            date: "2024.10",
            location: "함부르크, 독일",
            userId: "1",
            userName: "김지구",
            userAvatar: "https://picsum.photos/seed/avatar/100/100",
            description: "함부르크 최고다 최고~~",
            reactions: [
              { emoji: "😍", count: 234 },
              { emoji: "🥹", count: 234 },
              { emoji: "😀", count: 233 },
            ],
          },
          {
            id: "3",
            city: "베를린",
            country: "독일",
            images: ["https://picsum.photos/seed/berlin1/800/1200"],
            category: "풍경 🌳",
            date: "2024.10",
            location: "베를린, 독일",
            userId: "1",
            userName: "김지구",
            userAvatar: "https://picsum.photos/seed/avatar/100/100",
            description: "베를린 장벽의 역사를 느끼며",
            reactions: [
              { emoji: "😍", count: 150 },
              { emoji: "🥹", count: 120 },
            ],
          },
        ];

        setCountryRecords(mockCountryRecords);
        setIsLoading(false);
      } catch (_error) {
        setIsLoading(false);
      }
    };

    loadRecordData();
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
      <div className="w-full h-full bg-surface-secondary relative" style={{ height: "100dvh" }}>
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <RecordDetailHeader
            city={currentRecord.city}
            country={currentRecord.country}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
    <div className="w-full h-full bg-surface-secondary relative" style={{ height: "100dvh" }}>
      {/* 고정 헤더 - 현재 기록의 도시/국가로 업데이트 */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <RecordDetailHeader
            city={currentRecord.city}
            country={currentRecord.country}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
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
        {countryRecords.map((record) => (
          <RecordCard
            key={record.id}
            id={record.id}
            images={record.images}
            category={record.category}
            date={record.date}
            location={record.location}
            userName={record.userName}
            userAvatar={record.userAvatar}
            description={record.description}
            reactions={record.reactions}
          />
        ))}
      </RecordScrollContainer>
    </div>
  );
};

export default RecordDetailPage;
