import type { NextConfig } from "next";

const wpOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "cdn.scorpioplay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.hbnxihcjsi.net",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      ...(wpOrigin
        ? [
            {
              protocol: wpOrigin.startsWith("https") ? "https" : "http",
              hostname: new URL(wpOrigin).hostname,
              pathname: "/**",
            } as const,
          ]
        : []),
    ],
  },
};

export default nextConfig;
