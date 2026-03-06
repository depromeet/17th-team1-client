"use client";

import { PlusIcon } from "lucide-react";
import { ImageCarousel } from "./ImageCarousel";
import type { UploadMetadata } from "./hooks/useImageMetadata";
import type { ImageTag } from "@/types/imageMetadata";
import type { LocationSelection } from "./LocationSelectBottomSheet";

interface ImageUploadSectionProps {
  metadataList: UploadMetadata[];
  fileUploadId: string;
  deletingPhotoId: string | null;
  handleRemove: (id: string) => void;
  handleImageUpdate: (id: string, url: string) => void;
  handleTagChange: (id: string, tag: ImageTag | null) => void;
  handleDateChange: (id: string, date: string | null) => void;
  handleLocationChange: (id: string, location: LocationSelection | null) => void;
}

export const ImageUploadSection = ({
  metadataList,
  fileUploadId,
  deletingPhotoId,
  handleRemove,
  handleImageUpdate,
  handleTagChange,
  handleDateChange,
  handleLocationChange,
}: ImageUploadSectionProps) => {
  const hasImages = metadataList.length > 0;
  const MAX_IMAGES = 3;
  const metadataCount = metadataList.length;
  const placeholderCount = Math.max(0, MAX_IMAGES - metadataCount - (hasImages ? 0 : 1));

  return (
    <div
      className="flex gap-4 overflow-x-auto px-4 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{ touchAction: "pan-x", minHeight: hasImages ? undefined : "460px" }}
    >
      {!hasImages && (
        <div className="flex-shrink-0">
          <label htmlFor={fileUploadId} className="relative select-none w-[250.784px] mx-auto cursor-pointer block">
            <div className="overflow-hidden rounded-xl border border-[#272727] bg-[#141414] hover:bg-black/40 transition-colors">
              <div className="w-[251px] h-[445px] flex flex-col items-center justify-center gap-3 px-6 text-center">
                <PlusIcon size={32} />
                <p className="text-sm text-white/60 leading-relaxed">
                  사진은 최대 3장까지
                  <br />
                  업로드할 수 있어요.
                </p>
              </div>
            </div>
          </label>
        </div>
      )}
      {metadataList.map(metadata => (
        <div key={metadata.id} className="flex-shrink-0">
          <ImageCarousel
            image={metadata}
            onRemove={handleRemove}
            isProcessing={deletingPhotoId === metadata.id}
            onImageUpdate={handleImageUpdate}
            onTagChange={tag => handleTagChange(metadata.id, tag)}
            onDateChange={yearMonth => handleDateChange(metadata.id, yearMonth)}
            onLocationChange={location => handleLocationChange(metadata.id, location)}
          />
        </div>
      ))}
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <div key={`empty-${index}`} className="flex-shrink-0">
          <label htmlFor={fileUploadId} className="relative select-none w-[250.784px] mx-auto cursor-pointer block">
            <div className="overflow-hidden rounded-xl border border-[#272727] bg-[#141414] hover:bg-black/40 transition-colors">
              <div className="w-[251px] h-[445px] flex flex-col items-center justify-center gap-3">
                <PlusIcon size={32} />
              </div>
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};
