/** Collapse URL to locale + top section for presence analytics (not every sub-page). */
export function normalizePresencePath(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (!path || path === "/") {
    return "/ar";
  }

  const match = path.match(/^\/(ar|en)(?:\/([^/]+))?/);
  if (!match) {
    return path.slice(0, 80);
  }

  const locale = match[1];
  const section = match[2];
  return section ? `/${locale}/${section}` : `/${locale}`;
}
