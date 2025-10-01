"use client";

import { useEffect, useState } from "react";

interface GlobeLoadingProps {
  duration?: number; // 애니메이션 지속 시간 (ms)
  onComplete?: () => void; // 로딩 완료 콜백
}

export const GlobeLoading = ({ duration = 3000, onComplete }: GlobeLoadingProps) => {
  const [progress, setProgress] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!duration) return;

    const completionDuration = 1000; // "완성" 표시는 1초

    const totalSteps = 99; // 1에서 100까지 99단계
    const stepDuration = duration / totalSteps; // 각 단계당 시간

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);

          // 1초 후에 완료 콜백 실행
          setTimeout(() => {
            onComplete?.();
          }, completionDuration);

          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete, duration]);
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-[#001d39] to-[#0d0c14]">
      {/* Globe Background - Centered */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[512px] aspect-square">
        {/* Globe Container with radial gradient background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center 81%, #000000 0%, #032f59 100%),
                        radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 15.8%, transparent 83.6%, rgba(255,255,255,0.1) 100%)`,
          }}
        >
          {/* Globe Image */}
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img src="/assets/globe.png" alt="Globe" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Loading Text - Absolute positioned at center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4 z-10">
        <h1 className="text-white text-[32px] font-bold leading-[42px] mb-4 font-pretendard whitespace-nowrap">
          {isCompleted ? "완성!" : "잠시만 기다려주세요."}
        </h1>
        <p className="text-white text-[18px] font-medium leading-[27px] text-center font-pretendard">
          지구본 생성중... {progress}%
        </p>
      </div>
    </div>
  );
};
