"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RecordDetailHeader } from "@/components/record/RecordDetailHeader";
import { RecordImageCarousel } from "@/components/record/RecordImageCarousel";
import { RecordMetaInfo } from "@/components/record/RecordMetaInfo";
import { RecordReactions } from "@/components/record/RecordReactions";
import { RecordUserInfo } from "@/components/record/RecordUserInfo";
import { ChevronDown } from "lucide-react";

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
  const [recordData, setRecordData] = useState<RecordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const recordId = params.id as string;

  useEffect(() => {
    const loadRecordData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await getRecordDetail(recordId);

        // Mock data for now
        const mockData: RecordData = {
          id: recordId,
          city: "하이델베르크",
          country: "독일",
          images: [
            "https://picsum.photos/seed/1/800/1200",
            "https://picsum.photos/seed/2/800/1200",
            "https://picsum.photos/seed/3/800/1200",
          ],
          category: "풍경 🌳",
          date: "2025.02",
          location: "오리지널팬케이크하우스, 광화문",
          userId: "1",
          userName: "김지구",
          userAvatar: "https://picsum.photos/seed/avatar/100/100",
          description:
            "너무 좋았던 하이델베르크에서의 사진! 처음 갔을 때 설레기도하고 이 사진 찍을 때의 감정을 아직도 못 잊어",
          reactions: [
            { emoji: "🥹", count: 234 },
            { emoji: "😍", count: 156 },
          ],
        };

        setRecordData(mockData);
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
    // Navigate to edit page
    router.push(`/record/${recordId}/edit`);
  };

  const handleDelete = () => {
    // Show confirmation alert
    const confirmed = window.confirm("기록을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠어요?");

    if (confirmed) {
      // TODO: Call delete API
      // await deleteRecord(recordId);
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

  if (!recordData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-text-primary">기록을 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden bg-surface-secondary text-text-primary relative font-sans flex flex-col"
      style={{
        height: "100dvh",
      }}
    >
      {/* 이미지 영역 */}
      <div className="relative h-[714px] w-full">
        <RecordImageCarousel images={recordData.images} />

        {/* 상단 그라데이션 오버레이 */}
        <div
          className="absolute top-0 left-0 right-0 h-[207px] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, rgba(178, 178, 178, 0) 100%)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
          }}
        />

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 h-[167px] pointer-events-none">
          <div
            className="h-full rotate-180"
            style={{
              background: "linear-gradient(180deg, #001326 0%, rgba(0, 19, 38, 0) 100%)",
            }}
          />
        </div>

        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <RecordDetailHeader
            city={recordData.city}
            country={recordData.country}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* 메타 정보 (태그, 날짜, 위치) */}
        <div className="absolute top-[118px] left-4 z-10">
          <RecordMetaInfo category={recordData.category} date={recordData.date} location={recordData.location} />
        </div>

        {/* 사용자 정보 및 설명 */}
        <div className="absolute bottom-0 left-4 right-4 pb-6 z-10">
          <RecordUserInfo
            userName={recordData.userName}
            userAvatar={recordData.userAvatar}
            description={recordData.description}
          />
        </div>
      </div>

      {/* 하단 영역 - 이모지 반응 */}
      <div className="px-4 pt-4">
        <RecordReactions reactions={recordData.reactions} />
      </div>

      {/* 다음 기록 안내 */}
      <div className="flex flex-col items-center gap-1 mt-auto pb-6">
        <p className="text-text-thirdly text-sm">다음 기록을 살펴보세요!</p>
        <div className="w-6 h-6 flex items-center justify-center">
          <ChevronDown />
        </div>
      </div>
    </div>
  );
};

export default RecordDetailPage;
