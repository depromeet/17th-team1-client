"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { processSingleFile } from "@/lib/processFile";
import { createDiary, uploadTravelPhoto } from "@/services/diaryService";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { toYearMonth } from "@/utils/dateUtils";
import { Header } from "../common/Header";
// import { GoogleMapsModal } from "./GoogleMapsModal";
import { ImageCarousel } from "./ImageCarousel";
import { LoadingOverlay } from "./LoadingOverlay";
import type { LocationSelection } from "./LocationSelectBottomSheet";
import { MemoryTextarea } from "./MemoryTextarea";

type ImageMetadataProps = {
  cityId?: number;
  initialCity?: string;
  initialCountry?: string;
};

type UploadMetadata = ImageMetadata & {
  selectedTag?: ImageTag | null;
  customDate?: string | null;
};

type UploadedPhoto = {
  photoCode: string;
  metadata: ImageMetadata;
  file: File;
};

export const ImageMetadataComponent = ({ cityId, initialCity, initialCountry }: ImageMetadataProps) => {
  const router = useRouter();
  const [metadataList, setMetadataList] = useState<UploadMetadata[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [diaryText, setDiaryText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileUploadId = useId();
  const metadataCount = metadataList.length;

  const handleBack = () => {
    router.back();
  };

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsProcessing(true);
      try {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const MAX_IMAGES = 3;
        const remainingSlots = MAX_IMAGES - metadataCount;
        if (remainingSlots <= 0) return;

        const tasks: Promise<{ metadata: ImageMetadata; file: File }>[] = [];
        const filesToProcess = Math.min(files.length, remainingSlots);

        for (let i = 0; i < filesToProcess; i++) {
          const f = files[i];
          if (f.type.startsWith("image/")) {
            tasks.push(
              processSingleFile(f).then((metadata) => ({
                metadata,
                file: f,
              })),
            );
          }
        }

        const settled = await Promise.allSettled(tasks);
        const results = settled
          .filter((r): r is PromiseFulfilledResult<{ metadata: ImageMetadata; file: File }> => r.status === "fulfilled")
          .map((r) => r.value);

        if (results.length === 0) return;

        const uploadPromises = results.map(({ metadata, file }) =>
          uploadTravelPhoto(file).then((photoCode) => ({
            photoCode,
            metadata,
            file,
          })),
        );

        const uploadedResults = await Promise.all(uploadPromises);

        const mappedMetadata = uploadedResults.map((r) => ({
          ...r.metadata,
          selectedTag: r.metadata.tag && r.metadata.tag !== "NONE" ? r.metadata.tag : null,
          customDate: toYearMonth(r.metadata.timestamp),
        }));

        setMetadataList((prev) => (prev.length > 0 ? [...prev, ...mappedMetadata] : mappedMetadata));
        setUploadedPhotos((prev) => [...prev, ...uploadedResults]);
      } catch (error) {
        alert(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
      } finally {
        (e.target as HTMLInputElement).value = "";
        setIsProcessing(false);
      }
    },
    [metadataCount],
  );

  // TODO: LocationSelectBottomSheet에서 GoogleMapsModal 연동 시 사용
  // const handleLocationClick = (metadata: ImageMetadata) => {
  //   setSelectedImageForMaps(metadata);
  //   setIsMapsModalOpen(true);
  // };

  // const handleLocationUpdate = (lat: number, lng: number, address: string) => {
  //   if (!selectedImageForMaps) return;

  //   // 새로운 위치 정보로 업데이트
  //   const updatedLocation = {
  //     latitude: lat,
  //     longitude: lng,
  //     altitude: selectedImageForMaps.location?.altitude,
  //     address: address,
  //     nearbyPlaces: [address], // 기본적으로 선택된 주소만 포함
  //   };

  //   // 메타데이터 리스트 업데이트
  //   setMetadataList((prev) =>
  //     prev.map((item) => (item.id === selectedImageForMaps.id ? { ...item, location: updatedLocation } : item)),
  //   );

  //   // 현재 선택된 이미지도 업데이트
  //   if (selectedImage?.id === selectedImageForMaps.id) {
  //     setSelectedImage((prev) => (prev ? { ...prev, location: updatedLocation } : null));
  //   }
  // };

  const handleRemove = (id: string) => {
    setMetadataList((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index !== -1) {
        setUploadedPhotos((photos) => photos.filter((_, i) => i !== index));
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleImageUpdate = (id: string, croppedImage: string) => {
    setMetadataList((prev) => prev.map((item) => (item.id === id ? { ...item, imagePreview: croppedImage } : item)));
  };

  const handleTagChange = (id: string, tag: ImageTag | null) => {
    setMetadataList((prev) => prev.map((item) => (item.id === id ? { ...item, selectedTag: tag } : item)));
  };

  const handleDateChange = (id: string, yearMonth: string | null) => {
    setMetadataList((prev) => prev.map((item) => (item.id === id ? { ...item, customDate: yearMonth } : item)));
  };

  const handleLocationChange = (id: string, location: LocationSelection | null) => {
    setMetadataList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (!location) {
          return { ...item, location: undefined };
        }

        const displayName = location.name || location.address || "";
        const formattedAddress = location.address || location.name || "";
        const uniquePlaces = [formattedAddress, displayName].filter(
          (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index,
        );

        return {
          ...item,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            altitude: item.location?.altitude,
            address: displayName || formattedAddress,
            nearbyPlaces: uniquePlaces.length > 0 ? uniquePlaces : undefined,
          },
        };
      }),
    );
  };

  const handleSave = async () => {
    if (isProcessing) return;
    if (cityId == null) {
      alert("도시 정보가 없습니다. 기록을 생성할 수 없어요.");
      return;
    }
    if (metadataList.length === 0) {
      alert("업로드된 이미지가 없습니다.");
      return;
    }

    setIsProcessing(true);

    try {
      const fallbackMonth = new Date().toISOString().slice(0, 7).replace("-", "");

      const photos = metadataList.map((metadata) => {
        const uploaded = uploadedPhotos.find((item) => item.metadata.id === metadata.id);
        if (!uploaded) {
          throw new Error("업로드된 이미지 정보를 찾을 수 없습니다.");
        }

        const { location, dimensions, customDate, timestamp, selectedTag, tag } = metadata;
        const width = dimensions?.width ?? 0;
        const height = dimensions?.height ?? 0;
        const { photoCode } = uploaded;
        const takenMonth = customDate ?? toYearMonth(timestamp) ?? fallbackMonth;
        const normalizedTag = selectedTag ?? tag ?? "NONE";
        const latitude = location?.latitude;
        const longitude = location?.longitude;
        const placeName = location?.address;

        return {
          photoCode,
          lat: latitude,
          lng: longitude,
          width,
          height,
          takenMonth,
          tag: normalizedTag,
          placeName,
        };
      });

      const diaryId = await createDiary({
        cityId,
        text: diaryText || undefined,
        photos,
      });

      router.push(`/record/${diaryId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "여행기록 저장에 실패했습니다.");
      setIsProcessing(false);
    }
  };

  const locationTitle = [initialCity, initialCountry].filter(Boolean).join(", ");
  const headerTitle = locationTitle || "나라, 도시 이름";
  const hasImages = metadataCount > 0;
  const MAX_IMAGES = 3;
  const placeholderCount = Math.max(0, MAX_IMAGES - metadataCount - (hasImages ? 0 : 1));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <LoadingOverlay show={isProcessing} />
      <Header
        title={headerTitle}
        variant="dark"
        leftIcon="back"
        onLeftClick={handleBack}
        rightButtonTitle="저장"
        rightButtonDisabled={!hasImages || isProcessing || cityId == null}
        onRightClick={handleSave}
      />
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
        {metadataList.map((metadata) => (
          <div key={metadata.id} className="flex-shrink-0">
            <ImageCarousel
              image={metadata}
              onRemove={handleRemove}
              onImageUpdate={handleImageUpdate}
              onTagChange={(tag) => handleTagChange(metadata.id, tag)}
              onDateChange={(yearMonth) => handleDateChange(metadata.id, yearMonth)}
              onLocationChange={(location) => handleLocationChange(metadata.id, location)}
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
      <input
        type="file"
        multiple
        accept="image/*,image/heic"
        onChange={handleFileUpload}
        className="hidden"
        id={fileUploadId}
      />
      <div className="px-4">
        <MemoryTextarea value={diaryText} onChange={setDiaryText} />
      </div>
      {/* TODO: LocationSelectBottomSheet에서 GoogleMapsModal 연동 시 사용 */}
      {/* <GoogleMapsModal
        isOpen={isMapsModalOpen}
        onClose={() => setIsMapsModalOpen(false)}
        imageMetadata={selectedImageForMaps}
        onLocationUpdate={handleLocationUpdate}
      /> */}
    </div>
  );
};
