"use client";

import { cn } from "@/lib/cn";

interface ActivityPromoVideoProps {
  readonly url: string;
  readonly title: string;
  readonly className?: string;
}

function isSafeVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function ActivityPromoVideo({
  url,
  title,
  className,
}: ActivityPromoVideoProps): React.ReactElement | null {
  if (!isSafeVideoUrl(url)) return null;

  const isYoutube =
    url.includes("youtube.com") || url.includes("youtu.be");
  const embedUrl = isYoutube
    ? url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : url;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-black/40", className)}>
      {isYoutube ? (
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full object-cover"
          title={title}
        />
      )}
    </div>
  );
}
