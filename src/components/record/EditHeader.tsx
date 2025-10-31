"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface EditHeaderProps {
  canSave?: boolean;
  onSave?: () => void;
}

export function EditHeader({ canSave = false, onSave }: EditHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex justify-start items-center"
          type="button"
        >
          <div className="w-6 h-6 relative">
            <Image
              src="/ic_arrow_left.svg"
              alt="뒤로가기"
              fill
              className="object-contain"
              priority
            />
          </div>
        </button>

        <div className="text-center justify-center text-text-primary text-lg font-bold font-['Pretendard'] leading-6">
          도시 편집
        </div>

        <button
          type="button"
          onClick={() => canSave && onSave?.()}
          className="px-2 py-1.5 rounded-[200px] inline-flex justify-end items-center"
          disabled={!canSave}
        >
          <div className={`text-right justify-start text-base font-bold font-['Pretendard'] leading-5 ${
            canSave ? "text-theme-color cursor-pointer" : "text-text-thirdly"
          }`}>
            저장
          </div>
        </button>
      </div>
    </div>
  );
}


