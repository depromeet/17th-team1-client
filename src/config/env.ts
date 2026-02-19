const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

if (process.env.NODE_ENV === "production" && !COOKIE_DOMAIN?.trim()) {
  throw new Error("[env] COOKIE_DOMAIN is required in production but is missing or empty.");
}

export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://globber.world/api",
  REDIRECT_ORIGIN: process.env.NEXT_PUBLIC_REDIRECT_ORIGIN,
  COOKIE_DOMAIN: COOKIE_DOMAIN,
  IS_LOCAL_DEV: process.env.NODE_ENV === "development",
} as const;
