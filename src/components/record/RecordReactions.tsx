"use client";

import { AddEmojiIcon, EmojiHintIcon } from "@/assets/icons";
import { useState } from "react";

type Reaction = {
  emoji: string;
  count: number;
};

type RecordReactionsProps = {
  reactions?: Reaction[];
  onAddReaction?: (emoji: string) => void;
};

export const RecordReactions = ({ reactions = [], onAddReaction }: RecordReactionsProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAddEmoji = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction?.(emoji);
    setShowEmojiPicker(false);
  };

  const emptySlots = Math.max(0, 4 - reactions.length);

  return (
    <div className="flex items-center gap-2">
      {/* FAB 이모지 추가 버튼 */}
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
       <AddEmojiIcon  />
      </button>

      {/* 기존 이모지 반응 */}
      {reactions.map((reaction) => (
        <button
          key={`${reaction.emoji}-${reaction.count}`}
          type="button"
          className="w-16 h-16 rounded-full bg-surface-thirdly flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
        >
          <span className="text-2xl leading-none">{reaction.emoji}</span>
          <span className="text-xs font-medium text-text-primary">{reaction.count}</span>
        </button>
      ))}

      {/* 빈 슬롯 */}
      {Array.from({ length: emptySlots }, (_, i) => `empty-slot-${Date.now()}-${i}`).map((slotId) => (
        <button
          key={slotId}
          type="button"
          onClick={handleAddEmoji}
          className="w-16 h-16 rounded-full border border-dashed border-surface-thirdly flex items-center justify-center flex-shrink-0"
          aria-label="이모지 추가"
        >
          <EmojiHintIcon  />
        </button>
      ))}

      {/* 이모지 피커 모달 */}
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
              {["😀", "😍", "🥹", "😂", "😭", "😱", "🔥", "👍", "❤️", "🎉", "✨", "🌟"].map((emoji) => (
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
