"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { processSingleFile } from "@/lib/processFile";
import { getDiaryDetail } from "@/services/diaryService";
import {
  useAddDiaryPhotoMutation,
  useCreateDiaryMutation,
  useDeleteDiaryPhotoMutation,
  useUpdateDiaryMutation,
  useUploadTravelPhotoMutation,
} from "@/hooks/mutation/useDiaryMutations";
import type { ImageMetadata, ImageTag } from "@/types/imageMetadata";
import { getAuthInfo } from "@/utils/cookies";
import { toYearMonth } from "@/utils/dateUtils";
import { reverseGeocode } from "@/utils/geocoding";
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
  scrollIndex?: number;
  uuid?: string;
};

type UploadMetadata = ImageMetadata & {
  selectedTag?: ImageTag | null;
  customDate?: string | null;
  photoId?: number;
  photoCode?: string;
  isExisting?: boolean;
  originalImageUrl?: string;
  originalIndex?: number;
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

export const ImageMetadataComponent = ({
  cityId,
  diaryId,
  initialCity,
  initialCountry,
  scrollIndex,
  uuid,
}: ImageMetadataProps) => {
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
  const { mutateAsync: uploadTravelPhoto } = useUploadTravelPhotoMutation();
  const { mutateAsync: deleteDiaryPhoto } = useDeleteDiaryPhotoMutation();
  const { mutateAsync: addDiaryPhoto } = useAddDiaryPhotoMutation();
  const { mutateAsync: updateDiary } = useUpdateDiaryMutation();
  const { mutateAsync: createDiary } = useCreateDiaryMutation();

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

        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || "https://globber-dev.s3.ap-northeast-2.amazonaws.com/";

        // sessionStorage에서 저장된 순서 매핑 불러오기
        const photoCodeToIndexMap = new Map<string, number>();
        const savedOrder = sessionStorage.getItem(`diary-${diaryId}-photo-order`);
        if (savedOrder) {
          try {
            const orderMapping = JSON.parse(savedOrder) as Record<string, number>;
            Object.entries(orderMapping).forEach(([photoCode, index]) => {
              photoCodeToIndexMap.set(photoCode, index);
            });
          } catch {
            // JSON 파싱 실패 시 무시
          }
        }

        // 현재 metadataList에서도 originalIndex 정보 병합
        metadataList.forEach(item => {
          if (item.photoCode && item.originalIndex !== undefined && !photoCodeToIndexMap.has(item.photoCode)) {
            photoCodeToIndexMap.set(item.photoCode, item.originalIndex);
          }
        });

        // 서버에서 받은 photos를 원래 순서대로 정렬
        const sortedPhotos = [...diary.photos].sort((a, b) => {
          const indexA = photoCodeToIndexMap.get(a.photoCode) ?? Number.MAX_SAFE_INTEGER;
          const indexB = photoCodeToIndexMap.get(b.photoCode) ?? Number.MAX_SAFE_INTEGER;

          // 둘 다 매핑에 있으면 originalIndex로 정렬
          if (indexA !== Number.MAX_SAFE_INTEGER && indexB !== Number.MAX_SAFE_INTEGER) {
            return indexA - indexB;
          }
          // 둘 다 매핑에 없으면 photoId로 정렬 (새로 추가된 항목)
          if (indexA === Number.MAX_SAFE_INTEGER && indexB === Number.MAX_SAFE_INTEGER) {
            return a.photoId - b.photoId;
          }
          // 하나만 매핑에 있으면 매핑된 것을 앞에
          return indexA === Number.MAX_SAFE_INTEGER ? 1 : -1;
        });

        const mappedMetadata = await Promise.all(
          sortedPhotos.map(async (photo, index) => {
            const takenMonth = normalizeTakenMonth(
              typeof photo.takenMonth === "string"
                ? photo.takenMonth
                : photo.takenMonth
                  ? { year: photo.takenMonth.year, monthValue: photo.takenMonth.monthValue }
                  : null
            );

            const hasLat = typeof photo.lat === "number" && Number.isFinite(photo.lat);
            const hasLng = typeof photo.lng === "number" && Number.isFinite(photo.lng);

            /**
             * 기존 데이터에 좌표 형식("37.4850, 127.0178")으로 저장된 placeName 검증
             * 좌표 형식이면 즉시 reverse geocoding으로 실제 주소 가져오기
             */
            const isCoordinateFormat = (str: string | null | undefined): boolean => {
              if (!str) return false;
              return /^[\d.,\s]+$/.test(str.trim());
            };

            let placeName = photo.placeName && !isCoordinateFormat(photo.placeName) ? photo.placeName : null;

            // placeName이 좌표 형식이면 즉시 reverse geocoding 실행
            if (!placeName && hasLat && hasLng) {
              const geocodedName = await reverseGeocode(photo.lat, photo.lng);
              placeName = geocodedName;
            }

            const location =
              hasLat || hasLng || placeName
                ? {
                    latitude: hasLat ? photo.lat : undefined,
                    longitude: hasLng ? photo.lng : undefined,
                    altitude: undefined,
                    address: placeName ?? undefined,
                    nearbyPlaces: placeName ? [placeName, placeName] : undefined,
                  }
                : undefined;

            // photoCode로 원래 순서 복원, 없으면 현재 index 사용
            const originalIndex = photoCodeToIndexMap.get(photo.photoCode) ?? index;

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
              originalIndex,
            };
          })
        );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              processSingleFile(f).then(metadata => ({
                metadata,
                file: f,
              }))
            );
          }
        }

        const settled = await Promise.allSettled(tasks);
        const results = settled
          .filter((r): r is PromiseFulfilledResult<{ metadata: ImageMetadata; file: File }> => r.status === "fulfilled")
          .map(r => r.value);

        if (results.length === 0) return;

        const uploadPromises = results.map(({ metadata, file }) =>
          uploadTravelPhoto({ file }).then(photoCode => ({
            photoCode,
            metadata,
          }))
        );

        const uploadedResults = await Promise.all(uploadPromises);
        // 서버에는 아직 등록하지 않고, S3 업로드 결과를 이용해 로컬 상태만 갱신한다.
        const currentLength = metadataList.length;
        const mappedMetadata = uploadedResults.map(({ metadata, photoCode }, index) => {
          const selectedTag = metadata.tag && metadata.tag !== "NONE" ? metadata.tag : null;
          const baseTakenMonth = toYearMonth(metadata.timestamp);

          return {
            ...metadata,
            selectedTag,
            customDate: baseTakenMonth ?? null,
            photoCode,
            photoId: undefined,
            isExisting: false,
            originalIndex: currentLength + index, // 원래 순서 저장
          };
        });

        setMetadataList(prev => {
          if (prev.length > 0) {
            // 기존 항목들도 originalIndex가 없으면 추가
            const updatedPrev = prev.map((item, idx) => ({
              ...item,
              originalIndex: item.originalIndex ?? idx,
            }));
            return [...updatedPrev, ...mappedMetadata];
          }
          return mappedMetadata;
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
      } finally {
        (e.target as HTMLInputElement).value = "";
        setIsProcessing(false);
      }
    },
    [metadataCount, metadataList.length, uploadTravelPhoto]
  );

  const handleRemove = async (id: string) => {
    const target = metadataList.find(item => item.id === id);
    if (!target) return;

    if (target.photoId && isEditMode && typeof diaryId === "number") {
      try {
        setDeletingPhotoId(id);
        await deleteDiaryPhoto({ diaryId, photoId: target.photoId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "사진 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        alert(errorMessage);
        throw error;
      } finally {
        setDeletingPhotoId(null);
      }
    }

    setMetadataList(prev => prev.filter(item => item.id !== id));
  };

  const handleImageUpdate = async (id: string, croppedImageBlobUrl: string) => {
    const targetMetadata = metadataList.find(item => item.id === id);
    if (!targetMetadata) return;

    try {
      const blob = await fetch(croppedImageBlobUrl).then(res => res.blob());
      const croppedFile = new File([blob], targetMetadata.fileName, { type: "image/jpeg" });

      const newPhotoCode = await uploadTravelPhoto({ file: croppedFile });

      const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || "https://globber-dev.s3.ap-northeast-2.amazonaws.com/";
      const newImageUrl = `${baseUrl}${newPhotoCode}`;

      setMetadataList(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                imagePreview: newImageUrl,
                photoCode: newPhotoCode,
                originalPhotoId: item.photoId,
                photoId: undefined,
                isExisting: false,
                originalImageUrl: item.originalImageUrl || item.imagePreview,
              }
            : item
        )
      );
    } catch (error) {
      alert("크롭된 이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  const handleTagChange = (id: string, tag: ImageTag | null) => {
    setMetadataList(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          selectedTag: tag,
          tag: tag ?? "NONE",
        };
      })
    );
  };

  const handleDateChange = (id: string, yearMonth: string | null) => {
    setMetadataList(prev => prev.map(item => (item.id === id ? { ...item, customDate: yearMonth } : item)));
  };

  const handleLocationChange = (id: string, location: LocationSelection | null) => {
    setMetadataList(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (!location) {
          return { ...item, location: undefined };
        }

        const displayName = location.name || location.address || "";
        const formattedAddress = location.address || location.name || "";
        const uniquePlaces = [formattedAddress, displayName].filter(
          (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index
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
      })
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
      // sessionStorage에 photoCode-originalIndex 매핑 저장 (재조회 시 순서 복원용)
      if (isEditMode && typeof diaryId === "number") {
        const orderMapping: Record<string, number> = {};
        metadataList.forEach(item => {
          if (item.photoCode && item.originalIndex !== undefined) {
            orderMapping[item.photoCode] = item.originalIndex;
          }
        });
        sessionStorage.setItem(`diary-${diaryId}-photo-order`, JSON.stringify(orderMapping));
      }

      const fallbackMonth = new Date().toISOString().slice(0, 7).replace("-", "");

      let currentMetadataList = metadataList;

      if (isEditMode && typeof diaryId === "number") {
        const withoutPhotoId = metadataList.filter(item => item.photoId == null);

        if (withoutPhotoId.length > 0) {
          const createdPhotos: { targetId: string; photoId: number }[] = [];

          for (const metadata of withoutPhotoId) {
            if (!metadata.photoCode) {
              throw new Error("사진 정보가 없습니다. 다시 시도해주세요.");
            }

            if ((metadata as UploadMetadata & { originalPhotoId?: number }).originalPhotoId) {
              await deleteDiaryPhoto({
                diaryId,
                photoId: (metadata as UploadMetadata & { originalPhotoId: number }).originalPhotoId,
              });
            }

            const { location, dimensions, customDate, timestamp, selectedTag, tag } = metadata;
            const width = dimensions?.width ?? 1;
            const height = dimensions?.height ?? 1;
            const takenMonthValue =
              customDate !== null && customDate !== undefined
                ? customDate
                : customDate === null
                  ? null
                  : (toYearMonth(timestamp) ?? fallbackMonth);
            const normalizedTag = selectedTag ?? tag ?? "NONE";
            const latitude = location?.latitude;
            const longitude = location?.longitude;

            // 좌표 형식 검증 함수
            const isCoordinateFormat = (str: string | null | undefined): boolean => {
              if (!str) return false;
              return /^[\d.,\s]+$/.test(str.trim());
            };

            // placeName 결정 로직
            let placeName = location?.address;

            if ((!placeName || isCoordinateFormat(placeName)) && latitude && longitude) {
              const geocodedName = await reverseGeocode(latitude, longitude);
              placeName = geocodedName ?? undefined;
            }

            const finalPlaceName =
              placeName && typeof placeName === "string" && placeName.trim() && !isCoordinateFormat(placeName)
                ? placeName.trim()
                : undefined;

            const payload = {
              photoCode: metadata.photoCode,
              lat: latitude,
              lng: longitude,
              width,
              height,
              takenMonth: takenMonthValue,
              tag: normalizedTag,
              ...(finalPlaceName && { placeName: finalPlaceName }),
            };

            const createdPhoto = await addDiaryPhoto({ diaryId, photo: payload });
            let resolvedPhotoId =
              (createdPhoto as { photoId?: number })?.photoId ??
              (createdPhoto as { data?: { photoId?: number } })?.data?.photoId;

            if (!resolvedPhotoId) {
              console.warn("⚠️  photoId를 응답에서 찾지 못함 → 다이어리 재조회");
              try {
                const latestDiary = await getDiaryDetail(diaryId);
                const matchedPhoto = latestDiary.photos.find(photo => photo.photoCode === metadata.photoCode);
                if (matchedPhoto?.photoId) {
                  resolvedPhotoId = matchedPhoto.photoId;
                  console.log(`✅ 재조회 성공 → photoId: ${resolvedPhotoId}`);
                }
              } catch (fetchError) {
                console.error("❌ 재조회 실패:", fetchError);
              }
            }

            if (!resolvedPhotoId) {
              throw new Error("업로드한 사진 ID를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.");
            }

            createdPhotos.push({ targetId: metadata.id, photoId: resolvedPhotoId });
          }

          // 새로 생성된 photoId를 로컬 상태에도 반영해 이후 updateDiary 요청에서 재사용한다.
          currentMetadataList = metadataList.map(item => {
            const created = createdPhotos.find(c => c.targetId === item.id);
            if (!created) return item;
            return {
              ...item,
              photoId: created.photoId,
              isExisting: true,
              originalPhotoId: undefined,
            };
          });

          setMetadataList(currentMetadataList);
        }
      }

      // originalIndex 순서대로 정렬하여 서버에 저장 (순서 유지)
      const sortedMetadataList = [...currentMetadataList].sort((a, b) => {
        const indexA = a.originalIndex ?? Number.MAX_SAFE_INTEGER;
        const indexB = b.originalIndex ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
      });

      const photos = await Promise.all(
        sortedMetadataList.map(async metadata => {
          if (!metadata.photoCode) {
            throw new Error("사진 정보가 없습니다. 다시 시도해주세요.");
          }

          const { location, dimensions, customDate, timestamp, selectedTag, tag, photoId } = metadata;
          const width = dimensions?.width ?? 0;
          const height = dimensions?.height ?? 0;
          const takenMonth =
            customDate !== null && customDate !== undefined
              ? customDate
              : customDate === null
                ? null
                : (toYearMonth(timestamp) ?? fallbackMonth);
          const normalizedTag = selectedTag ?? tag ?? "NONE";
          const latitude = location?.latitude;
          const longitude = location?.longitude;

          // 좌표 형식 검증 함수
          const isCoordinateFormat = (str: string | null | undefined): boolean => {
            if (!str) return false;
            return /^[\d.,\s]+$/.test(str.trim());
          };

          let placeName = location?.address;

          if ((!placeName || isCoordinateFormat(placeName)) && latitude && longitude) {
            const geocodedName = await reverseGeocode(latitude, longitude);
            placeName = geocodedName ?? undefined;
          }

          const finalPlaceName =
            placeName && typeof placeName === "string" && placeName.trim() && !isCoordinateFormat(placeName)
              ? placeName.trim()
              : undefined;

          return {
            photoId,
            photoCode: metadata.photoCode,
            lat: latitude,
            lng: longitude,
            width,
            height,
            takenMonth,
            tag: normalizedTag,
            ...(finalPlaceName && { placeName: finalPlaceName }),
          };
        })
      );

      const validCityId = cityId as number;
      const payload = {
        cityId: validCityId,
        text: diaryText || undefined,
        photos,
      };

      if (isEditMode && typeof diaryId === "number") {
        await updateDiary({ diaryId, params: payload });
      } else {
        await createDiary({ params: payload });
      }

      const finalUuid = uuid || getAuthInfo().uuid;
      const params = new URLSearchParams();
      if (finalUuid) {
        params.set("uuid", finalUuid);
      }
      if (typeof scrollIndex === "number") {
        params.set("scrollIndex", String(scrollIndex));
      }
      const queryString = params.toString();
      const nextPath = queryString ? `/record/${validCityId}?${queryString}` : `/record/${validCityId}`;

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
      <div className="max-w-md mx-auto min-h-dvh bg-black text-white">
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
    <div className="max-w-md mx-auto min-h-dvh bg-black text-white">
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
