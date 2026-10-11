"use client";

import { MetadataChip } from "@/components/imageMetadata/MetadataChip";
import type { ImageTag } from "@/types/imageMetadata";

type RecordMetaInfoProps = {
  category?: ImageTag;
  date?: string;
  location?: string;
};

const CATEGORY_MAP: Record<Exclude<ImageTag, "NONE">, { label: string; emoji: string }> = {
  PEOPLE: { label: "인물", emoji: "👤" },
  SCENERY: { label: "풍경", emoji: "🌳" },
  FOOD: { label: "음식", emoji: "🍕" },
};

export const RecordMetaInfo = ({ category, date, location }: RecordMetaInfoProps) => {
  if (!category && !date && !location) {
    return null;
  }

  const categoryInfo = category && category !== "NONE" ? CATEGORY_MAP[category] : null;

  return (
    <div className="flex items-start gap-1 flex-wrap h-8">
      {/* 카테고리 태그 */}
      {categoryInfo && (
        <div className="bg-surface-inverseprimary text-text-inversesecondary px-3 py-1.5 rounded-lg h-full flex items-center justify-center gap-1.5">
          <span className="text-sm font-medium">{categoryInfo.label}</span>
          <span className="text-sm">{categoryInfo.emoji}</span>
        </div>
      )}

      {/* 날짜 */}
      {date && <MetadataChip iconType="calendar" text={date} />}

      {/* 위치 */}
      {location && <MetadataChip iconType="location" text={location} />}
    </div>
  );
};
