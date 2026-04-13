"use client";

import { useRouter } from "next/navigation";

import { Header } from "../common/Header";
import { CityErrorFallback } from "./CityErrorFallback";
import { useDiaryAction } from "./hooks/useDiaryAction";
import { useImageMetadata } from "./hooks/useImageMetadata";
import { ImageUploadSection } from "./ImageUploadSection";
import { LoadingOverlay } from "./LoadingOverlay";
import { MemoryTextarea } from "./MemoryTextarea";

type ImageMetadataProps = {
  cityId?: number;
  diaryId?: number;
  initialCity?: string;
  initialCountry?: string;
  scrollIndex?: number;
  uuid?: string;
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
  const isCityIdValid = typeof cityId === "number" && Number.isFinite(cityId) && cityId > 0;
  const isEditMode = typeof diaryId === "number" && Number.isFinite(diaryId);

  const {
    metadataList,
    setMetadataList,
    diaryText,
    setDiaryText,
    isProcessing,
    setIsProcessing,
    isInitialLoading,
    pendingDeletePhotoIds,
    fileUploadId,
    handleFileUpload,
    handleRemove,
    handleImageUpdate,
    handleTagChange,
    handleDateChange,
    handleLocationChange,
    handleReorder,
  } = useImageMetadata({ diaryId, isEditMode });

  const { handleSave } = useDiaryAction({
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
    pendingDeletePhotoIds,
  });

  const handleBack = () => {
    router.back();
  };

  const handleNavigateToCitySelection = () => {
    router.push("/record");
  };

  if (!isCityIdValid) {
    return <CityErrorFallback onBack={handleBack} onNavigateToCitySelection={handleNavigateToCitySelection} />;
  }

  const locationTitle = [initialCity, initialCountry].filter(Boolean).join(", ");
  const headerTitle = locationTitle || "나라, 도시 이름";
  const hasImages = metadataList.length > 0;

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-black text-white">
      <LoadingOverlay show={isProcessing || isInitialLoading} />
      <Header
        title={headerTitle}
        variant="dark"
        leftIcon="back"
        onLeftClick={handleBack}
        rightButtonTitle="저장"
        rightButtonDisabled={!hasImages || isProcessing || isInitialLoading || !isCityIdValid}
        onRightClick={handleSave}
      />
      <ImageUploadSection
        metadataList={metadataList}
        fileUploadId={fileUploadId}
        handleRemove={handleRemove}
        handleImageUpdate={handleImageUpdate}
        handleTagChange={handleTagChange}
        handleDateChange={handleDateChange}
        handleLocationChange={handleLocationChange}
        handleReorder={handleReorder}
      />

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
