import { defaultLaravelOrigin } from "@/lib/laravel-origin";

/** Laravel customer portal base (no trailing slash). */
export function getPortalBaseUrl(): string {
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL?.trim().replace(/\/$/, "");
  if (portal) return portal;

  const api = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (api) return api;

  const admin = process.env.NEXT_PUBLIC_ADMIN_URL?.trim().replace(/\/$/, "");
  if (admin) return admin;

  return defaultLaravelOrigin();
}

/** Customer portal route on Laravel (register/login/bookings live in DB → admin dashboard). */
export function portalPath(path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getPortalBaseUrl()}/portal${normalized}`;
}
