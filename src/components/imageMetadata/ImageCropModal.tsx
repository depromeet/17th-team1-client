"use client";

import { useCallback, useState } from "react";
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

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onSave(croppedImage);
      onClose();
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  };

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
            image={image}
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
 * 이미지를 크롭하여 새로운 이미지를 생성합니다.
 *
 * @param {string} imageSrc - 원본 이미지 URL
 * @param {Area} pixelCrop - 크롭 영역 정보
 * @returns {Promise<string>} 크롭된 이미지의 base64 URL
 */
const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
  const image = await createImage(imageSrc);
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
 * @param {string} url - 이미지 URL
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
