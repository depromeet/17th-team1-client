"use client";

import Image from "next/image";
import { useCallback, useId, useMemo, useState } from "react";
import { GalleryIcon } from "@/assets/icons";
import { MetadataChip } from "@/components/imageMetadata/MetadataChip";
import { processSingleFile } from "@/lib/processFile";
import type { ImageMetadata } from "@/types/imageMetadata";
import { Header } from "../common/Header";
import { GoogleMapsModal } from "./GoogleMapsModal";
import { ImageMetadataHeader } from "./ImageMetadataHeader";
import { LoadingOverlay } from "./LoadingOverlay";

type ImageMetadataProps = {
  initialCity?: string;
};

export default function ImageMetadataComponent({ initialCity }: ImageMetadataProps) {
  const [metadataList, setMetadataList] = useState<ImageMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileUploadId = useId();
  const [_keyword, _setKeyword] = useState("");
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);
  const [selectedImageForMaps, setSelectedImageForMaps] = useState<ImageMetadata | null>(null);
  const city = initialCity || "";
  const cityMain = useMemo(() => city.split(",")[0]?.trim() || "", [city]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const tasks: Promise<ImageMetadata>[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type.startsWith("image/")) tasks.push(processSingleFile(f));
      }

      const settled = await Promise.allSettled(tasks);
      const results = settled
        .filter((r): r is PromiseFulfilledResult<ImageMetadata> => r.status === "fulfilled")
        .map((r) => r.value);

      if (results.length === 0) return;

      setMetadataList((prev) => {
        const next = prev.length > 0 ? [...prev, ...results] : results;
        setSelectedImage(next[prev.length]);
        setCurrentIndex(prev.length);
        return next;
      });
    } finally {
      (e.target as HTMLInputElement).value = "";
      setIsProcessing(false);
    }
  }, []);

  const handleImageSelect = (metadata: ImageMetadata) => setSelectedImage(metadata);

  const handleLocationClick = (metadata: ImageMetadata) => {
    setSelectedImageForMaps(metadata);
    setIsMapsModalOpen(true);
  };

  const handleLocationUpdate = (lat: number, lng: number, address: string) => {
    if (!selectedImageForMaps) return;

    // 새로운 위치 정보로 업데이트
    const updatedLocation = {
      latitude: lat,
      longitude: lng,
      altitude: selectedImageForMaps.location?.altitude,
      address: address,
      nearbyPlaces: [address], // 기본적으로 선택된 주소만 포함
    };

    // 메타데이터 리스트 업데이트
    setMetadataList((prev) =>
      prev.map((item) => (item.id === selectedImageForMaps.id ? { ...item, location: updatedLocation } : item)),
    );

    // 현재 선택된 이미지도 업데이트
    if (selectedImage?.id === selectedImageForMaps.id) {
      setSelectedImage((prev) => (prev ? { ...prev, location: updatedLocation } : null));
    }
  };

  const handleSave = () => {
    // TODO: Implement actual save functionality
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
          onRightClick={() => console.log("dot")}
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

  if (metadataList.length > 0 && !selectedImage) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <ImageMetadataHeader city={cityMain} />
        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {metadataList.map((metadata) => (
              <button
                type="button"
                key={metadata.id}
                onClick={() => handleImageSelect(metadata)}
                className="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors relative border-0 p-0 w-full"
              >
                <Image
                  src={metadata.imagePreview}
                  alt={metadata.fileName}
                  fill
                  className="object-cover"
                  // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  sizes="100vw"
                />
                {metadata.status === "completed" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="h-20"></div>
      </div>
    );
  }

  if (selectedImage) {
    const images = metadataList.length > 0 ? metadataList : [selectedImage];
    const shown = images[currentIndex] || selectedImage;
    const formatMonth = (ts?: string) =>
      ts
        ? (() => {
          const d = new Date(ts);
          return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
        })()
        : "";
    const displayLocation = shown.location?.nearbyPlaces?.[1] || shown.location?.address || "";

    return (
      <div className="max-w-md mx-auto min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <Header
          title="나라, 도시 이름"
          variant="dark"
          leftIcon="back"
          onLeftClick={() => setSelectedImage(null)}
          rightButtonTitle="등록"
          rightButtonDisabled={true}
          onRightClick={() => console.log("dot")}
        />
        <div className="px-6 mb-6">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative select-none">
              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {images.map((img) => (
                    <div key={img.id} className="w-full h-[50vh] flex-shrink-0 bg-black relative">
                      <Image
                        src={img.imagePreview}
                        alt={img.fileName}
                        fill
                        className="object-cover object-center"
                        sizes="100vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <MetadataChip iconType="calendar" text={formatMonth(shown.timestamp) || "정보 없음"} />
              </div>
              <div className="absolute top-3 left-28">
                <button
                  type="button"
                  onClick={() => handleLocationClick(shown)}
                  aria-label="Open location in maps"
                  className="cursor-pointer hover:opacity-80 transition-opacity border-0 p-0 bg-transparent"
                >
                  <MetadataChip iconType="location" text={displayLocation || "정보 없음"} />
                </button>
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <GoogleMapsModal
          isOpen={isMapsModalOpen}
          onClose={() => setIsMapsModalOpen(false)}
          imageMetadata={selectedImageForMaps}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>
    );
  }

  return null;
}
