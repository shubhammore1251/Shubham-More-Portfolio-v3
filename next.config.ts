import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cffnzaephfjkpuofqlus.supabase.co",
        pathname: "/storage/v1/object/public/portfolio-images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.hashnode.com",
        pathname: "/res/hashnode/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "cdn.hashnode.com",
        pathname: "/uploads/**",
      }
    ],
  },
};

export default nextConfig;
