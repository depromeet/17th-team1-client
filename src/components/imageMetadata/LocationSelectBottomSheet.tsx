"use client";

import { useState } from "react";
import { SearchIcon } from "@/assets/icons";
import { BaseInputBottomSheet } from "./BaseInputBottomSheet";

type LocationSelectBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (date: string) => void;
};

export const LocationSelectBottomSheet = ({ isOpen, onClose, onConfirm }: LocationSelectBottomSheetProps) => {
  const [rawInput, setRawInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(event.target.value);
  };

  const handleConfirm = () => {
    onConfirm?.(rawInput);
    onClose();
    setRawInput("");
  };

  const handleClose = () => {
    onClose();
    setRawInput("");
  };

  return (
    <BaseInputBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="위치 추가"
      isValid={rawInput.length > 0}
    >
      <div className="relative">
        <SearchIcon
          width={20}
          height={20}
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            isFocused ? "text-white" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          value={rawInput}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="장소를 검색해주세요."
          className="w-full bg-[#1B293E] outline-none text-white placeholder-text-thirdly border-[1px] border-[#243246] focus:border-[#778A9B] rounded-3xl pl-12 pr-4 py-[14px] text-base transition-colors"
        />
      </div>
    </BaseInputBottomSheet>
  );
};
