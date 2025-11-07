"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface EditHeaderProps {
  title?: string;
  canSave?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
  onBack?: () => void;
}

export function EditHeader({
  title = "도시 편집",
  canSave = false,
  onSave,
  showSaveButton = true,
  onBack,
}: EditHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-8">
      <div className="relative flex justify-between items-center">
        <div className="w-24 flex justify-start items-center">
          <button onClick={handleBackClick} className="flex justify-start items-center" type="button">
            <div className="w-6 h-6 relative">
              <Image src="/ic_arrow_left.svg" alt="뒤로가기" fill className="object-contain" priority />
            </div>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-center text-text-primary text-lg font-bold font-['Pretendard'] leading-6">
          {title}
        </div>

        <div className="w-24 flex justify-end items-center">
          {showSaveButton ? (
            <button
              type="button"
              onClick={() => canSave && onSave?.()}
              className="px-2 inline-flex justify-end items-center"
              disabled={!canSave}
            >
              <div
                className={`text-right justify-start text-base font-bold font-['Pretendard'] leading-5 ${
                  canSave ? "text-theme-color cursor-pointer" : "text-text-thirdly"
                }`}
              >
                저장
              </div>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
