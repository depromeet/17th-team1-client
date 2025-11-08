"use client";

import { useRouter } from "next/navigation";
import { ICArrowLeftIcon } from "@/assets/icons";

export function RecordHeader() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/globe");
  };

  const handleEditClick = () => {
    router.push("/record/edit");
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <button type="button" onClick={handleBackClick} className="flex justify-start items-center">
          <ICArrowLeftIcon className="w-6 h-6" />
        </button>
        <button onClick={handleEditClick} type="button" className="px-2 inline-flex justify-end items-center">
          <div className="text-right justify-start text-state-focused text-base font-bold font-['Pretendard'] leading-5">
            도시 편집
          </div>
        </button>
      </div>
    </div>
  );
}
