"use client";

import { DotIcon } from "@/assets/icons";
import { Dropdown } from "@/components/common/Dropdown";
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
  const menuOptions = [
    {
      label: "기록 편집",
      value: "edit",
      onClick: onEdit,
    },
    {
      label: "기록 삭제",
      value: "delete",
      onClick: onDelete,
    },
  ];

  const title = `${city}, ${country}`;
  const truncatedTitle = title.length > 20 ? `${title.slice(0, 20)}...` : title;

  return (
    <div className="relative">
      <Header
        variant="transparent"
        leftIcon="back"
        onBack={onBack}
        title={truncatedTitle}
        rightIcon={
          isOwner ? (
            <Dropdown
              asMenu
              variant="light"
              options={menuOptions}
              trigger={
                <button type="button" aria-label="메뉴 열기">
                  <DotIcon />
                </button>
              }
            />
          ) : undefined
        }
      />
    </div>
  );
};
