"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  YOUTUBE_IFRAME_ALLOW,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "@/lib/video-embed";

interface YoutubeEmbedProps {
  readonly videoUrl: string;
  readonly title: string;
  readonly className?: string;
  /** Load iframe only after user clicks play (quieter console, faster LCP). */
  readonly facade?: boolean;
}

export function YoutubeEmbed({
  videoUrl,
  title,
  className,
  facade = true,
}: YoutubeEmbedProps): React.ReactElement {
  const [active, setActive] = useState(!facade);
  const embedSrc = youtubeEmbedUrl(videoUrl);
  const thumb = youtubeThumbnailUrl(videoUrl);

  if (!active && thumb) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className={cn(
          "group relative flex h-full w-full items-center justify-center overflow-hidden bg-black",
          className,
        )}
        aria-label={title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          loading="lazy"
        />
        <span
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-105 group-hover:bg-red-500"
          aria-hidden
        >
          ▶
        </span>
      </button>
    );
  }

  return (
    <iframe
      src={embedSrc}
      title={title}
      className={cn("h-full w-full border-0", className)}
      allow={YOUTUBE_IFRAME_ALLOW}
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
