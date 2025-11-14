"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type RecordImageCarouselProps = {
  images: string[];
  onImageChange?: (index: number) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const RESET_DELAY_MS = 300;
const SWIPE_THRESHOLD = 50; // 스와이프 판단 임계값 (px)
const SWIPE_TIME_THRESHOLD = 300; // 스와이프 판단 시간 (ms)

export const RecordImageCarousel = ({ images, onImageChange }: RecordImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const initialDistanceRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isGestureActiveRef = useRef(false);

  // 드래그 추적
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, []);

  // 드래그/터치 시작 처리
  const handleDragStart = (clientX: number, isTwoFinger: boolean = false) => {
    if (isTwoFinger) {
      setIsDragging(false);
      initialDistanceRef.current = null;
      isGestureActiveRef.current = true;
    } else {
      startXRef.current = clientX;
      startTimeRef.current = Date.now();
      setIsDragging(true);
    }
  };

  // 드래그/터치 이동 처리
  const handleDragMove = (clientX: number, isTwoFinger: boolean = false) => {
    if (isTwoFinger) {
      setIsDragging(false);
    } else if (isDragging) {
      const moveX = clientX - startXRef.current;
      setDragX(moveX);
    }
  };

  // 드래그/터치 종료 처리
  const handleDragEnd = (isTwoFinger: boolean = false) => {
    if (isTwoFinger) {
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
      return;
    }

    if (!isDragging) return;

    setIsDragging(false);

    const moveX = dragX;
    const elapsedTime = Date.now() - startTimeRef.current;

    // 스와이프 판정: 거리 또는 속도로 판단
    const isSwipe = Math.abs(moveX) > SWIPE_THRESHOLD || elapsedTime < SWIPE_TIME_THRESHOLD;

    if (isSwipe) {
      if (moveX > 0) {
        // 오른쪽 스와이프 (이전 이미지)
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          onImageChange?.(currentIndex - 1);
        }
      } else if (moveX < 0) {
        // 왼쪽 스와이프 (다음 이미지)
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
          onImageChange?.(currentIndex + 1);
        }
      }
    }

    // 드래그 위치 리셋 (애니메이션과 함께)
    setDragX(0);
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, false);
    } else if (e.touches.length === 2) {
      handleDragStart(0, true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 피치 줌
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
      handleDragMove(0, true);
    } else if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const isGestureEnding = isGestureActiveRef.current && e.touches.length < 2;
    handleDragEnd(isGestureEnding);
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragX(0);

    if (isGestureActiveRef.current) {
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

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX, false);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd(false);
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
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* 이미지 슬라이더 */}
      <div className="w-full h-full overflow-hidden select-none">
        <div
          className={`w-full h-full transition-transform ${isDragging ? "" : "duration-500 ease-out"}`}
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
            <div
              key={`indicator-${index}`}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-1.5" : "bg-white/30 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
