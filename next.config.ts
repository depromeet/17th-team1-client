import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for production builds
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "globber-dev.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "globber-prod.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
