"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

type RecordImageCarouselProps = {
  images: string[];
  onImageChange?: (index: number) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const RESET_DELAY_MS = 300;

export const RecordImageCarousel = ({ images, onImageChange }: RecordImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const initialDistanceRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isGestureActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  // react-swipeable 핸들러
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      if (scale > 1) return; // 줌된 상태에서는 스와이프 비활성화
      setIsDragging(true);
      setDragX(eventData.deltaX);
    },
    onSwiped: (eventData) => {
      if (scale > 1) return; // 줌된 상태에서는 스와이프 비활성화
      setIsDragging(false);

      const threshold = 50;
      const deltaX = eventData.deltaX;

      if (Math.abs(deltaX) > threshold) {
        setIsAnimating(true);

        if (deltaX > 0) {
          // 오른쪽 스와이프 (이전 이미지)
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            onImageChange?.(currentIndex - 1);
          }
        } else {
          // 왼쪽 스와이프 (다음 이미지)
          if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            onImageChange?.(currentIndex + 1);
          }
        }

        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        animationTimeoutRef.current = setTimeout(() => {
          setDragX(0);
          setIsAnimating(false);
          animationTimeoutRef.current = null;
        }, 300);
      } else {
        // 스와이프 거리가 부족하면 원래 위치로 돌아감
        setDragX(0);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  // 피치 줌 처리 (터치 제스처)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = currentDistance;
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }
      } else {
        const distanceRatio = currentDistance / initialDistanceRef.current;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, distanceRatio));
        setScale(newScale);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2 && isGestureActiveRef.current) {
      // 피치줌 종료
      isGestureActiveRef.current = false;
      initialDistanceRef.current = null;

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = setTimeout(() => {
        setScale(1);
        resetTimeoutRef.current = null;
      }, RESET_DELAY_MS);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isGestureActiveRef.current = true;
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
      className="relative w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...swipeHandlers}
    >
      {/* 이미지 슬라이더 */}
      <div className="w-full h-full overflow-hidden select-none">
        <div
          className={`w-full h-full transition-transform ${isDragging || isAnimating ? "duration-300 ease-out" : ""}`}
          style={{
            transform: `translateX(${dragX}px)`,
          }}
        >
          <Image
            src={images[currentIndex]}
            alt={`Record image ${currentIndex + 1}`}
            fill
            className="object-cover pointer-events-none"
            style={{ transform: `scale(${scale})` }}
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* 이미지 인디케이터 (여러 장일 경우만) */}
      {images.length > 1 && (
        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              onClick={() => {
                setCurrentIndex(index);
                onImageChange?.(index);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-1.5" : "bg-white/30 w-1.5"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
