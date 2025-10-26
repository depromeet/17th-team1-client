"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function RecordHeader() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      {/* iPhone Status Bar */}
      <div className="w-96 px-4 py-5 left-0 top-0 absolute inline-flex justify-center items-center gap-40">
        <div className="flex-1 h-5 pt-0.5 flex justify-center items-center gap-2.5">
          <div className="text-center justify-start text-white text-base font-['SF_Pro'] leading-snug">9:41</div>
        </div>
        <div className="flex-1 h-5 pt-px flex justify-center items-center gap-1.5">
          <div className="w-5 h-3 bg-white" />
          <div className="w-4 h-3 bg-white" />
          <div className="w-6 h-3 opacity-30 rounded border border-white" />
          <div className="w-[1.33px] h-1 opacity-40 bg-white" />
          <div className="w-5 h-2 bg-white rounded-sm" />
        </div>
      </div>

      {/* Header with Back Button */}
      <div className="w-96 left-0 top-[62px] absolute bg-slate-900 inline-flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch h-11 px-4 py-1 inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2.5">
            <button
              onClick={handleBackClick}
              className="h-11 min-w-11 px-0.5 bg-blend-multiply bg-white rounded-[296px] flex justify-center items-center gap-3"
            >
              <div className="h-9 min-w-9 px-2 rounded-[100px] flex justify-center items-center">
                <Image
                  src="/back_btn.svg"
                  alt="뒤로가기"
                  width={24}
                  height={24}
                  className="text-State-Enabled"
                />
              </div>
            </button>
          </div>
          <div className="w-16 text-center justify-center text-lg font-bold font-['Pretendard'] leading-normal text-white">
            기록
          </div>
          <div className="justify-start text-State-Focused text-base font-bold font-['Pretendard'] leading-normal">
            도시 편집
          </div>
        </div>
      </div>
    </>
  );
}
