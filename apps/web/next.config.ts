import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@amicale/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default config;
