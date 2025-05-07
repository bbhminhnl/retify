import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   serverComponentsExternalPackages: [
  //     "sharp",
  //     "@huggingface/inference",
  //     "@google-cloud/vision",
  //   ],
  //   serverActions: {
  //     allowedOrigins: ["*"],
  //   },
  // },
  i18n: {
    locales: ["en", "vi"], // Danh sách các ngôn ngữ hỗ trợ
    defaultLocale: "vi", // Ngôn ngữ mặc định
  },
  // experimental: {
  //   appDir: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
