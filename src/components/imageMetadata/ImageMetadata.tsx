"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { GalleryIcon } from "@/assets/icons";
import { processSingleFile } from "@/lib/processFile";
import type { ImageMetadata } from "@/types/imageMetadata";
import { Header } from "../common/Header";
// import { GoogleMapsModal } from "./GoogleMapsModal";
import { ImageCarousel } from "./ImageCarousel";
import { LoadingOverlay } from "./LoadingOverlay";
import { MemoryTextarea } from "./MemoryTextarea";

type ImageMetadataProps = {
  initialCity?: string;
};

export default function ImageMetadataComponent({ initialCity }: ImageMetadataProps) {
  const [metadataList, setMetadataList] = useState<ImageMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileUploadId = useId();
  const [_keyword, _setKeyword] = useState("");
  // TODO: LocationSelectBottomSheet에서 GoogleMapsModal 연동 시 사용
  // const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);
  // const [selectedImageForMaps, setSelectedImageForMaps] = useState<ImageMetadata | null>(null);
  // const city = initialCity || "";
  // const cityMain = useMemo(() => city.split(",")[0]?.trim() || "", [city]);
  const router = useRouter();

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
        const remainingSlots = MAX_IMAGES - metadataList.length;
        if (remainingSlots <= 0) return;

        const tasks: Promise<ImageMetadata>[] = [];
        const filesToProcess = Math.min(files.length, remainingSlots);
        for (let i = 0; i < filesToProcess; i++) {
          const f = files[i];
          if (f.type.startsWith("image/")) tasks.push(processSingleFile(f));
        }

        const settled = await Promise.allSettled(tasks);
        const results = settled
          .filter((r): r is PromiseFulfilledResult<ImageMetadata> => r.status === "fulfilled")
          .map((r) => r.value);

        if (results.length === 0) return;

        setMetadataList((prev) => (prev.length > 0 ? [...prev, ...results] : results));
      } finally {
        (e.target as HTMLInputElement).value = "";
        setIsProcessing(false);
      }
    },
    [metadataList.length],
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
      const filtered = prev.filter((item) => item.id !== id);
      return filtered;
    });
  };

  const handleSave = () => {
    // TODO: Implement actual save functionality
    console.log("save");
  };

  if (metadataList.length === 0) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        {/* <ImageMetadataHeader city={cityMain} /> */}
        <Header
          title="최근 항목"
          variant="dark"
          leftIcon="close"
          onLeftClick={() => console.log("close")}
          rightButtonTitle="등록"
          rightButtonDisabled={true}
          onRightClick={handleSave}
        />
        <div className="px-6 mb-6 h-[calc(100vh-160px)] flex items-center justify-center">
          <div className="text-center flex flex-col justify-center relative overflow-hidden">
            <div className="mb-6 pointer-events-none">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <GalleryIcon width={80} height={80} />
              </div>
              <div className="text-text-secondary text-lg font-medium mx-auto w-max">
                사진을 업로드하려면
                <br />
                접근 권한이 필요합니다
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,image/heic"
              onChange={handleFileUpload}
              className="hidden"
              id={fileUploadId}
            />
            <label htmlFor={fileUploadId} className="absolute inset-0 cursor-pointer">
              <span className="sr-only">이미지 파일 선택</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (metadataList.length > 0) {
    const MAX_IMAGES = 3;
    const canAddMore = metadataList.length < MAX_IMAGES;
    const isSingleImage = metadataList.length === 1 && !canAddMore;

    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <Header
          title="나라, 도시 이름"
          variant="dark"
          leftIcon="back"
          onLeftClick={handleBack}
          rightButtonTitle="등록"
          rightButtonDisabled={true}
          onRightClick={() => console.log("dot")}
        />
        <div
          className={
            isSingleImage
              ? "px-4"
              : "flex gap-4 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          }
        >
          {metadataList.map((metadata) => (
            <div key={metadata.id} className={isSingleImage ? "" : "flex-shrink-0"}>
              <ImageCarousel image={metadata} onRemove={handleRemove} />
            </div>
          ))}
          {canAddMore && (
            <div className="flex-shrink-0">
              <label
                htmlFor={fileUploadId}
                className="relative select-none w-[250.784px] mx-auto cursor-pointer block"
                style={{ touchAction: "pan-y" }}
              >
                <div className="overflow-hidden rounded-xl border border-[#272727] bg-[#141414] hover:bg-black/40 transition-colors">
                  <div className="w-[251px] h-[445px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <PlusIcon size={32} />
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}
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
          <MemoryTextarea />
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
  }

  return null;
}
