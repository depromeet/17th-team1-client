// 환경변수 설정
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://globber.store",
  REDIRECT_ORIGIN: process.env.NEXT_PUBLIC_REDIRECT_ORIGIN || "https://www.globber-fe.store",
  COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".globber-fe.store",
} as const;
