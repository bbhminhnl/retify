import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: [
      "sharp",
      "@huggingface/inference",
      "@google-cloud/vision",
    ],
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
