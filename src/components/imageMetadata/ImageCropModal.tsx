"use client";

import { useCallback, useEffect, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { Header } from "../common/Header";

type ImageCropModalProps = {
  image: string;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
};

export const ImageCropModal = ({ image, onClose, onSave }: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let blobUrlToCleanup: string | null = null;

    const loadImage = async () => {
      try {
        const blobUrl = await fetchImageAsBlob(image);
        blobUrlToCleanup = blobUrl;
        if (!cancelled) {
          setImageBlobUrl(blobUrl);
        }
      } catch {
        if (!cancelled) {
          alert("이미지 로드에 실패했습니다.");
          onClose();
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
      if (blobUrlToCleanup) {
        URL.revokeObjectURL(blobUrlToCleanup);
      }
    };
  }, [image, onClose]);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels || !imageBlobUrl) return;

    try {
      const croppedImage = await getCroppedImg(imageBlobUrl, croppedAreaPixels);
      onSave(croppedImage);
      onClose();
    } catch (error) {
      alert("이미지 크롭에 실패했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  if (!imageBlobUrl) {
    return (
      <div className="image-crop-modal fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-sm">이미지 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="image-crop-modal fixed inset-0 z-50 bg-black">
      <div className="max-w-md mx-auto w-full h-full relative">
        {/* Header - Absolute positioned */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <Header
            variant="dark"
            leftIcon="close"
            onLeftClick={onClose}
            rightButtonTitle="완료"
            rightButtonVariant="white"
            onRightClick={createCroppedImage}
          />
        </div>

        {/* Crop Area - Full screen */}
        <div className="relative w-full h-full">
          <Cropper
            image={imageBlobUrl}
            crop={crop}
            zoom={zoom}
            aspect={9 / 16}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
                backgroundColor: "#000",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * S3 이미지를 Blob URL로 변환합니다 (CORS 우회).
 *
 * @param {string} url - 원본 이미지 URL
 * @returns {Promise<string>} Blob URL
 */
const fetchImageAsBlob = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "include",
      cache: "force-cache",
    });

    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    // CORS 또는 네트워크 에러 발생 시 Next.js Image Proxy로 fallback
    console.warn("Direct S3 fetch failed, falling back to Next.js proxy:", error);
  }

  // Fallback: Next.js Image Proxy 사용
  const proxyUrl = `/_next/image?url=${encodeURIComponent(url)}&w=3840&q=95`;
  const proxyResponse = await fetch(proxyUrl);

  if (!proxyResponse.ok) {
    throw new Error("Failed to fetch image via proxy");
  }

  const blob = await proxyResponse.blob();
  return URL.createObjectURL(blob);
};

/**
 * 이미지를 크롭하여 새로운 이미지를 생성합니다.
 *
 * @param {string} imageBlobUrl - Blob URL 형태의 이미지 URL
 * @param {Area} pixelCrop - 크롭 영역 정보
 * @returns {Promise<string>} 크롭된 이미지의 Blob URL
 */
const getCroppedImg = async (imageBlobUrl: string, pixelCrop: Area): Promise<string> => {
  const image = await createImage(imageBlobUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context is not available");
  }

  const ASPECT_RATIO = 9 / 16;
  const { x, y, width, height } = pixelCrop;

  const canvasWidth = Math.round(width);
  const canvasHeight = Math.round(canvasWidth / ASPECT_RATIO);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.drawImage(image, x, y, width, height, 0, 0, canvasWidth, canvasHeight);

  const OUTPUT_MIME_TYPE = "image/jpeg";
  const OUTPUT_QUALITY = 0.95;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      },
      OUTPUT_MIME_TYPE,
      OUTPUT_QUALITY,
    );
  });
};

/**
 * 이미지 URL로부터 HTMLImageElement를 생성합니다.
 *
 * @param {string} url - 이미지 URL (Blob URL)
 * @returns {Promise<HTMLImageElement>} 로드된 이미지 엘리먼트
 */
const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
};
