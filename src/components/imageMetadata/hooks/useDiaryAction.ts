"use client";

import { useRouter } from "next/navigation";
import { getDiaryDetail } from "@/services/diaryService";
import {
  useDeleteDiaryPhotoMutation,
  useAddDiaryPhotoMutation,
  useUpdateDiaryMutation,
  useCreateDiaryMutation,
} from "@/hooks/mutation/useDiaryMutations";
import { getAuthInfo } from "@/utils/cookies";
import { toYearMonth } from "@/utils/dateUtils";
import { reverseGeocode } from "@/utils/geocoding";
import type { UploadMetadata } from "./useImageMetadata";

interface UseDiaryActionProps {
  cityId?: number;
  diaryId?: number;
  isEditMode: boolean;
  uuid?: string;
  scrollIndex?: number;
  metadataList: UploadMetadata[];
  setMetadataList: React.Dispatch<React.SetStateAction<UploadMetadata[]>>;
  diaryText: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useDiaryAction = ({
  cityId,
  diaryId,
  isEditMode,
  uuid,
  scrollIndex,
  metadataList,
  setMetadataList,
  diaryText,
  isProcessing,
  setIsProcessing,
}: UseDiaryActionProps) => {
  const router = useRouter();
  const { mutateAsync: deleteDiaryPhoto } = useDeleteDiaryPhotoMutation();
  const { mutateAsync: addDiaryPhoto } = useAddDiaryPhotoMutation();
  const { mutateAsync: updateDiary } = useUpdateDiaryMutation();
  const { mutateAsync: createDiary } = useCreateDiaryMutation();

  const isCityIdValid = typeof cityId === "number" && Number.isFinite(cityId) && cityId > 0;

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

            if (metadata.originalPhotoId) {
              await deleteDiaryPhoto({
                diaryId,
                photoId: metadata.originalPhotoId,
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
              (createdPhoto as any)?.photoId ?? (createdPhoto as any)?.data?.photoId;

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

  return { handleSave };
};
