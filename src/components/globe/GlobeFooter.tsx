import { HeadlessToast, HeadlessToastProvider } from "@/components/common/toast";
import { useState } from "react";

interface GlobeFooterProps {
  isZoomed: boolean;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export const GlobeFooter = ({ isZoomed, onBackClick, showBackButton = false }: GlobeFooterProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      aria-hidden={isZoomed}
      className={`px-4 pb-4 transition-opacity duration-500 ${isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="relative space-y-2 flex flex-col items-center">
        {/* 돌아가기 버튼 - 줌인 상태이고 showBackButton이 true일 때만 표시 */}
        {showBackButton && isZoomed && (
          <div className="absolute top-0 left-0 right-0 flex justify-center opacity-100 transition-opacity duration-500 z-10">
            <button
              type="button"
              onClick={onBackClick}
              className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              ← 돌아가기
            </button>
          </div>
        )}
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

        {/* 기본 버튼들 - 줌인 상태가 아닐 때만 표시 */}
        {!isZoomed && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
