import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "globber-dev.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "globber-prod.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: "globber",
  project: "globber-frontend",
  silent: true,

  // SENTRY_AUTH_TOKEN이 설정된 환경(로컬/CI)에서만 소스맵 업로드
  // GCP 빌드 서버에서는 업로드 비활성화하여 빌드 부하 방지
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  tunnelRoute: "/monitoring",
});
