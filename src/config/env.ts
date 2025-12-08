// 환경변수 설정
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://globber.world/api",
  REDIRECT_ORIGIN: process.env.NEXT_PUBLIC_REDIRECT_ORIGIN || "https://www.globber.world",
  COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".globber.world",
  // 로컬 개발 환경 여부 (development 환경이면 true)
  IS_LOCAL_DEV: process.env.NODE_ENV === "development",
} as const;
