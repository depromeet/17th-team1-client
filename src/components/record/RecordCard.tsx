"use client";

import type { Emoji } from "@/types/emoji";
import { RecordImageCarousel } from "./RecordImageCarousel";
import { RecordMetaInfo } from "./RecordMetaInfo";
import { RecordReactions } from "./RecordReactions";
import { RecordUserInfo } from "./RecordUserInfo";

type RecordCardProps = {
  id: string;
  images: string[];
  category?: string;
  date?: string;
  location?: string;
  userName: string;
  userAvatar?: string;
  description?: string;
  reactions?: Emoji[];
};

export const RecordCard = ({
  id,
  images,
  category,
  date,
  location,
  userName,
  userAvatar,
  description,
  reactions,
}: RecordCardProps) => {
  return (
    <div className="w-full h-full bg-surface-secondary flex flex-col relative" data-record-card>
      <div
        className="relative min-h-0 flex-1 w-full max-h-[652px]"
        onTouchStart={(e) => {
          // 이미지 캐러셀 내부에서는 수평 스와이프만 허용
          const target = e.target as HTMLElement;
          if (target.closest(".swiper") || target.closest("[data-carousel]")) {
            e.stopPropagation();
          }
        }}
      >
        <RecordImageCarousel images={images} />

        {/* 상단 그라데이션 오버레이 */}
        <div
          className="absolute top-0 left-0 right-0 h-[207px] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, rgba(178, 178, 178, 0) 100%)",
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

        {/* 메타 정보 (태그, 날짜, 위치) */}
        <div className="absolute top-[78px] left-4 z-10">
          <RecordMetaInfo category={category} date={date} location={location} />
        </div>

        {/* 사용자 정보 및 설명 */}
        <div className="absolute bottom-0 left-4 right-4 pb-6 z-10">
          <RecordUserInfo userName={userName} userAvatar={userAvatar} description={description} />
        </div>
      </div>

      {/* 하단 영역 - 이모지 반응 */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: div with stopPropagation for touch/mouse events, not a button */}
      <div
        className="px-4 pt-4 shrink-0"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <RecordReactions recordId={id} initialReactions={reactions || []} />
      </div>
    </div>
  );
};
