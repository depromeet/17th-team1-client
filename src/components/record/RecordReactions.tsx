"use client";

import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AddEmojiIcon, EmojiHintIcon } from "@/assets/icons";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type Reaction = {
  emoji: string;
  count: number;
  id: string;
};

type FloatingEmoji = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

type RecordReactionsProps = {
  recordId: string;
  initialReactions?: Reaction[];
  onReactionUpdate?: (reactions: Reaction[]) => void;
  isFriend?: boolean;
};

const MAX_EMPTY_SLOTS = 4;

export const RecordReactions = ({
  recordId,
  initialReactions = [],
  onReactionUpdate,
  isFriend = true,
}: RecordReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isInitialLoad) {
      const sortedReactions = [...initialReactions].sort((a, b) => b.count - a.count);
      setReactions(sortedReactions);
      setIsInitialLoad(false);
    }
  }, [initialReactions, isInitialLoad]);

  // Cleanup: 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      timersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      timersRef.current = [];
    };
  }, []);

  const createFloatingEmojiWithRect = (emoji: string, rect: DOMRect) => {
    // SSR 환경에서 실행되지 않도록 확인
    if (typeof window === "undefined") {
      return;
    }

    // 이미 애니메이션이 진행 중이면 무시
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;

    // RecordCard 찾기 (relative 기준점)
    const recordCard = document.querySelector("[data-record-card]");
    if (!recordCard) {
      isAnimatingRef.current = false;
      return;
    }

    const cardRect = recordCard.getBoundingClientRect();

    // 여러 개의 이모지를 연속으로 생성 (3-5개)
    const emojiCount = Math.floor(Math.random() * 3) + 3;
    const localTimers: NodeJS.Timeout[] = [];

    for (let i = 0; i < emojiCount; i++) {
      const createTimer = setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 60;

        // RecordCard 기준 상대 좌표
        const floatingEmoji: FloatingEmoji = {
          id: `${Date.now()}-${Math.random()}`,
          emoji,
          x: rect.left - cardRect.left + rect.width / 2 + randomX,
          y: rect.top - cardRect.top + rect.height / 2,
        };

        setFloatingEmojis((prev) => [...prev, floatingEmoji]);

        const removeTimer = setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((e) => e.id !== floatingEmoji.id));
        }, 2000);

        timersRef.current.push(removeTimer);
        localTimers.push(removeTimer);
      }, i * 150);

      timersRef.current.push(createTimer);
      localTimers.push(createTimer);
    }

    // 애니메이션이 끝난 후 다시 클릭 가능하도록
    const animationEndTimer = setTimeout(
      () => {
        isAnimatingRef.current = false;
      },
      emojiCount * 150 + 300,
    );

    timersRef.current.push(animationEndTimer);
    localTimers.push(animationEndTimer);
  };

  const handleReactionClick = (reactionId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isFriend) {
      return;
    }

    const reaction = reactions.find((r) => r.id === reactionId);
    if (!reaction) return;

    // Debounce를 사용하여 카운트 업데이트는 즉시, 애니메이션은 제한
    setReactions((prev) => {
      const updatedReactions = prev.map((r) => (r.id === reactionId ? { ...r, count: r.count + 1 } : r));
      onReactionUpdate?.(updatedReactions);
      return updatedReactions;
    });

    // 애니메이션만 debounce 적용 - 버튼 위치를 미리 저장
    const buttonElement = event.currentTarget;
    const rect = buttonElement.getBoundingClientRect();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      createFloatingEmojiWithRect(reaction.emoji, rect);
    }, 100);
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;

    setReactions((prev) => {
      const existingReaction = prev.find((r) => r.emoji === emoji);

      if (existingReaction) {
        const updatedReactions = prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r));

        const clickedReaction = updatedReactions.find((r) => r.emoji === emoji);
        const otherReactions = updatedReactions.filter((r) => r.emoji !== emoji);
        const newOrder = clickedReaction ? [clickedReaction, ...otherReactions] : updatedReactions;

        onReactionUpdate?.(newOrder);
        return newOrder;
      }

      const newReaction: Reaction = {
        emoji,
        count: 1,
        id: `${recordId}-${emoji}-${Date.now()}`,
      };

      const newReactions = [newReaction, ...prev];
      onReactionUpdate?.(newReactions);
      return newReactions;
    });

    setShowEmojiPicker(false);
  };

  const handleAddEmoji = () => {
    setShowEmojiPicker(true);
  };

  const emptySlots = Math.max(0, MAX_EMPTY_SLOTS - reactions.length);
  const hasEmptySlots = reactions.length < MAX_EMPTY_SLOTS;

  return (
    <div className="flex items-center gap-4 relative">
      <button
        type="button"
        onClick={handleAddEmoji}
        className="w-[68px] h-[68px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)]"
        style={{
          background:
            "radial-gradient(circle at 17.15% 14.06%, #00d9ff 0%, #0cdaff 7.02%, #18ddff 14.04%, #30e0ff 28.07%, #48e4ff 42.11%, #60e7ff 56.15%, #93efff 78.07%, #c6f6ff 100%)",
        }}
        aria-label="이모지 추가"
      >
        <AddEmojiIcon />
      </button>

      <div className="flex items-center gap-4">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.id}
            type="button"
            onClick={(e) => handleReactionClick(reaction.id, e)}
            disabled={!isFriend}
            whileTap={isFriend ? { scale: 0.85 } : {}}
            whileHover={isFriend ? { scale: 1.05 } : {}}
            className={`w-[66px] h-[66px] rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0 ${
              isFriend ? "" : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), linear-gradient(90deg, rgba(14, 23, 36, 0.87) 0%, rgba(14, 23, 36, 0.87) 100%)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="text-[20px] leading-none tracking-[-0.8px]">{reaction.emoji}</span>
            <span className="text-[12px] font-semibold text-white leading-[1.5] tracking-[-0.48px]">
              {reaction.count}
            </span>
          </motion.button>
        ))}

        {hasEmptySlots &&
          Array.from({ length: emptySlots }, (_, i) => `empty-${reactions.length + i}`).map((uniqueKey) => (
            <button
              key={uniqueKey}
              type="button"
              onClick={handleAddEmoji}
              className="w-[66px] h-[66px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), linear-gradient(90deg, rgba(14, 23, 36, 0.87) 0%, rgba(14, 23, 36, 0.87) 100%)",
              }}
              aria-label="이모지 추가"
            >
              <EmojiHintIcon />
            </button>
          ))}
      </div>

      <AnimatePresence>
        {floatingEmojis.map((floatingEmoji) => (
          <motion.div
            key={floatingEmoji.id}
            className="fixed pointer-events-none z-50 text-5xl drop-shadow-lg"
            style={{
              left: `${floatingEmoji.x}px`,
              top: `${floatingEmoji.y}px`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
            initial={{
              opacity: 0,
              scale: 0.3,
              y: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.2, 0.5, 1, 0.8],
              y: -200,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 2,
              ease: [0.25, 0.46, 0.45, 0.94],
              times: [0, 0.15, 0.85, 1],
            }}
          >
            {floatingEmoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {showEmojiPicker && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowEmojiPicker(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowEmojiPicker(false);
            }}
            aria-label="이모지 피커 닫기"
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[512px] mx-auto">
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              width="100%"
              height="400px"
              theme={Theme.DARK}
              searchPlaceHolder="이모지를 검색해 보세요"
              previewConfig={{
                showPreview: false,
              }}
              style={{
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                backgroundColor: "#0E1724",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
