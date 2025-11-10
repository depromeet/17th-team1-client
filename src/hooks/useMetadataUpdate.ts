import { useEffect } from "react";
import { generateShareMetadata } from "@/lib/shareUtils";

/**
 * 페이지의 OG 메타데이터를 동적으로 업데이트합니다.
 * 클라이언트 컴포넌트에서 사용하여 SEO 메타태그와 SNS 공유 정보를 설정합니다.
 *
 * @param nickname - 사용자 닉네임
 * @param uuid - 사용자 UUID
 * @param pageTitle - 페이지 타이틀 (기본값: "Globber - 나의 지구본")
 *
 * @example
 * useMetadataUpdate("민지", "d893516a-e667-4484-9a36-865ff43f85db");
 */
export const useMetadataUpdate = (nickname: string | null, uuid: string | null, pageTitle?: string) => {
  useEffect(() => {
    if (!nickname || !uuid) return;

    const metadata = generateShareMetadata(nickname, uuid);

    // 제목 업데이트
    document.title = pageTitle || metadata.ogTitle;

    // 메타 태그 유틸리티 함수
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(name.startsWith("og:") ? "property" : "name", name);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    // OG 메타 태그 설정
    setMetaTag("og:title", metadata.ogTitle);
    setMetaTag("og:description", metadata.ogDescription);
    setMetaTag("og:image", metadata.ogImage);
    setMetaTag("og:url", metadata.shareUrl);
    setMetaTag("og:type", "website");

    // Twitter 카드 설정
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", metadata.ogTitle);
    setMetaTag("twitter:description", metadata.ogDescription);
    setMetaTag("twitter:image", metadata.ogImage);

    // 일반 메타 태그
    setMetaTag("description", metadata.ogDescription);

    // Kakao Talk 메타 태그
    setMetaTag("og:image:width", "1200");
    setMetaTag("og:image:height", "630");
  }, [nickname, uuid, pageTitle]);
};
