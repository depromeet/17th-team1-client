"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { CircleCloseButton } from "./CircleCloseButton";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ImageCarouselProps = {
  images: ImageMetadata[];
  onRemove: (id: string) => void;
  onLocationClick: (metadata: ImageMetadata) => void;
  onTagSelect?: (tag: ImageTag) => void;
};

export const ImageCarousel = ({ images, onRemove, onLocationClick, onTagSelect }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<ImageTag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const shown = images[currentIndex];

  const formatMonth = (ts?: string) =>
    ts
      ? (() => {
          const d = new Date(ts);
          return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
        })()
      : "";

  const displayLocation = shown.location?.nearbyPlaces?.[1] || shown.location?.address || "";

  return (
    <div className="relative select-none w-[250.784px] mx-auto">
      <div className="overflow-hidden rounded-xl border border-white/20">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map(({ id, imagePreview, fileName }) => (
            <div key={id} className="w-[251px] h-[445px] flex-shrink-0 bg-black relative">
              <Image src={imagePreview} alt={fileName} fill className="object-cover object-center" />
            </div>
          ))}
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
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(images.length - 1, i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};
