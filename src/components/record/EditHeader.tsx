"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export function EditHeader() {
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

        <div data-property-1="disabled" className="px-2 py-1.5 rounded-[200px] inline-flex justify-end items-center">
          <div className="text-right justify-start text-text-thirdly text-base font-bold font-['Pretendard'] leading-5">
            저장
          </div>
        </div>
      </div>
    </div>
  );
}


