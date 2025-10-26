"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileHeaderProps = {
  title: string;
};

export const ProfileHeader = ({ title }: ProfileHeaderProps) => {
  const router = useRouter();

  return (
    <div className="absolute h-11 left-1/2 top-16 translate-x-[-50%] w-[402px]">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute box-border content-stretch flex gap-2.5 items-center left-4 overflow-clip p-2.5 top-0"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="size-6 text-text-primary" />
      </button>
      <div className="absolute flex flex-col font-bold justify-center leading-none left-1/2 not-italic text-lg text-text-primary text-center text-nowrap top-1/2 tracking-[-0.36px] translate-x-[-50%] translate-y-[-50%]">
        <p>{title}</p>
      </div>
    </div>
  );
};
