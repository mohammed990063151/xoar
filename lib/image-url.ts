/** Same-origin `/storage/...` (Next rewrites to Laravel), never hard-coded API host. */
export function normalizeStorageImageUrl(url: string): string {
  if (!url) return url;

  const storageIndex = url.indexOf("/storage/");
  if (storageIndex >= 0) {
    return url.slice(storageIndex);
  }

  if (url.startsWith("storage/")) {
    return `/${url}`;
  }

  return url;
}

export function isStorageImage(url: string): boolean {
  return url.startsWith("/storage/") || url.includes("/storage/");
}
