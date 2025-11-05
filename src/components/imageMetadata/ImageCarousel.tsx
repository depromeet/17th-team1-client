"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { formatDate } from "@/utils/dateUtils";
import { CircleCloseButton } from "./CircleCloseButton";
import { DateSelectBottomSheet } from "./DateSelectBottomSheet";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { LocationSelectBottomSheet } from "./LocationSelectBottomSheet";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ImageCarouselProps = {
  image: ImageMetadata;
  onRemove: (id: string) => void;
  onTagSelect?: (tag: ImageTag) => void;
};

export const ImageCarousel = ({ image, onRemove, onTagSelect }: ImageCarouselProps) => {
  const [selectedTag, setSelectedTag] = useState<ImageTag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDateSelectModalOpen, setIsDateSelectModalOpen] = useState(false);
  const [isLocationSelectModalOpen, setIsLocationSelectModalOpen] = useState(false);
  const [customTimestamp, setCustomTimestamp] = useState<string | null>(image.timestamp || null);
  const [customLocation, setCustomLocation] = useState<string | null>(
    image.location?.nearbyPlaces?.[1] || image.location?.address || null
  );

  const handleOpenDateModal = () => {
    setIsDateSelectModalOpen(true);
  };

  const handleOpenLocationModal = () => {
    setIsLocationSelectModalOpen(true);
  };

  const handleRemoveDate = () => {
    setCustomTimestamp(null);
  };

  const handleRemoveLocation = () => {
    setCustomLocation(null);
  };

  const handleConfirmDate = (date: string) => {
    setCustomTimestamp(date);
  };

  const shown = image;
  const displayLocation = customLocation || "";
  const displayDate = customTimestamp ? formatDate(customTimestamp) : null;
  const hasDate = customTimestamp !== null;
  const hasLocation = customLocation !== null;

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
        <MetadataChip
          iconType="calendar"
          text={hasDate && displayDate ? displayDate : "날짜 추가"}
          onClick={handleOpenDateModal}
          onRemove={hasDate ? handleRemoveDate : undefined}
          isPlaceholder={!hasDate || !displayDate}
        />
        <MetadataChip
          iconType="location"
          text={displayLocation || "위치 추가"}
          onClick={handleOpenLocationModal}
          onRemove={hasLocation ? handleRemoveLocation : undefined}
          isPlaceholder={!displayLocation}
        />
      </div>
      <DateSelectBottomSheet
        isOpen={isDateSelectModalOpen}
        onClose={() => setIsDateSelectModalOpen(false)}
        onConfirm={handleConfirmDate}
      />
      <LocationSelectBottomSheet
        isOpen={isLocationSelectModalOpen}
        onClose={() => setIsLocationSelectModalOpen(false)}
        // onConfirm={handleConfirmLocation}
      />
    </div>
  );
};
