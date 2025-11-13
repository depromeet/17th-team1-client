"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

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
  onSave: (name: string, imageFile?: File) => void | Promise<void>;
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges = useMemo(
    () => name !== initialName || selectedImageFile !== undefined,
    [name, initialName, selectedImageFile],
  );

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (예: 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 저장 (저장 버튼 클릭 시 업로드)
    setSelectedImageFile(file);

    // 로컬 프리뷰 표시
    const reader = new FileReader();
    reader.onerror = () => {
      alert("이미지를 불러오는데 실패했습니다.");
    };
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      await onSave(name, selectedImageFile);
      onOpenChange(false);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [name, selectedImageFile, onSave, onOpenChange]);

  useEffect(() => {
    setName(initialName);
    setImage(initialImage);
    setSelectedImageFile(undefined);
  }, [initialName, initialImage]);

  return (
    <BottomSheet open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheetContent className="min-h-[812px] max-w-lg">
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
            disabled={isLoading || !hasChanges || name.length === 0}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "bg-transparent text-base font-bold px-2 py-1.5",
              isLoading || !hasChanges || name.length === 0 ? "text-text-thirdly" : "text-blue-theme",
            )}
            variant="primary"
          >
            저장
          </Button>
        </BottomSheetHeader>

        <BottomSheetBody className="items-center px-0!">
          {/* 프로필 이미지 섹션 */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden bg-surface-placeholder--16">
              <Image src={image || "/assets/default-profile.png"} alt="프로필 이미지" fill className="object-cover" />
            </div>

            <label
              className={cn(
                "text-xs font-medium underline transition-colors",
                isLoading
                  ? "text-text-thirdly cursor-not-allowed"
                  : "text-text-secondary cursor-pointer hover:text-text-primary",
              )}
            >
              {isLoading ? "저장 중..." : "이미지 변경"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 20) {
                    setName(value);
                  }
                }}
                maxLength={20}
                placeholder="닉네임을 입력하세요"
                className={cn(
                  "w-full h-[50px] px-4 py-3.5",
                  "rounded-2xl border border-[rgba(255,255,255,0.04)]",
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
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    name.length === 20 ? "text-white" : "text-text-thirdly",
                  )}
                >
                  {name.length} / 20
                </span>
              </div>
            </div>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
};
