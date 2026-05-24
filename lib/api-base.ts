/** Laravel API origin (no trailing slash). Used for rewrites and server-side fetch fallbacks. */
export const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

/**
 * Base URL for API requests.
 * - Browser: empty string → same-origin `/api/...` (proxied via next.config rewrites).
 * - Server: explicit NEXT_PUBLIC_API_URL, or Next dev server so rewrites apply.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") return "";

  const port = process.env.PORT ?? "3000";
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://127.0.0.1:${port}`;
}
