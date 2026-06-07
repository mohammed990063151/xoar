/** Laravel customer portal base (no trailing slash). */
export function getPortalBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:8000";

  return base;
}

export function portalPath(path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getPortalBaseUrl()}/portal${normalized}`;
}
