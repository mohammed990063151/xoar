/** Laravel API origin (no trailing slash). Used for rewrites and server-side fetch fallbacks. */
export const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function normalizeApiOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/$/, "");
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Base URL for API requests.
 * - Server (SSR): `API_PROXY_TARGET` first — cPanel SSR must hit Laravel directly.
 * - Browser: `NEXT_PUBLIC_API_URL` when set, else same-origin `/api/...` rewrites.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    const proxy = normalizeApiOrigin(process.env.API_PROXY_TARGET);
    if (proxy) return proxy;
  }

  const configured = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;

  if (typeof window !== "undefined") return "";

  const port = process.env.PORT ?? "3000";
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://127.0.0.1:${port}`;
}
