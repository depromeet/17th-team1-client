"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Dropdown } from "@/components/common/Dropdown";
import { Header } from "@/components/common/Header";
import { addBookmark, getBookmarks, removeBookmark } from "@/services/bookmarkService";
import type { BookmarkUser } from "@/types/bookmark";

type SortOption = "latest" | "alphabetical";

type SavedGlobeClientProps = {
  initialBookmarks: BookmarkUser[];
};

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-4">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-full bg-[rgba(255,80,80,0.1)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#ff5050]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold text-white tracking-[-0.4px]">오류가 발생했습니다</h2>
          <p className="text-base font-medium text-(--color-text-secondary,#a8b8c6) tracking-[-0.32px]">{error}</p>
        </div>

        {/* Retry Button */}
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded-xl text-white font-semibold transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 z-10">
        {/* Globe Image Container */}
        <div className="relative w-[289.695px] h-[289.695px] flex items-center justify-center">
          {/* Globe Image */}
          <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
            {/* biome-ignore lint/performance/noImgElement: Empty state visual, optimization not needed */}
            <img src="/assets/globe.png" alt="저장된 지구본이 없어요" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-2 w-[247px] text-center">
          <h2 className="text-xl font-bold text-white tracking-[-0.4px]">저장된 지구본이 없어요 🥲</h2>
          <p className="text-base font-medium text-(--color-text-secondary,#a8b8c6) tracking-[-0.32px]">
            친구의 지구본을 둘러보고 저장해보세요
          </p>
        </div>
      </div>
    </div>
  );
};

const GlobeList = ({
  sortedGlobes,
  sortOption,
  onSortChange,
  onGlobeClick,
  onSaveToggle,
  isLoading,
}: {
  sortedGlobes: BookmarkUser[];
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  onGlobeClick: (memberId: number) => void;
  onSaveToggle: (memberId: number) => void;
  isLoading: boolean;
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Sort Dropdown */}
      <div className="flex items-center justify-end px-4 pt-5 pb-5 shrink-0">
        <Dropdown
          value={sortOption}
          onValueChange={(value) => onSortChange(value as SortOption)}
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
            className="w-full px-5 py-3 flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onGlobeClick(globe.memberId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                onGlobeClick(globe.memberId);
              }
            }}
            aria-label={`Open ${globe.nickname} 지구본`}
          >
            {/* Left Content */}
            <div className="flex items-center gap-2.5">
              {/* Profile Image */}
              <div className="w-11 h-11 rounded-full bg-[rgba(255,255,255,0.1)] shrink-0 overflow-hidden">
                {globe.profileImageUrl ? (
                  // biome-ignore lint/performance/noImgElement: Profile image placeholder, optimization not needed
                  <img src={globe.profileImageUrl} alt={globe.nickname} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-[rgba(0,217,255,0.3)] to-[rgba(0,217,255,0.1)]" />
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-white">{globe.nickname}</p>
            </div>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle(globe.memberId);
              }}
              disabled={isLoading}
              className="shrink-0 w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={globe.bookmarked ? "저장 해제" : "저장"}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 24"
                fill={globe.bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                color="white"
                role="img"
              >
                <title>{globe.bookmarked ? "저장됨" : "저장 안 됨"}</title>
                <path d="M2 2v20l8-5 8 5V2H2z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SavedGlobeClient = ({ initialBookmarks }: SavedGlobeClientProps) => {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkUser[]>(initialBookmarks);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getBookmarks();
      setBookmarks(data);
    } catch {
      setError("저장된 지구본을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveToggle = useCallback(
    async (memberId: number) => {
      try {
        setIsLoading(true);
        const bookmark = bookmarks.find((g) => g.memberId === memberId);
        if (!bookmark) {
          setIsLoading(false);
          return;
        }

        if (bookmark.bookmarked) {
          await removeBookmark(memberId);
        } else {
          await addBookmark(memberId);
        }

        setBookmarks((prev) => prev.map((g) => (g.memberId === memberId ? { ...g, bookmarked: !g.bookmarked } : g)));
      } catch {
        setError("북마크 상태 변경에 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    },
    [bookmarks],
  );

  const handleGlobeCardClick = (memberId: number) => {
    router.push(`/globe/${memberId}`);
  };

  const sortedBookmarks = useMemo(() => {
    const sorted = [...bookmarks];
    if (sortOption === "alphabetical") {
      sorted.sort((a, b) => a.nickname.localeCompare(b.nickname));
    }
    return sorted;
  }, [bookmarks, sortOption]);

  const hasBookmarks = sortedBookmarks.length > 0;

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
        <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
          <Header variant="navy" leftIcon="back" onLeftClick={() => router.back()} title="저장된 지구본" />

          <ErrorState error={error} onRetry={loadBookmarks} />
        </div>
      </main>
    );
  }

  if (!hasBookmarks) {
    return (
      <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
        <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
          <Header variant="navy" leftIcon="back" onLeftClick={() => router.back()} title="저장된 지구본" />

          <EmptyState />
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-surface-secondary p-4">
      <div className="bg-surface-secondary relative w-full max-w-[402px] h-screen flex flex-col">
        <Header variant="navy" leftIcon="back" onLeftClick={() => router.back()} title="저장된 지구본" />

        <GlobeList
          sortedGlobes={sortedBookmarks}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onGlobeClick={handleGlobeCardClick}
          onSaveToggle={handleSaveToggle}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};
