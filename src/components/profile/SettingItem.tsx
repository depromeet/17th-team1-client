"use client";

import { ChevronRight } from "lucide-react";

type SettingItemProps = {
  label: string;
  onClick?: () => void;
  className?: string;
};

export const SettingItem = ({ label, onClick, className }: SettingItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between w-full p-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity ${
        className || ""
      }`}
    >
      <p className="font-medium text-base text-[rgba(255,255,255,0.60)]">{label}</p>
      <ChevronRight className="size-5 text-[rgba(255,255,255,0.60)] shrink-0" />
    </button>
  );
};
