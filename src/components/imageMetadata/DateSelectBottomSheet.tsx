"use client";

import { useState } from "react";
import { BaseInputBottomSheet } from "./BaseInputBottomSheet";

type DateSelectBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (date: string) => void;
};

export const DateSelectBottomSheet = ({ isOpen, onClose, onConfirm }: DateSelectBottomSheetProps) => {
  const [rawInput, setRawInput] = useState("");

  const formatDisplayValue = (digits: string) => {
    if (digits.length === 0) return "";
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, "");

    if (value.length <= 6) {
      setRawInput(value);
    }
  };

  const dateInput = formatDisplayValue(rawInput);

  const isValidDate = () => {
    const dateRegex = /^\d{4}\.\d{2}$/;
    if (!dateRegex.test(dateInput)) return false;

    const [, month] = dateInput.split(".").map(Number);
    if (month < 1 || month > 12) return false;

    return true;
  };

  const handleConfirm = () => {
    if (isValidDate()) {
      onConfirm?.(dateInput);
      onClose();
      setRawInput("");
    }
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
      title="날짜 추가"
      isValid={isValidDate()}
    >
      <input
        type="text"
        value={dateInput}
        onChange={handleInputChange}
        placeholder="YYYY.MM"
        className="w-full bg-[#1B293E] outline-none text-white placeholder-text-thirdly border-[1px] border-[#243246] focus:border-[#778A9B] rounded-3xl px-4 py-[14px] text-base transition-colors"
        inputMode="numeric"
      />
    </BaseInputBottomSheet>
  );
};
