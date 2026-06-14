import { defaultLaravelOrigin } from "@/lib/laravel-origin";

/** Laravel API origin (no trailing slash). Used for rewrites and server-side fetch fallbacks. */
export const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? defaultLaravelOrigin();

function normalizeApiOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/$/, "");
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Base URL for API requests.
 * - Browser: always same-origin (`""`) so `/api/*` hits Next.js rewrites (no CORS).
 * - Server (SSR): `API_PROXY_TARGET` → Laravel directly on cPanel/production.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  const proxy = normalizeApiOrigin(process.env.API_PROXY_TARGET);
  if (proxy) return proxy;

  const configured = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;

  const port = process.env.PORT ?? "3000";
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://127.0.0.1:${port}`;
}
