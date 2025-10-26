"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useState } from "react";
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetCloseButton,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/common/BottomSheet";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

type EditProfileBottomSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialImage?: string;
  onSave: (name: string, image?: string) => void | Promise<void>;
};

export const EditProfileBottomSheet = ({
  isOpen,
  onOpenChange,
  initialName = "",
  initialImage,
  onSave,
}: EditProfileBottomSheetProps) => {
  const nicknameId = useId();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      await onSave(name, image);
      onOpenChange(false);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [name, image, onSave, onOpenChange]);

  return (
    <BottomSheet open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheetContent className="min-h-[812px]">
        <BottomSheetHeader className="w-full h-11 relative">
          <BottomSheetCloseButton
            onClick={() => onOpenChange(false)}
            aria-label="닫기"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6"
          >
            <X size={24} />
          </BottomSheetCloseButton>

          <BottomSheetTitle className="text-lg font-bold text-white text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            프로필 편집
          </BottomSheetTitle>

          <Button
            onClick={handleSave}
            disabled={isLoading || name === initialName}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "bg-transparent text-base font-bold px-2 py-1.5",
              isLoading || name === initialName ? "text-text-thirdly" : "text-blue-theme",
            )}
            variant="primary"
          >
            저장
          </Button>
        </BottomSheetHeader>

        <BottomSheetBody className="items-center !px-0">
          {/* 프로필 이미지 섹션 */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden bg-surface-placeholder--16">
              {image ? (
                <Image src={image} alt="프로필 이미지" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-placeholder--8 flex items-center justify-center" />
              )}
            </div>

            <label className="text-xs font-medium text-text-secondary underline cursor-pointer hover:text-text-primary transition-colors">
              이미지 변경
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* 닉네임 입력 섹션 */}
          <div className="flex flex-col gap-2.5 w-full px-4">
            <label htmlFor={nicknameId} className="text-sm font-medium text-white">
              닉네임
            </label>
            <div className="relative w-full">
              <input
                id={nicknameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="닉네임을 입력하세요"
                className={cn(
                  "w-full h-[50px] px-4 py-3.5",
                  "rounded-[16px] border border-[rgba(255,255,255,0.04)]",
                  "bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.04)], bg-surface-thirdly",
                  "text-base font-medium text-white",
                  "placeholder:text-text-thirdly",
                  "outline-none focus:border-blue-theme transition-colors",
                )}
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), linear-gradient(0deg, #112036 0%, #112036 100%)",
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-xs font-medium text-text-thirdly">{name.length} / 20</span>
              </div>
            </div>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
};
