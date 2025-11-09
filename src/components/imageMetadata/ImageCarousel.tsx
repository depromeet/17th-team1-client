"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { formatYearMonth, toYearMonth } from "@/utils/dateUtils";
import { CircleCloseButton } from "./CircleCloseButton";
import { DateSelectBottomSheet } from "./DateSelectBottomSheet";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ImageCropModal } from "./ImageCropModal";
import { LocationSelectBottomSheet } from "./LocationSelectBottomSheet";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ExtendedImageMetadata = ImageMetadata & {
  selectedTag?: ImageTag | null;
  customDate?: string | null;
};

type ImageCarouselProps = {
  image: ExtendedImageMetadata;
  onRemove: (id: string) => void;
  onTagChange?: (tag: ImageTag | null) => void;
  onDateChange?: (yearMonth: string | null) => void;
  onImageUpdate?: (id: string, croppedImage: string) => void;
};

export const ImageCarousel = ({ image, onRemove, onTagChange, onDateChange, onImageUpdate }: ImageCarouselProps) => {
  const [selectedTag, setSelectedTag] = useState<ImageTag | null>(
    image.selectedTag ?? (image.tag && image.tag !== "NONE" ? image.tag : null),
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDateSelectModalOpen, setIsDateSelectModalOpen] = useState(false);
  const [isLocationSelectModalOpen, setIsLocationSelectModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalImage] = useState(image.imagePreview);
  const [currentImage, setCurrentImage] = useState(image.imagePreview);
  const [customDate, setCustomDate] = useState<string | null>(image.customDate ?? toYearMonth(image.timestamp));
  const [customLocation, setCustomLocation] = useState<string | null>(
    image.location?.nearbyPlaces?.[1] || image.location?.address || null,
  );

  const baseDate = toYearMonth(image.timestamp);
  const displayedYearMonth = customDate ?? baseDate;
  const displayDate = formatYearMonth(displayedYearMonth);
  const hasDate = !!displayedYearMonth;

  useEffect(() => {
    setSelectedTag(image.selectedTag ?? (image.tag && image.tag !== "NONE" ? image.tag : null));
  }, [image.selectedTag, image.tag]);

  useEffect(() => {
    setCustomDate(image.customDate ?? toYearMonth(image.timestamp));
  }, [image.customDate, image.timestamp]);

  const handleTagSelect = (tag: ImageTag) => {
    setSelectedTag(tag);
    onTagChange?.(tag);
  };

  const handleTagRemove = () => {
    setSelectedTag(null);
    onTagChange?.(null);
  };

  const handleConfirmDate = (date: string) => {
    const normalized = date.replace(".", "");
    setCustomDate(normalized);
    onDateChange?.(normalized);
  };

  const handleDateClear = () => {
    setCustomDate(null);
    onDateChange?.(null);
  };

  const handleSaveCroppedImage = (croppedImage: string) => {
    setCurrentImage(croppedImage);
    onImageUpdate?.(image.id, croppedImage);
  };

  const shown = image;
  const displayLocation = customLocation || "";
  const hasLocation = customLocation !== null;

  return (
    <div className="relative select-none w-[251px] mx-auto">
      <div className="overflow-hidden rounded-xl border border-white/20" style={{ aspectRatio: "9 / 16" }}>
        <button
          type="button"
          className="w-full h-full bg-black relative cursor-pointer overflow-hidden"
          onClick={() => setIsCropModalOpen(true)}
          aria-label="이미지 편집"
        >
          <Image src={currentImage} alt={shown.fileName} fill sizes="251px" className="object-cover" unoptimized />
        </button>
      </div>
      <div className="absolute top-3 left-3">
        <TagSelector selectedTag={selectedTag} onSelect={handleTagSelect} onRemove={handleTagRemove} />
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
          onRemove={hasDate ? handleDateClear : undefined}
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
        onConfirm={handleConfirmDate}
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
