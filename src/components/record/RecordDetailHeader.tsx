"use client";

import { useState } from "react";
import { DotIcon } from "@/assets/icons";
import { Header } from "@/components/common/Header";

type RecordDetailHeaderProps = {
  city: string;
  country: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
};

export const RecordDetailHeader = ({
  city,
  country,
  onBack,
  onEdit,
  onDelete,
  isOwner = true,
}: RecordDetailHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.();
  };

  const title = `${city}, ${country}`;
  const truncatedTitle = title.length > 20 ? `${title.slice(0, 20)}...` : title;

  return (
    <div className="relative">
      <Header
        variant="transparent"
        leftIcon="back"
        onBack={onBack}
        title={truncatedTitle}
        rightIcon={isOwner ? <DotIcon width={24} height={24} /> : undefined}
        onRightButtonClick={isOwner ? handleMenuClick : undefined}
      />

      {/* 메뉴 드롭다운 */}
      {showMenu && isOwner && (
        <>
          {/* 백드롭 */}
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowMenu(false);
            }}
            aria-label="메뉴 닫기"
          />

          {/* 메뉴 */}
          <div className="absolute right-4 top-full mt-2 bg-surface-thirdly rounded-lg shadow-lg z-50 overflow-hidden min-w-[140px]">
            <button
              type="button"
              onClick={handleEdit}
              className="w-full px-4 py-3 text-left text-text-primary hover:bg-surface-secondary transition-colors"
            >
              편집하기
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left text-red-500 hover:bg-surface-secondary transition-colors"
            >
              삭제하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};
