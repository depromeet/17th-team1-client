"use client";

import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

type RecordImageCarouselProps = {
  images: string[];
};

export const RecordImageCarousel = ({ images }: RecordImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    trackMouse: true,
  });

  const handlePinchZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

      if (distance > 100) {
        setScale(1.5);
        setTimeout(() => setScale(1), 300);
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-surface-thirdly flex items-center justify-center">
        <p className="text-text-secondary">이미지가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" {...handlers} onTouchMove={handlePinchZoom}>
      {/* 이미지 */}
      <div className="w-full h-full overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={`Record image ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
          priority
        />
      </div>

      {/* 이미지 인디케이터 (여러 장일 경우만) */}
      {images.length > 1 && (
        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((image, index) => (
            <div
              key={image || `indicator-${index}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
