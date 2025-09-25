import { useState } from "react";
import { HeadlessToast, HeadlessToastProvider } from "@/components/common/toast";

interface GlobeFooterProps {
  isZoomed: boolean;
}

export const GlobeFooter = ({ isZoomed }: GlobeFooterProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      aria-hidden={isZoomed}
      className={`px-4 pb-4 transition-opacity duration-500 ${isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="space-y-2 flex flex-col items-center">
        <HeadlessToastProvider viewportClassName="absolute bottom-full left-0 right-0 translate-y-[-16px] w-full max-w-[400px] mx-auto bg-[#21272D] rounded-xl">
          <HeadlessToast
            open={open}
            onOpenChange={setOpen}
            className="toast-anim w-full flex items-center rounded-xl bg-[#21272D] text-white pl-3 pr-8 py-3 shadow-lg transition-all duration-200 will-change-[opacity,transform] data-[state=open]:opacity-100 data-[state=open]:translate-y-0 data-[state=closed]:opacity-0 data-[state=closed]:translate-y-1 motion-reduce:transition-none"
            leadingClassName="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-2"
            contentClassName="font-semibold text-sm tracking-[-0.02em] leading-none"
            leading={<span className="text-[20px]">😥</span>}
            duration={3000}
          >
            기능을 준비하고 있어요. 런칭데이에 만나요!
          </HeadlessToast>
        </HeadlessToastProvider>

        {/* 기본 버튼들 - opacity로 제어하여 layout shift 방지 */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full max-w-[400px] text-text-inverseprimary font-bold py-3 rounded-2xl text-base bg-blue-theme cursor-pointer"
          >
            내 지구본 자랑하기
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full max-w-[400px] bg-transparent text-text-primary font-bold py-3 rounded-2xl text-base cursor-pointer"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};
