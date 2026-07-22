"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import {
  YOUTUBE_IFRAME_ALLOW,
  youtubeEmbedUrl,
  youtubeThumbnailFallbacks,
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
  const fallbacks = youtubeThumbnailFallbacks(videoUrl);
  const [thumbIndex, setThumbIndex] = useState(0);
  const thumbSrc = fallbacks[thumbIndex] ?? thumb;

  const onThumbError = useCallback(() => {
    setThumbIndex((i) => (i + 1 < fallbacks.length ? i + 1 : i));
  }, [fallbacks.length]);

  if (!active && thumbSrc) {
    // Use a div (not <button>) so this can sit inside accordion/tab panels that are already buttons.
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActive(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActive(true);
          }
        }}
        className={cn(
          "group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-black",
          className,
        )}
        aria-label={title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          loading="lazy"
          onError={onThumbError}
        />
        <span
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-105 group-hover:bg-red-500"
          aria-hidden
        >
          ▶
        </span>
      </div>
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
