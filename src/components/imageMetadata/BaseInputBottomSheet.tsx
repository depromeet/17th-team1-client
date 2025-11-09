"use client";

import { X } from "lucide-react";
import {
  BottomSheet,
  BottomSheetCloseButton,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/common/BottomSheet";
import { Button } from "@/components/common/Button";

type BaseInputBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  isValid: boolean;
};

export const BaseInputBottomSheet = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  isValid,
}: BaseInputBottomSheetProps) => {
  return (
    <BottomSheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent className="max-w-[512px] min-h-[812px] !px-4 flex flex-col">
        <BottomSheetHeader className="w-full h-11 relative !px-0">
          <BottomSheetTitle className="text-lg font-bold text-white text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {title}
          </BottomSheetTitle>

          <BottomSheetCloseButton
            onClick={onClose}
            aria-label="닫기"
            className="!absolute !right-0 !left-auto top-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <X size={24} />
          </BottomSheetCloseButton>
        </BottomSheetHeader>

        {/* Input Area */}
        <div className="flex-1 py-6">{children}</div>

        {/* Confirm Button */}
        <div className="pb-5">
          <Button
            variant={isValid ? "primary" : "disabled"}
            size="lg"
            onClick={onConfirm}
            disabled={!isValid}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
};
