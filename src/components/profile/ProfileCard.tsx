"use client";

import Image from "next/image";
import { EditIcon, KakaoLogoIcon, ProfileIcon } from "@/assets/icons";

type ProfileCardProps = {
  name: string;
  email: string;
  profileImage?: string;
  onEditClick?: () => void;
};

export const ProfileCard = ({ name, email, profileImage, onEditClick }: ProfileCardProps) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-3 items-center">
        <div className="shrink-0 size-12 overflow-hidden rounded-full bg-surface-secondary border border-[#FF1744]">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="프로필 이미지"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ProfileIcon className="w-12 h-12 flex-shrink-0" />
            </div>
          )}
        </div>
        <div className="flex gap-1 items-center">
          <p className="font-bold text-2xl text-text-primary">{name}</p>
          <button
            type="button"
            onClick={onEditClick}
            className="rounded-lg p-1 hover:bg-surface-secondary transition-colors"
            aria-label="프로필 수정"
          >
            <EditIcon className="size-5 text-text-primary" />
          </button>
        </div>
      </div>

      <div className="bg-surface-placeholder--40 flex gap-2.5 items-center px-4 py-2.5 rounded-[10px] w-full">
        <KakaoLogoIcon />
        <p className="font-medium text-sm text-[rgba(255,255,255,0.74)]">{email}</p>
      </div>
    </div>
  );
};
