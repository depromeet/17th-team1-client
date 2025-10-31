"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecordHeader() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleEditClick = () => {
    router.push("/record/edit");
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <button
          onClick={handleBackClick}
          className="flex justify-start items-center"
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
        <button
          onClick={handleEditClick}
          type="button"
          className="px-2 py-1.5 rounded-[200px] inline-flex justify-end items-center"
        >
          <div className="text-right justify-start text-state-focused text-base font-bold font-['Pretendard'] leading-5">
            도시 편집
          </div>
        </button>
      </div>
    </div>
  );
}
