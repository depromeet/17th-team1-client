"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

type RecordImageCarouselProps = {
  images: string[];
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const RESET_DELAY_MS = 300;

export const RecordImageCarousel = ({ images }: RecordImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const initialDistanceRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isGestureActiveRef = useRef(false);

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

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, []);

  const handlePinchZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = currentDistance;
        isGestureActiveRef.current = true;

        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
      } else {
        const distanceRatio = currentDistance / initialDistanceRef.current;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, distanceRatio));
        setScale(newScale);
      }
    } else if (e.touches.length < 2 && isGestureActiveRef.current) {
      handleGestureEnd();
    }
  };

  const handleGestureEnd = () => {
    isGestureActiveRef.current = false;
    initialDistanceRef.current = null;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = setTimeout(() => {
      setScale(1);
      resetTimeoutRef.current = null;
    }, RESET_DELAY_MS);
  };

  const handleTouchEnd = () => {
    if (isGestureActiveRef.current) {
      handleGestureEnd();
    }
  };

  const handleTouchCancel = () => {
    if (isGestureActiveRef.current) {
      handleGestureEnd();
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
    <div
      className="relative w-full h-full"
      {...handlers}
      onTouchMove={handlePinchZoom}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* 이미지 */}
      <div className="w-full h-full overflow-hidden select-none">
        <Image
          src={images[currentIndex]}
          alt={`Record image ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 pointer-events-none"
          style={{ transform: `scale(${scale})` }}
          priority
          draggable={false}
        />
      </div>

      {/* 이미지 인디케이터 (여러 장일 경우만) */}
      {images.length > 1 && (
        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <div
              key={`indicator-${index}`}
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
