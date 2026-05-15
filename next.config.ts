import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hvvlvafmjmykqzlzzwnx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/estate-sale",
        destination: "/moving-sale",
        permanent: true,
      },
      {
        source: "/estate-sale/:id",
        destination: "/moving-sale/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
