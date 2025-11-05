"use client";

import { MetadataChip } from "@/components/imageMetadata/MetadataChip";

type RecordMetaInfoProps = {
  category?: string;
  date?: string;
  location?: string;
};

export const RecordMetaInfo = ({ category, date, location }: RecordMetaInfoProps) => {
  if (!category && !date && !location) {
    return null;
  }

  return (
    <div className="flex items-start gap-1 flex-wrap h-8">
      {/* 카테고리 태그 */}
      {category && (
        <div className="bg-surface-inverseprimary text-text-inversesecondary px-3 py-1.5 rounded-lg h-full flex items-center justify-center">
          <span className="text-sm font-medium">{category}</span>
        </div>
      )}

      {/* 날짜 */}
      {date && <MetadataChip iconType="calendar" text={date} />}

      {/* 위치 */}
      {location && <MetadataChip iconType="location" text={location} />}
    </div>
  );
};
