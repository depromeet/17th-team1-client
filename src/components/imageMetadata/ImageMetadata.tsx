"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { processSingleFile } from "@/lib/processFile";
import {
  addDiaryPhoto,
  createDiary,
  deleteDiaryPhoto,
  getDiaryDetail,
  updateDiary,
  uploadTravelPhoto,
} from "@/services/diaryService";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { getAuthInfo } from "@/utils/cookies";
import { toYearMonth } from "@/utils/dateUtils";
import { Header } from "../common/Header";
import { ImageCarousel } from "./ImageCarousel";
import { LoadingOverlay } from "./LoadingOverlay";
import type { LocationSelection } from "./LocationSelectBottomSheet";
import { MemoryTextarea } from "./MemoryTextarea";

type ImageMetadataProps = {
  cityId?: number;
  diaryId?: number;
  initialCity?: string;
  initialCountry?: string;
};

type UploadMetadata = ImageMetadata & {
  selectedTag?: ImageTag | null;
  customDate?: string | null;
  photoId?: number;
  photoCode?: string;
  isExisting?: boolean;
};

const normalizeTakenMonth = (value: string | { year: number; monthValue: number } | null | undefined) => {
  if (!value) return null;
  if (typeof value === "string") {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length >= 6 ? digitsOnly.slice(0, 6) : null;
  }
  const { year, monthValue } = value;
  if (!year || !monthValue) return null;
  return `${year}${String(monthValue).padStart(2, "0")}`;
};

export const ImageMetadataComponent = ({ cityId, diaryId, initialCity, initialCountry }: ImageMetadataProps) => {
  const router = useRouter();
  const [metadataList, setMetadataList] = useState<UploadMetadata[]>([]);
  const [diaryText, setDiaryText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const fileUploadId = useId();
  const metadataCount = metadataList.length;
  const isCityIdValid = typeof cityId === "number" && Number.isFinite(cityId) && cityId > 0;
  const isEditMode = typeof diaryId === "number" && Number.isFinite(diaryId);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!isEditMode || typeof diaryId !== "number") return;
    let isCancelled = false;

    const fetchDiaryDetail = async () => {
      setIsInitialLoading(true);
      try {
        const diary = await getDiaryDetail(diaryId);
        if (isCancelled) return;

        setDiaryText(diary.text ?? "");

        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || "";
        const mappedMetadata = diary.photos.map((photo, index) => {
          const takenMonth = normalizeTakenMonth(
            typeof photo.takenMonth === "string"
              ? photo.takenMonth
              : photo.takenMonth
                ? { year: photo.takenMonth.year, monthValue: photo.takenMonth.monthValue }
                : null,
          );

          const hasLat = typeof photo.lat === "number" && Number.isFinite(photo.lat);
          const hasLng = typeof photo.lng === "number" && Number.isFinite(photo.lng);
          const location =
            (hasLat || hasLng || photo.placeName) && (photo.placeName || (hasLat && hasLng))
              ? {
                  latitude: hasLat ? photo.lat : undefined,
                  longitude: hasLng ? photo.lng : undefined,
                  altitude: undefined,
                  address: photo.placeName ?? undefined,
                  nearbyPlaces: photo.placeName ? [photo.placeName, photo.placeName] : undefined,
                }
              : undefined;

          return {
            id: `existing-${photo.photoId}-${index}`,
            fileName: photo.photoCode.split("/").pop() ?? `photo-${photo.photoId}`,
            fileSize: 0,
            fileType: "image/jpeg",
            imagePreview: `${baseUrl}${photo.photoCode}`,
            dimensions:
              photo.width && photo.height
                ? {
                    width: photo.width,
                    height: photo.height,
                  }
                : undefined,
            location,
            timestamp: undefined,
            tag: photo.tag ?? "NONE",
            status: "completed" as const,
            selectedTag: photo.tag && photo.tag !== "NONE" ? photo.tag : null,
            customDate: takenMonth,
            photoId: photo.photoId,
            photoCode: photo.photoCode,
            isExisting: true,
          };
        });

        setMetadataList(mappedMetadata);
      } catch (error) {
        if (!isCancelled) {
          alert(error instanceof Error ? error.message : "여행 기록 정보를 불러오지 못했습니다.");
          router.back();
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchDiaryDetail();

    return () => {
      isCancelled = true;
    };
  }, [diaryId, isEditMode, router]);

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
          })),
        );

        const uploadedResults = await Promise.all(uploadPromises);
        const fallbackMonth = new Date().toISOString().slice(0, 7).replace("-", "");

        const mappedMetadata = await Promise.all(
          uploadedResults.map(async ({ metadata, photoCode }) => {
            const selectedTag = metadata.tag && metadata.tag !== "NONE" ? metadata.tag : null;
            const baseTakenMonth = toYearMonth(metadata.timestamp);
            const takenMonthForRequest = baseTakenMonth ?? fallbackMonth;
            const width = metadata.dimensions?.width ?? 1;
            const height = metadata.dimensions?.height ?? 1;
            const latitude = metadata.location?.latitude;
            const longitude = metadata.location?.longitude;
            const placeName = metadata.location?.address;

            let photoId: number | undefined;

            if (isEditMode && typeof diaryId === "number") {
              const normalizedTag = selectedTag ?? metadata.tag ?? "NONE";
              const photoPayload = {
                photoCode,
                lat: latitude,
                lng: longitude,
                width,
                height,
                takenMonth: takenMonthForRequest,
                tag: normalizedTag,
                placeName,
              };

              try {
                const createdPhoto = await addDiaryPhoto(diaryId, photoPayload);
                photoId = createdPhoto.photoId;
              } catch (error) {
                throw error;
              }
            }

            return {
              ...metadata,
              selectedTag,
              customDate: baseTakenMonth ?? null,
              photoCode,
              photoId,
              isExisting: Boolean(photoId),
            };
          }),
        );

        setMetadataList((prev) => (prev.length > 0 ? [...prev, ...mappedMetadata] : mappedMetadata));
      } catch (error) {
        alert(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
      } finally {
        (e.target as HTMLInputElement).value = "";
        setIsProcessing(false);
      }
    },
    [metadataCount, isEditMode, diaryId],
  );

  const handleRemove = async (id: string) => {
    const target = metadataList.find((item) => item.id === id);
    if (!target) return;

    if (target.photoId && isEditMode && typeof diaryId === "number") {
      try {
        setDeletingPhotoId(id);
        await deleteDiaryPhoto(diaryId, target.photoId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "사진 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        alert(errorMessage);
        throw error;
      } finally {
        setDeletingPhotoId(null);
      }
    }

    setMetadataList((prev) => prev.filter((item) => item.id !== id));
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
    if (!isCityIdValid) {
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

      let currentMetadataList = metadataList;

      if (isEditMode && typeof diaryId === "number") {
        const withoutPhotoId = metadataList.filter((item) => item.photoId == null);

        if (withoutPhotoId.length > 0) {
          const createdPhotos = await Promise.all(
            withoutPhotoId.map(async (metadata) => {
              if (!metadata.photoCode) {
                throw new Error("사진 정보가 없습니다. 다시 시도해주세요.");
              }

              const { location, dimensions, customDate, timestamp, selectedTag, tag } = metadata;
              const width = dimensions?.width ?? 1;
              const height = dimensions?.height ?? 1;
              const takenMonthValue = customDate ?? toYearMonth(timestamp) ?? fallbackMonth;
              const normalizedTag = selectedTag ?? tag ?? "NONE";
              const latitude = location?.latitude;
              const longitude = location?.longitude;
              const placeName = location?.address;

              const payload = {
                photoCode: metadata.photoCode,
                lat: latitude,
                lng: longitude,
                width,
                height,
                takenMonth: takenMonthValue,
                tag: normalizedTag,
                placeName,
              };

              const createdPhoto = await addDiaryPhoto(diaryId, payload);
              return { targetId: metadata.id, photoId: createdPhoto.photoId };
            }),
          );

          currentMetadataList = metadataList.map((item) => {
            const created = createdPhotos.find((c) => c.targetId === item.id);
            if (!created) return item;
            return {
              ...item,
              photoId: created.photoId,
              isExisting: true,
            };
          });

          setMetadataList(currentMetadataList);
        }
      }

      const photos = currentMetadataList.map((metadata) => {
        if (!metadata.photoCode) {
          throw new Error("사진 정보가 없습니다. 다시 시도해주세요.");
        }

        const { location, dimensions, customDate, timestamp, selectedTag, tag, photoId } = metadata;
        const width = dimensions?.width ?? 0;
        const height = dimensions?.height ?? 0;
        const takenMonth = customDate ?? toYearMonth(timestamp) ?? fallbackMonth;
        const normalizedTag = selectedTag ?? tag ?? "NONE";
        const latitude = location?.latitude;
        const longitude = location?.longitude;
        const placeName = location?.address;

        return {
          photoId,
          photoCode: metadata.photoCode,
          lat: latitude,
          lng: longitude,
          width,
          height,
          takenMonth,
          tag: normalizedTag,
          placeName,
        };
      });

      const validCityId = cityId as number;
      const payload = {
        cityId: validCityId,
        text: diaryText || undefined,
        photos,
      };

      if (isEditMode && typeof diaryId === "number") {
        await updateDiary(diaryId, payload);
      } else {
        await createDiary(payload);
      }

      const { uuid } = getAuthInfo();
      const nextPath = uuid ? `/record/${validCityId}?uuid=${uuid}` : `/record/${validCityId}`;

      router.push(nextPath);
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

  const handleNavigateToCitySelection = () => {
    router.push("/record");
  };

  if (!isCityIdValid) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white">
        <Header title="도시 선택 필요" variant="dark" leftIcon="back" onLeftClick={handleBack} />
        <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-white">도시 정보가 필요합니다.</p>
            <p className="text-sm text-white/60">
              여행 기록을 작성하려면 먼저 도시를 선택해주세요. 선택 화면으로 이동한 후 다시 시도해 주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNavigateToCitySelection}
            className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-black hover:opacity-90 transition-opacity"
          >
            도시 선택 화면으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white">
      <LoadingOverlay show={isProcessing || isInitialLoading || Boolean(deletingPhotoId)} />
      <Header
        title={headerTitle}
        variant="dark"
        leftIcon="back"
        onLeftClick={handleBack}
        rightButtonTitle="저장"
        rightButtonDisabled={!hasImages || isProcessing || isInitialLoading || !isCityIdValid}
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
              isProcessing={deletingPhotoId === metadata.id}
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
    </div>
  );
};
