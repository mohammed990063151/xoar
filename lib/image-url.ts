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

/** Skip Next.js image optimizer (avoids slow/failing upstream proxy for external CDNs). */
export function useUnoptimizedImage(url: string): boolean {
  if (!url) return false;
  if (isStorageImage(url)) return true;
  return /^https?:\/\//i.test(url);
}

/** Unsplash IDs that return 404 — replaced at runtime to avoid optimizer retry storms. */
const BROKEN_UNSPLASH_PHOTO_IDS = ["photo-1506126613645-ec7d78b93376"];

export function sanitizeExternalImageUrl(url: string, fallback: string): string {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (BROKEN_UNSPLASH_PHOTO_IDS.some((id) => trimmed.includes(id))) {
    return fallback;
  }
  return normalizeStorageImageUrl(trimmed);
}
