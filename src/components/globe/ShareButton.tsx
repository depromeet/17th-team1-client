"use client";

import { useCallback, useEffect, useState } from "react";
import ShareIcon from "@/assets/icons/share.svg";
import { generateShareMetadata } from "@/lib/shareUtils";
import { getMyProfile } from "@/services/profileService";
import { getAuthInfo, setCookie } from "@/utils/cookies";

type ShareButtonProps = {
  /**
   * 공유할 URL (기본값: 현재 페이지 URL)
   */
  url?: string;
  /**
   * 첫 지구본 여부 (true일 경우 큰 버튼 스타일)
   */
  isFirstGlobe?: boolean;
};

export const ShareButton = ({ url, isFirstGlobe = false }: ShareButtonProps) => {
  // React Hooks
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Variables
  const generateShareUrl = useCallback(() => {
    if (url) {
      return url;
    }

    const { uuid, nickname } = getAuthInfo();

    if (!uuid) {
      return typeof window !== "undefined" ? window.location.href : "";
    }

    // nickname이 있으면 shareUtils의 generateShareMetadata 사용
    if (nickname) {
      const metadata = generateShareMetadata(nickname, uuid);
      return metadata.shareUrl;
    }

    // nickname이 없으면 fallback
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.globber.world";
    return `${baseUrl}/globe/${uuid}`;
  }, [url]);

  const shareUrl = generateShareUrl();

  // 프로필 정보를 조회하고 쿠키에 저장
  const fetchAndSaveProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      if (profile.nickname) {
        setCookie("nickname", profile.nickname, { maxAge: 86400 * 30 }); // 30일
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  // Functions
  const copyToClipboard = useCallback(async () => {
    try {
      setIsLoading(true);

      await navigator.clipboard.writeText(shareUrl);

      // 복사 성공 피드백
      setIsShared(true);
      alert("링크가 복사되었습니다!");
      setTimeout(() => setIsShared(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [shareUrl]);

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

      const { nickname } = getAuthInfo();
      const shareData = {
        title: nickname ? `Globber(글로버) - ${nickname}님의 지구본` : "Globber - 나의 지구본",
        text: nickname
          ? `${nickname}님의 여행 기록을 담은 지구본을 확인해보세요!`
          : "여행 기록을 담은 지구본을 확인해보세요!",
        url: shareUrl,
      };

      await navigator.share(shareData);

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
    fetchAndSaveProfile();
  }, [fetchAndSaveProfile]);

  // 첫 지구본일 때는 큰 버튼 스타일
  if (isFirstGlobe) {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-12 py-[17px] rounded-[1000px] bg-[#00d9ff] transition-all hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isShared ? "공유 완료" : isLoading ? "공유 중..." : "내 지구본 자랑하기"}
      >
        <p className="font-bold text-base text-black leading-[1.3]">{isShared ? "공유 완료!" : "내 지구본 자랑하기"}</p>
      </button>
    );
  }

  // 기본 아이콘 버튼 스타일
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
