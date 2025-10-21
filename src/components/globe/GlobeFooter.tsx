import { useState } from "react";
import GlobeIcon from "@/assets/icons/globe.svg";
import ListIcon from "@/assets/icons/list.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import ShareIcon from "@/assets/icons/share.svg";

type GlobeFooterProps = {
  isZoomed: boolean;
};

export const GlobeFooter = ({ isZoomed }: GlobeFooterProps) => {
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");

  return (
    <div
      aria-hidden={isZoomed}
      className={`transition-opacity duration-500 w-full max-w-[512px] mx-auto flex items-center justify-center gap-11 ${isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* 공유 버튼 */}
      <button
        type="button"
        className="flex items-center justify-center p-[10px] rounded-[500px] size-[56px] transition-all hover:opacity-80"
        style={{
          background: "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #ffffff2e 0%, #ffffff14 56.15%, #ffffff09 100%)",
        }}
        aria-label="공유하기"
      >
        <ShareIcon className="w-8 h-8" />
      </button>

      {/* 리스트 뷰/글로브 뷰 토글 */}
      <div className="relative flex items-center gap-2 h-[60px] px-2 py-[6px] rounded-[50px] bg-opacity-10 backdrop-blur-sm bg-[var(--color-surface-placeholder--8)] overflow-hidden">
        {/* 슬라이더 배경 */}
        <div
          className="absolute w-[44px] h-[44px] rounded-[50px] bg-[var(--color-surface-inverseprimary)] transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${viewMode === "list" ? "0px" : "calc(44px + 8px)"})` }}
        />

        <button
          type="button"
          onClick={() => setViewMode("list")}
          className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors"
          aria-label="리스트 보기"
        >
          <ListIcon
            className="w-8 h-8"
            style={{ color: viewMode === "list" ? "var(--color-surface-primary)" : "white" }}
          />
        </button>

        <button
          type="button"
          onClick={() => setViewMode("globe")}
          className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors"
          aria-label="글로브 보기"
        >
          <GlobeIcon
            className="w-8 h-8"
            style={{ color: viewMode === "globe" ? "var(--color-surface-primary)" : "white" }}
          />
        </button>
      </div>

      {/* 기록/도시 추가 버튼 */}
      <button
        type="button"
        className="flex items-center justify-center p-[10px] rounded-[500px] size-[56px] transition-all hover:opacity-80"
        style={{
          background: "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #00D9FF 0%, #60E7FF 56.15%, #C6F6FF 100%)",
        }}
        aria-label="새 항목 추가"
      >
        <PlusIcon className="w-8 h-8" style={{ color: "var(--color-surface-primary)" }} />
      </button>
    </div>
  );
};
