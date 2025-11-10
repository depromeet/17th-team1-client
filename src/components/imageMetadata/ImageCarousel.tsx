"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { formatYearMonth, toYearMonth } from "@/utils/dateUtils";
import { CircleCloseButton } from "./CircleCloseButton";
import { DateSelectBottomSheet } from "./DateSelectBottomSheet";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ImageCropModal } from "./ImageCropModal";
import { LocationSelectBottomSheet, type LocationSelection } from "./LocationSelectBottomSheet";
import { MetadataChip } from "./MetadataChip";
import { TagSelector } from "./TagSelector";

type ExtendedImageMetadata = ImageMetadata & {
  selectedTag?: ImageTag | null;
  customDate?: string | null;
};

type ImageCarouselProps = {
  image: ExtendedImageMetadata;
  onRemove: (id: string) => void | Promise<void>;
  onTagChange?: (tag: ImageTag | null) => void;
  onDateChange?: (yearMonth: string | null) => void;
  onImageUpdate?: (id: string, croppedImage: string) => void;
  onLocationChange?: (location: LocationSelection | null) => void;
  isProcessing?: boolean;
};

export const ImageCarousel = ({
  image,
  onRemove,
  onTagChange,
  onDateChange,
  onImageUpdate,
  onLocationChange,
  isProcessing = false,
}: ImageCarouselProps) => {
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

  useEffect(() => {
    setCustomLocation(image.location?.nearbyPlaces?.[1] || image.location?.address || null);
  }, [image.location?.address, image.location?.nearbyPlaces]);

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

  const handleConfirmLocation = (location: LocationSelection) => {
    const displayName = location.name || location.address;
    setCustomLocation(displayName);
    onLocationChange?.(location);
  };

  const handleLocationClear = () => {
    setCustomLocation(null);
    onLocationChange?.(null);
  };

  const shown = image;
  const displayLocation = customLocation || "";
  const hasLocation = customLocation !== null;

  const initialLocationSelection = useMemo<LocationSelection | null>(() => {
    const location = image.location;
    if (!location) return null;

    const hasLatitude = typeof location.latitude === "number";
    const hasLongitude = typeof location.longitude === "number";
    if (!hasLatitude || !hasLongitude) return null;

    const formattedAddress =
      (Array.isArray(location.nearbyPlaces) && location.nearbyPlaces.length > 0
        ? location.nearbyPlaces[0]
        : undefined) ||
      location.address ||
      "";
    const mainName =
      (Array.isArray(location.nearbyPlaces) && location.nearbyPlaces.length > 1
        ? location.nearbyPlaces[1]
        : undefined) ||
      location.address ||
      "";

    if (!formattedAddress && !mainName) return null;

    return {
      name: mainName || formattedAddress,
      address: formattedAddress || mainName,
      latitude: location.latitude as number,
      longitude: location.longitude as number,
    };
  }, [image.location]);

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
        <CircleCloseButton onClick={() => setIsDeleteModalOpen(true)} disabled={isProcessing} />
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (isProcessing) return;
          try {
            await onRemove(shown.id);
            setIsDeleteModalOpen(false);
          } catch {
            // 삭제 실패 시 모달 유지 (상위에서 에러 처리)
          }
        }}
        isProcessing={isProcessing}
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
          onRemove={hasLocation ? handleLocationClear : undefined}
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
        onConfirm={handleConfirmLocation}
        initialLocation={initialLocationSelection}
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
