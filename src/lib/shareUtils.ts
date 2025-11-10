import { getAuthInfo } from "@/utils/cookies";

const getBaseUrl = (): string => {
  return "https://www.globber.world";
};

/**
 * 공유 링크를 생성하고 메타데이터를 반환합니다.
 * 사용자의 nickname과 uuid를 기반으로 OG 이미지 URL을 생성합니다.
 *
 * @param nickname - 사용자 닉네임
 * @param uuid - 사용자 UUID
 * @returns 공유 링크와 메타데이터
 *
 * @example
 * const { shareUrl, ogImage, ogTitle, ogDescription } = generateShareMetadata("민지", "d893516a-e667-4484-9a36-865ff43f85db");
 * console.log(shareUrl); // "https://www.globber.world/globe/d893516a-e667-4484-9a36-865ff43f85db"
 * console.log(ogImage); // "https://www.globber.world/api/og-image?nickname=민지&uuid=d893516a-e667-4484-9a36-865ff43f85db"
 */
export const generateShareMetadata = (nickname: string, uuid: string) => {
  const baseUrl = getBaseUrl();

  const shareUrl = `${baseUrl}/globe/${uuid}`;
  const ogImage = `${baseUrl}/api/og-image?nickname=${encodeURIComponent(nickname)}&uuid=${uuid}`;
  const ogTitle = `Globber(글로버) - ${nickname}님의 지구본`;
  const ogDescription = `${nickname}님의 여행 기록을 담은 지구본을 확인해보세요!`;

  return {
    shareUrl,
    ogImage,
    ogTitle,
    ogDescription,
    nickname,
    uuid,
  };
};

/**
 * 현재 사용자의 공유 메타데이터를 생성합니다.
 * 쿠키에서 nickname과 uuid를 자동으로 읽어옵니다.
 *
 * @returns 공유 메타데이터, 또는 필요한 정보가 없으면 null
 */
export const getCurrentUserShareMetadata = () => {
  const { nickname, uuid } = getAuthInfo();

  if (!nickname || !uuid) {
    return null;
  }

  return generateShareMetadata(nickname, uuid);
};

/**
 * Web Share API 또는 클립보드에 공유할 데이터를 반환합니다.
 *
 * @param nickname - 사용자 닉네임
 * @param uuid - 사용자 UUID
 * @returns Web Share API용 데이터 객체
 */
export const getShareData = (nickname: string, uuid: string) => {
  const { ogTitle, ogDescription, shareUrl } = generateShareMetadata(nickname, uuid);

  return {
    title: ogTitle,
    text: ogDescription,
    url: shareUrl,
  };
};
