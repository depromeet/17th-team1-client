"use client";

import { useCallback, useMemo, useState } from "react";
import { processSingleFile } from "@/lib/processFile";
import type { ImageMetadata } from "@/types/imageMetadata";
import { FixedSaveButton } from "./FixedSaveButton";
import { GoogleMapsModal } from "./GoogleMapsModal";
import { ImageMetadataHeader } from "./ImageMetadataHeader";
import { LoadingOverlay } from "./LoadingOverlay";

interface ImageMetadataProps {
  initialCity?: string;
}

export default function ImageMetadata({ initialCity }: ImageMetadataProps) {
  const [metadataList, setMetadataList] = useState<ImageMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
      <div className="min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <ImageMetadataHeader city={cityMain} />
        <div className="px-6 mb-6">
          <div className="bg-[#0f1012] rounded-[28px] text-center border border-[#1f2023] min-h-[50vh] flex flex-col justify-center relative overflow-hidden">
            <div className="mb-6 pointer-events-none">
              <div className="w-20 h-20 bg-[#1e1f22] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="bg-[#2a2b2f] text-gray-300 text-xs rounded-full px-4 py-2 mx-auto w-max shadow">
                꼭 기억하고 싶은 한장면을 선택해주세요.
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,image/heic"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
          </div>
        </div>
        <FixedSaveButton disabled />
      </div>
    );
  }

  if (metadataList.length > 0 && !selectedImage) {
    return (
      <div className="min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <ImageMetadataHeader city={cityMain} />
        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {metadataList.map((metadata) => (
              <div
                key={metadata.id}
                onClick={() => handleImageSelect(metadata)}
                className="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors relative"
              >
                <img src={metadata.imagePreview} alt={metadata.fileName} className="w-full h-full object-cover" />
                {metadata.status === "completed" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        <FixedSaveButton />
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
      <div className="min-h-screen bg-black text-white">
        <LoadingOverlay show={isProcessing} />
        <ImageMetadataHeader city={cityMain} onClose={() => setSelectedImage(null)} />
        <div className="px-6 mb-6">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative select-none">
              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {images.map((img) => (
                    <div key={img.id} className="w-full h-[50vh] flex-shrink-0 bg-black">
                      <img
                        src={img.imagePreview}
                        alt={img.fileName}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {shown.timestamp && (
                <div className="absolute top-3 left-3">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formatMonth(shown.timestamp)}
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-28">
                <div
                  className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center cursor-pointer hover:bg-black/80 transition-colors"
                  onClick={() => handleLocationClick(shown)}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {displayLocation || "정보 없음"}
                </div>
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
        <FixedSaveButton onClick={() => handleSave()} />
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
