import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@huggingface/inference"],
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
