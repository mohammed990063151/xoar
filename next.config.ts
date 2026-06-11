import type { NextConfig } from "next";
import { defaultLaravelOrigin, PRODUCTION_LARAVEL_ORIGIN } from "./lib/laravel-origin";

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? defaultLaravelOrigin();

const nextConfig: NextConfig = {
  // Safety net if any route still attempts static generation during CI build.
  staticPageGenerationTimeout: 120,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiProxyTarget}/storage/:path*`,
      },
    ];
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", pathname: "/storage/**" },
      { protocol: "https", hostname: "xoraplus.com", pathname: "/storage/**" },
      { protocol: "https", hostname: new URL(PRODUCTION_LARAVEL_ORIGIN).hostname, pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
