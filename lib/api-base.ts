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
 * - Browser: same-origin (`""`) → Next.js `/api/*` proxy injects FRONTEND_API_KEY server-side.
 * - Server (SSR) dev: loopback Next server `/api/*` proxy (same path as the browser — avoids key / cache mismatches).
 * - Server (SSR) prod: direct to API_PROXY_TARGET with FRONTEND_API_KEY header.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT ?? "3000";
    const host = process.env.INTERNAL_API_HOST?.trim() || "127.0.0.1";
    return `http://${host}:${port}`;
  }

  const proxy = normalizeApiOrigin(process.env.API_PROXY_TARGET);
  if (proxy) return proxy;

  const configured = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;

  return defaultLaravelOrigin();
}
