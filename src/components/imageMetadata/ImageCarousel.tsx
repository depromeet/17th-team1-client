"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { CircleCloseButton } from "./CircleCloseButton";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ImageCarouselProps = {
  image: ImageMetadata;
  onRemove: (id: string) => void;
  onLocationClick: (metadata: ImageMetadata) => void;
  onTagSelect?: (tag: ImageTag) => void;
};

export const ImageCarousel = ({ image, onRemove, onLocationClick, onTagSelect }: ImageCarouselProps) => {
  const [selectedTag, setSelectedTag] = useState<ImageTag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const shown = image;

  const formatMonth = (ts?: string) =>
    ts
      ? (() => {
        const d = new Date(ts);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      })()
      : "";

  const displayLocation = shown.location?.nearbyPlaces?.[1] || shown.location?.address || "";


  return (
    <div className="relative select-none w-[250.784px] mx-auto" style={{ touchAction: "pan-y" }}>
      <div className="overflow-hidden rounded-xl border border-white/20">
        <div className="w-[251px] h-[445px] bg-black relative">
          <Image src={shown.imagePreview} alt={shown.fileName} fill className="object-cover object-center" />
        </div>
      </div>
      <div className="absolute top-3 left-3">
        <TagSelector
          selectedTag={selectedTag}
          onSelect={(tag) => {
            setSelectedTag(tag);
            onTagSelect?.(tag);
          }}
          onRemove={() => setSelectedTag(null)}
        />
      </div>
      <div className="absolute top-3 right-3">
        <CircleCloseButton onClick={() => setIsDeleteModalOpen(true)} />
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onRemove(shown.id);
          setIsDeleteModalOpen(false);
        }}
      />
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 items-start">
        <MetadataChip iconType="calendar" text={formatMonth(shown.timestamp) || "정보 없음"} />
        <button
          type="button"
          onClick={() => onLocationClick(shown)}
          aria-label="Open location in maps"
          className="cursor-pointer hover:opacity-80 transition-opacity border-0 p-0 bg-transparent"
        >
          <MetadataChip iconType="location" text={displayLocation || "정보 없음"} />
        </button>
      </div>
    </div>
  );
};
