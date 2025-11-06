"use client";

import { useCallback, useEffect, useState } from "react";
import ShareIcon from "@/assets/icons/share.svg";
import { getAuthInfo } from "@/utils/cookies";

type ShareButtonProps = {
  /**
   * 공유할 제목 (기본값: "Globber - 나의 여행 지도")
   */
  title?: string;
  /**
   * 공유할 텍스트 내용
   */
  text?: string;
  /**
   * 공유할 URL (기본값: 현재 페이지 URL)
   */
  url?: string;
};

export const ShareButton = ({
  title = "Globber(글로버) - 지구본 위에서, 나의 여행을 한눈에!",
  text = "지구본으로 완성하는 여행 기록 서비스",
  url,
}: ShareButtonProps) => {
  // React Hooks
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Variables
  const generateShareUrl = useCallback(() => {
    if (url) return url;
    if (typeof window === "undefined") return "";

    const { uuid } = getAuthInfo();
    if (!uuid) return window.location.href;

    const baseUrl = window.location.origin;
    return `${baseUrl}/globe/${uuid}`;
  }, [url]);

  const shareUrl = generateShareUrl();

  // Functions
  const copyToClipboard = useCallback(async () => {
    try {
      setIsLoading(true);

      // 텍스트와 URL 사이에 줄바꿈 추가
      const shareText = `${title}

${text}

${shareUrl}`;

      await navigator.clipboard.writeText(shareText);

      // 복사 성공 피드백
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [title, text, shareUrl]);

  const handleShare = useCallback(async () => {
    // 모바일 기기 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    );

    // PC 또는 Web Share API 미지원: 클립보드 복사
    if (!isSupported || !isMobile) {
      await copyToClipboard();
      return;
    }

    // 모바일: Web Share API 사용
    try {
      setIsLoading(true);

      await navigator.share({
        url: shareUrl,
      });

      // 공유 성공 피드백
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (error) {
      // 사용자가 공유를 취소한 경우 (AbortError)는 에러로 처리하지 않음
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      // 공유 실패 시 클립보드 복사로 폴백
      await copyToClipboard();
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, shareUrl, copyToClipboard]);

  // Custom Hooks / Lifecycle Hooks
  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isLoading}
      className="flex items-center justify-center p-[10px] rounded-[500px] size-[56px] transition-all hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isShared
          ? "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #00D9FF 0%, #60E7FF 56.15%, #C6F6FF 100%)"
          : "radial-gradient(95.88% 89.71% at 17.16% 14.06%, #ffffff2e 0%, #ffffff14 56.15%, #ffffff09 100%)",
      }}
      aria-label={isShared ? "공유 완료" : isLoading ? "공유 중..." : "공유하기"}
    >
      <ShareIcon className={`w-8 h-8 ${isLoading ? "animate-pulse" : ""}`} />
    </button>
  );
};
