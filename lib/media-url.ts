import { normalizeStorageImageUrl } from "@/lib/image-url";

/** Demo / placeholder assets that must not ship to production visitors. */
const BLOCKED_DEMO_PATTERNS = [
  /videos\.pexels\.com/i,
  /19679435-hd_1920_1080/i,
];

/** Normalize storage paths and same-origin media URLs from Laravel. */
export function normalizeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    const storageMatch = trimmed.match(/\/storage\/(.+)$/i);
    if (storageMatch) {
      return `/storage/${storageMatch[1]}`;
    }
    return trimmed;
  }

  return normalizeStorageImageUrl(trimmed);
}

export function isSelfHostedMedia(url: string): boolean {
  return url.startsWith("/storage/") || url.includes("/storage/");
}

export function isBlockedDemoMedia(url: string): boolean {
  return BLOCKED_DEMO_PATTERNS.some((pattern) => pattern.test(url));
}

/** Hero video: only self-hosted uploads from the dashboard (light + reliable). */
export function sanitizeHeroVideoUrl(url: string | undefined): string | undefined {
  const normalized = url ? normalizeMediaUrl(url) : "";
  if (!normalized || isBlockedDemoMedia(normalized)) {
    return undefined;
  }
  if (!isSelfHostedMedia(normalized)) {
    return undefined;
  }
  return normalized;
}

/** Shrink large remote poster URLs (Unsplash defaults ship at 1920px). */
export function optimizePosterUrl(url: string | undefined, maxWidth = 960): string | undefined {
  if (!url) return undefined;

  const normalized = normalizeMediaUrl(url);
  if (!normalized) return undefined;

  if (/images\.unsplash\.com/i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      parsed.searchParams.set("w", String(maxWidth));
      parsed.searchParams.set("q", "70");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    } catch {
      return normalized;
    }
  }

  return normalized;
}
