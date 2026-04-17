"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { sendGAEvent } from "@next/third-parties/google";

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

  const hasSavedRef = useRef(false);
  const metadataListRef = useRef(metadataList);
  const diaryTextRef = useRef(diaryText);

  useEffect(() => {
    metadataListRef.current = metadataList;
  }, [metadataList]);

  useEffect(() => {
    diaryTextRef.current = diaryText;
  }, [diaryText]);

  const { handleSave, saveStartedRef, saveCompletedRef, savePhotoCountRef, saveTextLengthRef } = useDiaryAction({
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
    hasSavedRef,
  });

  useEffect(() => {
    sendGAEvent("event", "editor_record_edit_view", {
      flow: "editor",
      screen: "record_edit",
    });
    return () => {
      sendGAEvent("event", "editor_record_edit_exit", {
        flow: "editor",
        screen: "record_edit",
        has_saved: hasSavedRef.current,
        photo_count: metadataListRef.current.length,
        text_length: diaryTextRef.current.length,
      });
      if (saveStartedRef.current && !saveCompletedRef.current) {
        sendGAEvent("event", "record_save_exit", {
          flow: "editor",
          screen: "record_save",
          photo_count: savePhotoCountRef.current,
          text_length: saveTextLengthRef.current,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleRemoveWithGA = (id: string) => {
    sendGAEvent("event", "record_photo_delete_confirm", {
      flow: "editor",
      screen: "record_edit",
      click_code: "editor.record.edit.photo.delete.confirm",
      photo_count: metadataList.length - 1,
    });
    handleRemove(id);
  };

  const handleSaveClick = () => {
    const hasMetadata = metadataList.some(item => item.customDate || item.location?.address);
    sendGAEvent("event", "record_edit_save_click", {
      flow: "editor",
      screen: "record_edit",
      click_code: "editor.record.edit.header.save",
      photo_count: metadataList.length,
      text_length: diaryText.length,
      has_metadata: hasMetadata,
    });
    handleSave();
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
        onRightClick={handleSaveClick}
      />
      <ImageUploadSection
        metadataList={metadataList}
        fileUploadId={fileUploadId}
        handleRemove={handleRemoveWithGA}
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
