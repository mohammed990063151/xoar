/** @type {import('next').NextConfig} */

const LOCAL_LARAVEL = "http://127.0.0.1:8000";
const PRODUCTION_LARAVEL = "https://xoraplus.com";

function defaultLaravelOrigin() {
  return process.env.NODE_ENV === "production" ? PRODUCTION_LARAVEL : LOCAL_LARAVEL;
}

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? defaultLaravelOrigin();

const nextConfig = {
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
    qualities: [75, 95],
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
    ],
  },
};

export default nextConfig;
