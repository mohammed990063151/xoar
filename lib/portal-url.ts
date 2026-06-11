/** Laravel customer portal base (no trailing slash). */
export function getPortalBaseUrl(): string {
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL?.trim().replace(/\/$/, "");
  if (portal) return portal;

  const admin = process.env.NEXT_PUBLIC_ADMIN_URL?.trim().replace(/\/$/, "");
  if (admin) return admin;

  return "http://127.0.0.1:8000";
}

export function portalPath(path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getPortalBaseUrl()}/portal${normalized}`;
}
