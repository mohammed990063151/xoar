export function isYoutubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/** Extract YouTube video id from common URL shapes. */
export function youtubeVideoId(url: string): string | null {
  try {
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split(/[?&#]/)[0] ?? null;
    }
    const parsed = new URL(url, "https://www.youtube.com");
    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery;
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1] ?? null;
      }
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
        return parts[shortsIndex + 1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedUrl(url: string): string {
  const id = youtubeVideoId(url);
  if (!id) {
    return url.replace("watch?v=", "embed/").replace("&", "?");
  }

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
}

/** Fallback chain when mqdefault is missing (deleted/private videos). */
export function youtubeThumbnailFallbacks(url: string): readonly string[] {
  const id = youtubeVideoId(url);
  if (!id) return [];

  return [
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/default.jpg`,
  ];
}

/** Delegated features for embedded YouTube player (reduces permissions-policy console noise). */
export const YOUTUBE_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure *; fullscreen";
