"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dropdown } from "@/components/common/Dropdown";

type SavedGlobe = {
  memberId: number;
  name: string;
  profileImage?: string;
  isSaved: boolean;
};

type SortOption = "latest" | "alphabetical";

export default function SavedGlobePage() {
  const router = useRouter();
  const [globes, setGlobes] = useState<SavedGlobe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [savedStates, setSavedStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadGlobes = async () => {
      try {
        // TODO: API에서 저장된 지구본 리스트 가져오기
        // 임시 데이터
        const mockGlobes: SavedGlobe[] = [
          { memberId: 1, name: "장민지", isSaved: true },
          { memberId: 2, name: "김정우", isSaved: true },
          { memberId: 3, name: "이유정", isSaved: true },
          { memberId: 4, name: "유민", isSaved: true },
          { memberId: 5, name: "건우", isSaved: true },
          { memberId: 6, name: "sjdkdjf", isSaved: true },
        ];

        setGlobes(mockGlobes);
        const initialSavedStates: Record<number, boolean> = {};
        mockGlobes.forEach((globe) => {
          initialSavedStates[globe.memberId] = globe.isSaved;
        });
        setSavedStates(initialSavedStates);
      } catch {
        // 에러 처리
      } finally {
        setIsLoading(false);
      }
    };

    loadGlobes();
  }, []);

  const getSortedGlobes = () => {
    const sorted = [...globes];
    if (sortOption === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  };

  const handleSaveToggle = (memberId: number) => {
    setSavedStates((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleGlobeCardClick = (memberId: number) => {
    // TODO: 친구의 지구본 상세 화면으로 이동
    router.push(`/globe/${memberId}`);
  };

  const sortedGlobes = getSortedGlobes();
  const hasGlobes = sortedGlobes.length > 0;

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
      <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
        {/* Header */}
        <div className="h-11 w-full shrink-0 flex items-center justify-between px-4 relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex gap-2.5 items-center p-2.5 -ml-2.5"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 flex justify-center">
            <p className="font-bold text-lg text-text-primary">저장된 지구본</p>
          </div>
          <div className="w-10" />
        </div>

        {!hasGlobes && !isLoading ? (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-8 z-10">
              {/* Globe Image Container */}
              <div className="relative w-[289.695px] h-[289.695px] flex items-center justify-center">
                {/* Border Box */}
                <div className="absolute inset-0 border-2 border-[#ff5050] rounded-lg opacity-80" />

                {/* Globe Image */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: Empty state visual, optimization not needed */}
                  <img src="/assets/globe.png" alt="저장된 지구본이 없어요" className="w-full h-full object-cover" />
                </div>

                {/* Overlay gradient effect */}
                <div
                  className="absolute inset-[-0.13%_-0.12%] rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)",
                    transform: "scaleY(-1) rotate(180deg)",
                  }}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-center gap-2 w-[247px] text-center">
                <h2 className="text-xl font-bold text-white tracking-[-0.4px]">저장된 지구본이 없어요 🥲</h2>
                <p className="text-base font-medium text-[var(--color-text-secondary,#a8b8c6)] tracking-[-0.32px]">
                  친구의 지구본을 둘러보고 저장해보세요
                </p>
              </div>
            </div>
          </div>
        ) : (
          // List State
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Sort Dropdown */}
            <div className="flex items-center justify-end px-4 pt-5 pb-5 shrink-0">
              <Dropdown
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
                options={[
                  { label: "최신순", value: "latest" },
                  { label: "가나다순", value: "alphabetical" },
                ]}
              />
            </div>

            {/* Globe List */}
            <div className="px-4 flex flex-col gap-2 pb-4">
              {sortedGlobes.map((globe) => (
                // biome-ignore lint: Container with multiple buttons for different actions
                <div
                  key={globe.memberId}
                  role="button"
                  tabIndex={0}
                  className="w-full px-5 py-3 flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                  onClick={() => handleGlobeCardClick(globe.memberId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                      e.preventDefault();
                      handleGlobeCardClick(globe.memberId);
                    }
                  }}
                  aria-label={`Open ${globe.name} 지구본`}
                >
                  {/* Left Content */}
                  <div className="flex items-center gap-2.5">
                    {/* Profile Image */}
                    <div className="w-11 h-11 rounded-full bg-[rgba(255,255,255,0.1)] flex-shrink-0 overflow-hidden">
                      {globe.profileImage ? (
                        // biome-ignore lint/performance/noImgElement: Profile image placeholder, optimization not needed
                        <img src={globe.profileImage} alt={globe.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[rgba(0,217,255,0.3)] to-[rgba(0,217,255,0.1)]" />
                      )}
                    </div>

                    {/* Name */}
                    <p className="text-sm font-semibold text-white">{globe.name}</p>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToggle(globe.memberId);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label={savedStates[globe.memberId] ? "저장 해제" : "저장"}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 20 24"
                      fill={savedStates[globe.memberId] ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      color="white"
                      role="img"
                    >
                      <title>{savedStates[globe.memberId] ? "저장됨" : "저장 안 됨"}</title>
                      <path d="M2 2v20l8-5 8 5V2H2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
