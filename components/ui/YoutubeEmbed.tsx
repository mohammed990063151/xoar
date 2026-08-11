"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import {
  YOUTUBE_IFRAME_ALLOW,
  youtubeEmbedUrl,
  youtubeThumbnailFallbacks,
} from "@/lib/video-embed";

interface YoutubeEmbedProps {
  readonly videoUrl: string;
  readonly title: string;
  readonly className?: string;
  /** Load iframe only after user clicks play (quieter console, faster LCP). */
  readonly facade?: boolean;
}

function PlayFacade({
  title,
  className,
  thumbSrc,
  onPlay,
  onThumbError,
}: {
  readonly title: string;
  readonly className?: string;
  readonly thumbSrc: string | null;
  readonly onPlay: () => void;
  readonly onThumbError?: () => void;
}): React.ReactElement {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay();
        }
      }}
      className={cn(
        "group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900",
        className,
      )}
      aria-label={title}
    >
      {thumbSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          loading="lazy"
          onError={onThumbError}
        />
      ) : (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.25),transparent_65%)]" aria-hidden />
      )}
      <span
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-105 group-hover:bg-red-500"
        aria-hidden
      >
        ▶
      </span>
    </div>
  );
}

export function YoutubeEmbed({
  videoUrl,
  title,
  className,
  facade = true,
}: YoutubeEmbedProps): React.ReactElement {
  const [active, setActive] = useState(!facade);
  const embedSrc = youtubeEmbedUrl(videoUrl);
  const fallbacks = youtubeThumbnailFallbacks(videoUrl);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [thumbsExhausted, setThumbsExhausted] = useState(fallbacks.length === 0);
  const thumbSrc = !thumbsExhausted ? (fallbacks[thumbIndex] ?? null) : null;

  const onThumbError = useCallback(() => {
    setThumbIndex((i) => {
      const next = i + 1;
      if (next >= fallbacks.length) {
        setThumbsExhausted(true);
        return i;
      }
      return next;
    });
  }, [fallbacks.length]);

  if (!active) {
    return (
      <PlayFacade
        title={title}
        className={className}
        thumbSrc={thumbSrc}
        onPlay={() => setActive(true)}
        onThumbError={thumbsExhausted ? undefined : onThumbError}
      />
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
