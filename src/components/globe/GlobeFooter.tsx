"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@/assets/icons";
import GlobeIcon from "@/assets/icons/globe.svg";
import ListIcon from "@/assets/icons/list.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import { ShareButton } from "./ShareButton";

type GlobeFooterProps = {
  isZoomed: boolean;
  viewMode?: "globe" | "list";
  onViewModeChange?: (mode: "globe" | "list") => void;
  isMyGlobe?: boolean;
  isFirstGlobe?: boolean;
};

const DESCRIPTIONS = [
  "다녀온 도시가 많을수록 나라 색이 밝아져요.",
  "클러스터 마커는 확대하면 도시별로 풀려요.",
  "+ 버튼을 눌러 새로운 여행을 기록해보세요.",
];

const getRandomDescriptionIndex = (currentIndex: number): number => {
  let nextIndex = Math.floor(Math.random() * DESCRIPTIONS.length);
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * DESCRIPTIONS.length);
  }
  return nextIndex;
};

export const GlobeFooter = ({
  isZoomed,
  viewMode = "globe",
  onViewModeChange,
  isMyGlobe = true,
  isFirstGlobe = false,
}: GlobeFooterProps) => {
  const [descriptionIndex, setDescriptionIndex] = useState(() => Math.floor(Math.random() * DESCRIPTIONS.length));
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setDescriptionIndex((prevIndex) => getRandomDescriptionIndex(prevIndex));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden={isZoomed}
      className={`transition-opacity duration-500 w-full max-w-[512px] mx-auto flex flex-col items-center justify-center pt-10 ${
        isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 첫 지구본: 자랑하기/홈 버튼 */}
      {isFirstGlobe ? (
        <div className="w-full max-w-[512px] flex flex-col gap-3">
          {/* 내 지구본 자랑하기 버튼 */}
          <button
            type="button"
            className="w-full flex items-center justify-center px-12 py-[17px] rounded-[1000px] bg-[#00d9ff] transition-all hover:opacity-80 cursor-pointer"
            aria-label="내 지구본 자랑하기"
          >
            <p className="font-bold text-base text-black leading-[1.3]">내 지구본 자랑하기</p>
          </button>

          {/* 홈으로 이동 버튼 */}
          <button
            type="button"
            className="w-full flex items-center justify-center px-12 py-[17px] rounded-[1000px] transition-all hover:opacity-80 cursor-pointer"
            style={{
              background: "rgb(13, 12, 20) 100%)",
            }}
            aria-label="홈으로 이동"
            onClick={() => router.push("/")}
          >
            <p className="font-bold text-base text-white leading-[1.3]">홈으로 이동</p>
          </button>
        </div>
      ) : (
        <>
          {/* 설명 문구 - 지구본 뷰일 때만 표시 (내 지구본일 때만) */}
          {viewMode === "globe" && isMyGlobe && (
            <div className="mb-14 text-center min-h-[28px]">
              <p
                key={descriptionIndex}
                className="text-sm font-medium text-text-secondary"
                style={{
                  animation: "slideInFromTop 0.5s ease-out",
                }}
              >
                {DESCRIPTIONS[descriptionIndex]}
              </p>
            </div>
          )}

          {/* 버튼 래퍼 */}
          {isMyGlobe ? (
            // 내 지구본: 공유 버튼, 토글, 플러스 버튼 (중앙 정렬)
            <div className="flex items-center justify-center gap-11">
              {/* 공유 버튼 */}
              <ShareButton />

              {/* 리스트 뷰/글로브 뷰 토글 */}
              <div className="relative flex items-center gap-2 h-[60px] px-2 py-[6px] rounded-[50px] bg-opacity-10 backdrop-blur-sm bg-[var(--color-surface-placeholder--8)] overflow-hidden">
                {/* 슬라이더 배경 */}
                <div
                  className="absolute w-[44px] h-[44px] rounded-[50px] bg-[var(--color-surface-inverseprimary)] transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(${viewMode === "list" ? "0px" : "calc(44px + 8px)"})` }}
                />

                <button
                  type="button"
                  onClick={() => onViewModeChange?.("list")}
                  className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors cursor-pointer"
                  aria-label="리스트 보기"
                >
                  <ListIcon
                    className="w-8 h-8"
                    style={{ color: viewMode === "list" ? "var(--color-surface-primary)" : "white" }}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange?.("globe")}
                  className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors cursor-pointer"
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
                className="flex items-center justify-center p-[10px] rounded-[500px] size-[56px] transition-all hover:opacity-80 cursor-pointer"
                style={{
                  background:
                    "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #00D9FF 0%, #60E7FF 56.15%, #C6F6FF 100%)",
                }}
                aria-label="새 항목 추가"
                onClick={() => router.push("/record")}
              >
                <PlusIcon className="w-8 h-8" style={{ color: "var(--color-surface-primary)" }} />
              </button>
            </div>
          ) : (
            // 타인의 지구본: 북마크 버튼 (왼쪽), 토글 (오른쪽) - 양쪽 정렬
            <div className="w-full max-w-[328px] flex items-center justify-between">
              {/* 북마크 버튼 */}
              <button
                type="button"
                className="flex items-center justify-center rounded-[500px] size-[60px] transition-all hover:opacity-80 cursor-pointer"
                style={{
                  background:
                    "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #ffffff2e 0%, #ffffff14 56.15%, #ffffff09 100%)",
                }}
                aria-label="저장하기"
              >
                <BookmarkIcon className="w-8 h-8" />
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
                  onClick={() => onViewModeChange?.("list")}
                  className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors cursor-pointer"
                  aria-label="리스트 보기"
                >
                  <ListIcon
                    className="w-8 h-8"
                    style={{ color: viewMode === "list" ? "var(--color-surface-primary)" : "white" }}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange?.("globe")}
                  className="relative flex items-center justify-center size-[44px] rounded-[50px] transition-colors cursor-pointer"
                  aria-label="글로브 보기"
                >
                  <GlobeIcon
                    className="w-8 h-8"
                    style={{ color: viewMode === "globe" ? "var(--color-surface-primary)" : "white" }}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
