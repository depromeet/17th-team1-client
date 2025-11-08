"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { formatDate } from "@/utils/dateUtils";
import { CircleCloseButton } from "./CircleCloseButton";
import { DateSelectBottomSheet } from "./DateSelectBottomSheet";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ImageCropModal } from "./ImageCropModal";
import { LocationSelectBottomSheet } from "./LocationSelectBottomSheet";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ImageCarouselProps = {
  image: ImageMetadata;
  onRemove: (id: string) => void;
  onTagSelect?: (tag: ImageTag) => void;
  onImageUpdate?: (id: string, croppedImage: string) => void;
};

export const ImageCarousel = ({ image, onRemove, onTagSelect, onImageUpdate }: ImageCarouselProps) => {
  const [selectedTag, setSelectedTag] = useState<ImageTag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDateSelectModalOpen, setIsDateSelectModalOpen] = useState(false);
  const [isLocationSelectModalOpen, setIsLocationSelectModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalImage] = useState(image.imagePreview);
  const [currentImage, setCurrentImage] = useState(image.imagePreview);
  const [customTimestamp, setCustomTimestamp] = useState<string | null>(image.timestamp || null);
  const [customLocation, setCustomLocation] = useState<string | null>(
    image.location?.nearbyPlaces?.[1] || image.location?.address || null,
  );

  const handleSaveCroppedImage = (croppedImage: string) => {
    setCurrentImage(croppedImage);
    onImageUpdate?.(image.id, croppedImage);
  };

  const shown = image;
  const displayLocation = customLocation || "";
  const displayDate = customTimestamp ? formatDate(customTimestamp) : null;
  const hasDate = customTimestamp !== null;
  const hasLocation = customLocation !== null;

  return (
    <div className="relative select-none w-[251px] mx-auto" style={{ touchAction: "pan-y" }}>
      <div className="overflow-hidden rounded-xl border border-white/20" style={{ aspectRatio: "9 / 16" }}>
        <button
          type="button"
          className="w-full h-full bg-black relative cursor-pointer overflow-hidden"
          onClick={() => setIsCropModalOpen(true)}
          aria-label="이미지 편집"
        >
          <Image
            src={currentImage}
            alt={shown.fileName}
            fill
            sizes="251px"
            className="object-cover"
            unoptimized
          />
        </button>
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
          onClick={() => setIsDateSelectModalOpen(true)}
          onRemove={hasDate ? () => setCustomTimestamp(null) : undefined}
          isPlaceholder={!hasDate || !displayDate}
        />
        <MetadataChip
          iconType="location"
          text={displayLocation || "위치 추가"}
          onClick={() => setIsLocationSelectModalOpen(true)}
          onRemove={hasLocation ? () => setCustomLocation(null) : undefined}
          isPlaceholder={!displayLocation}
        />
      </div>
      <DateSelectBottomSheet
        isOpen={isDateSelectModalOpen}
        onClose={() => setIsDateSelectModalOpen(false)}
        onConfirm={(date) => setCustomTimestamp(date)}
      />
      <LocationSelectBottomSheet
        isOpen={isLocationSelectModalOpen}
        onClose={() => setIsLocationSelectModalOpen(false)}
        // onConfirm={handleConfirmLocation}
      />
      {isCropModalOpen && (
        <ImageCropModal
          image={originalImage}
          onClose={() => setIsCropModalOpen(false)}
          onSave={handleSaveCroppedImage}
        />
      )}
    </div>
  );
};
