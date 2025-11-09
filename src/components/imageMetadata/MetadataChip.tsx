"use client";

import type React from "react";
import { CalendarIcon, CloseIcon, MapPinIcon } from "@/assets/icons";

interface MetadataChipProps {
  iconType?: "calendar" | "location" | "custom";
  icon?: React.ReactNode;
  text: string;
  onRemove?: () => void;
  onClick?: () => void;
  isPlaceholder?: boolean;
}

export const MetadataChip = ({ iconType = "custom", icon, text, onRemove, onClick, isPlaceholder = false }: MetadataChipProps) => {
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

  const handleClickChip = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-remove-chip]")) {
      event.stopPropagation();
      onRemove?.();
      return;
    }
    event.stopPropagation();
    onClick?.();
  };

  const handleRemoveChip = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove?.();
  };

  const baseClasses = "inline-flex items-center gap-2 bg-[#000000]/40 pl-2 pr-2.5 py-1.5 rounded-lg";
  const textClasses = isPlaceholder ? "text-[#FFFFFF80]" : "text-white";
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-[#000000]/50 transition-colors" : "";

  if (onClick) {
    return (
      <button onClick={handleClickChip} className={`${baseClasses} ${interactiveClasses}`} type="button">
        {/* Left Icon */}
        <div className="flex-shrink-0">{renderIcon()}</div>

        {/* Center Text */}
        <span className={`text-sm font-medium ${textClasses}`}>{text}</span>

        {/* Right X Icon */}
        {onRemove && (
          <span data-remove-chip className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
            <CloseIcon width={8} height={8} className="text-[#A8B8C6]" />
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {/* Left Icon */}
      <div className="flex-shrink-0">{renderIcon()}</div>

      {/* Center Text */}
      <span className={`text-sm font-medium ${textClasses}`}>{text}</span>

      {/* Right X Icon */}
      {onRemove && (
        <button
          onClick={handleRemoveChip}
          className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
          aria-label="Remove MetadataChip"
          type="button"
        >
          <CloseIcon width={8} height={8} className="text-[#A8B8C6]" />
        </button>
      )}
    </div>
  );
};
