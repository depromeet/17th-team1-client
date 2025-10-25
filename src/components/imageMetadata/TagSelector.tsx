"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@/assets/icons";
import { IMAGE_TAGS, type ImageTag, TAG_LABELS } from "@/types/imageMetadata";
import { cn } from "@/utils/cn";

interface TagSelectorProps {
  selectedTag?: ImageTag | null;
  onSelect: (tag: ImageTag) => void;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
}

export function TagSelector({ selectedTag, onSelect, onRemove, placeholder = "태그 지정", className }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (tag: ImageTag) => {
    onSelect(tag);
    setIsOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className={cn("relative inline-block w-fit", className)}>
      <button
        onClick={() => !selectedTag && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-surface-secondary border border-[#0A1C2F] px-2.5 py-2 text-xs font-medium text-white cursor-pointer",
          isOpen ? "rounded-t-xl" : "rounded-xl",
        )}
        type="button"
      >
        <span>{selectedTag ? TAG_LABELS[selectedTag] : placeholder}</span>
        {selectedTag ? (
          <CloseIcon width={6} height={6} onClick={handleRemove} className="text-surface-inversethirdly" />
        ) : isOpen ? (
          <ChevronUpIcon width={12} height={12} />
        ) : (
          <ChevronDownIcon width={12} height={12} />
        )}
      </button>

      {isOpen && !selectedTag && (
        <div className="absolute left-0 top-full z-50 w-full rounded-b-xl bg-surface-secondary/50">
          {IMAGE_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => handleSelect(tag)}
              className={cn(
                "w-full px-4 py-2.5 text-left text-xs text-white transition-colors cursor-pointer",
              )}
            >
              {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
