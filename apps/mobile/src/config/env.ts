// EXPO_PUBLIC_* 는 번들 시점에 인라인되므로 반드시 `process.env.EXPO_PUBLIC_X` 형태로 직접 참조해야 합니다.
export const env = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://globber.world/api",
  S3_BASE_URL: process.env.EXPO_PUBLIC_S3_BASE_URL || "https://globber-dev.s3.ap-northeast-2.amazonaws.com/",
} as const;
