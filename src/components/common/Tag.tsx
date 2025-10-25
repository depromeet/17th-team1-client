"use client";

import type React from "react";
import { CalendarIcon, CloseIcon, MapPinIcon } from "@/assets/icons";

interface TagProps {
  iconType?: "calendar" | "location" | "custom";
  icon?: React.ReactNode;
  text: string;
  onRemove?: () => void;
}

export function Tag({ iconType = "custom", icon, text, onRemove }: TagProps) {
  const renderIcon = () => {
    if (iconType === "calendar") {
      return <CalendarIcon width={16} height={16} />;
    }
    if (iconType === "location") {
      return <MapPinIcon width={16} height={16} />;
    }
    if (icon) {
      return icon;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2 bg-[#00000066] text-white pl-2 pr-2.5 py-1.5 rounded-lg">
      {/* Left Icon */}
      <div className="flex-shrink-0">{renderIcon()}</div>

      {/* Center Text */}
      <span className="text-sm font-medium">{text}</span>

      {/* Right X Icon */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
          aria-label="Remove tag"
          type="button"
        >
          <CloseIcon width={8} height={8} className="text-[#A8B8C6]" />
        </button>
      )}
    </div>
  );
}
