/**
 * WebView 안에서 직접 열어도 되는 주소인지 판단합니다.
 *
 * - 서비스 도메인과 카카오 로그인 도메인은 WebView 안에서 이동합니다.
 * - 그 외 http(s) 링크와 커스텀 스킴(kakaotalk://, tel:, mailto: 등)은 시스템이 처리하도록 외부로 넘깁니다.
 */

const KAKAO_HOST_SUFFIXES = [".kakao.com", ".kakaocdn.net"];

const getHostname = (url: string): string | null => {
  const match = /^https?:\/\/([^/:?#]+)/i.exec(url);
  return match ? match[1].toLowerCase() : null;
};

const isSameSite = (hostname: string, webHostname: string): boolean => {
  if (hostname === webHostname) return true;

  // 서비스 루트 도메인(globber.world)과 그 하위 도메인
  const rootDomain = webHostname.split(".").slice(-2).join(".");
  return hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
};

export const shouldLoadInWebView = (url: string, webUrl: string): boolean => {
  if (url === "about:blank") return true;

  const hostname = getHostname(url);
  if (!hostname) return false;

  const webHostname = getHostname(webUrl);
  if (webHostname && isSameSite(hostname, webHostname)) return true;

  return KAKAO_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix));
};
