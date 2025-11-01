"use client";

import { AddEmojiIcon, EmojiHintIcon } from "@/assets/icons";
import { useEffect, useState } from "react";

type Reaction = {
  emoji: string;
  count: number;
  id: string;
};

type RecordReactionsProps = {
  recordId: string;
  initialReactions?: Reaction[];
  onReactionUpdate?: (reactions: Reaction[]) => void;
};

const MAX_EMPTY_SLOTS = 4;
const AVAILABLE_EMOJIS = ["😀", "😍", "🥹", "😂", "😭", "😱", "🔥", "👍", "❤️", "🎉", "✨", "🌟"];

export const RecordReactions = ({ recordId, initialReactions = [], onReactionUpdate }: RecordReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      const sortedReactions = [...initialReactions].sort((a, b) => b.count - a.count);
      setReactions(sortedReactions);
      setIsInitialLoad(false);
    }
  }, [initialReactions, isInitialLoad]);

  const handleReactionClick = (reactionId: string) => {
    setReactions((prev) => {
      const updatedReactions = prev.map((r) => (r.id === reactionId ? { ...r, count: r.count + 1 } : r));
      onReactionUpdate?.(updatedReactions);
      return updatedReactions;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
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
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleAddEmoji}
        className="w-[60px] h-[60px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          background:
            "radial-gradient(circle at 17.15% 14.06%, #00d9ff 0%, #0cdaff 7.02%, #18ddff 14.04%, #30e0ff 28.07%, #48e4ff 42.11%, #60e7ff 56.15%, #93efff 78.07%, #c6f6ff 100%)",
        }}
        aria-label="이모지 추가"
      >
        <AddEmojiIcon />
      </button>

      <div className="flex items-center gap-2">
        {reactions.map((reaction) => (
          <button
            key={reaction.id}
            type="button"
            onClick={() => handleReactionClick(reaction.id)}
            className="w-16 h-16 rounded-full bg-surface-thirdly flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
          >
            <span className="text-2xl leading-none">{reaction.emoji}</span>
            <span className="text-xs font-medium text-text-primary">{reaction.count}</span>
          </button>
        ))}

        {hasEmptySlots &&
          Array.from({ length: emptySlots }, (_, i) => i).map((index) => (
            <button
              key={`empty-slot-${index}`}
              type="button"
              onClick={handleAddEmoji}
              className="w-16 h-16 rounded-full border border-dashed border-surface-thirdly flex items-center justify-center flex-shrink-0"
              aria-label="이모지 추가"
            >
              <EmojiHintIcon />
            </button>
          ))}
        </div>

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
          <div className="fixed bottom-0 left-0 right-0 bg-surface-secondary rounded-t-3xl p-6 z-50 max-w-[512px] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text-primary">이모지 선택</h3>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-text-secondary"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-8 gap-3">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-3xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
