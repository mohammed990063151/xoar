"use client";

import { cn } from "@/lib/cn";
import { isYoutubeUrl } from "@/lib/video-embed";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";

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

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-black/40", className)}>
      {isYoutubeUrl(url) ? (
        <YoutubeEmbed videoUrl={url} title={title} className="aspect-video w-full" />
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
