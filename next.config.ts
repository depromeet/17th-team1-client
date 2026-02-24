import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select", "@radix-ui/react-toast"],
  },
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
      {
        protocol: "https",
        hostname: "picsum.photos",
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
