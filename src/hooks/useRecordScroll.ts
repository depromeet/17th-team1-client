import { useCallback, useEffect, useState } from "react";
import type { Emoji } from "@/types/emoji";

type RecordScrollItem = {
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

type UseRecordScrollParams = {
  countryRecords: RecordScrollItem[];
};

type UseRecordScrollReturn = {
  currentRecord: RecordScrollItem | null;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  showScrollHint: boolean;
  onScroll: (index: number) => void;
  hideScrollHint: () => void;
};

export const useRecordScroll = ({ countryRecords }: UseRecordScrollParams): UseRecordScrollReturn => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: countryRecords 변경 시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [countryRecords]);

  // 현재 기록
  const currentRecord = countryRecords[currentIndex] || null;

  // 다음/이전 존재 여부
  const hasNext = currentIndex < countryRecords.length - 1;
  const hasPrevious = currentIndex > 0;

  // 외부에서 인덱스 변경 시 (스냅 스크롤)
  const onScroll = useCallback(
    (index: number) => {
      if (index >= 0 && index < countryRecords.length) {
        setCurrentIndex(index);

        // 스크롤이 발생하면 힌트 숨김
        if (index > 0 && showScrollHint) {
          setShowScrollHint(false);
        }
      }
    },
    [countryRecords.length, showScrollHint],
  );

  // 힌트 수동 숨김
  const hideScrollHint = useCallback(() => {
    setShowScrollHint(false);
  }, []);

  // 초기 힌트 표시 (해당 국가의 기록 수 >= 2일 때만)
  useEffect(() => {
    if (countryRecords.length >= 2) {
      // 페이지 로드 후 힌트 표시
      setShowScrollHint(true);
    } else {
      setShowScrollHint(false);
    }
  }, [countryRecords.length]);

  return {
    currentRecord,
    currentIndex,
    hasNext,
    hasPrevious,
    showScrollHint,
    onScroll,
    hideScrollHint,
  };
};
