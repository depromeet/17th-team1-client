"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecordHeader() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <button
          onClick={handleBackClick}
          className="flex justify-start items-center"
        >
          <div className="relative w-5 h-5">
            <Image
              src="/back_btn.svg"
              alt="뒤로가기"
              width={16}
              height={16}
              className="object-contain"
              priority
            />
          </div>
        </button>
        <div className="text-center text-lg font-bold font-['Pretendard'] text-white">
          기록
        </div>
        <div className="text-State-Focused text-base font-bold font-['Pretendard']">
          도시 편집
        </div>
      </div>
    </div>
  );
}
