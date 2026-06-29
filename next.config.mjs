/** @type {import('next').NextConfig} */

const LOCAL_LARAVEL = "http://127.0.0.1:8000";
const PRODUCTION_LARAVEL = "https://xoraplus.com";

function defaultLaravelOrigin() {
  return process.env.NODE_ENV === "production" ? PRODUCTION_LARAVEL : LOCAL_LARAVEL;
}

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? defaultLaravelOrigin();

const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", pathname: "/storage/**" },
      { protocol: "https", hostname: "xoraplus.com", pathname: "/storage/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            // Enable only if HTTPS is guaranteed on this domain/subdomains.
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              'compute-pressure=(self "https://www.youtube.com" "https://www.youtube-nocookie.com")',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
